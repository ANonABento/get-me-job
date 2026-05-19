"use strict";
(self["webpackChunk_slothing_extension"] = self["webpackChunk_slothing_extension"] || []).push([[575],{

/***/ 997
(__unused_webpack_module, exports, __webpack_require__) {

var __webpack_unused_export__;


var m = __webpack_require__(316);
if (true) {
  exports.H = m.createRoot;
  __webpack_unused_export__ = m.hydrateRoot;
} else // removed by dead control flow
{ var i; }


/***/ },

/***/ 921
(__unused_webpack_module, exports, __webpack_require__) {

var __webpack_unused_export__;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=__webpack_require__(155),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}__webpack_unused_export__=l;exports.jsx=q;exports.jsxs=q;


/***/ },

/***/ 723
(module, __unused_webpack_exports, __webpack_require__) {



if (true) {
  module.exports = __webpack_require__(921);
} else // removed by dead control flow
{}


/***/ },

/***/ 481
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(723);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js
var react = __webpack_require__(155);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js
var client = __webpack_require__(997);
// EXTERNAL MODULE: ./src/shared/types.ts
var types = __webpack_require__(353);
;// ./src/background/storage.ts
// Extension storage utilities

const STORAGE_KEY = "slothing_extension";
async function getStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const stored = result[STORAGE_KEY];
            const apiBaseUrl = types/* SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL */.eA &&
                stored?.apiBaseUrl === types/* LEGACY_LOCAL_API_BASE_URL */.Xf &&
                !stored.authToken
                ? types/* DEFAULT_API_BASE_URL */.Ri
                : stored?.apiBaseUrl || types/* DEFAULT_API_BASE_URL */.Ri;
            resolve({
                ...stored,
                apiBaseUrl,
                settings: { ...types/* DEFAULT_SETTINGS */.a$, ...stored?.settings },
            });
        });
    });
}
async function setStorage(updates) {
    const current = await getStorage();
    const updated = { ...current, ...updates };
    return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, resolve);
    });
}
async function clearStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(STORAGE_KEY, resolve);
    });
}
// Auth token helpers
async function setAuthToken(token, expiresAt, apiBaseUrl) {
    await setStorage({
        authToken: token,
        tokenExpiry: expiresAt,
        ...(apiBaseUrl ? { apiBaseUrl } : {}),
        lastSeenAuthAt: new Date().toISOString(),
    });
    await setSessionAuthCache(true);
}
/**
 * Records that we just observed a working authenticated state. Called by the
 * API client after a successful `isAuthenticated()` check so the popup can
 * distinguish a real logout from a service-worker state-loss event.
 *
 * Distinct from `setAuthToken` because we don't always have a fresh token to
 * write — sometimes we just verified the existing one.
 */
async function markAuthSeen() {
    await setStorage({ lastSeenAuthAt: new Date().toISOString() });
}
/**
 * "Session lost" view (popup, #27) shows when we have no `authToken` but
 * `lastSeenAuthAt` is within this window. Beyond the window we treat the
 * extension as a fresh install / true logout and show the normal hero.
 */
const SESSION_LOST_WINDOW_MS = (/* unused pure expression or super */ null && (24 * 60 * 60 * 1000)); // 24h
/**
 * Returns true when the popup should render the "Session lost — reconnect"
 * branch instead of the unauthenticated hero. See #27.
 */
function isSessionLost(storage, now = Date.now()) {
    if (storage.authToken)
        return false;
    if (!storage.lastSeenAuthAt)
        return false;
    const lastSeen = new Date(storage.lastSeenAuthAt).getTime();
    if (!Number.isFinite(lastSeen))
        return false;
    return now - lastSeen <= SESSION_LOST_WINDOW_MS;
}
async function clearAuthToken() {
    // NOTE: we intentionally do NOT clear `lastSeenAuthAt` here. A true logout
    // path (handleLogout) calls `forgetAuthHistory` afterwards; this helper is
    // also used when a token quietly expires or a 401 trips the api-client,
    // and in those cases the session-lost UI is exactly what we want to show.
    await setStorage({
        authToken: undefined,
        tokenExpiry: undefined,
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
}
/**
 * Wipes the "we've seen you before" breadcrumb so the popup shows the
 * unauthenticated hero on next open. Call this from explicit-logout flows.
 */
async function forgetAuthHistory() {
    await setStorage({ lastSeenAuthAt: undefined });
}
async function getAuthToken() {
    const storage = await getStorage();
    if (!storage.authToken)
        return null;
    // Check expiry
    if (storage.tokenExpiry) {
        const expiry = new Date(storage.tokenExpiry);
        if (expiry < new Date()) {
            await clearAuthToken();
            return null;
        }
    }
    return storage.authToken;
}
// Profile cache helpers
const PROFILE_CACHE_TTL = (/* unused pure expression or super */ null && (5 * 60 * 1000)); // 5 minutes
async function getCachedProfile() {
    const storage = await getStorage();
    if (!storage.cachedProfile || !storage.profileCachedAt) {
        return null;
    }
    const cachedAt = new Date(storage.profileCachedAt);
    if (Date.now() - cachedAt.getTime() > PROFILE_CACHE_TTL) {
        return null; // Cache expired
    }
    return storage.cachedProfile;
}
async function setCachedProfile(profile) {
    await setStorage({
        cachedProfile: profile,
        profileCachedAt: new Date().toISOString(),
    });
}
async function clearCachedProfile() {
    await setStorage({
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
}
// Settings helpers
async function getSettings() {
    const storage = await getStorage();
    return storage.settings;
}
async function updateSettings(updates) {
    const storage = await getStorage();
    const updated = { ...storage.settings, ...updates };
    await setStorage({ settings: updated });
    return updated;
}
// API URL helper
async function setApiBaseUrl(url) {
    await setStorage({ apiBaseUrl: url });
}
async function getApiBaseUrl() {
    const storage = await getStorage();
    return storage.apiBaseUrl;
}
// ---- Session-scoped auth cache (#30) ------------------------------------
//
// `chrome.storage.session` is in-memory only — it survives suspending the
// service worker but is wiped on browser restart, which is exactly what we
// want for a short-lived auth verdict cache. Using session (not local)
// also means we never persist the verdict to disk.
//
// The cache stores `{ authenticated: boolean, at: ISO string }` so the
// popup can return a result in <50ms on the second open within a minute,
// while the background script revalidates in the background.
const AUTH_CACHE_TTL_MS = (/* unused pure expression or super */ null && (60 * 1000));
const AUTH_CACHE_KEY = "slothing_auth_cache";
/**
 * Reads the session-scoped auth verdict cache. Returns null when:
 * - the entry has never been written,
 * - the entry is older than AUTH_CACHE_TTL_MS,
 * - the entry's timestamp is unparseable, or
 * - chrome.storage.session is unavailable (e.g. older browsers).
 *
 * Optional `now` parameter exists for tests.
 */
async function getSessionAuthCache(now = Date.now()) {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return null;
    return new Promise((resolve) => {
        sessionStore.get(AUTH_CACHE_KEY, (result) => {
            const entry = result?.[AUTH_CACHE_KEY];
            if (!entry || typeof entry.at !== "string") {
                resolve(null);
                return;
            }
            const at = new Date(entry.at).getTime();
            if (!Number.isFinite(at)) {
                resolve(null);
                return;
            }
            if (now - at > AUTH_CACHE_TTL_MS) {
                resolve(null);
                return;
            }
            resolve({ authenticated: !!entry.authenticated, at: entry.at });
        });
    });
}
/**
 * Writes a fresh verdict to the session-scoped cache. No-ops when
 * chrome.storage.session is unavailable so callers don't need to guard.
 */
async function setSessionAuthCache(authenticated) {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return;
    const entry = {
        authenticated,
        at: new Date().toISOString(),
    };
    return new Promise((resolve) => {
        sessionStore.set({ [AUTH_CACHE_KEY]: entry }, () => resolve());
    });
}
/**
 * Drops the cached verdict. Call this on any 401 so the next popup open
 * doesn't trust a stale "authenticated" answer.
 */
async function clearSessionAuthCache() {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return;
    return new Promise((resolve) => {
        sessionStore.remove(AUTH_CACHE_KEY, () => resolve());
    });
}

// EXTERNAL MODULE: ./src/shared/error-messages.ts
var error_messages = __webpack_require__(543);
;// ./src/options/save-status.ts
/**
 * Minimal save-status state machine for the extension options page.
 *
 * Mirrors the pattern in apps/web/src/components/studio/save-status.ts but
 * pared down: the options surface only needs idle → saving → saved → idle,
 * with a 2s linger on "saved" and a sticky "error" state.
 *
 * Pure helpers (no React state) so they're trivially unit-testable; the
 * page glues them together with useState + setTimeout.
 */
const SAVED_LINGER_MS = 2000;
const AUTO_SAVE_DEBOUNCE_MS = 500;
/**
 * Returns the inline label for a given status. Kept here so the test suite
 * can assert against the exact strings without rendering the component.
 */
function labelForStatus(status) {
    switch (status.state) {
        case "saving":
            return "Saving…";
        case "saved":
            return "Saved ✓";
        case "error":
            return status.error ? `Save failed — ${status.error}` : "Save failed";
        case "idle":
        default:
            return "";
    }
}

;// ./src/options/App.tsx






function OptionsApp() {
    const [settings, setSettingsState] = (0,react.useState)(types/* DEFAULT_SETTINGS */.a$);
    const [apiUrl, setApiUrl] = (0,react.useState)(types/* DEFAULT_API_BASE_URL */.Ri);
    const [learnedAnswers, setLearnedAnswers] = (0,react.useState)([]);
    const [loading, setLoading] = (0,react.useState)(true);
    // Save-status indicator (see save-status.ts). One per surface so the URL
    // save button doesn't flicker the checkbox area, and vice versa.
    const [apiUrlStatus, setApiUrlStatus] = (0,react.useState)({
        state: "idle",
    });
    const [settingsStatus, setSettingsStatus] = (0,react.useState)({
        state: "idle",
    });
    // Auto-save debounce — a single timer is enough because we only ever
    // need to flush the latest settings object. The pending changes ref
    // accumulates updates that arrive within the debounce window.
    const pendingSettingsRef = (0,react.useRef)({});
    const debounceTimerRef = (0,react.useRef)(null);
    const savedFadeTimerRef = (0,react.useRef)(null);
    const apiSavedFadeTimerRef = (0,react.useRef)(null);
    (0,react.useEffect)(() => {
        loadSettings();
        loadLearnedAnswers();
        return () => {
            if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current);
            if (savedFadeTimerRef.current)
                clearTimeout(savedFadeTimerRef.current);
            if (apiSavedFadeTimerRef.current)
                clearTimeout(apiSavedFadeTimerRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    async function loadSettings() {
        try {
            const [settingsData, url] = await Promise.all([
                getSettings(),
                getApiBaseUrl(),
            ]);
            setSettingsState(settingsData);
            setApiUrl(url);
        }
        catch (err) {
            setSettingsStatus({ state: "error", error: (0,error_messages/* messageForError */.p3)(err) });
        }
        finally {
            setLoading(false);
        }
    }
    async function loadLearnedAnswers() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: "GET_AUTH_STATUS",
            });
            if (!response?.data?.isAuthenticated)
                return;
            // Fetch learned answers via background script
            const result = await chrome.runtime.sendMessage({
                type: "GET_LEARNED_ANSWERS",
            });
            if (result?.success && result.data) {
                setLearnedAnswers(result.data);
            }
        }
        catch (err) {
            console.error("Failed to load learned answers:", err);
        }
    }
    async function handleDeleteAnswer(id) {
        try {
            const result = await chrome.runtime.sendMessage({
                type: "DELETE_ANSWER",
                payload: id,
            });
            if (result?.success) {
                setLearnedAnswers((prev) => prev.filter((a) => a.id !== id));
            }
        }
        catch (err) {
            console.error("Failed to delete answer:", err);
        }
    }
    /**
     * Updates a single setting locally and schedules a debounced flush.
     * Multiple rapid changes (range slider drag, repeated checkbox clicks)
     * coalesce into a single updateSettings call after AUTO_SAVE_DEBOUNCE_MS
     * of quiet.
     */
    function handleSettingChange(key, value) {
        setSettingsState((prev) => ({ ...prev, [key]: value }));
        pendingSettingsRef.current = {
            ...pendingSettingsRef.current,
            [key]: value,
        };
        if (debounceTimerRef.current)
            clearTimeout(debounceTimerRef.current);
        if (savedFadeTimerRef.current) {
            clearTimeout(savedFadeTimerRef.current);
            savedFadeTimerRef.current = null;
        }
        debounceTimerRef.current = setTimeout(() => {
            flushSettings();
        }, AUTO_SAVE_DEBOUNCE_MS);
    }
    async function flushSettings() {
        const pending = pendingSettingsRef.current;
        pendingSettingsRef.current = {};
        if (Object.keys(pending).length === 0)
            return;
        setSettingsStatus({ state: "saving" });
        try {
            await updateSettings(pending);
            setSettingsStatus({ state: "saved" });
            savedFadeTimerRef.current = setTimeout(() => {
                setSettingsStatus({ state: "idle" });
                savedFadeTimerRef.current = null;
            }, SAVED_LINGER_MS);
        }
        catch (err) {
            setSettingsStatus({ state: "error", error: (0,error_messages/* messageForError */.p3)(err) });
        }
    }
    async function handleApiUrlChange() {
        setApiUrlStatus({ state: "saving" });
        if (apiSavedFadeTimerRef.current) {
            clearTimeout(apiSavedFadeTimerRef.current);
            apiSavedFadeTimerRef.current = null;
        }
        try {
            await setApiBaseUrl(apiUrl);
            setApiUrlStatus({ state: "saved" });
            apiSavedFadeTimerRef.current = setTimeout(() => {
                setApiUrlStatus({ state: "idle" });
                apiSavedFadeTimerRef.current = null;
            }, SAVED_LINGER_MS);
        }
        catch (err) {
            setApiUrlStatus({ state: "error", error: (0,error_messages/* messageForError */.p3)(err) });
        }
    }
    if (loading) {
        return ((0,jsx_runtime.jsx)("div", { className: "options-container", children: (0,jsx_runtime.jsx)("div", { className: "loading", children: "Loading settings..." }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "options-container", children: [(0,jsx_runtime.jsxs)("header", { children: [(0,jsx_runtime.jsx)("img", { className: "header-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), (0,jsx_runtime.jsxs)("div", { className: "header-text", children: [(0,jsx_runtime.jsx)("h1", { children: "Slothing Settings" }), (0,jsx_runtime.jsx)("p", { className: "subtitle", children: "Connection, autofill, learning, and tracking" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card connection-card", children: [(0,jsx_runtime.jsx)("h2", { children: "Connection" }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { children: [(0,jsx_runtime.jsx)("span", { children: "Slothing API URL" }), (0,jsx_runtime.jsx)("small", { children: "The URL where your Slothing app is running" })] }), (0,jsx_runtime.jsxs)("div", { className: "input-group", children: [(0,jsx_runtime.jsx)("input", { type: "url", value: apiUrl, onChange: (e) => setApiUrl(e.target.value), placeholder: types/* DEFAULT_API_BASE_URL */.Ri }), (0,jsx_runtime.jsx)("button", { onClick: handleApiUrlChange, disabled: apiUrlStatus.state === "saving", children: apiUrlStatus.state === "saving" ? "Saving…" : "Save" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: apiUrlStatus })] })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card autofill-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Auto-Fill" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.autoFillEnabled, onChange: (e) => handleSettingChange("autoFillEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Enable auto-fill" })] }), (0,jsx_runtime.jsx)("small", { children: "Automatically detect form fields on job application pages" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.showConfidenceIndicators, onChange: (e) => handleSettingChange("showConfidenceIndicators", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Show confidence indicators" })] }), (0,jsx_runtime.jsx)("small", { children: "Display confidence levels for detected fields" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { children: [(0,jsx_runtime.jsx)("span", { children: "Minimum confidence threshold" }), (0,jsx_runtime.jsx)("small", { children: "Only fill fields with confidence above this level" })] }), (0,jsx_runtime.jsxs)("div", { className: "range-group", children: [(0,jsx_runtime.jsx)("input", { type: "range", min: "0", max: "1", step: "0.1", value: settings.minimumConfidence, onChange: (e) => handleSettingChange("minimumConfidence", parseFloat(e.target.value)) }), (0,jsx_runtime.jsxs)("span", { children: [Math.round(settings.minimumConfidence * 100), "%"] })] })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card compact-card learning-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Learning" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.learnFromAnswers, onChange: (e) => handleSettingChange("learnFromAnswers", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Learn from my answers" })] }), (0,jsx_runtime.jsx)("small", { children: "Save answers to custom questions for future suggestions" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card tracking-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Tracking" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.autoTrackApplicationsEnabled, onChange: (e) => handleSettingChange("autoTrackApplicationsEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Track submitted applications" })] }), (0,jsx_runtime.jsx)("small", { children: "Create an applied opportunity when an autofilled application form is submitted" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.captureScreenshotEnabled, onChange: (e) => handleSettingChange("captureScreenshotEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Capture screenshot when tracking" })] }), (0,jsx_runtime.jsx)("small", { children: "Off by default; form values are never captured" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card compact-card notifications-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Notifications" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.notifyOnJobDetected, onChange: (e) => handleSettingChange("notifyOnJobDetected", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Show badge when job detected" })] }), (0,jsx_runtime.jsx)("small", { children: "Display a badge on the extension icon when a job listing is found" })] })] }), learnedAnswers.length > 0 && ((0,jsx_runtime.jsxs)("section", { className: "settings-card saved-answers-card", children: [(0,jsx_runtime.jsxs)("h2", { children: ["Saved Answers (", learnedAnswers.length, ")"] }), (0,jsx_runtime.jsx)("div", { className: "answers-list", children: learnedAnswers.map((answer) => ((0,jsx_runtime.jsxs)("div", { className: "answer-item", children: [(0,jsx_runtime.jsx)("div", { className: "answer-question", children: answer.question }), (0,jsx_runtime.jsx)("div", { className: "answer-text", children: answer.answer }), (0,jsx_runtime.jsxs)("div", { className: "answer-meta", children: [answer.sourceCompany && (0,jsx_runtime.jsx)("span", { children: answer.sourceCompany }), (0,jsx_runtime.jsxs)("span", { children: ["Used ", answer.timesUsed, "x"] }), (0,jsx_runtime.jsx)("button", { className: "delete-btn", onClick: () => handleDeleteAnswer(answer.id), children: "Delete" })] })] }, answer.id))) })] })), (0,jsx_runtime.jsxs)("section", { className: "settings-card about-card", children: [(0,jsx_runtime.jsx)("h2", { children: "About" }), (0,jsx_runtime.jsxs)("p", { className: "about", children: ["Slothing Browser Extension v", chrome.runtime.getManifest().version] }), (0,jsx_runtime.jsx)("p", { className: "about", children: (0,jsx_runtime.jsx)("a", { href: "https://github.com/ANonABento/slothing", target: "_blank", rel: "noopener noreferrer", children: "View on GitHub" }) })] })] }));
}
function SaveStatusBadge({ status }) {
    if (status.state === "idle")
        return null;
    const label = labelForStatus(status);
    return ((0,jsx_runtime.jsx)("span", { className: `save-status save-status-${status.state}`, role: "status", "aria-live": "polite", children: label }));
}

;// ./src/options/index.tsx





const container = document.getElementById("root");
if (container) {
    const root = (0,client/* createRoot */.H)(container);
    root.render((0,jsx_runtime.jsx)(react.StrictMode, { children: (0,jsx_runtime.jsx)(OptionsApp, {}) }));
}


/***/ },

/***/ 543
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p3: () => (/* binding */ messageForError)
/* harmony export */ });
/* unused harmony exports messageForStatus, retryExhaustedMessage */
/**
 * User-facing error string mapping for the Slothing extension.
 *
 * The popup (and any other extension surface) should never show raw
 * `"Request failed: 503"` / `"Authentication expired"` strings. Wrap any
 * error path in `messageForError(err)` to get an English sentence safe
 * for end-users.
 *
 * Mirror of the message tone used by `apps/web/.../extension/connect/page.tsx`
 * `messageForStatus` — the connect page keeps its own copy because it sits
 * inside the next-intl tree (different package boundary), but the
 * user-visible strings should stay aligned. If you change one, change both.
 *
 * English-only by design: the extension itself does not use next-intl.
 */
/**
 * Maps an HTTP status code to a human-friendly message.
 */
function messageForStatus(status) {
    if (status === 401 || status === 403) {
        return "Sign in expired. Reconnect the extension.";
    }
    if (status === 429) {
        return "We're rate-limited. Try again in a minute.";
    }
    if (status >= 500) {
        return "Slothing servers are having a problem.";
    }
    return "Something went wrong. Please try again.";
}
function retryExhaustedMessage() {
    return "Slothing is still not responding after retrying. Try again in a minute.";
}
/**
 * Best-effort mapping of an unknown thrown value to a human-friendly
 * message. Recognises the specific phrases the api-client throws today
 * (`"Authentication expired"`, `"Not authenticated"`, `"Request failed: <code>"`,
 * `"Failed to fetch"`) and falls back to the original message for anything
 * else — that's almost always more useful than a generic catch-all.
 */
function messageForError(err) {
    // Generic network failure (fetch in service workers throws TypeError here)
    if (err instanceof TypeError) {
        return "Network error. Check your connection and try again.";
    }
    const raw = err instanceof Error ? err.message : "";
    if (!raw)
        return "Something went wrong. Please try again.";
    // Auth-shaped messages from SlothingAPIClient.
    if (raw === "Authentication expired" ||
        raw === "Not authenticated" ||
        /unauthor/i.test(raw)) {
        return messageForStatus(401);
    }
    // `Request failed: 503` — recover the status code.
    const match = raw.match(/Request failed:\s*(\d{3})/);
    if (match) {
        const code = Number(match[1]);
        if (Number.isFinite(code))
            return messageForStatus(code);
    }
    const retryMatch = raw.match(/Request still failing after retry:\s*(\d{3})/);
    if (retryMatch) {
        return retryExhaustedMessage();
    }
    // Browser fetch failures bubble up as "Failed to fetch".
    if (/failed to fetch/i.test(raw) || /network/i.test(raw)) {
        return "Network error. Check your connection and try again.";
    }
    // For anything else, the underlying message is usually a sentence already
    // (e.g. "Couldn't read the full job description from this page.").
    return raw;
}


/***/ },

/***/ 353
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ri: () => (/* binding */ DEFAULT_API_BASE_URL),
/* harmony export */   Xf: () => (/* binding */ LEGACY_LOCAL_API_BASE_URL),
/* harmony export */   a$: () => (/* binding */ DEFAULT_SETTINGS),
/* harmony export */   eA: () => (/* binding */ SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL),
/* harmony export */   fc: () => (/* binding */ CHAT_PORT_NAME)
/* harmony export */ });
/**
 * P4/#40 — Long-lived port name used by the inline AI assistant. The content
 * script calls `chrome.runtime.connect({ name: CHAT_PORT_NAME })` and the
 * background's `chrome.runtime.onConnect` listener filters by this name.
 */
const CHAT_PORT_NAME = "slothing-chat-stream";
const DEFAULT_SETTINGS = {
    autoFillEnabled: true,
    showConfidenceIndicators: true,
    minimumConfidence: 0.5,
    learnFromAnswers: true,
    notifyOnJobDetected: true,
    autoTrackApplicationsEnabled: true,
    captureScreenshotEnabled: false,
};
const LEGACY_LOCAL_API_BASE_URL = "http://localhost:3000";
const DEFAULT_API_BASE_URL = "http://localhost:3000" || 0;
const SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL = DEFAULT_API_BASE_URL !== LEGACY_LOCAL_API_BASE_URL;


/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(481));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBa0IsY0FBYztBQUNoQyxZQUFZLG1CQUFJLFdBQVcsc0NBQXNDLGFBQWEsMkRBQTJEO0FBQ3pJOzs7QUMzSmdEO0FBQ3RCO0FBQ29CO0FBQ2Y7QUFDVDtBQUN0QjtBQUNBO0FBQ0EsaUJBQWlCLDRCQUFVO0FBQzNCLGdCQUFnQixtQkFBSSxDQUFDLGdCQUFnQixJQUFJLFVBQVUsbUJBQUksQ0FBQyxVQUFVLElBQUksR0FBRztBQUN6RTs7Ozs7Ozs7Ozs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsRUFBRTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkVBQTJFLEVBQUU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDeEVBO0FBQ0E7QUFDQSwwQ0FBMEMsc0JBQXNCO0FBQ2hFO0FBQ0E7QUFDTztBQUNBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ0EsNkJBQTZCLHVCQUEyQyxJQUFJLENBQXVCO0FBQ25HIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9janMvcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9qc3gtcnVudGltZS5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvc3RvcmFnZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL29wdGlvbnMvc2F2ZS1zdGF0dXMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9vcHRpb25zL0FwcC50c3giLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9vcHRpb25zL2luZGV4LnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9lcnJvci1tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC90eXBlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBleHBvcnRzLmNyZWF0ZVJvb3QgPSBtLmNyZWF0ZVJvb3Q7XG4gIGV4cG9ydHMuaHlkcmF0ZVJvb3QgPSBtLmh5ZHJhdGVSb290O1xufSBlbHNlIHtcbiAgdmFyIGkgPSBtLl9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEO1xuICBleHBvcnRzLmNyZWF0ZVJvb3QgPSBmdW5jdGlvbihjLCBvKSB7XG4gICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbS5jcmVhdGVSb290KGMsIG8pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbiAgZXhwb3J0cy5oeWRyYXRlUm9vdCA9IGZ1bmN0aW9uKGMsIGgsIG8pIHtcbiAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBtLmh5ZHJhdGVSb290KGMsIGgsIG8pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbn1cbiIsIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHJlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0Jzt2YXIgZj1yZXF1aXJlKFwicmVhY3RcIiksaz1TeW1ib2wuZm9yKFwicmVhY3QuZWxlbWVudFwiKSxsPVN5bWJvbC5mb3IoXCJyZWFjdC5mcmFnbWVudFwiKSxtPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksbj1mLl9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVELlJlYWN0Q3VycmVudE93bmVyLHA9e2tleTohMCxyZWY6ITAsX19zZWxmOiEwLF9fc291cmNlOiEwfTtcbmZ1bmN0aW9uIHEoYyxhLGcpe3ZhciBiLGQ9e30sZT1udWxsLGg9bnVsbDt2b2lkIDAhPT1nJiYoZT1cIlwiK2cpO3ZvaWQgMCE9PWEua2V5JiYoZT1cIlwiK2Eua2V5KTt2b2lkIDAhPT1hLnJlZiYmKGg9YS5yZWYpO2ZvcihiIGluIGEpbS5jYWxsKGEsYikmJiFwLmhhc093blByb3BlcnR5KGIpJiYoZFtiXT1hW2JdKTtpZihjJiZjLmRlZmF1bHRQcm9wcylmb3IoYiBpbiBhPWMuZGVmYXVsdFByb3BzLGEpdm9pZCAwPT09ZFtiXSYmKGRbYl09YVtiXSk7cmV0dXJueyQkdHlwZW9mOmssdHlwZTpjLGtleTplLHJlZjpoLHByb3BzOmQsX293bmVyOm4uY3VycmVudH19ZXhwb3J0cy5GcmFnbWVudD1sO2V4cG9ydHMuanN4PXE7ZXhwb3J0cy5qc3hzPXE7XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LXJ1bnRpbWUuZGV2ZWxvcG1lbnQuanMnKTtcbn1cbiIsIi8vIEV4dGVuc2lvbiBzdG9yYWdlIHV0aWxpdGllc1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9BUElfQkFTRV9VUkwsIExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwsIFNIT1VMRF9QUk9NT1RFX0xFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwsIH0gZnJvbSBcIkAvc2hhcmVkL3R5cGVzXCI7XG5jb25zdCBTVE9SQUdFX0tFWSA9IFwic2xvdGhpbmdfZXh0ZW5zaW9uXCI7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmFnZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFNUT1JBR0VfS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdG9yZWQgPSByZXN1bHRbU1RPUkFHRV9LRVldO1xuICAgICAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IFNIT1VMRF9QUk9NT1RFX0xFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgJiZcbiAgICAgICAgICAgICAgICBzdG9yZWQ/LmFwaUJhc2VVcmwgPT09IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgJiZcbiAgICAgICAgICAgICAgICAhc3RvcmVkLmF1dGhUb2tlblxuICAgICAgICAgICAgICAgID8gREVGQVVMVF9BUElfQkFTRV9VUkxcbiAgICAgICAgICAgICAgICA6IHN0b3JlZD8uYXBpQmFzZVVybCB8fCBERUZBVUxUX0FQSV9CQVNFX1VSTDtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIC4uLnN0b3JlZCxcbiAgICAgICAgICAgICAgICBhcGlCYXNlVXJsLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIC4uLnN0b3JlZD8uc2V0dGluZ3MgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTdG9yYWdlKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLmN1cnJlbnQsIC4uLnVwZGF0ZXMgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogdXBkYXRlZCB9LCByZXNvbHZlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShTVE9SQUdFX0tFWSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG4vLyBBdXRoIHRva2VuIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBdXRoVG9rZW4odG9rZW4sIGV4cGlyZXNBdCwgYXBpQmFzZVVybCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHRva2VuLFxuICAgICAgICB0b2tlbkV4cGlyeTogZXhwaXJlc0F0LFxuICAgICAgICAuLi4oYXBpQmFzZVVybCA/IHsgYXBpQmFzZVVybCB9IDoge30pLFxuICAgICAgICBsYXN0U2VlbkF1dGhBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0pO1xuICAgIGF3YWl0IHNldFNlc3Npb25BdXRoQ2FjaGUodHJ1ZSk7XG59XG4vKipcbiAqIFJlY29yZHMgdGhhdCB3ZSBqdXN0IG9ic2VydmVkIGEgd29ya2luZyBhdXRoZW50aWNhdGVkIHN0YXRlLiBDYWxsZWQgYnkgdGhlXG4gKiBBUEkgY2xpZW50IGFmdGVyIGEgc3VjY2Vzc2Z1bCBgaXNBdXRoZW50aWNhdGVkKClgIGNoZWNrIHNvIHRoZSBwb3B1cCBjYW5cbiAqIGRpc3Rpbmd1aXNoIGEgcmVhbCBsb2dvdXQgZnJvbSBhIHNlcnZpY2Utd29ya2VyIHN0YXRlLWxvc3MgZXZlbnQuXG4gKlxuICogRGlzdGluY3QgZnJvbSBgc2V0QXV0aFRva2VuYCBiZWNhdXNlIHdlIGRvbid0IGFsd2F5cyBoYXZlIGEgZnJlc2ggdG9rZW4gdG9cbiAqIHdyaXRlIOKAlCBzb21ldGltZXMgd2UganVzdCB2ZXJpZmllZCB0aGUgZXhpc3Rpbmcgb25lLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya0F1dGhTZWVuKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBsYXN0U2VlbkF1dGhBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pO1xufVxuLyoqXG4gKiBcIlNlc3Npb24gbG9zdFwiIHZpZXcgKHBvcHVwLCAjMjcpIHNob3dzIHdoZW4gd2UgaGF2ZSBubyBgYXV0aFRva2VuYCBidXRcbiAqIGBsYXN0U2VlbkF1dGhBdGAgaXMgd2l0aGluIHRoaXMgd2luZG93LiBCZXlvbmQgdGhlIHdpbmRvdyB3ZSB0cmVhdCB0aGVcbiAqIGV4dGVuc2lvbiBhcyBhIGZyZXNoIGluc3RhbGwgLyB0cnVlIGxvZ291dCBhbmQgc2hvdyB0aGUgbm9ybWFsIGhlcm8uXG4gKi9cbmV4cG9ydCBjb25zdCBTRVNTSU9OX0xPU1RfV0lORE9XX01TID0gMjQgKiA2MCAqIDYwICogMTAwMDsgLy8gMjRoXG4vKipcbiAqIFJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwb3B1cCBzaG91bGQgcmVuZGVyIHRoZSBcIlNlc3Npb24gbG9zdCDigJQgcmVjb25uZWN0XCJcbiAqIGJyYW5jaCBpbnN0ZWFkIG9mIHRoZSB1bmF1dGhlbnRpY2F0ZWQgaGVyby4gU2VlICMyNy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2Vzc2lvbkxvc3Qoc3RvcmFnZSwgbm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGlmIChzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghc3RvcmFnZS5sYXN0U2VlbkF1dGhBdClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGxhc3RTZWVuID0gbmV3IERhdGUoc3RvcmFnZS5sYXN0U2VlbkF1dGhBdCkuZ2V0VGltZSgpO1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGxhc3RTZWVuKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBub3cgLSBsYXN0U2VlbiA8PSBTRVNTSU9OX0xPU1RfV0lORE9XX01TO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQXV0aFRva2VuKCkge1xuICAgIC8vIE5PVEU6IHdlIGludGVudGlvbmFsbHkgZG8gTk9UIGNsZWFyIGBsYXN0U2VlbkF1dGhBdGAgaGVyZS4gQSB0cnVlIGxvZ291dFxuICAgIC8vIHBhdGggKGhhbmRsZUxvZ291dCkgY2FsbHMgYGZvcmdldEF1dGhIaXN0b3J5YCBhZnRlcndhcmRzOyB0aGlzIGhlbHBlciBpc1xuICAgIC8vIGFsc28gdXNlZCB3aGVuIGEgdG9rZW4gcXVpZXRseSBleHBpcmVzIG9yIGEgNDAxIHRyaXBzIHRoZSBhcGktY2xpZW50LFxuICAgIC8vIGFuZCBpbiB0aG9zZSBjYXNlcyB0aGUgc2Vzc2lvbi1sb3N0IFVJIGlzIGV4YWN0bHkgd2hhdCB3ZSB3YW50IHRvIHNob3cuXG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGF1dGhUb2tlbjogdW5kZWZpbmVkLFxuICAgICAgICB0b2tlbkV4cGlyeTogdW5kZWZpbmVkLFxuICAgICAgICBjYWNoZWRQcm9maWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogdW5kZWZpbmVkLFxuICAgIH0pO1xufVxuLyoqXG4gKiBXaXBlcyB0aGUgXCJ3ZSd2ZSBzZWVuIHlvdSBiZWZvcmVcIiBicmVhZGNydW1iIHNvIHRoZSBwb3B1cCBzaG93cyB0aGVcbiAqIHVuYXV0aGVudGljYXRlZCBoZXJvIG9uIG5leHQgb3Blbi4gQ2FsbCB0aGlzIGZyb20gZXhwbGljaXQtbG9nb3V0IGZsb3dzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9yZ2V0QXV0aEhpc3RvcnkoKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IGxhc3RTZWVuQXV0aEF0OiB1bmRlZmluZWQgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXV0aFRva2VuKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gQ2hlY2sgZXhwaXJ5XG4gICAgaWYgKHN0b3JhZ2UudG9rZW5FeHBpcnkpIHtcbiAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoc3RvcmFnZS50b2tlbkV4cGlyeSk7XG4gICAgICAgIGlmIChleHBpcnkgPCBuZXcgRGF0ZSgpKSB7XG4gICAgICAgICAgICBhd2FpdCBjbGVhckF1dGhUb2tlbigpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuYXV0aFRva2VuO1xufVxuLy8gUHJvZmlsZSBjYWNoZSBoZWxwZXJzXG5jb25zdCBQUk9GSUxFX0NBQ0hFX1RUTCA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhY2hlZFByb2ZpbGUoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuY2FjaGVkUHJvZmlsZSB8fCAhc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZEF0ID0gbmV3IERhdGUoc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpO1xuICAgIGlmIChEYXRlLm5vdygpIC0gY2FjaGVkQXQuZ2V0VGltZSgpID4gUFJPRklMRV9DQUNIRV9UVEwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIENhY2hlIGV4cGlyZWRcbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuY2FjaGVkUHJvZmlsZTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDYWNoZWRQcm9maWxlKHByb2ZpbGUpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogcHJvZmlsZSxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJDYWNoZWRQcm9maWxlKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogdW5kZWZpbmVkLFxuICAgIH0pO1xufVxuLy8gU2V0dGluZ3MgaGVscGVyc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgcmV0dXJuIHN0b3JhZ2Uuc2V0dGluZ3M7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3ModXBkYXRlcykge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgY29uc3QgdXBkYXRlZCA9IHsgLi4uc3RvcmFnZS5zZXR0aW5ncywgLi4udXBkYXRlcyB9O1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBzZXR0aW5nczogdXBkYXRlZCB9KTtcbiAgICByZXR1cm4gdXBkYXRlZDtcbn1cbi8vIEFQSSBVUkwgaGVscGVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXBpQmFzZVVybCh1cmwpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgYXBpQmFzZVVybDogdXJsIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUJhc2VVcmwoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5hcGlCYXNlVXJsO1xufVxuLy8gLS0tLSBTZXNzaW9uLXNjb3BlZCBhdXRoIGNhY2hlICgjMzApIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIGBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uYCBpcyBpbi1tZW1vcnkgb25seSDigJQgaXQgc3Vydml2ZXMgc3VzcGVuZGluZyB0aGVcbi8vIHNlcnZpY2Ugd29ya2VyIGJ1dCBpcyB3aXBlZCBvbiBicm93c2VyIHJlc3RhcnQsIHdoaWNoIGlzIGV4YWN0bHkgd2hhdCB3ZVxuLy8gd2FudCBmb3IgYSBzaG9ydC1saXZlZCBhdXRoIHZlcmRpY3QgY2FjaGUuIFVzaW5nIHNlc3Npb24gKG5vdCBsb2NhbClcbi8vIGFsc28gbWVhbnMgd2UgbmV2ZXIgcGVyc2lzdCB0aGUgdmVyZGljdCB0byBkaXNrLlxuLy9cbi8vIFRoZSBjYWNoZSBzdG9yZXMgYHsgYXV0aGVudGljYXRlZDogYm9vbGVhbiwgYXQ6IElTTyBzdHJpbmcgfWAgc28gdGhlXG4vLyBwb3B1cCBjYW4gcmV0dXJuIGEgcmVzdWx0IGluIDw1MG1zIG9uIHRoZSBzZWNvbmQgb3BlbiB3aXRoaW4gYSBtaW51dGUsXG4vLyB3aGlsZSB0aGUgYmFja2dyb3VuZCBzY3JpcHQgcmV2YWxpZGF0ZXMgaW4gdGhlIGJhY2tncm91bmQuXG5leHBvcnQgY29uc3QgQVVUSF9DQUNIRV9UVExfTVMgPSA2MCAqIDEwMDA7XG5jb25zdCBBVVRIX0NBQ0hFX0tFWSA9IFwic2xvdGhpbmdfYXV0aF9jYWNoZVwiO1xuLyoqXG4gKiBSZWFkcyB0aGUgc2Vzc2lvbi1zY29wZWQgYXV0aCB2ZXJkaWN0IGNhY2hlLiBSZXR1cm5zIG51bGwgd2hlbjpcbiAqIC0gdGhlIGVudHJ5IGhhcyBuZXZlciBiZWVuIHdyaXR0ZW4sXG4gKiAtIHRoZSBlbnRyeSBpcyBvbGRlciB0aGFuIEFVVEhfQ0FDSEVfVFRMX01TLFxuICogLSB0aGUgZW50cnkncyB0aW1lc3RhbXAgaXMgdW5wYXJzZWFibGUsIG9yXG4gKiAtIGNocm9tZS5zdG9yYWdlLnNlc3Npb24gaXMgdW5hdmFpbGFibGUgKGUuZy4gb2xkZXIgYnJvd3NlcnMpLlxuICpcbiAqIE9wdGlvbmFsIGBub3dgIHBhcmFtZXRlciBleGlzdHMgZm9yIHRlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2Vzc2lvbkF1dGhDYWNoZShub3cgPSBEYXRlLm5vdygpKSB7XG4gICAgY29uc3Qgc2Vzc2lvblN0b3JlID0gY2hyb21lLnN0b3JhZ2U/LnNlc3Npb247XG4gICAgaWYgKCFzZXNzaW9uU3RvcmUpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXNzaW9uU3RvcmUuZ2V0KEFVVEhfQ0FDSEVfS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IHJlc3VsdD8uW0FVVEhfQ0FDSEVfS0VZXTtcbiAgICAgICAgICAgIGlmICghZW50cnkgfHwgdHlwZW9mIGVudHJ5LmF0ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhdCA9IG5ldyBEYXRlKGVudHJ5LmF0KS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShhdCkpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3cgLSBhdCA+IEFVVEhfQ0FDSEVfVFRMX01TKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKHsgYXV0aGVudGljYXRlZDogISFlbnRyeS5hdXRoZW50aWNhdGVkLCBhdDogZW50cnkuYXQgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBXcml0ZXMgYSBmcmVzaCB2ZXJkaWN0IHRvIHRoZSBzZXNzaW9uLXNjb3BlZCBjYWNoZS4gTm8tb3BzIHdoZW5cbiAqIGNocm9tZS5zdG9yYWdlLnNlc3Npb24gaXMgdW5hdmFpbGFibGUgc28gY2FsbGVycyBkb24ndCBuZWVkIHRvIGd1YXJkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U2Vzc2lvbkF1dGhDYWNoZShhdXRoZW50aWNhdGVkKSB7XG4gICAgY29uc3Qgc2Vzc2lvblN0b3JlID0gY2hyb21lLnN0b3JhZ2U/LnNlc3Npb247XG4gICAgaWYgKCFzZXNzaW9uU3RvcmUpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgICAgYXV0aGVudGljYXRlZCxcbiAgICAgICAgYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXNzaW9uU3RvcmUuc2V0KHsgW0FVVEhfQ0FDSEVfS0VZXTogZW50cnkgfSwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cbi8qKlxuICogRHJvcHMgdGhlIGNhY2hlZCB2ZXJkaWN0LiBDYWxsIHRoaXMgb24gYW55IDQwMSBzbyB0aGUgbmV4dCBwb3B1cCBvcGVuXG4gKiBkb2Vzbid0IHRydXN0IGEgc3RhbGUgXCJhdXRoZW50aWNhdGVkXCIgYW5zd2VyLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJTZXNzaW9uQXV0aENhY2hlKCkge1xuICAgIGNvbnN0IHNlc3Npb25TdG9yZSA9IGNocm9tZS5zdG9yYWdlPy5zZXNzaW9uO1xuICAgIGlmICghc2Vzc2lvblN0b3JlKVxuICAgICAgICByZXR1cm47XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNlc3Npb25TdG9yZS5yZW1vdmUoQVVUSF9DQUNIRV9LRVksICgpID0+IHJlc29sdmUoKSk7XG4gICAgfSk7XG59XG4iLCIvKipcbiAqIE1pbmltYWwgc2F2ZS1zdGF0dXMgc3RhdGUgbWFjaGluZSBmb3IgdGhlIGV4dGVuc2lvbiBvcHRpb25zIHBhZ2UuXG4gKlxuICogTWlycm9ycyB0aGUgcGF0dGVybiBpbiBhcHBzL3dlYi9zcmMvY29tcG9uZW50cy9zdHVkaW8vc2F2ZS1zdGF0dXMudHMgYnV0XG4gKiBwYXJlZCBkb3duOiB0aGUgb3B0aW9ucyBzdXJmYWNlIG9ubHkgbmVlZHMgaWRsZSDihpIgc2F2aW5nIOKGkiBzYXZlZCDihpIgaWRsZSxcbiAqIHdpdGggYSAycyBsaW5nZXIgb24gXCJzYXZlZFwiIGFuZCBhIHN0aWNreSBcImVycm9yXCIgc3RhdGUuXG4gKlxuICogUHVyZSBoZWxwZXJzIChubyBSZWFjdCBzdGF0ZSkgc28gdGhleSdyZSB0cml2aWFsbHkgdW5pdC10ZXN0YWJsZTsgdGhlXG4gKiBwYWdlIGdsdWVzIHRoZW0gdG9nZXRoZXIgd2l0aCB1c2VTdGF0ZSArIHNldFRpbWVvdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBTQVZFRF9MSU5HRVJfTVMgPSAyMDAwO1xuZXhwb3J0IGNvbnN0IEFVVE9fU0FWRV9ERUJPVU5DRV9NUyA9IDUwMDtcbi8qKlxuICogUmV0dXJucyB0aGUgaW5saW5lIGxhYmVsIGZvciBhIGdpdmVuIHN0YXR1cy4gS2VwdCBoZXJlIHNvIHRoZSB0ZXN0IHN1aXRlXG4gKiBjYW4gYXNzZXJ0IGFnYWluc3QgdGhlIGV4YWN0IHN0cmluZ3Mgd2l0aG91dCByZW5kZXJpbmcgdGhlIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhYmVsRm9yU3RhdHVzKHN0YXR1cykge1xuICAgIHN3aXRjaCAoc3RhdHVzLnN0YXRlKSB7XG4gICAgICAgIGNhc2UgXCJzYXZpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBcIlNhdmluZ+KAplwiO1xuICAgICAgICBjYXNlIFwic2F2ZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcIlNhdmVkIOKck1wiO1xuICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgIHJldHVybiBzdGF0dXMuZXJyb3IgPyBgU2F2ZSBmYWlsZWQg4oCUICR7c3RhdHVzLmVycm9yfWAgOiBcIlNhdmUgZmFpbGVkXCI7XG4gICAgICAgIGNhc2UgXCJpZGxlXCI6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBERUZBVUxUX0FQSV9CQVNFX1VSTCB9IGZyb20gXCJAL3NoYXJlZC90eXBlc1wiO1xuaW1wb3J0IHsgdXBkYXRlU2V0dGluZ3MsIGdldFNldHRpbmdzLCBnZXRBcGlCYXNlVXJsLCBzZXRBcGlCYXNlVXJsLCB9IGZyb20gXCIuLi9iYWNrZ3JvdW5kL3N0b3JhZ2VcIjtcbmltcG9ydCB7IG1lc3NhZ2VGb3JFcnJvciB9IGZyb20gXCJAL3NoYXJlZC9lcnJvci1tZXNzYWdlc1wiO1xuaW1wb3J0IHsgQVVUT19TQVZFX0RFQk9VTkNFX01TLCBTQVZFRF9MSU5HRVJfTVMsIGxhYmVsRm9yU3RhdHVzLCB9IGZyb20gXCIuL3NhdmUtc3RhdHVzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBPcHRpb25zQXBwKCkge1xuICAgIGNvbnN0IFtzZXR0aW5ncywgc2V0U2V0dGluZ3NTdGF0ZV0gPSB1c2VTdGF0ZShERUZBVUxUX1NFVFRJTkdTKTtcbiAgICBjb25zdCBbYXBpVXJsLCBzZXRBcGlVcmxdID0gdXNlU3RhdGUoREVGQVVMVF9BUElfQkFTRV9VUkwpO1xuICAgIGNvbnN0IFtsZWFybmVkQW5zd2Vycywgc2V0TGVhcm5lZEFuc3dlcnNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIC8vIFNhdmUtc3RhdHVzIGluZGljYXRvciAoc2VlIHNhdmUtc3RhdHVzLnRzKS4gT25lIHBlciBzdXJmYWNlIHNvIHRoZSBVUkxcbiAgICAvLyBzYXZlIGJ1dHRvbiBkb2Vzbid0IGZsaWNrZXIgdGhlIGNoZWNrYm94IGFyZWEsIGFuZCB2aWNlIHZlcnNhLlxuICAgIGNvbnN0IFthcGlVcmxTdGF0dXMsIHNldEFwaVVybFN0YXR1c10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHN0YXRlOiBcImlkbGVcIixcbiAgICB9KTtcbiAgICBjb25zdCBbc2V0dGluZ3NTdGF0dXMsIHNldFNldHRpbmdzU3RhdHVzXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgc3RhdGU6IFwiaWRsZVwiLFxuICAgIH0pO1xuICAgIC8vIEF1dG8tc2F2ZSBkZWJvdW5jZSDigJQgYSBzaW5nbGUgdGltZXIgaXMgZW5vdWdoIGJlY2F1c2Ugd2Ugb25seSBldmVyXG4gICAgLy8gbmVlZCB0byBmbHVzaCB0aGUgbGF0ZXN0IHNldHRpbmdzIG9iamVjdC4gVGhlIHBlbmRpbmcgY2hhbmdlcyByZWZcbiAgICAvLyBhY2N1bXVsYXRlcyB1cGRhdGVzIHRoYXQgYXJyaXZlIHdpdGhpbiB0aGUgZGVib3VuY2Ugd2luZG93LlxuICAgIGNvbnN0IHBlbmRpbmdTZXR0aW5nc1JlZiA9IHVzZVJlZih7fSk7XG4gICAgY29uc3QgZGVib3VuY2VUaW1lclJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBzYXZlZEZhZGVUaW1lclJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBhcGlTYXZlZEZhZGVUaW1lclJlZiA9IHVzZVJlZihudWxsKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkU2V0dGluZ3MoKTtcbiAgICAgICAgbG9hZExlYXJuZWRBbnN3ZXJzKCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGVib3VuY2VUaW1lclJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChkZWJvdW5jZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgaWYgKHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgaWYgKGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBbc2V0dGluZ3NEYXRhLCB1cmxdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIGdldFNldHRpbmdzKCksXG4gICAgICAgICAgICAgICAgZ2V0QXBpQmFzZVVybCgpLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBzZXRTZXR0aW5nc1N0YXRlKHNldHRpbmdzRGF0YSk7XG4gICAgICAgICAgICBzZXRBcGlVcmwodXJsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRTZXR0aW5nc1N0YXR1cyh7IHN0YXRlOiBcImVycm9yXCIsIGVycm9yOiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB9KTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRMZWFybmVkQW5zd2VycygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUX0FVVEhfU1RBVFVTXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2U/LmRhdGE/LmlzQXV0aGVudGljYXRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAvLyBGZXRjaCBsZWFybmVkIGFuc3dlcnMgdmlhIGJhY2tncm91bmQgc2NyaXB0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRfTEVBUk5FRF9BTlNXRVJTXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZXRMZWFybmVkQW5zd2VycyhyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBsb2FkIGxlYXJuZWQgYW5zd2VyczpcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVBbnN3ZXIoaWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkRFTEVURV9BTlNXRVJcIixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBpZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdD8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNldExlYXJuZWRBbnN3ZXJzKChwcmV2KSA9PiBwcmV2LmZpbHRlcigoYSkgPT4gYS5pZCAhPT0gaWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSBhbnN3ZXI6XCIsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBhIHNpbmdsZSBzZXR0aW5nIGxvY2FsbHkgYW5kIHNjaGVkdWxlcyBhIGRlYm91bmNlZCBmbHVzaC5cbiAgICAgKiBNdWx0aXBsZSByYXBpZCBjaGFuZ2VzIChyYW5nZSBzbGlkZXIgZHJhZywgcmVwZWF0ZWQgY2hlY2tib3ggY2xpY2tzKVxuICAgICAqIGNvYWxlc2NlIGludG8gYSBzaW5nbGUgdXBkYXRlU2V0dGluZ3MgY2FsbCBhZnRlciBBVVRPX1NBVkVfREVCT1VOQ0VfTVNcbiAgICAgKiBvZiBxdWlldC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYW5kbGVTZXR0aW5nQ2hhbmdlKGtleSwgdmFsdWUpIHtcbiAgICAgICAgc2V0U2V0dGluZ3NTdGF0ZSgocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHZhbHVlIH0pKTtcbiAgICAgICAgcGVuZGluZ1NldHRpbmdzUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgICAuLi5wZW5kaW5nU2V0dGluZ3NSZWYuY3VycmVudCxcbiAgICAgICAgICAgIFtrZXldOiB2YWx1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGRlYm91bmNlVGltZXJSZWYuY3VycmVudClcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChkZWJvdW5jZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICBpZiAoc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGVib3VuY2VUaW1lclJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBmbHVzaFNldHRpbmdzKCk7XG4gICAgICAgIH0sIEFVVE9fU0FWRV9ERUJPVU5DRV9NUyk7XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGZsdXNoU2V0dGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmcgPSBwZW5kaW5nU2V0dGluZ3NSZWYuY3VycmVudDtcbiAgICAgICAgcGVuZGluZ1NldHRpbmdzUmVmLmN1cnJlbnQgPSB7fTtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHBlbmRpbmcpLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0U2V0dGluZ3NTdGF0dXMoeyBzdGF0ZTogXCJzYXZpbmdcIiB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVNldHRpbmdzKHBlbmRpbmcpO1xuICAgICAgICAgICAgc2V0U2V0dGluZ3NTdGF0dXMoeyBzdGF0ZTogXCJzYXZlZFwiIH0pO1xuICAgICAgICAgICAgc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFNldHRpbmdzU3RhdHVzKHsgc3RhdGU6IFwiaWRsZVwiIH0pO1xuICAgICAgICAgICAgICAgIHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgfSwgU0FWRURfTElOR0VSX01TKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRTZXR0aW5nc1N0YXR1cyh7IHN0YXRlOiBcImVycm9yXCIsIGVycm9yOiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVBcGlVcmxDaGFuZ2UoKSB7XG4gICAgICAgIHNldEFwaVVybFN0YXR1cyh7IHN0YXRlOiBcInNhdmluZ1wiIH0pO1xuICAgICAgICBpZiAoYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHNldEFwaUJhc2VVcmwoYXBpVXJsKTtcbiAgICAgICAgICAgIHNldEFwaVVybFN0YXR1cyh7IHN0YXRlOiBcInNhdmVkXCIgfSk7XG4gICAgICAgICAgICBhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0QXBpVXJsU3RhdHVzKHsgc3RhdGU6IFwiaWRsZVwiIH0pO1xuICAgICAgICAgICAgICAgIGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgfSwgU0FWRURfTElOR0VSX01TKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRBcGlVcmxTdGF0dXMoeyBzdGF0ZTogXCJlcnJvclwiLCBlcnJvcjogbWVzc2FnZUZvckVycm9yKGVycikgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm9wdGlvbnMtY29udGFpbmVyXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImxvYWRpbmdcIiwgY2hpbGRyZW46IFwiTG9hZGluZyBzZXR0aW5ncy4uLlwiIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJvcHRpb25zLWNvbnRhaW5lclwiLCBjaGlsZHJlbjogW19qc3hzKFwiaGVhZGVyXCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaW1nXCIsIHsgY2xhc3NOYW1lOiBcImhlYWRlci1tYXJrXCIsIHNyYzogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiYnJhbmQvc2xvdGhpbmctbWFyay5wbmdcIiksIGFsdDogXCJcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaGVhZGVyLXRleHRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjaGlsZHJlbjogXCJTbG90aGluZyBTZXR0aW5nc1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJzdWJ0aXRsZVwiLCBjaGlsZHJlbjogXCJDb25uZWN0aW9uLCBhdXRvZmlsbCwgbGVhcm5pbmcsIGFuZCB0cmFja2luZ1wiIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIGNvbm5lY3Rpb24tY2FyZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkNvbm5lY3Rpb25cIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiU2xvdGhpbmcgQVBJIFVSTFwiIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJUaGUgVVJMIHdoZXJlIHlvdXIgU2xvdGhpbmcgYXBwIGlzIHJ1bm5pbmdcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImlucHV0LWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJ1cmxcIiwgdmFsdWU6IGFwaVVybCwgb25DaGFuZ2U6IChlKSA9PiBzZXRBcGlVcmwoZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogREVGQVVMVF9BUElfQkFTRV9VUkwgfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBoYW5kbGVBcGlVcmxDaGFuZ2UsIGRpc2FibGVkOiBhcGlVcmxTdGF0dXMuc3RhdGUgPT09IFwic2F2aW5nXCIsIGNoaWxkcmVuOiBhcGlVcmxTdGF0dXMuc3RhdGUgPT09IFwic2F2aW5nXCIgPyBcIlNhdmluZ+KAplwiIDogXCJTYXZlXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogYXBpVXJsU3RhdHVzIH0pXSB9KV0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCBhdXRvZmlsbC1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2VjdGlvbi1oZWFkXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2hpbGRyZW46IFwiQXV0by1GaWxsXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3MuYXV0b0ZpbGxFbmFibGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJhdXRvRmlsbEVuYWJsZWRcIiwgZS50YXJnZXQuY2hlY2tlZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiRW5hYmxlIGF1dG8tZmlsbFwiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiQXV0b21hdGljYWxseSBkZXRlY3QgZm9ybSBmaWVsZHMgb24gam9iIGFwcGxpY2F0aW9uIHBhZ2VzXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3Muc2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJzaG93Q29uZmlkZW5jZUluZGljYXRvcnNcIiwgZS50YXJnZXQuY2hlY2tlZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiU2hvdyBjb25maWRlbmNlIGluZGljYXRvcnNcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIkRpc3BsYXkgY29uZmlkZW5jZSBsZXZlbHMgZm9yIGRldGVjdGVkIGZpZWxkc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTWluaW11bSBjb25maWRlbmNlIHRocmVzaG9sZFwiIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJPbmx5IGZpbGwgZmllbGRzIHdpdGggY29uZmlkZW5jZSBhYm92ZSB0aGlzIGxldmVsXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyYW5nZS1ncm91cFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwicmFuZ2VcIiwgbWluOiBcIjBcIiwgbWF4OiBcIjFcIiwgc3RlcDogXCIwLjFcIiwgdmFsdWU6IHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJtaW5pbXVtQ29uZmlkZW5jZVwiLCBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKSkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbTWF0aC5yb3VuZChzZXR0aW5ncy5taW5pbXVtQ29uZmlkZW5jZSAqIDEwMCksIFwiJVwiXSB9KV0gfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgY29tcGFjdC1jYXJkIGxlYXJuaW5nLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJMZWFybmluZ1wiIH0pLCBfanN4KFNhdmVTdGF0dXNCYWRnZSwgeyBzdGF0dXM6IHNldHRpbmdzU3RhdHVzIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiY2hlY2tib3gtbGFiZWxcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNldHRpbmdzLmxlYXJuRnJvbUFuc3dlcnMsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcImxlYXJuRnJvbUFuc3dlcnNcIiwgZS50YXJnZXQuY2hlY2tlZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTGVhcm4gZnJvbSBteSBhbnN3ZXJzXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJTYXZlIGFuc3dlcnMgdG8gY3VzdG9tIHF1ZXN0aW9ucyBmb3IgZnV0dXJlIHN1Z2dlc3Rpb25zXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgdHJhY2tpbmctY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24taGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIlRyYWNraW5nXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3MuYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwiYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJUcmFjayBzdWJtaXR0ZWQgYXBwbGljYXRpb25zXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJDcmVhdGUgYW4gYXBwbGllZCBvcHBvcnR1bml0eSB3aGVuIGFuIGF1dG9maWxsZWQgYXBwbGljYXRpb24gZm9ybSBpcyBzdWJtaXR0ZWRcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5jYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWQsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcImNhcHR1cmVTY3JlZW5zaG90RW5hYmxlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJDYXB0dXJlIHNjcmVlbnNob3Qgd2hlbiB0cmFja2luZ1wiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiT2ZmIGJ5IGRlZmF1bHQ7IGZvcm0gdmFsdWVzIGFyZSBuZXZlciBjYXB0dXJlZFwiIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIGNvbXBhY3QtY2FyZCBub3RpZmljYXRpb25zLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJOb3RpZmljYXRpb25zXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3Mubm90aWZ5T25Kb2JEZXRlY3RlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwibm90aWZ5T25Kb2JEZXRlY3RlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTaG93IGJhZGdlIHdoZW4gam9iIGRldGVjdGVkXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJEaXNwbGF5IGEgYmFkZ2Ugb24gdGhlIGV4dGVuc2lvbiBpY29uIHdoZW4gYSBqb2IgbGlzdGluZyBpcyBmb3VuZFwiIH0pXSB9KV0gfSksIGxlYXJuZWRBbnN3ZXJzLmxlbmd0aCA+IDAgJiYgKF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIHNhdmVkLWFuc3dlcnMtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDJcIiwgeyBjaGlsZHJlbjogW1wiU2F2ZWQgQW5zd2VycyAoXCIsIGxlYXJuZWRBbnN3ZXJzLmxlbmd0aCwgXCIpXCJdIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuc3dlcnMtbGlzdFwiLCBjaGlsZHJlbjogbGVhcm5lZEFuc3dlcnMubWFwKChhbnN3ZXIpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhbnN3ZXItaXRlbVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2VyLXF1ZXN0aW9uXCIsIGNoaWxkcmVuOiBhbnN3ZXIucXVlc3Rpb24gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2VyLXRleHRcIiwgY2hpbGRyZW46IGFuc3dlci5hbnN3ZXIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuc3dlci1tZXRhXCIsIGNoaWxkcmVuOiBbYW5zd2VyLnNvdXJjZUNvbXBhbnkgJiYgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogYW5zd2VyLnNvdXJjZUNvbXBhbnkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJVc2VkIFwiLCBhbnN3ZXIudGltZXNVc2VkLCBcInhcIl0gfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiZGVsZXRlLWJ0blwiLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVEZWxldGVBbnN3ZXIoYW5zd2VyLmlkKSwgY2hpbGRyZW46IFwiRGVsZXRlXCIgfSldIH0pXSB9LCBhbnN3ZXIuaWQpKSkgfSldIH0pKSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgYWJvdXQtY2FyZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkFib3V0XCIgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJhYm91dFwiLCBjaGlsZHJlbjogW1wiU2xvdGhpbmcgQnJvd3NlciBFeHRlbnNpb24gdlwiLCBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb25dIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJhYm91dFwiLCBjaGlsZHJlbjogX2pzeChcImFcIiwgeyBocmVmOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9BTm9uQUJlbnRvL3Nsb3RoaW5nXCIsIHRhcmdldDogXCJfYmxhbmtcIiwgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiwgY2hpbGRyZW46IFwiVmlldyBvbiBHaXRIdWJcIiB9KSB9KV0gfSldIH0pKTtcbn1cbmZ1bmN0aW9uIFNhdmVTdGF0dXNCYWRnZSh7IHN0YXR1cyB9KSB7XG4gICAgaWYgKHN0YXR1cy5zdGF0ZSA9PT0gXCJpZGxlXCIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGxhYmVsID0gbGFiZWxGb3JTdGF0dXMoc3RhdHVzKTtcbiAgICByZXR1cm4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBgc2F2ZS1zdGF0dXMgc2F2ZS1zdGF0dXMtJHtzdGF0dXMuc3RhdGV9YCwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGxhYmVsIH0pKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCBPcHRpb25zQXBwIGZyb20gXCIuL0FwcFwiO1xuaW1wb3J0IFwiLi9zdHlsZXMuY3NzXCI7XG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIik7XG5pZiAoY29udGFpbmVyKSB7XG4gICAgY29uc3Qgcm9vdCA9IGNyZWF0ZVJvb3QoY29udGFpbmVyKTtcbiAgICByb290LnJlbmRlcihfanN4KFJlYWN0LlN0cmljdE1vZGUsIHsgY2hpbGRyZW46IF9qc3goT3B0aW9uc0FwcCwge30pIH0pKTtcbn1cbiIsIi8qKlxuICogVXNlci1mYWNpbmcgZXJyb3Igc3RyaW5nIG1hcHBpbmcgZm9yIHRoZSBTbG90aGluZyBleHRlbnNpb24uXG4gKlxuICogVGhlIHBvcHVwIChhbmQgYW55IG90aGVyIGV4dGVuc2lvbiBzdXJmYWNlKSBzaG91bGQgbmV2ZXIgc2hvdyByYXdcbiAqIGBcIlJlcXVlc3QgZmFpbGVkOiA1MDNcImAgLyBgXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCJgIHN0cmluZ3MuIFdyYXAgYW55XG4gKiBlcnJvciBwYXRoIGluIGBtZXNzYWdlRm9yRXJyb3IoZXJyKWAgdG8gZ2V0IGFuIEVuZ2xpc2ggc2VudGVuY2Ugc2FmZVxuICogZm9yIGVuZC11c2Vycy5cbiAqXG4gKiBNaXJyb3Igb2YgdGhlIG1lc3NhZ2UgdG9uZSB1c2VkIGJ5IGBhcHBzL3dlYi8uLi4vZXh0ZW5zaW9uL2Nvbm5lY3QvcGFnZS50c3hgXG4gKiBgbWVzc2FnZUZvclN0YXR1c2Ag4oCUIHRoZSBjb25uZWN0IHBhZ2Uga2VlcHMgaXRzIG93biBjb3B5IGJlY2F1c2UgaXQgc2l0c1xuICogaW5zaWRlIHRoZSBuZXh0LWludGwgdHJlZSAoZGlmZmVyZW50IHBhY2thZ2UgYm91bmRhcnkpLCBidXQgdGhlXG4gKiB1c2VyLXZpc2libGUgc3RyaW5ncyBzaG91bGQgc3RheSBhbGlnbmVkLiBJZiB5b3UgY2hhbmdlIG9uZSwgY2hhbmdlIGJvdGguXG4gKlxuICogRW5nbGlzaC1vbmx5IGJ5IGRlc2lnbjogdGhlIGV4dGVuc2lvbiBpdHNlbGYgZG9lcyBub3QgdXNlIG5leHQtaW50bC5cbiAqL1xuLyoqXG4gKiBNYXBzIGFuIEhUVFAgc3RhdHVzIGNvZGUgdG8gYSBodW1hbi1mcmllbmRseSBtZXNzYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZUZvclN0YXR1cyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSA0MDEgfHwgc3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgcmV0dXJuIFwiU2lnbiBpbiBleHBpcmVkLiBSZWNvbm5lY3QgdGhlIGV4dGVuc2lvbi5cIjtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgIHJldHVybiBcIldlJ3JlIHJhdGUtbGltaXRlZC4gVHJ5IGFnYWluIGluIGEgbWludXRlLlwiO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID49IDUwMCkge1xuICAgICAgICByZXR1cm4gXCJTbG90aGluZyBzZXJ2ZXJzIGFyZSBoYXZpbmcgYSBwcm9ibGVtLlwiO1xuICAgIH1cbiAgICByZXR1cm4gXCJTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXRyeUV4aGF1c3RlZE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIFwiU2xvdGhpbmcgaXMgc3RpbGwgbm90IHJlc3BvbmRpbmcgYWZ0ZXIgcmV0cnlpbmcuIFRyeSBhZ2FpbiBpbiBhIG1pbnV0ZS5cIjtcbn1cbi8qKlxuICogQmVzdC1lZmZvcnQgbWFwcGluZyBvZiBhbiB1bmtub3duIHRocm93biB2YWx1ZSB0byBhIGh1bWFuLWZyaWVuZGx5XG4gKiBtZXNzYWdlLiBSZWNvZ25pc2VzIHRoZSBzcGVjaWZpYyBwaHJhc2VzIHRoZSBhcGktY2xpZW50IHRocm93cyB0b2RheVxuICogKGBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcImAsIGBcIk5vdCBhdXRoZW50aWNhdGVkXCJgLCBgXCJSZXF1ZXN0IGZhaWxlZDogPGNvZGU+XCJgLFxuICogYFwiRmFpbGVkIHRvIGZldGNoXCJgKSBhbmQgZmFsbHMgYmFjayB0byB0aGUgb3JpZ2luYWwgbWVzc2FnZSBmb3IgYW55dGhpbmdcbiAqIGVsc2Ug4oCUIHRoYXQncyBhbG1vc3QgYWx3YXlzIG1vcmUgdXNlZnVsIHRoYW4gYSBnZW5lcmljIGNhdGNoLWFsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VGb3JFcnJvcihlcnIpIHtcbiAgICAvLyBHZW5lcmljIG5ldHdvcmsgZmFpbHVyZSAoZmV0Y2ggaW4gc2VydmljZSB3b3JrZXJzIHRocm93cyBUeXBlRXJyb3IgaGVyZSlcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgVHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBcIk5ldHdvcmsgZXJyb3IuIENoZWNrIHlvdXIgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluLlwiO1xuICAgIH1cbiAgICBjb25zdCByYXcgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJcIjtcbiAgICBpZiAoIXJhdylcbiAgICAgICAgcmV0dXJuIFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG4gICAgLy8gQXV0aC1zaGFwZWQgbWVzc2FnZXMgZnJvbSBTbG90aGluZ0FQSUNsaWVudC5cbiAgICBpZiAocmF3ID09PSBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcIiB8fFxuICAgICAgICByYXcgPT09IFwiTm90IGF1dGhlbnRpY2F0ZWRcIiB8fFxuICAgICAgICAvdW5hdXRob3IvaS50ZXN0KHJhdykpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JTdGF0dXMoNDAxKTtcbiAgICB9XG4gICAgLy8gYFJlcXVlc3QgZmFpbGVkOiA1MDNgIOKAlCByZWNvdmVyIHRoZSBzdGF0dXMgY29kZS5cbiAgICBjb25zdCBtYXRjaCA9IHJhdy5tYXRjaCgvUmVxdWVzdCBmYWlsZWQ6XFxzKihcXGR7M30pLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBOdW1iZXIobWF0Y2hbMV0pO1xuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGNvZGUpKVxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JTdGF0dXMoY29kZSk7XG4gICAgfVxuICAgIGNvbnN0IHJldHJ5TWF0Y2ggPSByYXcubWF0Y2goL1JlcXVlc3Qgc3RpbGwgZmFpbGluZyBhZnRlciByZXRyeTpcXHMqKFxcZHszfSkvKTtcbiAgICBpZiAocmV0cnlNYXRjaCkge1xuICAgICAgICByZXR1cm4gcmV0cnlFeGhhdXN0ZWRNZXNzYWdlKCk7XG4gICAgfVxuICAgIC8vIEJyb3dzZXIgZmV0Y2ggZmFpbHVyZXMgYnViYmxlIHVwIGFzIFwiRmFpbGVkIHRvIGZldGNoXCIuXG4gICAgaWYgKC9mYWlsZWQgdG8gZmV0Y2gvaS50ZXN0KHJhdykgfHwgL25ldHdvcmsvaS50ZXN0KHJhdykpIHtcbiAgICAgICAgcmV0dXJuIFwiTmV0d29yayBlcnJvci4gQ2hlY2sgeW91ciBjb25uZWN0aW9uIGFuZCB0cnkgYWdhaW4uXCI7XG4gICAgfVxuICAgIC8vIEZvciBhbnl0aGluZyBlbHNlLCB0aGUgdW5kZXJseWluZyBtZXNzYWdlIGlzIHVzdWFsbHkgYSBzZW50ZW5jZSBhbHJlYWR5XG4gICAgLy8gKGUuZy4gXCJDb3VsZG4ndCByZWFkIHRoZSBmdWxsIGpvYiBkZXNjcmlwdGlvbiBmcm9tIHRoaXMgcGFnZS5cIikuXG4gICAgcmV0dXJuIHJhdztcbn1cbiIsIi8qKlxuICogUDQvIzQwIOKAlCBMb25nLWxpdmVkIHBvcnQgbmFtZSB1c2VkIGJ5IHRoZSBpbmxpbmUgQUkgYXNzaXN0YW50LiBUaGUgY29udGVudFxuICogc2NyaXB0IGNhbGxzIGBjaHJvbWUucnVudGltZS5jb25uZWN0KHsgbmFtZTogQ0hBVF9QT1JUX05BTUUgfSlgIGFuZCB0aGVcbiAqIGJhY2tncm91bmQncyBgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0YCBsaXN0ZW5lciBmaWx0ZXJzIGJ5IHRoaXMgbmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IENIQVRfUE9SVF9OQU1FID0gXCJzbG90aGluZy1jaGF0LXN0cmVhbVwiO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XG4gICAgYXV0b0ZpbGxFbmFibGVkOiB0cnVlLFxuICAgIHNob3dDb25maWRlbmNlSW5kaWNhdG9yczogdHJ1ZSxcbiAgICBtaW5pbXVtQ29uZmlkZW5jZTogMC41LFxuICAgIGxlYXJuRnJvbUFuc3dlcnM6IHRydWUsXG4gICAgbm90aWZ5T25Kb2JEZXRlY3RlZDogdHJ1ZSxcbiAgICBhdXRvVHJhY2tBcHBsaWNhdGlvbnNFbmFibGVkOiB0cnVlLFxuICAgIGNhcHR1cmVTY3JlZW5zaG90RW5hYmxlZDogZmFsc2UsXG59O1xuZXhwb3J0IGNvbnN0IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVBJX0JBU0VfVVJMID0gcHJvY2Vzcy5lbnYuU0xPVEhJTkdfRVhURU5TSU9OX0FQSV9CQVNFX1VSTCB8fCBcImh0dHBzOi8vc2xvdGhpbmcud29ya1wiO1xuZXhwb3J0IGNvbnN0IFNIT1VMRF9QUk9NT1RFX0xFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgPSBERUZBVUxUX0FQSV9CQVNFX1VSTCAhPT0gTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==