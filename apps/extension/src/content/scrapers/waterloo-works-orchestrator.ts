// Orchestrator for bulk WaterlooWorks scraping. Walks the visible postings
// table, opens each row's detail panel, runs the single-posting scraper, and
// yields the results. Two modes:
//
//   scrapeAllVisible()   — current page only
//   scrapeAllPaginated() — current page, then clicks "Next page" and repeats
//                          until there is no next page (or the hard cap hits).
//
// Lives in the content script. Pagination + row clicks rely on selectors
// observed on the live modern WW UI in 2026-05. If WW redesigns again, the
// orchestrator will return [] gracefully (no exceptions thrown to the caller).

import type { ScrapedJob } from "../../shared/types";
import { WaterlooWorksScraper } from "./waterloo-works-scraper";

export type OrchestratorProgress = {
  scrapedCount: number;
  attemptedCount: number;
  currentPage: number;
  totalRowsOnPage: number;
  lastTitle?: string;
  done: boolean;
  errors: string[];
};

export type OrchestratorOptions = {
  // Maximum number of jobs to scrape across all pages. Default 200.
  maxJobs?: number;
  // Maximum pages to traverse in paginated mode. Default 50.
  maxPages?: number;
  // ms to wait between actions (row click, panel close, page change). Lower
  // values are faster but more likely to race against the SPA's DOM updates.
  throttleMs?: number;
  // Called after each row attempt with cumulative progress. Used to drive the
  // popup progress UI.
  onProgress?: (p: OrchestratorProgress) => void;
  // Abort the in-flight scrape between rows / pages. The popup wires its
  // "Stop" button to an AbortController and forwards the signal here.
  signal?: AbortSignal;
  // Pre-scrape dedupe filter. Rows whose ID is in this set are skipped
  // without opening their modal — saves the bulk of per-row time on
  // re-scrapes. Populated by the background from the user's already-
  // imported posting IDs for this source.
  skipSourceJobIds?: Set<string>;
  // Streaming import: flush every N scraped jobs via onChunk so the
  // review queue fills live instead of one big-bang at the end. Each
  // batch is independent — partial scrapes survive a crash.
  chunkSize?: number;
  onChunk?: (chunk: ScrapedJob[]) => Promise<void>;
};

const DEFAULT_THROTTLE_MS = 500;
const ROW_SELECTORS = [
  "table.data-viewer-table tbody tr.table__row--body",
  "table.data-viewer-table tbody tr",
  ".data-viewer-table [role='row']",
  "table tbody tr.table__row--body",
  "table tbody tr",
  "[role='rowgroup'] [role='row']",
  "[role='table'] [role='row']",
  ".table__row--body",
  ".table__row",
] as const;
const ROW_TITLE_CONTROL_SELECTOR =
  "td a, td button, [role='cell'] a, [role='cell'] button";
const POSTING_PANEL_SELECTOR = ".dashboard-header__posting-title";
const NEXT_PAGE_SELECTOR = 'a.pagination__link[aria-label="Go to next page"]';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isHidden(el: HTMLAnchorElement | HTMLElement | null): boolean {
  if (!el) return true;
  return el.classList.contains("disabled");
}

export function getWaterlooWorksRows(): HTMLElement[] {
  for (const selector of ROW_SELECTORS) {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).filter(isLikelyPostingRow);
    if (rows.length > 0) return dedupeElements(rows);
  }

  // Fallback: walk up from each plausible job-title control to the nearest
  // row-like ancestor. Doesn't require <table> markup — covers grid + list
  // variants WW has used over the years.
  const controls = Array.from(
    document.querySelectorAll<HTMLElement>(
      "a[href='javascript:void(0)'], td a, td button, [role='cell'] a, [role='cell'] button",
    ),
  );
  const rowAncestors = controls
    .map((el) => findRowAncestor(el))
    .filter((row): row is HTMLElement => !!row)
    .filter(isLikelyPostingRow);
  return dedupeElements(rowAncestors);
}

const ROW_ANCESTOR_SELECTOR =
  "tr, [role='row'], li, .table__row, .table__row--body, [class*='posting-row'], [class*='job-row'], [class*='listing-row']";

function findRowAncestor(el: HTMLElement): HTMLElement | null {
  return el.closest<HTMLElement>(ROW_ANCESTOR_SELECTOR);
}

export function getWaterlooWorksNextPageLink(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(NEXT_PAGE_SELECTOR) ||
    Array.from(document.querySelectorAll<HTMLElement>("a, button")).find((el) =>
      /next/i.test(el.getAttribute("aria-label") || el.textContent || ""),
    ) ||
    null
  );
}

// One-shot debug guard. Logs the first row's cell layout once per
// page-load so a real-DOM scrape leaves a breadcrumb in the console
// without spamming the log per-row. Reset when the module re-loads.
let rowMetaDebugLogged = false;

/**
 * Read the (sourceJobId, applicants) pair off a list row before we click it
 * open. Both come from the table cells — the modal does NOT show applicant
 * count, so this is our only chance to capture it. The orchestrator merges
 * these into the scraped job after scrape returns.
 *
 * Stricter than the previous version (which mis-fired on title cells that
 * contained 6+ digits embedded in text). Rules:
 *
 *   - sourceJobId: a cell whose trimmed text is *just* a 6-digit number,
 *     optionally prefixed by a status-bullet glyph ("●" / "•" / "*") or
 *     other non-digit decoration. Cells with mixed text like
 *     "Co-op - 13092" or "Hourly $50,000" don't qualify.
 *   - applicants: the rightmost cell whose trimmed text is *just* a
 *     1-4 digit integer. Won't double-count the ID cell.
 *
 * Cells holding the job title link/button are excluded — they often
 * contain digits embedded in text.
 */
export function readWaterlooWorksRowMeta(row: HTMLElement): {
  sourceJobId?: string;
  applicants?: number;
} {
  const cells = Array.from(
    row.querySelectorAll<HTMLElement>("td, th, [role='cell']"),
  );

  let sourceJobId: string | undefined;
  let lastShortInt: number | undefined;
  const debugCells: Array<{ text: string; matched: string | null }> = [];

  for (const cell of cells) {
    // Skip the title cell — its anchor/button text frequently contains
    // years or numeric codes that would otherwise be picked up here.
    if (
      cell.querySelector(
        "a[href='javascript:void(0)'], a.overflow--ellipsis, button",
      )
    ) {
      debugCells.push({
        text: (cell.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        matched: "skipped:title-cell",
      });
      continue;
    }

    const text = (cell.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    // Strip a single decorative non-digit prefix (status bullet, etc.)
    // before testing. This catches "● 471268" → "471268". We don't
    // strip ALL non-digits — that would let "Co-op - 471268" through.
    const stripped = text.replace(/^[^0-9]{0,3}\s*/, "");

    let matched: string | null = null;
    if (!sourceJobId && /^\d{6,7}$/.test(stripped)) {
      sourceJobId = stripped;
      matched = `id:${stripped}`;
    } else if (/^\d{1,4}$/.test(stripped)) {
      const n = Number.parseInt(stripped, 10);
      if (Number.isFinite(n)) {
        lastShortInt = n;
        matched = `shortInt:${n}`;
      }
    }
    debugCells.push({ text: text.slice(0, 60), matched });
  }

  if (!rowMetaDebugLogged) {
    rowMetaDebugLogged = true;
    console.log("[Slothing][WW] row-meta first-row diagnostic", {
      cells: debugCells,
      result: { sourceJobId, applicants: lastShortInt },
      rowHtml: row.outerHTML.slice(0, 800),
    });
  }

  return { sourceJobId, applicants: lastShortInt };
}

function isLikelyPostingRow(row: HTMLElement): boolean {
  const text = normalizeText(row.textContent || "");
  if (!text) return false;
  if (
    /^(job title|organization|work term|location|level|applications?)$/i.test(
      text,
    )
  ) {
    return false;
  }
  // Skip true header rows only. WaterlooWorks (and any accessible table)
  // puts a `<th scope="row">` on the row-header cell of every body row, so
  // a naive `querySelector("th")` rejection silently drops every real row.
  if (isHeaderRow(row)) return false;
  if (row.querySelector(ROW_TITLE_CONTROL_SELECTOR)) return true;
  if (row.querySelector("a, button")) return text.length > 8;
  const cells = row.querySelectorAll("td, [role='cell']");
  return cells.length >= 2 && text.length > 12;
}

/**
 * A row is a real "header row" only if it lives in <thead>, or if all its
 * own cells are <th> (no <td>s mixed in). Body rows that use
 * `<th scope="row">` for the ID column alongside data <td>s are NOT headers.
 */
function isHeaderRow(row: HTMLElement): boolean {
  // Walk up from the row to the enclosing table; if we pass through <thead>
  // first, this row is a column-header row.
  let parent: HTMLElement | null = row.parentElement;
  while (parent && parent.tagName !== "TABLE") {
    if (parent.tagName === "THEAD") return true;
    if (parent.tagName === "TBODY" || parent.tagName === "TFOOT") break;
    parent = parent.parentElement;
  }
  // Inspect direct cell children. A row composed entirely of <th> is a
  // header row even if it lives in <tbody> (e.g. legacy markup).
  const directCells = Array.from(row.children).filter(
    (c) => c.tagName === "TD" || c.tagName === "TH",
  );
  if (directCells.length === 0) return false;
  return directCells.every((c) => c.tagName === "TH");
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function dedupeElements<T extends HTMLElement>(items: T[]): T[] {
  return Array.from(new Set(items));
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs: number,
  intervalMs = 100,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await sleep(intervalMs);
  }
  return false;
}

export class WaterlooWorksOrchestrator {
  private scraper = new WaterlooWorksScraper();

  /** Scrape every row visible on the current page. */
  async scrapeAllVisible(
    opts: OrchestratorOptions = {},
  ): Promise<ScrapedJob[]> {
    const { jobs } = await this.scrapeCurrentPage({
      scrapedSoFar: 0,
      pageIndex: 1,
      opts,
      errors: [],
    });
    return jobs;
  }

  /** Walk every row across every page (capped by maxJobs / maxPages). */
  async scrapeAllPaginated(
    opts: OrchestratorOptions = {},
  ): Promise<ScrapedJob[]> {
    const maxJobs = opts.maxJobs ?? 200;
    const maxPages = opts.maxPages ?? 50;
    const throttle = opts.throttleMs ?? DEFAULT_THROTTLE_MS;

    const allJobs: ScrapedJob[] = [];
    const errors: string[] = [];
    let pageIndex = 1;

    while (pageIndex <= maxPages && allJobs.length < maxJobs) {
      if (opts.signal?.aborted) break;
      const { jobs, stopReason } = await this.scrapeCurrentPage({
        scrapedSoFar: allJobs.length,
        pageIndex,
        opts: { ...opts, maxJobs },
        errors,
      });
      allJobs.push(...jobs);

      if (stopReason === "cap-hit" || stopReason === "aborted") break;

      // Try to go to the next page
      const advanced = await this.goToNextPage(throttle);
      if (!advanced) break;
      pageIndex++;
    }

    opts.onProgress?.({
      scrapedCount: allJobs.length,
      attemptedCount: allJobs.length,
      currentPage: pageIndex,
      totalRowsOnPage: this.getRows().length,
      done: true,
      errors,
    });

    return allJobs;
  }

  private async scrapeCurrentPage(args: {
    scrapedSoFar: number;
    pageIndex: number;
    opts: OrchestratorOptions;
    errors: string[];
  }): Promise<{
    jobs: ScrapedJob[];
    stopReason?: "cap-hit" | "aborted";
  }> {
    const { scrapedSoFar, pageIndex, opts, errors } = args;
    const maxJobs = opts.maxJobs ?? 200;
    const throttle = opts.throttleMs ?? DEFAULT_THROTTLE_MS;

    const rows = this.getRows();
    const jobs: ScrapedJob[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (opts.signal?.aborted) {
        return { jobs, stopReason: "aborted" };
      }
      if (scrapedSoFar + jobs.length >= maxJobs) {
        return { jobs, stopReason: "cap-hit" };
      }

      // Re-fetch the row each iteration — the DOM may rebuild after panel close.
      const liveRows = this.getRows();
      const row = liveRows[i];
      if (!row) break;

      const titleControl = row.querySelector<HTMLElement>(
        ROW_TITLE_CONTROL_SELECTOR,
      );
      const expectedTitle = titleControl?.textContent?.trim();
      if (!titleControl) continue;

      // Capture row-only metadata BEFORE clicking — the modal hides the
      // table so once we open it we lose access to applicants count + the
      // row's ID cell. We merge these into the scraped job after.
      const rowMeta = readWaterlooWorksRowMeta(row);

      // Pre-scrape dedupe: skip rows whose posting ID is already in the
      // caller's "already imported" set. Saves a panel click + waitFor +
      // scrape per skip, which is the bulk of the per-row time.
      if (
        rowMeta.sourceJobId &&
        opts.skipSourceJobIds?.has(rowMeta.sourceJobId)
      ) {
        opts.onProgress?.({
          scrapedCount: scrapedSoFar + jobs.length,
          attemptedCount: scrapedSoFar + i + 1,
          currentPage: pageIndex,
          totalRowsOnPage: liveRows.length,
          lastTitle: `(skipped: already imported) ${expectedTitle}`,
          done: false,
          errors,
        });
        continue;
      }

      // Capture the panel's current title so we can detect when the new
      // posting's content has actually rendered (the panel may already be
      // visible from a previous row).
      const previousPanelTitle = document
        .querySelector(POSTING_PANEL_SELECTOR + " h2")
        ?.textContent?.trim();

      titleControl.click();

      const opened = await waitFor(
        () => !!document.querySelector(POSTING_PANEL_SELECTOR),
        5000,
      );
      if (!opened) {
        errors.push(`row ${i} (${expectedTitle}): panel did not open`);
        continue;
      }

      // Wait for the panel's h2 to update (or appear for the first time) AND
      // for posting-specific field rows to be present. We check for a
      // recognisable label like "Job Title" — search filters share the same
      // .tag__key-value-list class so a non-zero count is not a reliable
      // signal that the posting body has rendered.
      const fullyRendered = await waitFor(() => {
        const h2 = document
          .querySelector(POSTING_PANEL_SELECTOR + " h2")
          ?.textContent?.trim();
        if (!h2) return false;
        if (previousPanelTitle && h2 === previousPanelTitle) return false;
        const labels = Array.from(
          document.querySelectorAll(
            ".tag__key-value-list.js--question--container .label",
          ),
        ).map((el) => (el.textContent || "").trim().toLowerCase());
        return labels.some(
          (l) => l.startsWith("job title") || l.startsWith("organization"),
        );
      }, 8000);

      if (!fullyRendered) {
        errors.push(`row ${i} (${expectedTitle}): panel never fully rendered`);
        continue;
      }
      await sleep(throttle);

      let job: ScrapedJob | null = null;
      try {
        job = await this.scraper.scrapeJobListing();
      } catch (err) {
        errors.push(
          `row ${i} (${expectedTitle}): ${String(err).slice(0, 200)}`,
        );
      }
      if (job) {
        // Merge row-only metadata: applicants is never in the modal, and
        // sourceJobId from the row is a useful fallback if the modal
        // header parse missed it.
        if (
          typeof rowMeta.applicants === "number" &&
          job.applicants === undefined
        ) {
          job.applicants = rowMeta.applicants;
        }
        if (!job.sourceJobId && rowMeta.sourceJobId) {
          job.sourceJobId = rowMeta.sourceJobId;
        }
        jobs.push(job);
        // Optional streaming flush — hands off accumulated jobs to the
        // caller (runWwBulkScrape) every N jobs so the import can land
        // in chunks instead of one big batch at the end.
        if (
          opts.onChunk &&
          opts.chunkSize &&
          jobs.length > 0 &&
          jobs.length % opts.chunkSize === 0
        ) {
          await opts.onChunk(jobs.slice(jobs.length - opts.chunkSize));
        }
      }

      opts.onProgress?.({
        scrapedCount: scrapedSoFar + jobs.length,
        attemptedCount: scrapedSoFar + i + 1,
        currentPage: pageIndex,
        totalRowsOnPage: liveRows.length,
        lastTitle: job?.title || expectedTitle,
        done: false,
        errors,
      });

      // No need to explicitly close the panel — clicking the next row replaces
      // its content. We only stop here if this was the last row on the page.
      await sleep(throttle);
    }

    return { jobs };
  }

  private async goToNextPage(throttleMs: number): Promise<boolean> {
    const nextBtn = getWaterlooWorksNextPageLink();
    if (!nextBtn || isHidden(nextBtn)) return false;

    // Capture the first row's signature to detect when the page has changed.
    const beforeSig = this.firstRowSignature();
    nextBtn.click();

    const changed = await waitFor(
      () => this.firstRowSignature() !== beforeSig && this.getRows().length > 0,
      8000,
    );
    if (!changed) return false;
    await sleep(throttleMs);
    return true;
  }

  private getRows(): HTMLElement[] {
    return getWaterlooWorksRows();
  }

  private firstRowSignature(): string {
    const row = this.getRows()[0];
    return row?.textContent?.trim().slice(0, 120) || "";
  }
}
