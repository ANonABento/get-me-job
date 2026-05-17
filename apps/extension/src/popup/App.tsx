import React, { useEffect, useState } from "react";
import type {
  ExtensionProfile,
  PageSurfaceContext,
  ScrapedJob,
} from "@/shared/types";
import { formatRelative } from "@slothing/shared/formatters";
import { scoreResume } from "@slothing/shared/scoring";
import { DEFAULT_API_BASE_URL } from "@/shared/types";
import { sendMessage, Messages } from "@/shared/messages";
import { messageForError } from "@/shared/error-messages";
import { opportunityReviewUrl } from "./deep-links";
import {
  BulkSourceCard,
  type BulkScrapeMode,
  type BulkScrapeResult,
} from "./BulkSourceCard";

type ViewState =
  | "loading"
  | "unauthenticated"
  | "session-lost"
  | "authenticated"
  | "error";

interface PageStatus {
  hasForm: boolean;
  hasJobListing: boolean;
  detectedFields: number;
  scrapedJob: ScrapedJob | null;
}

type PageProbeState = "unknown" | "ready" | "needs-refresh";

type WwPageKind = "list" | "detail" | "other";
interface WwPageState {
  kind: WwPageKind;
  rowCount: number;
  hasNextPage: boolean;
  currentPage?: string;
}

// Generic bulk-scrape modes/results are exported by BulkSourceCard so popup
// state can share one shape across every source (WW + GH + Lever + Workday).

/**
 * P3/#39 — per-source bulk-scrape page state for the generic ATS hosts. Mirrors
 * the WW shape but expressed in BulkSourceCard's vocabulary.
 */
type BulkSourceKey = "greenhouse" | "lever" | "workday";

interface BulkSourceState {
  detected: boolean;
  rowCount: number;
  hasNextPage: boolean;
}

const BULK_SOURCE_LABELS: Record<BulkSourceKey, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  workday: "Workday",
};

const BULK_SOURCE_URL_PATTERNS: Record<BulkSourceKey, RegExp[]> = {
  greenhouse: [/boards\.greenhouse\.io\//, /[\w-]+\.greenhouse\.io\//],
  lever: [/jobs\.lever\.co\//, /[\w-]+\.lever\.co\//],
  workday: [/\.myworkdayjobs\.com\//, /\.workdayjobs\.com\//],
};

const CONTENT_SCRIPT_URL_PATTERNS = [
  /linkedin\.com\//,
  /indeed\.com\//,
  /greenhouse\.io\//,
  /boards\.greenhouse\.io\//,
  /lever\.co\//,
  /jobs\.lever\.co\//,
  /waterlooworks\.uwaterloo\.ca\//,
  /workdayjobs\.com\//,
  /myworkdayjobs\.com\//,
];
const LINKEDIN_JOBS_URL_PATTERN =
  /linkedin\.com\/jobs\/(?:view|search-results|search|collections)/;
const LINKEDIN_JOB_RETRY_DELAYS_MS = [600, 1400];

function matchBulkSource(url: string | undefined): BulkSourceKey | null {
  if (!url) return null;
  for (const key of Object.keys(BULK_SOURCE_URL_PATTERNS) as BulkSourceKey[]) {
    if (BULK_SOURCE_URL_PATTERNS[key].some((p) => p.test(url))) return key;
  }
  return null;
}

function hasContentScriptHost(url: string | undefined): boolean {
  return (
    !!url && CONTENT_SCRIPT_URL_PATTERNS.some((pattern) => pattern.test(url))
  );
}

function isLinkedInJobsUrl(url: string | undefined): boolean {
  return !!url && LINKEDIN_JOBS_URL_PATTERN.test(url);
}

export default function App() {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [profile, setProfile] = useState<ExtensionProfile | null>(null);
  const [pageStatus, setPageStatus] = useState<PageStatus | null>(null);
  const [surfaceContext, setSurfaceContext] =
    useState<PageSurfaceContext | null>(null);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeTabUrl, setActiveTabUrl] = useState<string | null>(null);
  const [pageProbeState, setPageProbeState] =
    useState<PageProbeState>("unknown");
  const [error, setError] = useState<string | null>(null);
  // Cached so dashboard/review links can render without querying
  // GET_AUTH_STATUS again. Populated from the auth-status response on first
  // load and kept stable for the lifetime of the popup.
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [wwState, setWwState] = useState<WwPageState | null>(null);
  const [wwBulkInFlight, setWwBulkInFlight] = useState<BulkScrapeMode | null>(
    null,
  );
  const [wwBulkResult, setWwBulkResult] = useState<BulkScrapeResult | null>(
    null,
  );
  const [wwBulkError, setWwBulkError] = useState<string | null>(null);
  // P3/#39 — Per-source state for Greenhouse / Lever / Workday. Keyed by
  // BulkSourceKey so a future source is a one-line addition.
  const [bulkStates, setBulkStates] = useState<
    Partial<Record<BulkSourceKey, BulkSourceState>>
  >({});
  const [bulkInFlight, setBulkInFlight] = useState<
    Partial<Record<BulkSourceKey, BulkScrapeMode>>
  >({});
  const [bulkResults, setBulkResults] = useState<
    Partial<Record<BulkSourceKey, BulkScrapeResult>>
  >({});
  const [bulkErrors, setBulkErrors] = useState<
    Partial<Record<BulkSourceKey, string>>
  >({});
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const profileScore = profile ? scoreResume({ profile }).overall : null;

  useEffect(() => {
    checkAuthStatus();
    checkPageStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const listener = (message: { type?: string }) => {
      if (message.type === "AUTH_STATUS_CHANGED") {
        void checkAuthStatus();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (viewState !== "session-lost") return;
    const intervalId = window.setInterval(() => {
      void checkAuthStatus();
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [viewState]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkAuthStatus() {
    try {
      const response = await sendMessage(Messages.getAuthStatus());
      if (response.success && response.data) {
        const {
          isAuthenticated,
          sessionLost,
          apiBaseUrl: url,
        } = response.data as {
          isAuthenticated: boolean;
          sessionLost?: boolean;
          apiBaseUrl?: string;
        };
        if (url) setApiBaseUrl(url);
        if (isAuthenticated) {
          setViewState("authenticated");
          loadProfile();
        } else if (sessionLost) {
          setViewState("session-lost");
        } else {
          setViewState("unauthenticated");
        }
      } else {
        setViewState("unauthenticated");
      }
    } catch (err) {
      setError((err as Error).message);
      setViewState("error");
    }
  }

  async function loadProfile() {
    const response = await sendMessage<ExtensionProfile>(Messages.getProfile());
    if (response.success && response.data) {
      setProfile(response.data);
    }
  }

  async function checkPageStatus(attempt = 0) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      setActiveTabId(tab.id);
      setActiveTabUrl(tab.url || null);
      try {
        const response = await chrome.tabs.sendMessage(
          tab.id,
          Messages.getSurfaceContext(),
        );
        if (response) {
          const context = response as PageSurfaceContext;
          setSurfaceContext(context);
          setPageStatus({
            hasForm: context.page.hasApplicationForm,
            hasJobListing: context.page.job !== null,
            detectedFields: context.page.detectedFieldCount,
            scrapedJob: context.page.job,
          });
          setPageProbeState("ready");
          if (
            !context.page.job &&
            isLinkedInJobsUrl(tab.url) &&
            attempt < LINKEDIN_JOB_RETRY_DELAYS_MS.length
          ) {
            window.setTimeout(() => {
              void checkPageStatus(attempt + 1);
            }, LINKEDIN_JOB_RETRY_DELAYS_MS[attempt]);
          }
        }
      } catch {
        setPageProbeState(
          !tab.url || hasContentScriptHost(tab.url)
            ? "needs-refresh"
            : "unknown",
        );
      }
      if (tab.url && /waterlooworks\.uwaterloo\.ca/.test(tab.url)) {
        try {
          const r = await chrome.tabs.sendMessage(tab.id, {
            type: "WW_GET_PAGE_STATE",
          });
          if (r?.success) setWwState(r.data);
        } catch {
          // Content script not yet loaded
        }
      }
      // P3/#39 — probe Greenhouse/Lever/Workday listing pages. Only one
      // matcher fires per visit (the user is on a single host).
      const bulkKey = matchBulkSource(tab.url);
      if (bulkKey) {
        try {
          const messageType = bulkPageStateMessage(bulkKey);
          const r = await chrome.tabs.sendMessage(tab.id, {
            type: messageType,
          });
          if (r?.success && r.data) {
            setBulkStates((prev) => ({ ...prev, [bulkKey]: r.data }));
          }
        } catch {
          // Content script not yet loaded
        }
      }
    }
  }

  function bulkPageStateMessage(key: BulkSourceKey): string {
    return `BULK_${key.toUpperCase()}_GET_PAGE_STATE`;
  }
  function bulkScrapeMessage(key: BulkSourceKey, mode: BulkScrapeMode): string {
    const suffix = mode === "visible" ? "SCRAPE_VISIBLE" : "SCRAPE_PAGINATED";
    return `BULK_${key.toUpperCase()}_${suffix}`;
  }

  async function handleBulkSourceScrape(
    key: BulkSourceKey,
    mode: BulkScrapeMode,
  ) {
    setBulkInFlight((prev) => ({ ...prev, [key]: mode }));
    setBulkErrors((prev) => ({ ...prev, [key]: undefined }));
    setBulkResults((prev) => ({ ...prev, [key]: undefined }));
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("No active tab");
      const message = { type: bulkScrapeMessage(key, mode), payload: {} };
      const response: {
        success: boolean;
        data?: BulkScrapeResult;
        error?: string;
      } = await chrome.tabs.sendMessage(tab.id, message);
      if (response?.success && response.data) {
        setBulkResults((prev) => ({ ...prev, [key]: response.data }));
      } else {
        setBulkErrors((prev) => ({
          ...prev,
          [key]: messageForError(
            new Error(response?.error || "Bulk scrape failed"),
          ),
        }));
      }
    } catch (err) {
      setBulkErrors((prev) => ({ ...prev, [key]: messageForError(err) }));
    } finally {
      setBulkInFlight((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleWwBulkScrape(mode: BulkScrapeMode) {
    setWwBulkInFlight(mode);
    setWwBulkError(null);
    setWwBulkResult(null);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("No active tab");
      const message =
        mode === "visible"
          ? Messages.wwScrapeAllVisible()
          : Messages.wwScrapeAllPaginated();
      const response: {
        success: boolean;
        data?: BulkScrapeResult;
        error?: string;
      } = await chrome.tabs.sendMessage(tab.id, message);
      if (response?.success && response.data) {
        setWwBulkResult(response.data);
      } else {
        setWwBulkError(
          messageForError(new Error(response?.error || "Bulk scrape failed")),
        );
      }
    } catch (err) {
      setWwBulkError(messageForError(err));
    } finally {
      setWwBulkInFlight(null);
    }
  }

  async function handleConnect() {
    setError(null);
    try {
      const response = await sendMessage(Messages.openAuth());
      if (response.success) {
        window.close();
        return;
      }
      setError(messageForError(new Error(response.error || "Failed to open")));
      setViewState("error");
    } catch (err) {
      setError(messageForError(err));
      setViewState("error");
    }
  }

  async function handleLogout() {
    if (!confirmingLogout) {
      setConfirmingLogout(true);
      setTimeout(() => setConfirmingLogout(false), 4000);
      return;
    }
    await sendMessage(Messages.logout());
    setViewState("unauthenticated");
    setProfile(null);
    setConfirmingLogout(false);
  }

  async function handleOpenDashboard() {
    const baseUrl = await resolveApiBaseUrl();
    chrome.tabs.create({ url: `${baseUrl}/dashboard` });
    window.close();
  }

  async function handleShowPanel() {
    if (!activeTabId) return;
    try {
      const response = await chrome.tabs.sendMessage(activeTabId, {
        type: "SHOW_SLOTHING_PANEL",
      });
      if (!response?.success) {
        await checkPageStatus();
        return;
      }
      window.close();
    } catch {
      await chrome.tabs.reload(activeTabId);
      window.close();
    }
  }

  async function handleRefreshTab() {
    if (!activeTabId) return;
    await chrome.tabs.reload(activeTabId);
    window.close();
  }

  /**
   * Resolves the configured Slothing API base URL, preferring the value we
   * cached at first paint (`apiBaseUrl`) and falling back to a fresh
   * GET_AUTH_STATUS roundtrip if we haven't seen one yet. Used by all the
   * deep-link handlers (#31).
   */
  async function resolveApiBaseUrl(): Promise<string> {
    if (apiBaseUrl) return apiBaseUrl;
    const response = await sendMessage(Messages.getAuthStatus());
    const data = response.data as { apiBaseUrl?: string } | undefined;
    return data?.apiBaseUrl || DEFAULT_API_BASE_URL;
  }

  /** Opens the review queue for the user to triage their bulk imports. (#31) */
  async function handleViewReviewQueue() {
    const baseUrl = await resolveApiBaseUrl();
    chrome.tabs.create({ url: opportunityReviewUrl(baseUrl) });
    window.close();
  }

  function profileInitial(): string {
    const name = profile?.contact?.name?.trim();
    if (name) return name.charAt(0).toUpperCase();
    const email = profile?.contact?.email;
    return email ? email.charAt(0).toUpperCase() : "S";
  }

  function supportedTabLabel(): string | null {
    const url = surfaceContext?.tab.url || activeTabUrl || undefined;
    if (!url || !hasContentScriptHost(url)) return null;
    if (/waterlooworks\.uwaterloo\.ca/.test(url)) return "WaterlooWorks";
    if (/linkedin\.com/.test(url)) return "LinkedIn";
    if (/indeed\.com/.test(url)) return "Indeed";
    if (/greenhouse\.io/.test(url)) return "Greenhouse";
    if (/lever\.co/.test(url)) return "Lever";
    if (/workdayjobs\.com/.test(url)) return "Workday";
    return "this job site";
  }

  function signedOutContextCopy(): {
    title: string;
    body: string;
    site?: string;
  } | null {
    const site = supportedTabLabel();
    if (wwState?.kind === "list") {
      return {
        title: "WaterlooWorks jobs found",
        body: `Connect Slothing to import and track these ${wwState.rowCount} postings.`,
        site: "WaterlooWorks",
      };
    }
    if (pageStatus?.scrapedJob) {
      return {
        title: "Job detected",
        body: "Connect Slothing to tailor, save, and autofill from this posting.",
        site,
      };
    }
    if (pageStatus?.hasForm) {
      return {
        title: "Application page detected",
        body: "Connect Slothing to autofill this application from your profile.",
        site,
      };
    }
    if (site) {
      return {
        title: `${site} is supported`,
        body: "Connect Slothing to scan jobs, import postings, and open job tools here.",
        site,
      };
    }
    return null;
  }

  if (viewState === "loading") {
    return (
      <div className="popup">
        <div className="state-center">
          <div className="spinner" />
          <p className="state-text">Connecting…</p>
        </div>
      </div>
    );
  }

  if (viewState === "error") {
    return (
      <div className="popup">
        <div className="state-center">
          <div className="state-icon error" aria-hidden>
            !
          </div>
          <h2 className="state-title">Something went wrong</h2>
          <p className="state-text">{error}</p>
          <button className="btn primary" onClick={() => checkAuthStatus()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (viewState === "unauthenticated") {
    const contextCopy = signedOutContextCopy();
    return (
      <div className="popup">
        <div className={`hero ${contextCopy ? "contextual" : ""}`}>
          <img
            className="hero-mark"
            src={chrome.runtime.getURL("brand/slothing-mark.png")}
            alt=""
          />
          {contextCopy?.site && (
            <span className="hero-kicker">{contextCopy.site}</span>
          )}
          <h1 className="hero-title">{contextCopy?.title || "Slothing"}</h1>
          <p className="hero-sub">
            {contextCopy?.body ||
              "Auto-fill applications. Import jobs. Track everything."}
          </p>
          <button className="btn primary block" onClick={handleConnect}>
            {contextCopy ? "Connect to use job tools" : "Connect account"}
          </button>
          <p className="hero-foot">You'll sign in once — Slothing remembers.</p>
        </div>
      </div>
    );
  }

  if (viewState === "session-lost") {
    const contextCopy = signedOutContextCopy();
    return (
      <div className="popup">
        <div className={`hero session-lost ${contextCopy ? "contextual" : ""}`}>
          <div className="hero-mark warn" aria-hidden>
            !
          </div>
          {contextCopy?.site && (
            <span className="hero-kicker">{contextCopy.site}</span>
          )}
          <h1 className="hero-title">Session lost</h1>
          <p className="hero-sub">
            {contextCopy
              ? "Reconnect to use Slothing job tools on this page."
              : "Slothing got reset by your browser. Reconnect to pick up where you left off — your profile and data are safe."}
          </p>
          <button className="btn primary block" onClick={handleConnect}>
            Reconnect
          </button>
          <p className="hero-foot">Takes about five seconds.</p>
        </div>
      </div>
    );
  }

  const detectedJob = pageStatus?.scrapedJob;
  const supportedSite = supportedTabLabel();
  const workspaceVisible = !!surfaceContext?.workspace.visible;
  const showWwBulk = wwState && wwState.kind === "list";
  const detectedBulkSources = (
    Object.keys(BULK_SOURCE_LABELS) as BulkSourceKey[]
  ).filter((key) => bulkStates[key]?.detected);
  const nothingDetected =
    !pageStatus?.hasForm &&
    !detectedJob &&
    !showWwBulk &&
    detectedBulkSources.length === 0 &&
    pageProbeState !== "needs-refresh" &&
    !supportedSite;
  const hasPageStatus =
    !!detectedJob || !!pageStatus?.hasForm || pageProbeState === "ready";
  const currentTabTitle = workspaceVisible
    ? "Job workspace active"
    : detectedJob
      ? "Job detected"
      : pageStatus?.hasForm
        ? "Application detected"
        : pageProbeState === "ready"
          ? "No job detected"
          : "Unsupported page";

  return (
    <div className="popup">
      <header className="topbar">
        <div className="brand">
          <img
            className="brand-mark"
            src={chrome.runtime.getURL("brand/slothing-mark.png")}
            alt=""
          />
          <span className="brand-name">Slothing</span>
        </div>
        <span className="pill ok" title="Extension connected">
          <span className="pill-dot" />
          Connected
        </span>
      </header>

      <section className="profile-card">
        <div className="avatar">{profileInitial()}</div>
        <div className="profile-meta">
          <div className="profile-name">
            {profile?.contact?.name ||
              profile?.contact?.email ||
              "Set up your profile"}
          </div>
          <div className="profile-sub">
            {profile?.computed?.currentTitle &&
            profile?.computed?.currentCompany
              ? `${profile.computed.currentTitle} · ${profile.computed.currentCompany}`
              : profile?.contact?.email ||
                "Add your work history so Slothing can tailor"}
          </div>
        </div>
        {profileScore !== null ? (
          <div
            className={`score ${profileScore >= 80 ? "high" : profileScore >= 50 ? "mid" : "low"}`}
            title="Profile completeness"
          >
            <span className="score-num">{profileScore}</span>
            <span className="score-unit">/100</span>
          </div>
        ) : (
          <button className="btn ghost tight" onClick={handleOpenDashboard}>
            Open
          </button>
        )}
      </section>

      <main className="content">
        {pageProbeState === "needs-refresh" && (
          <article className="status-card">
            <div className="status-copy">
              <span className="status-eyebrow">Current tab</span>
              <span className="status-title">Page needs refresh</span>
            </div>
            <button className="btn block" onClick={handleRefreshTab}>
              Refresh tab
            </button>
          </article>
        )}

        {hasPageStatus && (
          <article className="status-card active">
            <header className="status-head">
              <div className="status-copy">
                <span className="status-eyebrow">Current tab</span>
                <span className="status-title">{currentTabTitle}</span>
              </div>
              {pageStatus?.hasForm && (
                <span className="badge">
                  {pageStatus.detectedFields} fields
                </span>
              )}
            </header>
            {detectedJob ? (
              <div className="page-summary">
                <span className="clip" title={detectedJob.title}>
                  {detectedJob.title}
                </span>
                <span className="card-sub clip">{detectedJob.company}</span>
              </div>
            ) : (
              <p className="inline-note">
                {pageStatus?.hasForm
                  ? "Ready on this application page."
                  : "Open a job posting, then scan again."}
              </p>
            )}
            {detectedJob && (
              <button className="btn primary block" onClick={handleShowPanel}>
                Open job tools
              </button>
            )}
            {!detectedJob && pageProbeState === "ready" && (
              <button className="btn block" onClick={() => checkPageStatus()}>
                Scan again
              </button>
            )}
          </article>
        )}

        {showWwBulk && wwState && (
          <BulkSourceCard
            sourceLabel="WaterlooWorks"
            detectedCount={wwState.rowCount}
            busy={wwBulkInFlight}
            lastResult={wwBulkResult}
            lastError={wwBulkError}
            onScrapeVisible={() => handleWwBulkScrape("visible")}
            onScrapePaginated={() => handleWwBulkScrape("paginated")}
            onViewTracker={handleViewReviewQueue}
          />
        )}

        {/* P3/#39 — Generic bulk sources (Greenhouse, Lever, Workday). Only
           one will render at a time because the user is on a single host. */}
        {detectedBulkSources.map((key) => {
          const state = bulkStates[key];
          if (!state) return null;
          return (
            <BulkSourceCard
              key={key}
              sourceLabel={BULK_SOURCE_LABELS[key]}
              detectedCount={state.rowCount}
              busy={bulkInFlight[key] ?? null}
              lastResult={bulkResults[key] ?? null}
              lastError={bulkErrors[key] ?? null}
              onScrapeVisible={() => handleBulkSourceScrape(key, "visible")}
              onScrapePaginated={() => handleBulkSourceScrape(key, "paginated")}
              onViewTracker={handleViewReviewQueue}
            />
          );
        })}

        {nothingDetected && !hasPageStatus && (
          <div className="idle">
            <p className="idle-title">Unsupported page</p>
            <p className="idle-sub">
              Open a supported job posting or application page.
            </p>
          </div>
        )}

        {!hasPageStatus && !nothingDetected && supportedSite && (
          <div className="idle">
            <p className="idle-title">{supportedSite} is supported</p>
            <p className="idle-sub">
              Scanning this tab for a job posting or application form.
            </p>
          </div>
        )}

        <div className="quick-row">
          <button className="quick" onClick={handleOpenDashboard}>
            <span className="quick-icon" aria-hidden>
              ↗
            </span>
            <span>Dashboard</span>
          </button>
          <button
            className="quick"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            <span className="quick-icon" aria-hidden>
              ⚙
            </span>
            <span>Settings</span>
          </button>
        </div>
      </main>

      <footer className="footbar">
        <button
          className={`link ${confirmingLogout ? "warn" : ""}`}
          onClick={handleLogout}
        >
          {confirmingLogout ? "Click again to disconnect" : "Disconnect"}
        </button>
        {profile?.updatedAt && (
          <span className="updated">
            Synced {formatRelative(profile.updatedAt)}
          </span>
        )}
      </footer>
    </div>
  );
}
