// Background service worker for Slothing extension

// Firefox's `chrome.*` compat is callback-based, so `await chrome.tabs.query(...)`
// resolves to `undefined`. Alias global `chrome` to polyfilled `browser` so all
// `chrome.*` calls below return Promises on both Firefox and Chrome.
import browser from "webextension-polyfill";
if (typeof globalThis !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = browser;
}

import type {
  ChatPortMessage,
  ChatStreamStartPayload,
  ExtensionMessage,
  ExtensionResponse,
  ScrapedJob,
  TrackedApplicationPayload,
  SaveCorrectionPayload,
} from "@/shared/types";
import { CHAT_PORT_NAME } from "@/shared/types";
import type { TailorFromPagePayload } from "@/shared/messages";
import { messageForError } from "@/shared/error-messages";
import { getAPIClient, resetAPIClient } from "./api-client";
import {
  getStorage,
  setAuthToken,
  clearAuthToken,
  forgetAuthHistory,
  getCachedProfile,
  setCachedProfile,
  getApiBaseUrl,
  getSettings,
  isSessionLost,
  getSessionAuthCache,
  setSessionAuthCache,
  clearSessionAuthCache,
} from "./storage";
import { setBadgeForTab, clearBadgeForTab } from "./badge";
import {
  clearSession,
  listSessions,
  purgeExpiredSessions,
} from "@/content/multistep/session";

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error("[Slothing] Message handler error:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  },
);

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
): Promise<ExtensionResponse> {
  switch (message.type) {
    case "GET_AUTH_STATUS":
      return handleGetAuthStatus();

    case "OPEN_AUTH":
      return handleOpenAuth();

    case "LOGOUT":
      return handleLogout();

    case "GET_PROFILE":
      return handleGetProfile();

    case "GET_SETTINGS":
      return handleGetSettings();

    case "IMPORT_JOB":
      return handleImportJob(message.payload as ScrapedJob);

    case "IMPORT_JOBS_BATCH":
      return handleImportJobsBatch(message.payload as ScrapedJob[]);

    case "GET_IMPORTED_SOURCE_JOB_IDS":
      return handleGetImportedSourceJobIds(
        (message.payload as { source?: string } | undefined)?.source,
      );

    case "TRACK_APPLIED":
      return handleTrackApplied(message.payload as TrackedApplicationPayload);

    case "OPEN_DASHBOARD":
      return handleOpenDashboard();

    case "CAPTURE_VISIBLE_TAB":
      return handleCaptureVisibleTab();

    case "TAILOR_FROM_PAGE":
      return handleTailorFromPage(
        message.payload as TailorFromPagePayload | ScrapedJob,
      );

    case "GENERATE_COVER_LETTER_FROM_PAGE":
      return handleGenerateCoverLetterFromPage(message.payload as ScrapedJob);

    case "LIST_RESUMES":
      return handleListResumes();

    case "SAVE_ANSWER":
      return handleSaveAnswer(
        message.payload as {
          question: string;
          answer: string;
          url?: string;
          company?: string;
        },
      );

    case "SEARCH_ANSWERS":
      return handleSearchAnswers(message.payload as string);

    case "MATCH_ANSWER_BANK":
      return handleMatchAnswerBank(
        message.payload as { q: string; limit?: number },
      );

    case "GET_LEARNED_ANSWERS":
      return handleGetLearnedAnswers();

    case "DELETE_ANSWER":
      return handleDeleteAnswer(message.payload as string);

    case "SAVE_CORRECTION":
      return handleSaveCorrection(message.payload as SaveCorrectionPayload);

    // P3 / #36 #37 — multi-step support.
    case "GET_TAB_ID":
      return { success: true, data: { tabId: sender.tab?.id ?? null } };

    case "HAS_WEBNAVIGATION_PERMISSION":
      return handleHasWebNavigationPermission();

    case "REQUEST_WEBNAVIGATION_PERMISSION":
      return handleRequestWebNavigationPermission();

    case "JOB_DETECTED": {
      const tabId = sender.tab?.id;
      if (!tabId) return { success: false, error: "No tab ID in sender" };
      await setBadgeForTab(tabId);
      return { success: true };
    }

    case "AUTH_CALLBACK": {
      // Sent by the content script when it picks up a localStorage-transported
      // token from the Slothing connect page (the localStorage path is used on
      // browsers without externally_connectable — Firefox in particular).
      const payload = message as {
        type: string;
        token?: string;
        expiresAt?: string;
        apiBaseUrl?: string;
      };
      if (!payload.token || !payload.expiresAt) {
        return { success: false, error: "Missing token or expiresAt" };
      }
      try {
        await setAuthToken(
          payload.token,
          payload.expiresAt,
          authCallbackBaseUrl(payload.apiBaseUrl, sender.url),
        );
        resetAPIClient();
        notifyAuthStatusChanged();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }

    case "WW_BULK_PROGRESS": {
      // Content script emits progress on every row + the terminal done:true
      // event. We mirror the latest payload in memory (so the popup can
      // rehydrate on open) and re-broadcast it as WW_BULK_PROGRESS_FANOUT
      // for any currently-open popup to consume via its onMessage listener.
      const payload = message.payload as
        | { done?: boolean; [k: string]: unknown }
        | undefined;
      if (payload?.done === true) {
        latestBulkProgress.delete("waterlooworks");
      } else if (payload) {
        latestBulkProgress.set("waterlooworks", payload);
      }
      // Broadcast — popup listens for the FANOUT type. Wrapped in try because
      // sendMessage rejects with "Receiving end does not exist" when no
      // popup is open, which is fine.
      void chrome.runtime
        .sendMessage({
          type: "WW_BULK_PROGRESS_FANOUT",
          payload,
        })
        .catch(() => undefined);
      return { success: true };
    }

    case "GET_BULK_PROGRESS": {
      // Popup asks for the latest snapshot on mount. Returns null when
      // nothing is in flight.
      const ww = latestBulkProgress.get("waterlooworks") ?? null;
      return { success: true, data: { ww } };
    }

    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

// In-flight bulk-scrape snapshot, keyed by source. Background page in MV2
// is persistent so a Map is fine; if we migrate to MV3 we'll need to move
// this into chrome.storage.session.
const latestBulkProgress = new Map<
  string,
  { done?: boolean; [k: string]: unknown }
>();

async function handleTailorFromPage(
  payload: TailorFromPagePayload | ScrapedJob,
): Promise<ExtensionResponse> {
  // Support both the new wrapped payload ({job, baseResumeId}) used by the
  // popup picker (#34) and the legacy bare ScrapedJob still sent by the
  // content-script Tailor action. The "url" presence on the inner object is
  // the cheapest discriminator (ScrapedJob has it, TailorFromPagePayload
  // doesn't).
  const isLegacy = "url" in payload && !("job" in payload);
  const job: ScrapedJob = isLegacy
    ? (payload as ScrapedJob)
    : (payload as TailorFromPagePayload).job;
  const baseResumeId = isLegacy
    ? undefined
    : (payload as TailorFromPagePayload).baseResumeId;

  try {
    const client = await getAPIClient();
    const result = await client.tailorFromJob(job, baseResumeId);
    const apiBaseUrl = await getApiBaseUrl();
    const resumeId = result.savedResume.id;

    const studioParams = new URLSearchParams({
      from: "extension",
      tailorId: resumeId,
    });
    if (baseResumeId) {
      studioParams.set("baseResumeId", baseResumeId);
    }

    return {
      success: true,
      data: {
        url: `${apiBaseUrl}/studio?${studioParams.toString()}`,
        opportunityId: result.opportunityId,
        resumeId,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleListResumes(): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const resumes = await client.listResumes();
    return { success: true, data: { resumes } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGenerateCoverLetterFromPage(
  job: ScrapedJob,
): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.generateCoverLetterFromJob(job);
    const apiBaseUrl = await getApiBaseUrl();
    const coverLetterId = result.savedCoverLetter.id;

    return {
      success: true,
      data: {
        url: `${apiBaseUrl}/cover-letter?from=extension&id=${encodeURIComponent(coverLetterId)}`,
        opportunityId: result.opportunityId,
        coverLetterId,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGetAuthStatus(): Promise<ExtensionResponse> {
  // Fast-path (#30): return a cached verdict if it's <60s old, then
  // revalidate in the background so a flipped server state still
  // self-corrects on the *next* popup open.
  try {
    const cached = await getSessionAuthCache();
    if (cached) {
      const apiBaseUrl = await getApiBaseUrl();
      const storage = await getStorage();
      const sessionLost = !cached.authenticated && isSessionLost(storage);

      // Fire-and-forget revalidation. We deliberately don't await it so
      // the popup gets its response immediately.
      void revalidateAuthInBackground();

      return {
        success: true,
        data: {
          isAuthenticated: cached.authenticated,
          apiBaseUrl,
          sessionLost,
        },
      };
    }
  } catch {
    // Cache lookup failure is non-fatal; fall through to the verify path.
  }

  try {
    const client = await getAPIClient();
    const isAuthenticated = await client.isAuthenticated();
    const apiBaseUrl = await getApiBaseUrl();
    const storage = await getStorage();
    const sessionLost = !isAuthenticated && isSessionLost(storage);

    await setSessionAuthCache(isAuthenticated);

    return {
      success: true,
      data: { isAuthenticated, apiBaseUrl, sessionLost },
    };
  } catch (error) {
    const apiBaseUrl = await getApiBaseUrl();
    const storage = await getStorage().catch(() => null);
    const sessionLost = storage ? isSessionLost(storage) : false;
    return {
      success: true,
      data: { isAuthenticated: false, apiBaseUrl, sessionLost },
    };
  }
}

/**
 * Background revalidation that runs after we return a cached verdict.
 * Refreshes the session cache so subsequent reads stay fresh; on a 401
 * the api-client's authenticatedFetch clears `authToken` + the cache
 * already.
 */
async function revalidateAuthInBackground(): Promise<void> {
  try {
    const client = await getAPIClient();
    const verdict = await client.isAuthenticated();
    await setSessionAuthCache(verdict);
  } catch {
    // Network blip — leave the cache alone; next miss will revalidate.
  }
}

async function handleOpenAuth(): Promise<ExtensionResponse> {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    // Pass extension ID so the connect page can deliver the token back via
    // chrome.runtime.sendMessage(extensionId, ...). The page is a regular web
    // page and cannot resolve the calling extension by passing undefined.
    const authUrl = `${apiBaseUrl}/extension/connect?extensionId=${chrome.runtime.id}`;

    await chrome.tabs.create({ url: authUrl });

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function authCallbackBaseUrl(
  explicitUrl?: string,
  senderUrl?: string,
): string | undefined {
  const candidate = explicitUrl || senderUrl;
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}

async function handleLogout(): Promise<ExtensionResponse> {
  try {
    await clearAuthToken();
    // Explicit logout — also drop the "we've seen you before" breadcrumb so
    // the popup doesn't fall into the #27 "session lost" branch.
    await forgetAuthHistory();
    // And the fast-path cache (#30) so the next popup open re-verifies.
    await clearSessionAuthCache();
    resetAPIClient();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGetProfile(): Promise<ExtensionResponse> {
  try {
    // Check cache first
    const cached = await getCachedProfile();
    if (cached) {
      return { success: true, data: cached };
    }

    // Fetch from API
    const client = await getAPIClient();
    const profile = await client.getProfile();

    // Cache the profile
    await setCachedProfile(profile);

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGetSettings(): Promise<ExtensionResponse> {
  try {
    return { success: true, data: await getSettings() };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleImportJob(job: ScrapedJob): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.importJob(job);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleImportJobsBatch(
  jobs: ScrapedJob[],
): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.importJobsBatch(jobs);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGetImportedSourceJobIds(
  source: string | undefined,
): Promise<ExtensionResponse> {
  if (!source) {
    return { success: false, error: "source is required" };
  }
  try {
    const client = await getAPIClient();
    const ids = await client.listSourceJobIds(source);
    return { success: true, data: { ids } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleTrackApplied(
  payload: TrackedApplicationPayload,
): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.trackApplied(payload);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleOpenDashboard(): Promise<ExtensionResponse> {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    await chrome.tabs.create({ url: `${apiBaseUrl}/dashboard` });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleCaptureVisibleTab(): Promise<ExtensionResponse> {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
      format: "jpeg",
      quality: 35,
    });
    return { success: true, data: { dataUrl } };
  } catch {
    return { success: false };
  }
}

async function handleSaveAnswer(data: {
  question: string;
  answer: string;
  url?: string;
  company?: string;
}): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.saveLearnedAnswer({
      question: data.question,
      answer: data.answer,
      sourceUrl: data.url,
      sourceCompany: data.company,
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleSearchAnswers(
  question: string,
): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const results = await client.searchSimilarAnswers(question);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleMatchAnswerBank(payload: {
  q: string;
  limit?: number;
}): Promise<ExtensionResponse> {
  try {
    if (!payload?.q?.trim()) {
      return { success: false, error: "Question is required" };
    }
    const client = await getAPIClient();
    const results = await client.matchAnswerBank(payload.q, payload.limit);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleGetLearnedAnswers(): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const answers = await client.getLearnedAnswers();
    return { success: true, data: answers };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleDeleteAnswer(id: string): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    await client.deleteLearnedAnswer(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleSaveCorrection(
  payload: SaveCorrectionPayload,
): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.saveCorrection(payload);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ----- Multi-step (P3 / #36 #37) ------------------------------------------

/**
 * Returns whether the `webNavigation` permission is granted right now.
 * In Chrome MV3 this is always true because the permission is in the
 * required `permissions` array. In Firefox MV2 it's in `optional_permissions`
 * and the user may not have approved it yet.
 */
async function handleHasWebNavigationPermission(): Promise<ExtensionResponse> {
  try {
    // chrome.permissions exists in both MV2 (via the polyfill) and MV3.
    const granted = await new Promise<boolean>((resolve) => {
      try {
        chrome.permissions.contains(
          { permissions: ["webNavigation"] },
          (has: boolean) => resolve(!!has),
        );
      } catch {
        resolve(false);
      }
    });
    return { success: true, data: { granted } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Ask the browser to request `webNavigation`. In Chrome MV3 the permission
 * is required at install time so this resolves instantly with true. In
 * Firefox MV2 the browser shows a permission prompt and the resolved value
 * reflects the user's verdict — a "No" leaves us on the prompted-toast
 * fallback path, which is exactly what we want.
 *
 * Important: `chrome.permissions.request` must be called from a user-gesture
 * context. The Firefox background can do this if invoked from a content-
 * script message handler that fired inside a button click; if Firefox
 * rejects with "may only be called from a user input handler" the
 * controller catches the failure and continues with the fallback path.
 */
async function handleRequestWebNavigationPermission(): Promise<ExtensionResponse> {
  try {
    const granted = await new Promise<boolean>((resolve) => {
      try {
        chrome.permissions.request(
          { permissions: ["webNavigation"] },
          (has: boolean) => resolve(!!has),
        );
      } catch {
        resolve(false);
      }
    });
    if (granted) {
      attachWebNavigationListener();
    }
    return { success: true, data: { granted } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

let webNavigationListenerAttached = false;

/**
 * Subscribe to `webNavigation.onHistoryStateUpdated`. Multi-step ATSes drive
 * step transitions via `history.pushState`, so this is the right event to
 * watch — `onCompleted` only fires for full document loads.
 *
 * Idempotent: safe to call after every install/update and after every
 * permission grant. Wrapped in try/catch because the API may not be
 * available in MV2 until the user grants the optional permission.
 */
function attachWebNavigationListener(): void {
  if (webNavigationListenerAttached) return;
  try {
    if (
      typeof chrome.webNavigation === "undefined" ||
      !chrome.webNavigation.onHistoryStateUpdated
    ) {
      return;
    }
    chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
      if (details.frameId !== 0 && details.frameId !== undefined) {
        // We only care about the top frame here. Iframed Greenhouse is
        // handled by the per-provider MutationObserver inside the content
        // script.
        return;
      }
      void notifyTabOfStepTransition(details.tabId, details.url);
    });
    webNavigationListenerAttached = true;
  } catch (err) {
    console.warn("[Slothing] webNavigation listener attach failed:", err);
  }
}

async function notifyTabOfStepTransition(
  tabId: number,
  url: string,
): Promise<void> {
  // Only fire when the tab has an in-progress multi-step session — keeps
  // us from spamming every tab on every history event.
  const sessions = await listSessions();
  if (!sessions.some((s) => s.tabId === tabId)) return;
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "MULTISTEP_STEP_TRANSITION",
      payload: { url, transitionType: "webNavigation" },
    });
  } catch {
    // Tab might be closed or the content script might not be loaded yet —
    // both are non-fatal.
  }
}

// Try to attach on startup. If the permission isn't granted yet (Firefox
// first run) this is a no-op; the listener attaches lazily when the user
// approves via `handleRequestWebNavigationPermission`.
attachWebNavigationListener();

// Clear the in-flight session when its tab closes. webNavigation's
// `onHistoryStateUpdated` also fires for back/forward inside the same tab;
// we deliberately keep the session in that case so the user doesn't lose
// state by accidentally hitting Back.
chrome.tabs.onRemoved.addListener((tabId) => {
  void clearSession(tabId);
});

// Sweep stale sessions on service-worker startup. Not strictly necessary —
// `getSession` already evicts expired entries on read — but it keeps the
// storage area small after a crash.
void purgeExpiredSessions();

/**
 * P4/#40 — Long-lived port handler for the inline AI assistant.
 *
 * The content-script sidebar opens `chrome.runtime.connect({name:
 * CHAT_PORT_NAME})` and posts a CHAT_STREAM_START frame. We translate that
 * into an SSE call via api-client.chat() and stream tokens back on the same
 * port until the generator completes (CHAT_STREAM_END) or throws
 * (CHAT_STREAM_ERROR). If the content-script disconnects mid-stream we set a
 * cancelled flag so the iterator stops enqueueing.
 */
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  if (port.name !== CHAT_PORT_NAME) return;

  let cancelled = false;
  port.onDisconnect.addListener(() => {
    cancelled = true;
  });

  port.onMessage.addListener((message: ChatPortMessage) => {
    if (message.type !== "CHAT_STREAM_START") return;
    void runChatStream(port, message, () => cancelled).catch((error) => {
      console.error("[Slothing] chat stream failure:", error);
    });
  });
});

async function runChatStream(
  port: chrome.runtime.Port,
  message: ChatStreamStartPayload,
  isCancelled: () => boolean,
): Promise<void> {
  const safePost = (frame: ChatPortMessage): boolean => {
    if (isCancelled()) return false;
    try {
      port.postMessage(frame);
      return true;
    } catch {
      // Port closed between cancellation checks — bail out quietly.
      return false;
    }
  };

  try {
    const client = await getAPIClient();
    const iterator = client.chat(message.prompt, message.jobContext);
    for await (const token of iterator) {
      if (isCancelled()) return;
      if (!safePost({ type: "CHAT_STREAM_TOKEN", token })) return;
    }
    safePost({ type: "CHAT_STREAM_END" });
  } catch (error) {
    safePost({
      type: "CHAT_STREAM_ERROR",
      error: messageForError(error),
    });
  } finally {
    try {
      port.disconnect();
    } catch {
      // Already disconnected — nothing to do.
    }
  }
}

// Handle auth callback from Slothing web app
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (
      message.type === "AUTH_CALLBACK" &&
      message.token &&
      message.expiresAt
    ) {
      setAuthToken(
        message.token,
        message.expiresAt,
        authCallbackBaseUrl(message.apiBaseUrl, sender.url),
      )
        .then(() => {
          resetAPIClient();
          notifyAuthStatusChanged();
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
  },
);

function notifyAuthStatusChanged(): void {
  try {
    chrome.runtime.sendMessage({ type: "AUTH_STATUS_CHANGED" }, () => {
      // No popup may be open; consume lastError so Chrome does not log noise.
      void chrome.runtime.lastError;
    });
  } catch {
    // No active extension page listeners.
  }
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  switch (command) {
    case "fill-form":
      chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_FILL" });
      break;
    case "import-job":
      chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_IMPORT" });
      break;
  }
});

// Clear badge when a tab navigates to a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    clearBadgeForTab(tabId).catch(() => {});
  }
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[Slothing] Extension installed");
    // Could open onboarding page here
  } else if (details.reason === "update") {
    console.log(
      "[Slothing] Extension updated to",
      chrome.runtime.getManifest().version,
    );
  }
});

console.log("[Slothing] Background service worker started");
