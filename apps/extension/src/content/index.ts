// Content script entry point for Slothing extension

// Firefox's `chrome.*` compat is callback-based, so `await chrome.tabs.query(...)`
// resolves to `undefined`. Alias global `chrome` to polyfilled `browser` so all
// `chrome.*` calls below return Promises on both Firefox and Chrome.
import browser from "webextension-polyfill";
if (typeof globalThis !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = browser;
}

// Import styles for content script
import "./ui/styles.css";

import { FieldDetector } from "./auto-fill/field-detector";
import { FieldMapper } from "./auto-fill/field-mapper";
import { AutoFillEngine } from "./auto-fill/engine";
import { getScraperForUrl } from "./scrapers/scraper-registry";
import {
  WaterlooWorksOrchestrator,
  getWaterlooWorksNextPageLink,
  getWaterlooWorksRows,
} from "./scrapers/waterloo-works-orchestrator";
import { GreenhouseOrchestrator } from "./scrapers/greenhouse-orchestrator";
import { LeverOrchestrator } from "./scrapers/lever-orchestrator";
import { WorkdayOrchestrator } from "./scrapers/workday-orchestrator";
import type {
  AnswerBankMatch,
  ChatJobContext,
  ChatPortMessage,
  ChatStreamStartPayload,
  ExtensionProfile,
  ScrapedJob,
  DetectedField,
  DetectedUploadField,
  ExtensionResumeSummary,
  ExtensionSettings,
  PageSurfaceContext,
  SimilarAnswer,
} from "@/shared/types";
import { CHAT_PORT_NAME, DEFAULT_API_BASE_URL } from "@/shared/types";
import { sendMessage, Messages } from "@/shared/messages";
import { messageForError } from "@/shared/error-messages";
import type { ChatIntent } from "./sidebar/chat-panel";
import { showAppliedToast } from "./tracking/applied-toast";
import { SubmitWatcher, extractCompanyHint } from "./tracking/submit-watcher";
import { JobPageSidebarController } from "./sidebar/controller";
import { CorrectionsTracker } from "./corrections-tracker";
import { tryCaptureLinkedInJob } from "./scrapers/linkedin-passive-capture";
import {
  mountAnswerBankButton,
  shouldDecorateTextarea,
  unmountAllAnswerBankButtons,
} from "./ui/answer-bank-button";
import { MultistepController } from "./multistep/controller";

// Initialize components
const fieldDetector = new FieldDetector();
let autoFillEngine: AutoFillEngine | null = null;
let cachedProfile: ExtensionProfile | null = null;
let detectedFields: DetectedField[] = [];
let detectedUploadFields: DetectedUploadField[] = [];
const detectedFieldsByForm = new WeakMap<HTMLFormElement, DetectedField[]>();
const autofilledForms = new WeakSet<HTMLFormElement>();
let scrapedJob: ScrapedJob | null = null;
let jobDetectedForUrl: string | null = null;
let profileLoadPromise: Promise<ExtensionProfile | null> | null = null;
// In-flight WaterlooWorks bulk-scrape controller. Held at module scope so
// the WW_BULK_CANCEL message handler can abort whichever scrape is running.
let currentWwBulkController: AbortController | null = null;
const sidebarController = new JobPageSidebarController();
const correctionsTracker = new CorrectionsTracker();
// P3 / #36 #37 — wires Workday + Greenhouse multi-step handlers. The
// controller itself decides per-URL whether it should attach.
const multistepController = new MultistepController({
  getProfile: () => loadProfileForSidebar(),
});
multistepController.init();

const submitWatcher = new SubmitWatcher({
  getDetectedFields: (form) => detectedFieldsByForm.get(form) || [],
  getScrapedJob: () => scrapedJob,
  getSettings: getExtensionSettings,
  wasAutofilled: (form) => autofilledForms.has(form),
  onTracked: async (payload) => {
    const response = await sendMessage<{ opportunityId: string }>(
      Messages.trackApplied(payload),
    );
    if (!response.success) {
      console.error("[Slothing] Failed to track application:", response.error);
      return;
    }

    showAppliedToast(extractCompanyHint(scrapedJob, payload.host), () => {
      sendMessage(Messages.openDashboard()).catch((err) =>
        console.error("[Slothing] Failed to open dashboard:", err),
      );
    });
  },
});

// Scan page on load
scanPage();
submitWatcher.attach();

// Re-scan on dynamic content changes
const observer = new MutationObserver(debounce(scanPage, 500));
observer.observe(document.body, { childList: true, subtree: true });

// Deep-link to a specific WaterlooWorks posting via `#postingId=<id>` hash.
// Opportunity rows in Slothing's UI link to URLs the scraper minted in this
// format (since WW postings are SPA modals with no canonical URL of their
// own). When the user lands on such a URL we wait for the row to appear,
// then click it to open the corresponding posting modal.
void openWwPostingFromHash();
window.addEventListener("hashchange", () => {
  void openWwPostingFromHash();
});

async function openWwPostingFromHash() {
  if (!/waterlooworks[-.a-z0-9]*\.uwaterloo\.ca$/i.test(location.hostname)) {
    return;
  }
  const match = location.hash.match(/postingId=([0-9]+)/);
  if (!match) return;
  const postingId = match[1];
  // The WW list is rendered async; poll up to ~10s for the row to appear.
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const link = findWwRowLinkForId(postingId);
    if (link) {
      link.click();
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

function findWwRowLinkForId(postingId: string): HTMLElement | null {
  // Every body row carries an ID cell. The cell text is the posting's WW ID.
  // Walk the cells, then go back to the row, then find its title control.
  const cells = document.querySelectorAll<HTMLElement>(
    "tr.table__row--body td, tr.table__row--body th, [role='row'] [role='cell']",
  );
  for (const cell of cells) {
    if (cell.textContent?.trim() === postingId) {
      const row = cell.closest<HTMLElement>(
        "tr, [role='row'], li, .table__row, .table__row--body",
      );
      if (!row) continue;
      const link =
        row.querySelector<HTMLElement>(
          "td a[href='javascript:void(0)'], td a, td button, [role='cell'] a, [role='cell'] button",
        ) || null;
      if (link) return link;
    }
  }
  return null;
}

async function scanPage() {
  // Detect forms
  const forms = document.querySelectorAll("form");
  let nextDetectedFields: DetectedField[] = [];
  let nextDetectedUploads: DetectedUploadField[] = [];
  for (const form of forms) {
    const fields = fieldDetector.detectFields(form);
    const uploads = fieldDetector.detectUploadFields(form);
    if (fields.length > 0) {
      detectedFieldsByForm.set(form, fields);
      nextDetectedFields = fields;
      console.log("[Slothing] Detected fields:", fields.length);
    }
    if (uploads.length > 0) {
      nextDetectedUploads = uploads;
      console.log("[Slothing] Detected document uploads:", uploads.length);
    }
  }
  detectedFields = nextDetectedFields;
  detectedUploadFields = nextDetectedUploads;

  // P2/#35 — decorate long essay textareas with the inline answer-bank
  // popover. This runs in addition to the field detector above because the
  // textareas we care about often aren't owned by a recognised form (some
  // ATS portals use bare <textarea> with dynamic labels).
  scanForAnswerBankTextareas();

  await refreshScrapedJob();
  void updateSidebar();
}

async function refreshScrapedJob(): Promise<ScrapedJob | null> {
  if (isSlothingWebAppPage()) {
    scrapedJob = null;
    return null;
  }

  const scraper = getScraperForUrl(window.location.href);
  if (!scraper.canHandle(window.location.href)) return null;

  let nextScrapedJob: ScrapedJob | null = null;
  try {
    nextScrapedJob = await scraper.scrapeJobListing();
    scrapedJob = nextScrapedJob;
    if (nextScrapedJob) {
      console.log("[Slothing] Scraped job:", nextScrapedJob.title);
      const detectionKey = nextScrapedJob.sourceJobId || nextScrapedJob.url;
      if (jobDetectedForUrl !== detectionKey) {
        jobDetectedForUrl = detectionKey;
        sendMessage(
          Messages.jobDetected({
            title: nextScrapedJob.title,
            company: nextScrapedJob.company,
            url: nextScrapedJob.url,
          }),
        ).catch((err) =>
          console.error("[Slothing] Failed to notify job detected:", err),
        );

        // P3/#38 — passive LinkedIn capture. Only runs on detail pages the
        // user navigated to themselves; the scraper already enforces this
        // because `sourceJobId` is only populated when the URL matches the
        // `/jobs/view/:id` pattern. Failures here are fire-and-forget so a
        // capture hiccup never blocks the visible scrape/sidebar UX.
        if (nextScrapedJob.source === "linkedin") {
          void tryCaptureLinkedInJob(nextScrapedJob, {
            sendMessage,
            buildImportMessage: Messages.importJob,
          }).catch((err) =>
            console.warn("[Slothing] LinkedIn passive capture failed:", err),
          );
        }
      }
    }
  } catch (err) {
    console.error("[Slothing] Scrape error:", err);
  }

  if (!nextScrapedJob && scrapedJob?.url !== window.location.href) {
    scrapedJob = null;
  }

  return scrapedJob;
}

function isSlothingWebAppPage(): boolean {
  const host = window.location.hostname;
  if (host === "slothing.work" || host.endsWith(".slothing.work")) {
    return true;
  }
  if (host !== "localhost" && host !== "127.0.0.1") return false;
  return /\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?extension\/connect(?:\/|$)/.test(
    window.location.pathname,
  );
}

// Handle messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ success: false, error: err.message }));
  return true; // Async response
});

async function handleMessage(message: { type: string; payload?: unknown }) {
  switch (message.type) {
    case "GET_PAGE_STATUS":
      if (!scrapedJob) {
        await refreshScrapedJob();
        void updateSidebar();
      }
      return {
        hasForm: detectedFields.length > 0,
        hasJobListing: scrapedJob !== null,
        detectedFields: detectedFields.length,
        scrapedJob,
      };

    case "GET_SURFACE_CONTEXT":
      return getSurfaceContext();

    case "SHOW_SLOTHING_PANEL":
      await refreshScrapedJob();
      await sidebarController.restoreDomain();
      await updateSidebar();
      return { success: scrapedJob !== null, scrapedJob };

    case "TRIGGER_FILL":
      return handleFillForm(
        (message.payload as { overwriteExisting?: boolean } | undefined) ?? {},
      );

    case "TRIGGER_IMPORT":
      if (scrapedJob) {
        return sendMessage(Messages.importJob(scrapedJob));
      }
      return { success: false, error: "No job detected" };

    case "SCRAPE_JOB":
      const scraper = getScraperForUrl(window.location.href);
      if (scraper.canHandle(window.location.href)) {
        scrapedJob = await scraper.scrapeJobListing();
        return { success: true, data: scrapedJob };
      }
      return { success: false, error: "No scraper available for this site" };

    case "SCRAPE_JOB_LIST":
      const listScraper = getScraperForUrl(window.location.href);
      if (listScraper.canHandle(window.location.href)) {
        const jobs = await listScraper.scrapeJobList();
        return { success: true, data: jobs };
      }
      return { success: false, error: "No scraper available for this site" };

    case "WW_GET_PAGE_STATE":
      return getWwPageState();

    case "WW_SCRAPE_ALL_VISIBLE":
      return runWwBulkScrape({ paginated: false });

    case "WW_SCRAPE_ALL_PAGINATED":
      return runWwBulkScrape({
        paginated: true,
        ...(message.payload as object),
      });

    case "WW_BULK_CANCEL":
      // Popup's "Stop" button forwards this. We hold the AbortController
      // for whichever bulk scrape is currently in flight (visible OR
      // paginated) so cancelling is just `.abort()` — the orchestrator
      // checks the signal between rows / pages and returns gracefully.
      currentWwBulkController?.abort();
      return { success: true };

    // P3/#39 — Generic bulk-scrape orchestrators for public ATS hosts.
    case "BULK_GREENHOUSE_GET_PAGE_STATE":
      return getBulkSourcePageState("greenhouse");
    case "BULK_GREENHOUSE_SCRAPE_VISIBLE":
      return runBulkSourceScrape("greenhouse", { paginated: false });
    case "BULK_GREENHOUSE_SCRAPE_PAGINATED":
      return runBulkSourceScrape("greenhouse", {
        paginated: true,
        ...(message.payload as object),
      });

    case "BULK_LEVER_GET_PAGE_STATE":
      return getBulkSourcePageState("lever");
    case "BULK_LEVER_SCRAPE_VISIBLE":
      return runBulkSourceScrape("lever", { paginated: false });
    case "BULK_LEVER_SCRAPE_PAGINATED":
      return runBulkSourceScrape("lever", {
        paginated: true,
        ...(message.payload as object),
      });

    case "BULK_WORKDAY_GET_PAGE_STATE":
      return getBulkSourcePageState("workday");
    case "BULK_WORKDAY_SCRAPE_VISIBLE":
      return runBulkSourceScrape("workday", { paginated: false });
    case "BULK_WORKDAY_SCRAPE_PAGINATED":
      return runBulkSourceScrape("workday", {
        paginated: true,
        ...(message.payload as object),
      });

    case "MULTISTEP_STEP_TRANSITION":
      // P3 / #36 #37 — background's webNavigation listener saw a step
      // transition for this tab. The controller dispatches to the active
      // provider handler (Workday / Greenhouse), which re-fills the new DOM.
      await multistepController.onWebNavigationTransition();
      return { success: true };

    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

async function getSurfaceContext(): Promise<PageSurfaceContext> {
  if (!scrapedJob) {
    await refreshScrapedJob();
    void updateSidebar();
  }
  const sidebar = sidebarController.getStatus();
  return {
    tab: {
      url: window.location.href,
      host: window.location.hostname,
      supported: true,
      contentScriptReady: true,
    },
    page: {
      hasApplicationForm: detectedFields.length > 0,
      detectedFieldCount: detectedFields.length,
      detectedUploadCount: detectedUploadFields.length,
      documentUploads: detectedUploadFields.map((field) => ({
        kind: field.kind,
        label: field.label,
        accept: field.accept,
      })),
      job: scrapedJob,
    },
    workspace: sidebar,
  };
}

function isWaterlooWorks(): boolean {
  return /^waterlooworks[-.a-z0-9]*\.uwaterloo\.ca$/i.test(
    window.location.hostname,
  );
}

function getWwPageState() {
  if (!isWaterlooWorks()) {
    return {
      success: true,
      data: { kind: "other", rowCount: 0, hasNextPage: false },
    };
  }
  const rows = getWaterlooWorksRows();
  const nextBtn = getWaterlooWorksNextPageLink();
  const currentPage = document
    .querySelector<HTMLAnchorElement>("a.pagination__link.active")
    ?.textContent?.trim();
  const hasDetail = Array.from(
    document.querySelectorAll<HTMLElement>(".dashboard-header__posting-title"),
  ).some(isVisibleElement);
  return {
    success: true,
    data: {
      kind: rows.length > 0 ? "list" : hasDetail ? "detail" : "other",
      rowCount: rows.length,
      hasNextPage: !!nextBtn && !nextBtn.classList.contains("disabled"),
      currentPage,
    },
  };
}

function isVisibleElement(el: HTMLElement): boolean {
  if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return !!(el.offsetParent || el.getClientRects().length > 0);
}

// P3/#39 — Generic bulk-source plumbing for Greenhouse/Lever/Workday.
type BulkSource = "greenhouse" | "lever" | "workday";

interface BulkOrchestratorLike {
  scrapeAllVisible(opts: {
    throttleMs?: number;
    maxJobs?: number;
    onProgress?: (p: {
      scrapedCount: number;
      attemptedCount: number;
      currentPage: number;
      totalRowsOnPage: number;
      done: boolean;
      errors: string[];
    }) => void;
  }): Promise<ScrapedJob[]>;
  scrapeAllPaginated(opts: {
    throttleMs?: number;
    maxJobs?: number;
    maxPages?: number;
    onProgress?: (p: {
      scrapedCount: number;
      attemptedCount: number;
      currentPage: number;
      totalRowsOnPage: number;
      done: boolean;
      errors: string[];
    }) => void;
  }): Promise<ScrapedJob[]>;
}

function getOrchestratorForSource(source: BulkSource): BulkOrchestratorLike {
  switch (source) {
    case "greenhouse":
      return new GreenhouseOrchestrator();
    case "lever":
      return new LeverOrchestrator();
    case "workday":
      return new WorkdayOrchestrator();
  }
}

function isBulkSourceHandled(source: BulkSource, url: string): boolean {
  switch (source) {
    case "greenhouse":
      return GreenhouseOrchestrator.canHandle(url);
    case "lever":
      return LeverOrchestrator.canHandle(url);
    case "workday":
      return WorkdayOrchestrator.canHandle(url);
  }
}

/**
 * Selectors used to count visible rows for the popup's "Detected: <source> —
 * N rows" badge. Each list mirrors the orchestrator's row selectors but stays
 * out-of-band so we can probe the page cheaply without instantiating the
 * orchestrator just to count.
 */
const BULK_ROW_SELECTORS: Record<BulkSource, string[]> = {
  greenhouse: [
    "div.opening",
    ".job-post",
    '[data-mapped="true"]',
    "section.level-0 div.opening",
  ],
  lever: [".posting", '[data-qa="posting-name"]'],
  workday: [
    '[data-automation-id="jobResults"] li',
    '[data-automation-id="jobResults"] [role="listitem"]',
    'ul[role="list"] li[data-automation-id*="job"]',
    "li.css-1q2dra3",
  ],
};

const BULK_NEXT_SELECTORS: Record<BulkSource, string[]> = {
  greenhouse: [
    'a[rel="next"]',
    'a[aria-label="Next page" i]',
    'button[aria-label="Next" i]',
    ".pagination .next a",
  ],
  lever: [
    'a[rel="next"]',
    'button[aria-label="Next" i]',
    'button[aria-label="Load more" i]',
  ],
  workday: [
    'button[data-uxi-element-id="next"]',
    'nav[aria-label="pagination"] button[aria-label*="next" i]',
    'button[aria-label="next" i]',
  ],
};

function countBulkRows(source: BulkSource): number {
  for (const selector of BULK_ROW_SELECTORS[source]) {
    const matches = document.querySelectorAll(selector);
    if (matches.length > 0) return matches.length;
  }
  return 0;
}

function bulkHasNextPage(source: BulkSource): boolean {
  for (const selector of BULK_NEXT_SELECTORS[source]) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    if (
      el.hasAttribute("disabled") ||
      el.getAttribute("aria-disabled") === "true" ||
      el.classList.contains("disabled")
    ) {
      continue;
    }
    return true;
  }
  return false;
}

function getBulkSourcePageState(source: BulkSource) {
  const url = window.location.href;
  if (!isBulkSourceHandled(source, url)) {
    return {
      success: true,
      data: { detected: false, rowCount: 0, hasNextPage: false },
    };
  }
  const rowCount = countBulkRows(source);
  return {
    success: true,
    data: {
      detected: rowCount > 0,
      rowCount,
      hasNextPage: bulkHasNextPage(source),
    },
  };
}

async function runBulkSourceScrape(
  source: BulkSource,
  opts: { paginated: boolean; maxJobs?: number; maxPages?: number },
) {
  const url = window.location.href;
  if (!isBulkSourceHandled(source, url)) {
    return { success: false, error: `Not a ${source} listing page` };
  }
  const orchestrator = getOrchestratorForSource(source);
  let errors: string[] = [];
  let pages = 1;
  const onProgress = (p: {
    scrapedCount: number;
    attemptedCount: number;
    currentPage: number;
    totalRowsOnPage: number;
    done: boolean;
    errors: string[];
  }) => {
    pages = p.currentPage;
    errors = p.errors;
    // Best-effort progress fan-out. The background routes it to the popup.
    sendMessage({
      type: `BULK_${source.toUpperCase()}_PROGRESS`,
      payload: p,
    } as never).catch(() => undefined);
  };

  const jobs = opts.paginated
    ? await orchestrator.scrapeAllPaginated({
        onProgress,
        maxJobs: opts.maxJobs,
        maxPages: opts.maxPages,
      })
    : await orchestrator.scrapeAllVisible({ onProgress });

  if (jobs.length === 0) {
    return {
      success: true,
      data: { imported: 0, attempted: 0, pages, errors },
    };
  }
  const importResp = await sendMessage<{
    imported: number;
    opportunityIds: string[];
    pendingCount: number;
    dedupedIds?: string[];
  }>(Messages.importJobsBatch(jobs));
  if (!importResp.success) {
    return {
      success: false,
      error: importResp.error || "Bulk import failed",
    };
  }
  return {
    success: true,
    data: {
      imported: importResp.data?.imported ?? jobs.length,
      attempted: jobs.length,
      pages,
      duplicateCount:
        importResp.data?.dedupedIds?.length ??
        Math.max(0, jobs.length - (importResp.data?.imported ?? jobs.length)),
      dedupedIds: importResp.data?.dedupedIds,
      errors,
    },
  };
}

const BULK_SCRAPE_CHUNK_SIZE = 5;

async function runWwBulkScrape(opts: {
  paginated: boolean;
  maxJobs?: number;
  maxPages?: number;
}) {
  if (!isWaterlooWorks()) {
    return { success: false, error: "Not a WaterlooWorks page" };
  }
  // Abort any previous scrape and install our controller. The popup's
  // "Stop" button sends WW_BULK_CANCEL which calls .abort() on this.
  currentWwBulkController?.abort();
  const controller = new AbortController();
  currentWwBulkController = controller;
  const orchestrator = new WaterlooWorksOrchestrator();
  let errors: string[] = [];
  let pages = 1;
  let aborted = false;

  // Ask the background for posting IDs we've already imported. The
  // orchestrator skips those rows entirely (no modal open, no scrape).
  // Best-effort — failures fall back to "no filter" so we still scrape.
  let skipSourceJobIds: Set<string> | undefined;
  try {
    const resp = await sendMessage<{ ids: string[] }>({
      type: "GET_IMPORTED_SOURCE_JOB_IDS",
      // Must match `WaterlooWorksScraper.source` ("waterlooworks", no
      // underscore) — that's what gets stored in jobs.source on import,
      // and what listSourceJobIds filters by.
      payload: { source: "waterlooworks" },
    } as never);
    if (resp.success && Array.isArray(resp.data?.ids)) {
      skipSourceJobIds = new Set(resp.data.ids);
    }
  } catch {
    // Background unavailable — proceed without dedupe filter.
  }

  // Aggregate import stats across streaming chunks.
  let importedTotal = 0;
  let attemptedTotal = 0;
  const dedupedIdsAll: string[] = [];

  const onChunk = async (chunk: ScrapedJob[]) => {
    if (chunk.length === 0) return;
    attemptedTotal += chunk.length;
    try {
      const importResp = await sendMessage<{
        imported: number;
        opportunityIds: string[];
        pendingCount: number;
        dedupedIds?: string[];
      }>(Messages.importJobsBatch(chunk));
      if (importResp.success && importResp.data) {
        importedTotal += importResp.data.imported ?? 0;
        if (importResp.data.dedupedIds) {
          dedupedIdsAll.push(...importResp.data.dedupedIds);
        }
      }
    } catch {
      // Best-effort — a single chunk failure shouldn't abort the whole
      // scrape. Errors flow through onProgress.errors.
    }
  };

  const onProgress = (p: {
    scrapedCount: number;
    attemptedCount: number;
    currentPage: number;
    totalRowsOnPage: number;
    done: boolean;
    errors: string[];
  }) => {
    pages = p.currentPage;
    errors = p.errors;
    // Fire-and-forget progress event to the background, which mirrors it
    // (for popup rehydrate) and re-broadcasts to the open popup if any.
    sendMessage({
      type: "WW_BULK_PROGRESS",
      payload: p,
    } as never).catch(() => undefined);
  };
  let jobs: ScrapedJob[];
  try {
    jobs = opts.paginated
      ? await orchestrator.scrapeAllPaginated({
          onProgress,
          maxJobs: opts.maxJobs,
          maxPages: opts.maxPages,
          signal: controller.signal,
          skipSourceJobIds,
          chunkSize: BULK_SCRAPE_CHUNK_SIZE,
          onChunk,
        })
      : await orchestrator.scrapeAllVisible({
          onProgress,
          signal: controller.signal,
          skipSourceJobIds,
          chunkSize: BULK_SCRAPE_CHUNK_SIZE,
          onChunk,
        });
    aborted = controller.signal.aborted;
    // Flush any trailing partial chunk (jobs.length not a multiple of N).
    const remainder = jobs.length % BULK_SCRAPE_CHUNK_SIZE;
    if (remainder > 0) {
      await onChunk(jobs.slice(jobs.length - remainder));
    }
  } finally {
    if (currentWwBulkController === controller) {
      currentWwBulkController = null;
    }
    // Always emit a terminal `done:true` event so the popup's progress UI
    // clears, regardless of which mode ran (scrapeAllPaginated emits its
    // own done event, scrapeAllVisible does not — wire both here).
    sendMessage({
      type: "WW_BULK_PROGRESS",
      payload: {
        scrapedCount: 0,
        attemptedCount: 0,
        currentPage: pages,
        totalRowsOnPage: 0,
        done: true,
        errors,
      },
    } as never).catch(() => undefined);
  }

  return {
    success: true,
    data: {
      imported: importedTotal,
      attempted: attemptedTotal,
      pages,
      duplicateCount: dedupedIdsAll.length,
      dedupedIds: dedupedIdsAll,
      skipped: skipSourceJobIds ? skipSourceJobIds.size : 0,
      errors,
      aborted,
    },
  };
}

async function handleFillForm(options: { overwriteExisting?: boolean } = {}) {
  if (detectedFields.length === 0) {
    return { success: false, error: "No fields detected" };
  }

  // Get profile if not cached
  if (!cachedProfile) {
    const response = await sendMessage<ExtensionProfile>(Messages.getProfile());
    if (!response.success || !response.data) {
      return { success: false, error: "Failed to load profile" };
    }
    cachedProfile = response.data;
  }

  // Create mapper and engine
  const mapper = new FieldMapper(cachedProfile);
  autoFillEngine = new AutoFillEngine(fieldDetector, mapper);

  // Read the cold-zone floor from settings. Defaults to the legacy 0.5 if
  // settings aren't available (e.g. transient background-storage failure).
  let minimumConfidence = 0.5;
  try {
    const settings = await getExtensionSettings();
    minimumConfidence = settings.minimumConfidence;
  } catch (err) {
    console.warn("[Slothing] Failed to load settings; using default 0.5", err);
  }

  // Fill the form. Hand each successful fill to the corrections tracker so
  // edits-after-fill flow back into the per-domain field mapping (#33).
  const result = await autoFillEngine.fillForm(detectedFields, {
    minimumConfidence,
    overwriteExisting: options.overwriteExisting,
    onFilled: ({ field, value }) => {
      correctionsTracker.track(field, value);
    },
  });
  if (result.filled >= 2) {
    for (const form of new Set(
      detectedFields
        .map((field) => field.element.closest("form"))
        .filter(
          (form): form is HTMLFormElement => form instanceof HTMLFormElement,
        ),
    )) {
      autofilledForms.add(form);
    }
  }
  return { success: true, data: result };
}

// Opens the web answer-bank page in a new tab, pre-seeded with the question
// label. Used by the "Generate new" button in the inline popover. The
// background returns the configured Slothing API base URL alongside the auth
// status, which is the same host the user's logged-in answer bank lives on.
async function openAnswerBankSeed(question: string) {
  const auth = await sendMessage<{ apiBaseUrl: string }>(
    Messages.getAuthStatus(),
  );
  const base = (auth.success && auth.data?.apiBaseUrl) || DEFAULT_API_BASE_URL;
  const url = `${base.replace(/\/$/, "")}/en/bank?seed=${encodeURIComponent(question)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// P2/#35 — scan textareas + decorate matches with the floating 💡 popover.
// Idempotent: the decorator marks each textarea so re-scans don't double-mount.
function scanForAnswerBankTextareas() {
  // querySelectorAll across the whole document. Workday/Greenhouse essay
  // fields don't always live inside a <form>, so we don't scope this to forms.
  const textareas = document.querySelectorAll<HTMLTextAreaElement>("textarea");
  for (const textarea of textareas) {
    try {
      if (!shouldDecorateTextarea(textarea)) continue;
      mountAnswerBankButton(textarea, {
        onMatch: async (q, limit) => {
          const response = await sendMessage<AnswerBankMatch[]>(
            Messages.matchAnswerBank({ q, limit: limit ?? 3 }),
          );
          if (!response.success) {
            throw new Error(
              response.error || "Couldn't reach the Slothing answer bank.",
            );
          }
          return response.data || [];
        },
        onPick: () => {
          // The decorator handles the DOM insertion (value + input/change
          // events). Nothing else to do here — kept as a hook for future
          // analytics / corrections (#33).
        },
        onGenerate: (q) => {
          // V1: ask the background to open the web answer-bank page with the
          // question pre-seeded. A streamed generation endpoint is deferred
          // to a follow-up (called out in the PR body).
          openAnswerBankSeed(q).catch((err) =>
            console.warn("[Slothing] open bank failed:", err),
          );
        },
      });
    } catch (err) {
      // A single textarea failure shouldn't abort the scan.
      console.warn("[Slothing] answer-bank decorate failed:", err);
    }
  }
}

async function getExtensionSettings(): Promise<ExtensionSettings> {
  const response = await sendMessage<ExtensionSettings>(Messages.getSettings());
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to load extension settings");
  }
  return response.data;
}

async function updateSidebar() {
  const profile = await loadProfileForSidebar();
  const latestResume = await loadLatestResumeForSidebar();
  await sidebarController.update({
    scrapedJob,
    detectedFieldCount: detectedFields.length,
    detectedUploadCount: detectedUploadFields.length,
    latestResume,
    profile,
    onTailor: async () => {
      if (!scrapedJob) throw new Error("No job detected");
      const response = await sendMessage<{ url: string }>(
        Messages.tailorFromPage(scrapedJob),
      );
      if (!response.success || !response.data?.url) {
        throw new Error(response.error || "Failed to tailor resume");
      }
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    },
    onCoverLetter: async () => {
      if (!scrapedJob) throw new Error("No job detected");
      const response = await sendMessage<{ url: string }>(
        Messages.generateCoverLetterFromPage(scrapedJob),
      );
      if (!response.success || !response.data?.url) {
        throw new Error(response.error || "Failed to generate cover letter");
      }
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    },
    onSave: async () => {
      if (!scrapedJob) throw new Error("No job detected");
      const response = await sendMessage(Messages.importJob(scrapedJob));
      if (!response.success) {
        throw new Error(response.error || "Failed to save job");
      }
    },
    onAutoFill: async (options) => {
      // P3 / #36 #37 — Workday / Greenhouse get the multi-step pipeline so
      // subsequent steps in the application are filled automatically. Other
      // sites fall through to the single-page `handleFillForm` path.
      const provider = multistepController.init();
      if (provider) {
        const ok = await multistepController.confirm();
        if (!ok) {
          // The controller's confirm() returns false when there were no
          // fillable fields detected on the current page. Fall back to the
          // single-page path so users still get a meaningful error.
          const response = await handleFillForm(options);
          if (!response.success) {
            throw new Error(response.error || "Failed to auto-fill form");
          }
          return response.data;
        }
        return;
      }

      const response = await handleFillForm(options);
      if (!response.success) {
        throw new Error(response.error || "Failed to auto-fill form");
      }
      return response.data;
    },
    onOpenLatestResume: async () => {
      const auth = await sendMessage<{ apiBaseUrl: string }>(
        Messages.getAuthStatus(),
      );
      const base =
        (auth.success && auth.data?.apiBaseUrl) || DEFAULT_API_BASE_URL;
      const resumeParam = latestResume
        ? `?from=extension&tailorId=${encodeURIComponent(latestResume.id)}`
        : "";
      window.open(
        `${base.replace(/\/$/, "")}/en/studio${resumeParam}`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    onSearchAnswers: async (query) => {
      const response = await sendMessage<SimilarAnswer[]>(
        Messages.searchAnswers(query),
      );
      if (!response.success) {
        throw new Error(response.error || "Answer search failed");
      }
      return response.data || [];
    },
    onApplyAnswer: (answer) => {
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        active.value = answer.answer;
        active.dispatchEvent(new Event("input", { bubbles: true }));
        active.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    onChatStream: ({ prompt, intent, onToken, signal }) =>
      streamChat({ prompt, intent, onToken, signal }),
    onUseInCoverLetter: (seedText) => {
      void openCoverLetterStudio(seedText);
    },
  });
}

async function loadLatestResumeForSidebar(): Promise<ExtensionResumeSummary | null> {
  if (detectedUploadFields.length === 0) return null;
  try {
    const response = await sendMessage<ExtensionResumeSummary[]>(
      Messages.listResumes(),
    );
    if (!response.success) return null;
    return response.data?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * P4/#40 — Build the trimmed job-context payload sent to the background's
 * chat port. We deliberately drop large fields like `responsibilities` and
 * cap the description here too so we don't blow message-size limits before
 * the SW even sees it; the server clamps again as a safety net.
 */
function buildChatJobContext(): ChatJobContext | undefined {
  if (!scrapedJob) return undefined;
  const context: ChatJobContext = {
    title: scrapedJob.title,
    company: scrapedJob.company,
  };
  if (scrapedJob.location) context.location = scrapedJob.location;
  if (scrapedJob.description) {
    context.description = scrapedJob.description.slice(0, 2400);
  }
  if (scrapedJob.requirements?.length) {
    context.requirements = scrapedJob.requirements.slice(0, 10);
  }
  if (scrapedJob.url) context.url = scrapedJob.url;
  if (scrapedJob.sourceJobId) context.sourceJobId = scrapedJob.sourceJobId;
  return context;
}

/**
 * P4/#40 — Open a long-lived `chrome.runtime.connect` Port to the background
 * service worker, post a CHAT_STREAM_START frame, and resolve / reject the
 * returned Promise based on the terminal frame the background sends back.
 *
 * We chose a Port (rather than chrome.tabs.sendMessage round-trips) because:
 *   1. The SW can stream tokens back-to-back without needing the tab id.
 *   2. Either side disconnecting cleanly tears down the other half — so an
 *      AbortSignal from the React UI can cancel the upstream LLM call by
 *      simply disconnecting the port.
 */
async function streamChat(params: {
  prompt: string;
  intent: ChatIntent;
  onToken: (token: string) => void;
  signal: AbortSignal;
}): Promise<void> {
  const startFrame: ChatStreamStartPayload = {
    type: "CHAT_STREAM_START",
    prompt: params.prompt,
    jobContext: buildChatJobContext(),
  };

  return new Promise<void>((resolve, reject) => {
    let port: chrome.runtime.Port;
    try {
      port = chrome.runtime.connect({ name: CHAT_PORT_NAME });
    } catch (error) {
      reject(new Error(messageForError(error)));
      return;
    }

    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      params.signal.removeEventListener("abort", onAbort);
      try {
        port.disconnect();
      } catch {
        // Already torn down.
      }
      if (err) reject(err);
      else resolve();
    };

    const onAbort = () => finish(new Error("Cancelled"));
    params.signal.addEventListener("abort", onAbort);

    port.onMessage.addListener((message: ChatPortMessage) => {
      switch (message.type) {
        case "CHAT_STREAM_TOKEN":
          params.onToken(message.token);
          break;
        case "CHAT_STREAM_END":
          finish();
          break;
        case "CHAT_STREAM_ERROR":
          finish(new Error(message.error));
          break;
        default:
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      // Background-initiated disconnect with no terminal frame = treat as a
      // generic failure so the UI surfaces a sensible message.
      if (!settled) {
        const runtimeError = chrome.runtime.lastError?.message;
        finish(new Error(runtimeError || "Chat stream closed unexpectedly."));
      }
    });

    try {
      port.postMessage(startFrame);
    } catch (error) {
      finish(new Error(messageForError(error)));
    }
  });
}

/**
 * P4/#40 — Open `/studio?mode=cover_letter&jobId=...&seed=...` in a new tab,
 * URL-encoding the seed text and truncating to keep the URL short.
 */
async function openCoverLetterStudio(seedText: string): Promise<void> {
  const auth = await sendMessage<{ apiBaseUrl: string }>(
    Messages.getAuthStatus(),
  );
  const base = (
    (auth.success && auth.data?.apiBaseUrl) ||
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");

  const params = new URLSearchParams({
    mode: "cover_letter",
    seed: seedText,
  });
  if (scrapedJob?.sourceJobId) {
    params.set("jobId", scrapedJob.sourceJobId);
  } else if (scrapedJob?.url) {
    params.set("jobUrl", scrapedJob.url);
  }
  window.open(
    `${base}/studio?${params.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
}

async function loadProfileForSidebar(): Promise<ExtensionProfile | null> {
  if (cachedProfile) return cachedProfile;
  if (!profileLoadPromise) {
    profileLoadPromise = sendMessage<ExtensionProfile>(Messages.getProfile())
      .then((response) => {
        if (response.success && response.data) {
          cachedProfile = response.data;
          return response.data;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        profileLoadPromise = null;
      });
  }

  return profileLoadPromise;
}

window.addEventListener("pagehide", () => {
  submitWatcher.detach();
  sidebarController.destroy();
  correctionsTracker.clear();
  // P2/#35 — tear down every mounted answer-bank decoration so we don't leak
  // ResizeObservers or React roots when the page is bfcache-restored.
  unmountAllAnswerBankButtons();
  // P3 / #36 #37 — destroy the per-provider observers + dismiss any
  // in-flight fallback toast.
  multistepController.destroy();
});

// Utility: debounce function
function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

console.log("[Slothing] Content script loaded");

// Pick up a localStorage-transported auth token from the Slothing connect page.
// Used on browsers that don't honor externally_connectable (Firefox in
// particular). The connect page writes the token under this key; we forward it
// to the background, which stores it in chrome.storage.local and clears the
// localStorage entry. Polls for ~30s in case the script runs before the page
// has written the key.
const SLOTHING_TOKEN_KEY = "slothing_extension_token";

// Returns "picked" when the token was forwarded to the background AND the
// localStorage entry was cleared (i.e., success), "empty" when there is
// nothing to do, or "pending" when a token is present but pickup is still in
// flight. The polling loop keeps going until the LS entry is gone (success)
// or the deadline lapses, so a single failed sendMessage doesn't strand the
// token forever on Firefox where this path is the only transport.
type PickupResult = "picked" | "empty" | "pending";

let pickupInFlight = false;

function pickUpSlothingToken(): PickupResult {
  try {
    const raw = localStorage.getItem(SLOTHING_TOKEN_KEY);
    if (!raw) return "empty";
    const parsed = JSON.parse(raw) as {
      token?: string;
      expiresAt?: string;
      apiBaseUrl?: string;
    };
    if (!parsed?.token || !parsed?.expiresAt) {
      // Malformed payload — purge so we stop polling.
      try {
        localStorage.removeItem(SLOTHING_TOKEN_KEY);
      } catch {
        // ignore
      }
      return "empty";
    }
    if (pickupInFlight) return "pending";
    pickupInFlight = true;
    chrome.runtime.sendMessage(
      {
        type: "AUTH_CALLBACK",
        token: parsed.token,
        expiresAt: parsed.expiresAt,
        apiBaseUrl: parsed.apiBaseUrl || window.location.origin,
      },
      (response: { success?: boolean } | undefined) => {
        pickupInFlight = false;
        if (response?.success) {
          try {
            localStorage.removeItem(SLOTHING_TOKEN_KEY);
          } catch {
            // ignore
          }
          console.log("[Slothing] picked up localStorage token");
        }
      },
    );
    return "pending";
  } catch {
    return "empty";
  }
}

if (
  /(^|\.)localhost(:|$)|^127\.0\.0\.1(:|$)|^\[::1\](:|$)/.test(
    window.location.host,
  ) ||
  /(^|\.)slothing\.work(:|$)/.test(window.location.host)
) {
  // Initial probe: if there's nothing to pick up and we're not on the connect
  // page itself, there's no reason to poll — the page hasn't been opened.
  // On the connect page (or anywhere else if the user is about to land on
  // /extension/connect via SPA nav), keep polling for 30s.
  const initial = pickUpSlothingToken();
  const onConnectPath = /\/extension\/connect(\b|\/)/.test(
    window.location.pathname,
  );
  if (initial !== "empty" || onConnectPath) {
    let elapsedMs = 0;
    const intervalId = setInterval(() => {
      elapsedMs += 500;
      const result = pickUpSlothingToken();
      if (
        (!onConnectPath &&
          result === "empty" &&
          !pickupInFlight &&
          elapsedMs > 2000) ||
        elapsedMs >= 30_000
      ) {
        clearInterval(intervalId);
      }
    }, 500);
  }
}
