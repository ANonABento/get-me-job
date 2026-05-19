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
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l;exports.jsx=q;exports.jsxs=q;


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
    return ((0,jsx_runtime.jsxs)("div", { className: "options-container", children: [(0,jsx_runtime.jsxs)("header", { children: [(0,jsx_runtime.jsx)("img", { className: "header-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), (0,jsx_runtime.jsxs)("div", { className: "header-text", children: [(0,jsx_runtime.jsx)("h1", { children: "Slothing Settings" }), (0,jsx_runtime.jsx)("p", { className: "subtitle", children: "Connection, autofill, learning, and tracking" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card connection-card", children: [(0,jsx_runtime.jsx)("h2", { children: "Connection" }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { children: [(0,jsx_runtime.jsx)("span", { children: "Slothing API URL" }), (0,jsx_runtime.jsx)("small", { children: "The URL where your Slothing app is running" })] }), (0,jsx_runtime.jsxs)("div", { className: "input-group", children: [(0,jsx_runtime.jsx)("input", { type: "url", value: apiUrl, onChange: (e) => setApiUrl(e.target.value), placeholder: types/* DEFAULT_API_BASE_URL */.Ri }), (0,jsx_runtime.jsx)("button", { onClick: handleApiUrlChange, disabled: apiUrlStatus.state === "saving", children: apiUrlStatus.state === "saving" ? "Saving…" : "Save" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: apiUrlStatus })] })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card autofill-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Auto-Fill" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.autoFillEnabled, onChange: (e) => handleSettingChange("autoFillEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Enable auto-fill" })] }), (0,jsx_runtime.jsx)("small", { children: "Automatically detect form fields on job application pages" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.showConfidenceIndicators, onChange: (e) => handleSettingChange("showConfidenceIndicators", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Show confidence indicators" })] }), (0,jsx_runtime.jsx)("small", { children: "Display confidence levels for detected fields" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { children: [(0,jsx_runtime.jsx)("span", { children: "Minimum confidence threshold" }), (0,jsx_runtime.jsx)("small", { children: "Only fill fields with confidence above this level" })] }), (0,jsx_runtime.jsxs)("div", { className: "range-group", children: [(0,jsx_runtime.jsx)("input", { type: "range", min: "0", max: "1", step: "0.1", value: settings.minimumConfidence, onChange: (e) => handleSettingChange("minimumConfidence", parseFloat(e.target.value)) }), (0,jsx_runtime.jsxs)("span", { children: [Math.round(settings.minimumConfidence * 100), "%"] })] })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card compact-card learning-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Learning" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.learnFromAnswers, onChange: (e) => handleSettingChange("learnFromAnswers", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Learn from my answers" })] }), (0,jsx_runtime.jsx)("small", { children: "Save answers to custom questions for future suggestions" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card tracking-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Tracking" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.autoTrackApplicationsEnabled, onChange: (e) => handleSettingChange("autoTrackApplicationsEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Track submitted applications" })] }), (0,jsx_runtime.jsx)("small", { children: "Create an applied opportunity when an autofilled application form is submitted" })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.captureScreenshotEnabled, onChange: (e) => handleSettingChange("captureScreenshotEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Capture screenshot when tracking" })] }), (0,jsx_runtime.jsx)("small", { children: "Off by default; form values are never captured" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card scrape-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Bulk scrape" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsx)("small", { children: "Controls the bulk scrape on WaterlooWorks (and other bulk sources). Throttle is how long we wait between row clicks; chunk size is how many scraped jobs we import per HTTP request." }), (0,jsx_runtime.jsxs)("div", { className: "setting-row", children: [(0,jsx_runtime.jsxs)("label", { className: "number-input", children: [(0,jsx_runtime.jsx)("span", { children: "Row throttle (ms)" }), (0,jsx_runtime.jsx)("input", { type: "number", min: 100, max: 5000, value: settings.scrapeThrottleMs, onChange: (e) => {
                                            const next = Number.parseInt(e.target.value, 10);
                                            if (Number.isFinite(next)) {
                                                handleSettingChange("scrapeThrottleMs", Math.max(100, Math.min(5000, next)));
                                            }
                                        } })] }), (0,jsx_runtime.jsxs)("label", { className: "number-input", children: [(0,jsx_runtime.jsx)("span", { children: "Import chunk size" }), (0,jsx_runtime.jsx)("input", { type: "number", min: 1, max: 50, value: settings.scrapeChunkSize, onChange: (e) => {
                                            const next = Number.parseInt(e.target.value, 10);
                                            if (Number.isFinite(next)) {
                                                handleSettingChange("scrapeChunkSize", Math.max(1, Math.min(50, next)));
                                            }
                                        } })] })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-row", children: [(0,jsx_runtime.jsxs)("label", { className: "number-input", children: [(0,jsx_runtime.jsx)("span", { children: "Max jobs / scrape" }), (0,jsx_runtime.jsx)("input", { type: "number", min: 1, max: 1000, value: settings.scrapeMaxJobs, onChange: (e) => {
                                            const next = Number.parseInt(e.target.value, 10);
                                            if (Number.isFinite(next)) {
                                                handleSettingChange("scrapeMaxJobs", Math.max(1, Math.min(1000, next)));
                                            }
                                        } })] }), (0,jsx_runtime.jsxs)("label", { className: "number-input", children: [(0,jsx_runtime.jsx)("span", { children: "Max pages / scrape" }), (0,jsx_runtime.jsx)("input", { type: "number", min: 1, max: 200, value: settings.scrapeMaxPages, onChange: (e) => {
                                            const next = Number.parseInt(e.target.value, 10);
                                            if (Number.isFinite(next)) {
                                                handleSettingChange("scrapeMaxPages", Math.max(1, Math.min(200, next)));
                                            }
                                        } })] })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.scrapeDedupeEnabled, onChange: (e) => handleSettingChange("scrapeDedupeEnabled", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Skip postings already imported" })] }), (0,jsx_runtime.jsx)("small", { children: "Asks the API for your imported posting IDs before scraping; skips matching rows without opening their modal." })] })] }), (0,jsx_runtime.jsxs)("section", { className: "settings-card compact-card notifications-card", children: [(0,jsx_runtime.jsxs)("div", { className: "section-head", children: [(0,jsx_runtime.jsx)("h2", { children: "Notifications" }), (0,jsx_runtime.jsx)(SaveStatusBadge, { status: settingsStatus })] }), (0,jsx_runtime.jsxs)("div", { className: "setting-group", children: [(0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [(0,jsx_runtime.jsx)("input", { type: "checkbox", checked: settings.notifyOnJobDetected, onChange: (e) => handleSettingChange("notifyOnJobDetected", e.target.checked) }), (0,jsx_runtime.jsx)("span", { children: "Show badge when job detected" })] }), (0,jsx_runtime.jsx)("small", { children: "Display a badge on the extension icon when a job listing is found" })] })] }), learnedAnswers.length > 0 && ((0,jsx_runtime.jsxs)("section", { className: "settings-card saved-answers-card", children: [(0,jsx_runtime.jsxs)("h2", { children: ["Saved Answers (", learnedAnswers.length, ")"] }), (0,jsx_runtime.jsx)("div", { className: "answers-list", children: learnedAnswers.map((answer) => ((0,jsx_runtime.jsxs)("div", { className: "answer-item", children: [(0,jsx_runtime.jsx)("div", { className: "answer-question", children: answer.question }), (0,jsx_runtime.jsx)("div", { className: "answer-text", children: answer.answer }), (0,jsx_runtime.jsxs)("div", { className: "answer-meta", children: [answer.sourceCompany && (0,jsx_runtime.jsx)("span", { children: answer.sourceCompany }), (0,jsx_runtime.jsxs)("span", { children: ["Used ", answer.timesUsed, "x"] }), (0,jsx_runtime.jsx)("button", { className: "delete-btn", onClick: () => handleDeleteAnswer(answer.id), children: "Delete" })] })] }, answer.id))) })] })), (0,jsx_runtime.jsxs)("section", { className: "settings-card about-card", children: [(0,jsx_runtime.jsx)("h2", { children: "About" }), (0,jsx_runtime.jsxs)("p", { className: "about", children: ["Slothing Browser Extension v", chrome.runtime.getManifest().version] }), (0,jsx_runtime.jsx)("p", { className: "about", children: (0,jsx_runtime.jsx)("a", { href: "https://github.com/ANonABento/slothing", target: "_blank", rel: "noopener noreferrer", children: "View on GitHub" }) })] })] }));
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
    scrapeThrottleMs: 500,
    scrapeChunkSize: 5,
    scrapeMaxJobs: 200,
    scrapeMaxPages: 50,
    scrapeDedupeEnabled: true,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQWE7O0FBRWIsUUFBUSxtQkFBTyxDQUFDLEdBQVc7QUFDM0IsSUFBSSxJQUFxQztBQUN6QyxFQUFFLFNBQWtCO0FBQ3BCLEVBQUUseUJBQW1CO0FBQ3JCLEVBQUUsS0FBSztBQUFBLFVBa0JOOzs7Ozs7OztBQ3hCRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDYSxNQUFNLG1CQUFPLENBQUMsR0FBTyw2S0FBNks7QUFDL00sa0JBQWtCLFVBQVUsZUFBZSxxQkFBcUIsNkJBQTZCLDBCQUEwQiwwREFBMEQsNEVBQTRFLE9BQU8sd0RBQXdELGdCQUFnQixHQUFHLFdBQVcsR0FBRyxZQUFZOzs7Ozs7OztBQ1Y1Vjs7QUFFYixJQUFJLElBQXFDO0FBQ3pDLEVBQUUseUNBQXFFO0FBQ3ZFLEVBQUUsS0FBSztBQUFBLEVBRU47Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05EO0FBQzhJO0FBQzlJO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isc0RBQXdDO0FBQ3ZFLHVDQUF1Qyx1Q0FBeUI7QUFDaEU7QUFDQSxrQkFBa0Isa0NBQW9CO0FBQ3RDLHdDQUF3QyxrQ0FBb0I7QUFDNUQ7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLEdBQUcsOEJBQWdCLHVCQUF1QjtBQUN0RSxhQUFhO0FBQ2IsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQSxtQ0FBbUMsd0JBQXdCO0FBQzNELEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsYUFBYSxJQUFJO0FBQzVDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCx1QkFBdUIsMENBQTBDO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLCtCQUErQixtRUFBbUIsSUFBRTtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBLGlFQUFpRTtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCx1QkFBdUIsMkJBQTJCO0FBQ2xEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDZEQUFhLElBQUU7QUFDbEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0Esc0JBQXNCO0FBQ3RCLHVCQUF1QixtQkFBbUI7QUFDMUM7QUFDQTtBQUNBO0FBQ087QUFDUCx1QkFBdUIsaUJBQWlCO0FBQ3hDO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix3Q0FBd0M7QUFDL0Q7QUFDQTtBQUNPLDBCQUEwQix5REFBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isb0RBQW9EO0FBQzFFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQix5QkFBeUI7QUFDcEQsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFO0FBQ3JFO0FBQ0E7QUFDTztBQUNBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxhQUFhO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVCK0Q7QUFDWDtBQUNvQjtBQUMyQjtBQUN6QztBQUM4QjtBQUN6RTtBQUNmLHlDQUF5QyxrQkFBUSxDQUFDLDhCQUFnQjtBQUNsRSxnQ0FBZ0Msa0JBQVEsQ0FBQyxrQ0FBb0I7QUFDN0QsZ0RBQWdELGtCQUFRO0FBQ3hELGtDQUFrQyxrQkFBUTtBQUMxQztBQUNBO0FBQ0EsNENBQTRDLGtCQUFRO0FBQ3BEO0FBQ0EsS0FBSztBQUNMLGdEQUFnRCxrQkFBUTtBQUN4RDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZ0JBQU0sR0FBRztBQUN4Qyw2QkFBNkIsZ0JBQU07QUFDbkMsOEJBQThCLGdCQUFNO0FBQ3BDLGlDQUFpQyxnQkFBTTtBQUN2QyxJQUFJLG1CQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLE9BQU87QUFDWjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsV0FBVztBQUMzQixnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLHVCQUF1QiwwQ0FBZSxPQUFPO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyx1QkFBdUI7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxFQUFFLHFCQUFxQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsaUJBQWlCO0FBQzdDO0FBQ0Esa0JBQWtCLGNBQWM7QUFDaEMsZ0NBQWdDLGdCQUFnQjtBQUNoRDtBQUNBLG9DQUFvQyxlQUFlO0FBQ25EO0FBQ0EsYUFBYSxFQUFFLGVBQWU7QUFDOUI7QUFDQTtBQUNBLGdDQUFnQyx1QkFBdUIsMENBQWUsT0FBTztBQUM3RTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsaUJBQWlCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsYUFBYTtBQUMvQiw4QkFBOEIsZ0JBQWdCO0FBQzlDO0FBQ0Esa0NBQWtDLGVBQWU7QUFDakQ7QUFDQSxhQUFhLEVBQUUsZUFBZTtBQUM5QjtBQUNBO0FBQ0EsOEJBQThCLHVCQUF1QiwwQ0FBZSxPQUFPO0FBQzNFO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixtQkFBSSxVQUFVLDBDQUEwQyxtQkFBSSxVQUFVLHVEQUF1RCxHQUFHO0FBQ2hKO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLDJDQUEyQyxvQkFBSyxhQUFhLFdBQVcsbUJBQUksVUFBVSwwRkFBMEYsR0FBRyxvQkFBSyxVQUFVLHFDQUFxQyxtQkFBSSxTQUFTLCtCQUErQixHQUFHLG1CQUFJLFFBQVEsaUZBQWlGLElBQUksSUFBSSxHQUFHLG9CQUFLLGNBQWMsdURBQXVELG1CQUFJLFNBQVMsd0JBQXdCLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSxXQUFXLG1CQUFJLFdBQVcsOEJBQThCLEdBQUcsbUJBQUksWUFBWSx3REFBd0QsSUFBSSxHQUFHLG9CQUFLLFVBQVUscUNBQXFDLG1CQUFJLFlBQVkscUZBQXFGLGtDQUFvQixFQUFFLEdBQUcsbUJBQUksYUFBYSx3SUFBd0ksR0FBRyxtQkFBSSxvQkFBb0Isc0JBQXNCLElBQUksSUFBSSxJQUFJLEdBQUcsb0JBQUssY0FBYyxxREFBcUQsb0JBQUssVUFBVSxzQ0FBc0MsbUJBQUksU0FBUyx1QkFBdUIsR0FBRyxtQkFBSSxvQkFBb0Isd0JBQXdCLElBQUksR0FBRyxvQkFBSyxVQUFVLHVDQUF1QyxvQkFBSyxZQUFZLHdDQUF3QyxtQkFBSSxZQUFZLGdJQUFnSSxHQUFHLG1CQUFJLFdBQVcsOEJBQThCLElBQUksR0FBRyxtQkFBSSxZQUFZLHVFQUF1RSxJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSxrSkFBa0osR0FBRyxtQkFBSSxXQUFXLHdDQUF3QyxJQUFJLEdBQUcsbUJBQUksWUFBWSwyREFBMkQsSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksV0FBVyxtQkFBSSxXQUFXLDBDQUEwQyxHQUFHLG1CQUFJLFlBQVksK0RBQStELElBQUksR0FBRyxvQkFBSyxVQUFVLHFDQUFxQyxtQkFBSSxZQUFZLDBLQUEwSyxHQUFHLG9CQUFLLFdBQVcsK0RBQStELElBQUksSUFBSSxJQUFJLEdBQUcsb0JBQUssY0FBYyxrRUFBa0Usb0JBQUssVUFBVSxzQ0FBc0MsbUJBQUksU0FBUyxzQkFBc0IsR0FBRyxtQkFBSSxvQkFBb0Isd0JBQXdCLElBQUksR0FBRyxvQkFBSyxVQUFVLHVDQUF1QyxvQkFBSyxZQUFZLHdDQUF3QyxtQkFBSSxZQUFZLGtJQUFrSSxHQUFHLG1CQUFJLFdBQVcsbUNBQW1DLElBQUksR0FBRyxtQkFBSSxZQUFZLHFFQUFxRSxJQUFJLElBQUksR0FBRyxvQkFBSyxjQUFjLHFEQUFxRCxvQkFBSyxVQUFVLHNDQUFzQyxtQkFBSSxTQUFTLHNCQUFzQixHQUFHLG1CQUFJLG9CQUFvQix3QkFBd0IsSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksd0NBQXdDLG1CQUFJLFlBQVksMEpBQTBKLEdBQUcsbUJBQUksV0FBVywwQ0FBMEMsSUFBSSxHQUFHLG1CQUFJLFlBQVksNEZBQTRGLElBQUksR0FBRyxvQkFBSyxVQUFVLHVDQUF1QyxvQkFBSyxZQUFZLHdDQUF3QyxtQkFBSSxZQUFZLGtKQUFrSixHQUFHLG1CQUFJLFdBQVcsOENBQThDLElBQUksR0FBRyxtQkFBSSxZQUFZLDJCQUEyQixpQ0FBaUMsSUFBSSxJQUFJLEdBQUcsb0JBQUssY0FBYyxtREFBbUQsb0JBQUssVUFBVSxzQ0FBc0MsbUJBQUksU0FBUyx5QkFBeUIsR0FBRyxtQkFBSSxvQkFBb0Isd0JBQXdCLElBQUksR0FBRyxtQkFBSSxZQUFZLGdJQUFnSSxrRUFBa0UsR0FBRyxvQkFBSyxVQUFVLHFDQUFxQyxvQkFBSyxZQUFZLHNDQUFzQyxtQkFBSSxXQUFXLCtCQUErQixHQUFHLG1CQUFJLFlBQVk7QUFDcitKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLElBQUksR0FBRyxvQkFBSyxZQUFZLHNDQUFzQyxtQkFBSSxXQUFXLCtCQUErQixHQUFHLG1CQUFJLFlBQVk7QUFDMUs7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSxxQ0FBcUMsb0JBQUssWUFBWSxzQ0FBc0MsbUJBQUksV0FBVywrQkFBK0IsR0FBRyxtQkFBSSxZQUFZO0FBQ2xPO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLElBQUksR0FBRyxvQkFBSyxZQUFZLHNDQUFzQyxtQkFBSSxXQUFXLGdDQUFnQyxHQUFHLG1CQUFJLFlBQVk7QUFDM0s7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSx3SUFBd0ksR0FBRyxtQkFBSSxXQUFXLDRDQUE0QyxJQUFJLEdBQUcsbUJBQUksWUFBWSx1RUFBdUUsbURBQW1ELElBQUksSUFBSSxHQUFHLG9CQUFLLGNBQWMsdUVBQXVFLG9CQUFLLFVBQVUsc0NBQXNDLG1CQUFJLFNBQVMsMkJBQTJCLEdBQUcsbUJBQUksb0JBQW9CLHdCQUF3QixJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSx3SUFBd0ksR0FBRyxtQkFBSSxXQUFXLDBDQUEwQyxJQUFJLEdBQUcsbUJBQUksWUFBWSwrRUFBK0UsSUFBSSxJQUFJLGlDQUFpQyxvQkFBSyxjQUFjLDBEQUEwRCxvQkFBSyxTQUFTLDJEQUEyRCxHQUFHLG1CQUFJLFVBQVUscUVBQXFFLG9CQUFLLFVBQVUscUNBQXFDLG1CQUFJLFVBQVUseURBQXlELEdBQUcsbUJBQUksVUFBVSxtREFBbUQsR0FBRyxvQkFBSyxVQUFVLDZEQUE2RCxtQkFBSSxXQUFXLGdDQUFnQyxHQUFHLG9CQUFLLFdBQVcsNENBQTRDLEdBQUcsbUJBQUksYUFBYSwyRkFBMkYsSUFBSSxJQUFJLGdCQUFnQixJQUFJLElBQUksb0JBQUssY0FBYyxrREFBa0QsbUJBQUksU0FBUyxtQkFBbUIsR0FBRyxvQkFBSyxRQUFRLHNHQUFzRyxHQUFHLG1CQUFJLFFBQVEsOEJBQThCLG1CQUFJLFFBQVEsMEhBQTBILEdBQUcsSUFBSSxJQUFJO0FBQzEyRTtBQUNBLDJCQUEyQixRQUFRO0FBQ25DO0FBQ0E7QUFDQSxrQkFBa0IsY0FBYztBQUNoQyxZQUFZLG1CQUFJLFdBQVcsc0NBQXNDLGFBQWEsMkRBQTJEO0FBQ3pJOzs7QUMvS2dEO0FBQ3RCO0FBQ29CO0FBQ2Y7QUFDVDtBQUN0QjtBQUNBO0FBQ0EsaUJBQWlCLDRCQUFVO0FBQzNCLGdCQUFnQixtQkFBSSxDQUFDLGdCQUFnQixJQUFJLFVBQVUsbUJBQUksQ0FBQyxVQUFVLElBQUksR0FBRztBQUN6RTs7Ozs7Ozs7Ozs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsRUFBRTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkVBQTJFLEVBQUU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDeEVBO0FBQ0E7QUFDQSwwQ0FBMEMsc0JBQXNCO0FBQ2hFO0FBQ0E7QUFDTztBQUNBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNBLDZCQUE2Qix1QkFBMkMsSUFBSSxDQUF1QjtBQUNuRyIsInNvdXJjZXMiOlsid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0LWRvbUAxOC4zLjFfcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC1kb20vY2xpZW50LmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvcmVhY3QvY2pzL3JlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvcmVhY3QvanN4LXJ1bnRpbWUuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9vcHRpb25zL3NhdmUtc3RhdHVzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvb3B0aW9ucy9BcHAudHN4Iiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvb3B0aW9ucy9pbmRleC50c3giLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9zaGFyZWQvZXJyb3ItbWVzc2FnZXMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9zaGFyZWQvdHlwZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgZXhwb3J0cy5jcmVhdGVSb290ID0gbS5jcmVhdGVSb290O1xuICBleHBvcnRzLmh5ZHJhdGVSb290ID0gbS5oeWRyYXRlUm9vdDtcbn0gZWxzZSB7XG4gIHZhciBpID0gbS5fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRDtcbiAgZXhwb3J0cy5jcmVhdGVSb290ID0gZnVuY3Rpb24oYywgbykge1xuICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG0uY3JlYXRlUm9vdChjLCBvKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIGV4cG9ydHMuaHlkcmF0ZVJvb3QgPSBmdW5jdGlvbihjLCBoLCBvKSB7XG4gICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbS5oeWRyYXRlUm9vdChjLCBoLCBvKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG59XG4iLCIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiByZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7dmFyIGY9cmVxdWlyZShcInJlYWN0XCIpLGs9U3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIiksbD1TeW1ib2wuZm9yKFwicmVhY3QuZnJhZ21lbnRcIiksbT1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LG49Zi5fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRC5SZWFjdEN1cnJlbnRPd25lcixwPXtrZXk6ITAscmVmOiEwLF9fc2VsZjohMCxfX3NvdXJjZTohMH07XG5mdW5jdGlvbiBxKGMsYSxnKXt2YXIgYixkPXt9LGU9bnVsbCxoPW51bGw7dm9pZCAwIT09ZyYmKGU9XCJcIitnKTt2b2lkIDAhPT1hLmtleSYmKGU9XCJcIithLmtleSk7dm9pZCAwIT09YS5yZWYmJihoPWEucmVmKTtmb3IoYiBpbiBhKW0uY2FsbChhLGIpJiYhcC5oYXNPd25Qcm9wZXJ0eShiKSYmKGRbYl09YVtiXSk7aWYoYyYmYy5kZWZhdWx0UHJvcHMpZm9yKGIgaW4gYT1jLmRlZmF1bHRQcm9wcyxhKXZvaWQgMD09PWRbYl0mJihkW2JdPWFbYl0pO3JldHVybnskJHR5cGVvZjprLHR5cGU6YyxrZXk6ZSxyZWY6aCxwcm9wczpkLF9vd25lcjpuLmN1cnJlbnR9fWV4cG9ydHMuRnJhZ21lbnQ9bDtleHBvcnRzLmpzeD1xO2V4cG9ydHMuanN4cz1xO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCIvLyBFeHRlbnNpb24gc3RvcmFnZSB1dGlsaXRpZXNcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERFRkFVTFRfQVBJX0JBU0VfVVJMLCBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMLCBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMLCB9IGZyb20gXCJAL3NoYXJlZC90eXBlc1wiO1xuY29uc3QgU1RPUkFHRV9LRVkgPSBcInNsb3RoaW5nX2V4dGVuc2lvblwiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0W1NUT1JBR0VfS0VZXTtcbiAgICAgICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMICYmXG4gICAgICAgICAgICAgICAgc3RvcmVkPy5hcGlCYXNlVXJsID09PSBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMICYmXG4gICAgICAgICAgICAgICAgIXN0b3JlZC5hdXRoVG9rZW5cbiAgICAgICAgICAgICAgICA/IERFRkFVTFRfQVBJX0JBU0VfVVJMXG4gICAgICAgICAgICAgICAgOiBzdG9yZWQ/LmFwaUJhc2VVcmwgfHwgREVGQVVMVF9BUElfQkFTRV9VUkw7XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAuLi5zdG9yZWQsXG4gICAgICAgICAgICAgICAgYXBpQmFzZVVybCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogeyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi5zdG9yZWQ/LnNldHRpbmdzIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmFnZSh1cGRhdGVzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5jdXJyZW50LCAuLi51cGRhdGVzIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtTVE9SQUdFX0tFWV06IHVwZGF0ZWQgfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoU1RPUkFHRV9LRVksIHJlc29sdmUpO1xuICAgIH0pO1xufVxuLy8gQXV0aCB0b2tlbiBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXV0aFRva2VuKHRva2VuLCBleHBpcmVzQXQsIGFwaUJhc2VVcmwpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB0b2tlbixcbiAgICAgICAgdG9rZW5FeHBpcnk6IGV4cGlyZXNBdCxcbiAgICAgICAgLi4uKGFwaUJhc2VVcmwgPyB7IGFwaUJhc2VVcmwgfSA6IHt9KSxcbiAgICAgICAgbGFzdFNlZW5BdXRoQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbiAgICBhd2FpdCBzZXRTZXNzaW9uQXV0aENhY2hlKHRydWUpO1xufVxuLyoqXG4gKiBSZWNvcmRzIHRoYXQgd2UganVzdCBvYnNlcnZlZCBhIHdvcmtpbmcgYXV0aGVudGljYXRlZCBzdGF0ZS4gQ2FsbGVkIGJ5IHRoZVxuICogQVBJIGNsaWVudCBhZnRlciBhIHN1Y2Nlc3NmdWwgYGlzQXV0aGVudGljYXRlZCgpYCBjaGVjayBzbyB0aGUgcG9wdXAgY2FuXG4gKiBkaXN0aW5ndWlzaCBhIHJlYWwgbG9nb3V0IGZyb20gYSBzZXJ2aWNlLXdvcmtlciBzdGF0ZS1sb3NzIGV2ZW50LlxuICpcbiAqIERpc3RpbmN0IGZyb20gYHNldEF1dGhUb2tlbmAgYmVjYXVzZSB3ZSBkb24ndCBhbHdheXMgaGF2ZSBhIGZyZXNoIHRva2VuIHRvXG4gKiB3cml0ZSDigJQgc29tZXRpbWVzIHdlIGp1c3QgdmVyaWZpZWQgdGhlIGV4aXN0aW5nIG9uZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtBdXRoU2VlbigpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgbGFzdFNlZW5BdXRoQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KTtcbn1cbi8qKlxuICogXCJTZXNzaW9uIGxvc3RcIiB2aWV3IChwb3B1cCwgIzI3KSBzaG93cyB3aGVuIHdlIGhhdmUgbm8gYGF1dGhUb2tlbmAgYnV0XG4gKiBgbGFzdFNlZW5BdXRoQXRgIGlzIHdpdGhpbiB0aGlzIHdpbmRvdy4gQmV5b25kIHRoZSB3aW5kb3cgd2UgdHJlYXQgdGhlXG4gKiBleHRlbnNpb24gYXMgYSBmcmVzaCBpbnN0YWxsIC8gdHJ1ZSBsb2dvdXQgYW5kIHNob3cgdGhlIG5vcm1hbCBoZXJvLlxuICovXG5leHBvcnQgY29uc3QgU0VTU0lPTl9MT1NUX1dJTkRPV19NUyA9IDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIDI0aFxuLyoqXG4gKiBSZXR1cm5zIHRydWUgd2hlbiB0aGUgcG9wdXAgc2hvdWxkIHJlbmRlciB0aGUgXCJTZXNzaW9uIGxvc3Qg4oCUIHJlY29ubmVjdFwiXG4gKiBicmFuY2ggaW5zdGVhZCBvZiB0aGUgdW5hdXRoZW50aWNhdGVkIGhlcm8uIFNlZSAjMjcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Nlc3Npb25Mb3N0KHN0b3JhZ2UsIG5vdyA9IERhdGUubm93KCkpIHtcbiAgICBpZiAoc3RvcmFnZS5hdXRoVG9rZW4pXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIXN0b3JhZ2UubGFzdFNlZW5BdXRoQXQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsYXN0U2VlbiA9IG5ldyBEYXRlKHN0b3JhZ2UubGFzdFNlZW5BdXRoQXQpLmdldFRpbWUoKTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShsYXN0U2VlbikpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gbm93IC0gbGFzdFNlZW4gPD0gU0VTU0lPTl9MT1NUX1dJTkRPV19NUztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckF1dGhUb2tlbigpIHtcbiAgICAvLyBOT1RFOiB3ZSBpbnRlbnRpb25hbGx5IGRvIE5PVCBjbGVhciBgbGFzdFNlZW5BdXRoQXRgIGhlcmUuIEEgdHJ1ZSBsb2dvdXRcbiAgICAvLyBwYXRoIChoYW5kbGVMb2dvdXQpIGNhbGxzIGBmb3JnZXRBdXRoSGlzdG9yeWAgYWZ0ZXJ3YXJkczsgdGhpcyBoZWxwZXIgaXNcbiAgICAvLyBhbHNvIHVzZWQgd2hlbiBhIHRva2VuIHF1aWV0bHkgZXhwaXJlcyBvciBhIDQwMSB0cmlwcyB0aGUgYXBpLWNsaWVudCxcbiAgICAvLyBhbmQgaW4gdGhvc2UgY2FzZXMgdGhlIHNlc3Npb24tbG9zdCBVSSBpcyBleGFjdGx5IHdoYXQgd2Ugd2FudCB0byBzaG93LlxuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbi8qKlxuICogV2lwZXMgdGhlIFwid2UndmUgc2VlbiB5b3UgYmVmb3JlXCIgYnJlYWRjcnVtYiBzbyB0aGUgcG9wdXAgc2hvd3MgdGhlXG4gKiB1bmF1dGhlbnRpY2F0ZWQgaGVybyBvbiBuZXh0IG9wZW4uIENhbGwgdGhpcyBmcm9tIGV4cGxpY2l0LWxvZ291dCBmbG93cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcmdldEF1dGhIaXN0b3J5KCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBsYXN0U2VlbkF1dGhBdDogdW5kZWZpbmVkIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEF1dGhUb2tlbigpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5hdXRoVG9rZW4pXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vIENoZWNrIGV4cGlyeVxuICAgIGlmIChzdG9yYWdlLnRva2VuRXhwaXJ5KSB7XG4gICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKHN0b3JhZ2UudG9rZW5FeHBpcnkpO1xuICAgICAgICBpZiAoZXhwaXJ5IDwgbmV3IERhdGUoKSkge1xuICAgICAgICAgICAgYXdhaXQgY2xlYXJBdXRoVG9rZW4oKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdG9yYWdlLmF1dGhUb2tlbjtcbn1cbi8vIFByb2ZpbGUgY2FjaGUgaGVscGVyc1xuY29uc3QgUFJPRklMRV9DQUNIRV9UVEwgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDYWNoZWRQcm9maWxlKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yYWdlLmNhY2hlZFByb2ZpbGUgfHwgIXN0b3JhZ2UucHJvZmlsZUNhY2hlZEF0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRBdCA9IG5ldyBEYXRlKHN0b3JhZ2UucHJvZmlsZUNhY2hlZEF0KTtcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGNhY2hlZEF0LmdldFRpbWUoKSA+IFBST0ZJTEVfQ0FDSEVfVFRMKSB7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBDYWNoZSBleHBpcmVkXG4gICAgfVxuICAgIHJldHVybiBzdG9yYWdlLmNhY2hlZFByb2ZpbGU7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Q2FjaGVkUHJvZmlsZShwcm9maWxlKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHByb2ZpbGUsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQ2FjaGVkUHJvZmlsZSgpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbi8vIFNldHRpbmdzIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLnNldHRpbmdzO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVNldHRpbmdzKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLnN0b3JhZ2Uuc2V0dGluZ3MsIC4uLnVwZGF0ZXMgfTtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgc2V0dGluZ3M6IHVwZGF0ZWQgfSk7XG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG59XG4vLyBBUEkgVVJMIGhlbHBlclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEFwaUJhc2VVcmwodXJsKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IGFwaUJhc2VVcmw6IHVybCB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlCYXNlVXJsKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgcmV0dXJuIHN0b3JhZ2UuYXBpQmFzZVVybDtcbn1cbi8vIC0tLS0gU2Vzc2lvbi1zY29wZWQgYXV0aCBjYWNoZSAoIzMwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyBgY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbmAgaXMgaW4tbWVtb3J5IG9ubHkg4oCUIGl0IHN1cnZpdmVzIHN1c3BlbmRpbmcgdGhlXG4vLyBzZXJ2aWNlIHdvcmtlciBidXQgaXMgd2lwZWQgb24gYnJvd3NlciByZXN0YXJ0LCB3aGljaCBpcyBleGFjdGx5IHdoYXQgd2Vcbi8vIHdhbnQgZm9yIGEgc2hvcnQtbGl2ZWQgYXV0aCB2ZXJkaWN0IGNhY2hlLiBVc2luZyBzZXNzaW9uIChub3QgbG9jYWwpXG4vLyBhbHNvIG1lYW5zIHdlIG5ldmVyIHBlcnNpc3QgdGhlIHZlcmRpY3QgdG8gZGlzay5cbi8vXG4vLyBUaGUgY2FjaGUgc3RvcmVzIGB7IGF1dGhlbnRpY2F0ZWQ6IGJvb2xlYW4sIGF0OiBJU08gc3RyaW5nIH1gIHNvIHRoZVxuLy8gcG9wdXAgY2FuIHJldHVybiBhIHJlc3VsdCBpbiA8NTBtcyBvbiB0aGUgc2Vjb25kIG9wZW4gd2l0aGluIGEgbWludXRlLFxuLy8gd2hpbGUgdGhlIGJhY2tncm91bmQgc2NyaXB0IHJldmFsaWRhdGVzIGluIHRoZSBiYWNrZ3JvdW5kLlxuZXhwb3J0IGNvbnN0IEFVVEhfQ0FDSEVfVFRMX01TID0gNjAgKiAxMDAwO1xuY29uc3QgQVVUSF9DQUNIRV9LRVkgPSBcInNsb3RoaW5nX2F1dGhfY2FjaGVcIjtcbi8qKlxuICogUmVhZHMgdGhlIHNlc3Npb24tc2NvcGVkIGF1dGggdmVyZGljdCBjYWNoZS4gUmV0dXJucyBudWxsIHdoZW46XG4gKiAtIHRoZSBlbnRyeSBoYXMgbmV2ZXIgYmVlbiB3cml0dGVuLFxuICogLSB0aGUgZW50cnkgaXMgb2xkZXIgdGhhbiBBVVRIX0NBQ0hFX1RUTF9NUyxcbiAqIC0gdGhlIGVudHJ5J3MgdGltZXN0YW1wIGlzIHVucGFyc2VhYmxlLCBvclxuICogLSBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uIGlzIHVuYXZhaWxhYmxlIChlLmcuIG9sZGVyIGJyb3dzZXJzKS5cbiAqXG4gKiBPcHRpb25hbCBgbm93YCBwYXJhbWV0ZXIgZXhpc3RzIGZvciB0ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb25BdXRoQ2FjaGUobm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGNvbnN0IHNlc3Npb25TdG9yZSA9IGNocm9tZS5zdG9yYWdlPy5zZXNzaW9uO1xuICAgIGlmICghc2Vzc2lvblN0b3JlKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2Vzc2lvblN0b3JlLmdldChBVVRIX0NBQ0hFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSByZXN1bHQ/LltBVVRIX0NBQ0hFX0tFWV07XG4gICAgICAgICAgICBpZiAoIWVudHJ5IHx8IHR5cGVvZiBlbnRyeS5hdCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXQgPSBuZXcgRGF0ZShlbnRyeS5hdCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoYXQpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm93IC0gYXQgPiBBVVRIX0NBQ0hFX1RUTF9NUykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSh7IGF1dGhlbnRpY2F0ZWQ6ICEhZW50cnkuYXV0aGVudGljYXRlZCwgYXQ6IGVudHJ5LmF0IH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8qKlxuICogV3JpdGVzIGEgZnJlc2ggdmVyZGljdCB0byB0aGUgc2Vzc2lvbi1zY29wZWQgY2FjaGUuIE5vLW9wcyB3aGVuXG4gKiBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uIGlzIHVuYXZhaWxhYmxlIHNvIGNhbGxlcnMgZG9uJ3QgbmVlZCB0byBndWFyZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNlc3Npb25BdXRoQ2FjaGUoYXV0aGVudGljYXRlZCkge1xuICAgIGNvbnN0IHNlc3Npb25TdG9yZSA9IGNocm9tZS5zdG9yYWdlPy5zZXNzaW9uO1xuICAgIGlmICghc2Vzc2lvblN0b3JlKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQsXG4gICAgICAgIGF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2Vzc2lvblN0b3JlLnNldCh7IFtBVVRIX0NBQ0hFX0tFWV06IGVudHJ5IH0sICgpID0+IHJlc29sdmUoKSk7XG4gICAgfSk7XG59XG4vKipcbiAqIERyb3BzIHRoZSBjYWNoZWQgdmVyZGljdC4gQ2FsbCB0aGlzIG9uIGFueSA0MDEgc28gdGhlIG5leHQgcG9wdXAgb3BlblxuICogZG9lc24ndCB0cnVzdCBhIHN0YWxlIFwiYXV0aGVudGljYXRlZFwiIGFuc3dlci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbkF1dGhDYWNoZSgpIHtcbiAgICBjb25zdCBzZXNzaW9uU3RvcmUgPSBjaHJvbWUuc3RvcmFnZT8uc2Vzc2lvbjtcbiAgICBpZiAoIXNlc3Npb25TdG9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXNzaW9uU3RvcmUucmVtb3ZlKEFVVEhfQ0FDSEVfS0VZLCAoKSA9PiByZXNvbHZlKCkpO1xuICAgIH0pO1xufVxuIiwiLyoqXG4gKiBNaW5pbWFsIHNhdmUtc3RhdHVzIHN0YXRlIG1hY2hpbmUgZm9yIHRoZSBleHRlbnNpb24gb3B0aW9ucyBwYWdlLlxuICpcbiAqIE1pcnJvcnMgdGhlIHBhdHRlcm4gaW4gYXBwcy93ZWIvc3JjL2NvbXBvbmVudHMvc3R1ZGlvL3NhdmUtc3RhdHVzLnRzIGJ1dFxuICogcGFyZWQgZG93bjogdGhlIG9wdGlvbnMgc3VyZmFjZSBvbmx5IG5lZWRzIGlkbGUg4oaSIHNhdmluZyDihpIgc2F2ZWQg4oaSIGlkbGUsXG4gKiB3aXRoIGEgMnMgbGluZ2VyIG9uIFwic2F2ZWRcIiBhbmQgYSBzdGlja3kgXCJlcnJvclwiIHN0YXRlLlxuICpcbiAqIFB1cmUgaGVscGVycyAobm8gUmVhY3Qgc3RhdGUpIHNvIHRoZXkncmUgdHJpdmlhbGx5IHVuaXQtdGVzdGFibGU7IHRoZVxuICogcGFnZSBnbHVlcyB0aGVtIHRvZ2V0aGVyIHdpdGggdXNlU3RhdGUgKyBzZXRUaW1lb3V0LlxuICovXG5leHBvcnQgY29uc3QgU0FWRURfTElOR0VSX01TID0gMjAwMDtcbmV4cG9ydCBjb25zdCBBVVRPX1NBVkVfREVCT1VOQ0VfTVMgPSA1MDA7XG4vKipcbiAqIFJldHVybnMgdGhlIGlubGluZSBsYWJlbCBmb3IgYSBnaXZlbiBzdGF0dXMuIEtlcHQgaGVyZSBzbyB0aGUgdGVzdCBzdWl0ZVxuICogY2FuIGFzc2VydCBhZ2FpbnN0IHRoZSBleGFjdCBzdHJpbmdzIHdpdGhvdXQgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYWJlbEZvclN0YXR1cyhzdGF0dXMpIHtcbiAgICBzd2l0Y2ggKHN0YXR1cy5zdGF0ZSkge1xuICAgICAgICBjYXNlIFwic2F2aW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJTYXZpbmfigKZcIjtcbiAgICAgICAgY2FzZSBcInNhdmVkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJTYXZlZCDinJNcIjtcbiAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RhdHVzLmVycm9yID8gYFNhdmUgZmFpbGVkIOKAlCAke3N0YXR1cy5lcnJvcn1gIDogXCJTYXZlIGZhaWxlZFwiO1xuICAgICAgICBjYXNlIFwiaWRsZVwiOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9BUElfQkFTRV9VUkwgfSBmcm9tIFwiQC9zaGFyZWQvdHlwZXNcIjtcbmltcG9ydCB7IHVwZGF0ZVNldHRpbmdzLCBnZXRTZXR0aW5ncywgZ2V0QXBpQmFzZVVybCwgc2V0QXBpQmFzZVVybCwgfSBmcm9tIFwiLi4vYmFja2dyb3VuZC9zdG9yYWdlXCI7XG5pbXBvcnQgeyBtZXNzYWdlRm9yRXJyb3IgfSBmcm9tIFwiQC9zaGFyZWQvZXJyb3ItbWVzc2FnZXNcIjtcbmltcG9ydCB7IEFVVE9fU0FWRV9ERUJPVU5DRV9NUywgU0FWRURfTElOR0VSX01TLCBsYWJlbEZvclN0YXR1cywgfSBmcm9tIFwiLi9zYXZlLXN0YXR1c1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3B0aW9uc0FwcCgpIHtcbiAgICBjb25zdCBbc2V0dGluZ3MsIHNldFNldHRpbmdzU3RhdGVdID0gdXNlU3RhdGUoREVGQVVMVF9TRVRUSU5HUyk7XG4gICAgY29uc3QgW2FwaVVybCwgc2V0QXBpVXJsXSA9IHVzZVN0YXRlKERFRkFVTFRfQVBJX0JBU0VfVVJMKTtcbiAgICBjb25zdCBbbGVhcm5lZEFuc3dlcnMsIHNldExlYXJuZWRBbnN3ZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICAvLyBTYXZlLXN0YXR1cyBpbmRpY2F0b3IgKHNlZSBzYXZlLXN0YXR1cy50cykuIE9uZSBwZXIgc3VyZmFjZSBzbyB0aGUgVVJMXG4gICAgLy8gc2F2ZSBidXR0b24gZG9lc24ndCBmbGlja2VyIHRoZSBjaGVja2JveCBhcmVhLCBhbmQgdmljZSB2ZXJzYS5cbiAgICBjb25zdCBbYXBpVXJsU3RhdHVzLCBzZXRBcGlVcmxTdGF0dXNdID0gdXNlU3RhdGUoe1xuICAgICAgICBzdGF0ZTogXCJpZGxlXCIsXG4gICAgfSk7XG4gICAgY29uc3QgW3NldHRpbmdzU3RhdHVzLCBzZXRTZXR0aW5nc1N0YXR1c10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHN0YXRlOiBcImlkbGVcIixcbiAgICB9KTtcbiAgICAvLyBBdXRvLXNhdmUgZGVib3VuY2Ug4oCUIGEgc2luZ2xlIHRpbWVyIGlzIGVub3VnaCBiZWNhdXNlIHdlIG9ubHkgZXZlclxuICAgIC8vIG5lZWQgdG8gZmx1c2ggdGhlIGxhdGVzdCBzZXR0aW5ncyBvYmplY3QuIFRoZSBwZW5kaW5nIGNoYW5nZXMgcmVmXG4gICAgLy8gYWNjdW11bGF0ZXMgdXBkYXRlcyB0aGF0IGFycml2ZSB3aXRoaW4gdGhlIGRlYm91bmNlIHdpbmRvdy5cbiAgICBjb25zdCBwZW5kaW5nU2V0dGluZ3NSZWYgPSB1c2VSZWYoe30pO1xuICAgIGNvbnN0IGRlYm91bmNlVGltZXJSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3Qgc2F2ZWRGYWRlVGltZXJSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgYXBpU2F2ZWRGYWRlVGltZXJSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFNldHRpbmdzKCk7XG4gICAgICAgIGxvYWRMZWFybmVkQW5zd2VycygpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRlYm91bmNlVGltZXJSZWYuY3VycmVudClcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgYXN5bmMgZnVuY3Rpb24gbG9hZFNldHRpbmdzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3NldHRpbmdzRGF0YSwgdXJsXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICBnZXRTZXR0aW5ncygpLFxuICAgICAgICAgICAgICAgIGdldEFwaUJhc2VVcmwoKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgc2V0U2V0dGluZ3NTdGF0ZShzZXR0aW5nc0RhdGEpO1xuICAgICAgICAgICAgc2V0QXBpVXJsKHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0U2V0dGluZ3NTdGF0dXMoeyBzdGF0ZTogXCJlcnJvclwiLCBlcnJvcjogbWVzc2FnZUZvckVycm9yKGVycikgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkTGVhcm5lZEFuc3dlcnMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVF9BVVRIX1NUQVRVU1wiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlPy5kYXRhPy5pc0F1dGhlbnRpY2F0ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgLy8gRmV0Y2ggbGVhcm5lZCBhbnN3ZXJzIHZpYSBiYWNrZ3JvdW5kIHNjcmlwdFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUX0xFQVJORURfQU5TV0VSU1wiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0TGVhcm5lZEFuc3dlcnMocmVzdWx0LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBsZWFybmVkIGFuc3dlcnM6XCIsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlQW5zd2VyKGlkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJERUxFVEVfQU5TV0VSXCIsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogaWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQ/LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZXRMZWFybmVkQW5zd2VycygocHJldikgPT4gcHJldi5maWx0ZXIoKGEpID0+IGEuaWQgIT09IGlkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWxldGUgYW5zd2VyOlwiLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgYSBzaW5nbGUgc2V0dGluZyBsb2NhbGx5IGFuZCBzY2hlZHVsZXMgYSBkZWJvdW5jZWQgZmx1c2guXG4gICAgICogTXVsdGlwbGUgcmFwaWQgY2hhbmdlcyAocmFuZ2Ugc2xpZGVyIGRyYWcsIHJlcGVhdGVkIGNoZWNrYm94IGNsaWNrcylcbiAgICAgKiBjb2FsZXNjZSBpbnRvIGEgc2luZ2xlIHVwZGF0ZVNldHRpbmdzIGNhbGwgYWZ0ZXIgQVVUT19TQVZFX0RFQk9VTkNFX01TXG4gICAgICogb2YgcXVpZXQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaGFuZGxlU2V0dGluZ0NoYW5nZShrZXksIHZhbHVlKSB7XG4gICAgICAgIHNldFNldHRpbmdzU3RhdGUoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgICAgIHBlbmRpbmdTZXR0aW5nc1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgICAgLi4ucGVuZGluZ1NldHRpbmdzUmVmLmN1cnJlbnQsXG4gICAgICAgICAgICBba2V5XTogdmFsdWUsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChkZWJvdW5jZVRpbWVyUmVmLmN1cnJlbnQpXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgaWYgKHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRlYm91bmNlVGltZXJSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgZmx1c2hTZXR0aW5ncygpO1xuICAgICAgICB9LCBBVVRPX1NBVkVfREVCT1VOQ0VfTVMpO1xuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBmbHVzaFNldHRpbmdzKCkge1xuICAgICAgICBjb25zdCBwZW5kaW5nID0gcGVuZGluZ1NldHRpbmdzUmVmLmN1cnJlbnQ7XG4gICAgICAgIHBlbmRpbmdTZXR0aW5nc1JlZi5jdXJyZW50ID0ge307XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhwZW5kaW5nKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldFNldHRpbmdzU3RhdHVzKHsgc3RhdGU6IFwic2F2aW5nXCIgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTZXR0aW5ncyhwZW5kaW5nKTtcbiAgICAgICAgICAgIHNldFNldHRpbmdzU3RhdHVzKHsgc3RhdGU6IFwic2F2ZWRcIiB9KTtcbiAgICAgICAgICAgIHNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRTZXR0aW5nc1N0YXR1cyh7IHN0YXRlOiBcImlkbGVcIiB9KTtcbiAgICAgICAgICAgICAgICBzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0sIFNBVkVEX0xJTkdFUl9NUyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0U2V0dGluZ3NTdGF0dXMoeyBzdGF0ZTogXCJlcnJvclwiLCBlcnJvcjogbWVzc2FnZUZvckVycm9yKGVycikgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXBpVXJsQ2hhbmdlKCkge1xuICAgICAgICBzZXRBcGlVcmxTdGF0dXMoeyBzdGF0ZTogXCJzYXZpbmdcIiB9KTtcbiAgICAgICAgaWYgKGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzZXRBcGlCYXNlVXJsKGFwaVVybCk7XG4gICAgICAgICAgICBzZXRBcGlVcmxTdGF0dXMoeyBzdGF0ZTogXCJzYXZlZFwiIH0pO1xuICAgICAgICAgICAgYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEFwaVVybFN0YXR1cyh7IHN0YXRlOiBcImlkbGVcIiB9KTtcbiAgICAgICAgICAgICAgICBhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0sIFNBVkVEX0xJTkdFUl9NUyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0QXBpVXJsU3RhdHVzKHsgc3RhdGU6IFwiZXJyb3JcIiwgZXJyb3I6IG1lc3NhZ2VGb3JFcnJvcihlcnIpIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChsb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJvcHRpb25zLWNvbnRhaW5lclwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJsb2FkaW5nXCIsIGNoaWxkcmVuOiBcIkxvYWRpbmcgc2V0dGluZ3MuLi5cIiB9KSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwib3B0aW9ucy1jb250YWluZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImhlYWRlclwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImltZ1wiLCB7IGNsYXNzTmFtZTogXCJoZWFkZXItbWFya1wiLCBzcmM6IGNocm9tZS5ydW50aW1lLmdldFVSTChcImJyYW5kL3Nsb3RoaW5nLW1hcmsucG5nXCIpLCBhbHQ6IFwiXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImhlYWRlci10ZXh0XCIsIGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2hpbGRyZW46IFwiU2xvdGhpbmcgU2V0dGluZ3NcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic3VidGl0bGVcIiwgY2hpbGRyZW46IFwiQ29ubmVjdGlvbiwgYXV0b2ZpbGwsIGxlYXJuaW5nLCBhbmQgdHJhY2tpbmdcIiB9KV0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCBjb25uZWN0aW9uLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJDb25uZWN0aW9uXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlNsb3RoaW5nIEFQSSBVUkxcIiB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiVGhlIFVSTCB3aGVyZSB5b3VyIFNsb3RoaW5nIGFwcCBpcyBydW5uaW5nXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJpbnB1dC1ncm91cFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidXJsXCIsIHZhbHVlOiBhcGlVcmwsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0QXBpVXJsKGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IERFRkFVTFRfQVBJX0JBU0VfVVJMIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlQXBpVXJsQ2hhbmdlLCBkaXNhYmxlZDogYXBpVXJsU3RhdHVzLnN0YXRlID09PSBcInNhdmluZ1wiLCBjaGlsZHJlbjogYXBpVXJsU3RhdHVzLnN0YXRlID09PSBcInNhdmluZ1wiID8gXCJTYXZpbmfigKZcIiA6IFwiU2F2ZVwiIH0pLCBfanN4KFNhdmVTdGF0dXNCYWRnZSwgeyBzdGF0dXM6IGFwaVVybFN0YXR1cyB9KV0gfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgYXV0b2ZpbGwtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24taGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkF1dG8tRmlsbFwiIH0pLCBfanN4KFNhdmVTdGF0dXNCYWRnZSwgeyBzdGF0dXM6IHNldHRpbmdzU3RhdHVzIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiY2hlY2tib3gtbGFiZWxcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNldHRpbmdzLmF1dG9GaWxsRW5hYmxlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwiYXV0b0ZpbGxFbmFibGVkXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkVuYWJsZSBhdXRvLWZpbGxcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIkF1dG9tYXRpY2FsbHkgZGV0ZWN0IGZvcm0gZmllbGRzIG9uIGpvYiBhcHBsaWNhdGlvbiBwYWdlc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiY2hlY2tib3gtbGFiZWxcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNldHRpbmdzLnNob3dDb25maWRlbmNlSW5kaWNhdG9ycywgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlNob3cgY29uZmlkZW5jZSBpbmRpY2F0b3JzXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJEaXNwbGF5IGNvbmZpZGVuY2UgbGV2ZWxzIGZvciBkZXRlY3RlZCBmaWVsZHNcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIk1pbmltdW0gY29uZmlkZW5jZSB0aHJlc2hvbGRcIiB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiT25seSBmaWxsIGZpZWxkcyB3aXRoIGNvbmZpZGVuY2UgYWJvdmUgdGhpcyBsZXZlbFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmFuZ2UtZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInJhbmdlXCIsIG1pbjogXCIwXCIsIG1heDogXCIxXCIsIHN0ZXA6IFwiMC4xXCIsIHZhbHVlOiBzZXR0aW5ncy5taW5pbXVtQ29uZmlkZW5jZSwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwibWluaW11bUNvbmZpZGVuY2VcIiwgcGFyc2VGbG9hdChlLnRhcmdldC52YWx1ZSkpIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjaGlsZHJlbjogW01hdGgucm91bmQoc2V0dGluZ3MubWluaW11bUNvbmZpZGVuY2UgKiAxMDApLCBcIiVcIl0gfSldIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIGNvbXBhY3QtY2FyZCBsZWFybmluZy1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2VjdGlvbi1oZWFkXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2hpbGRyZW46IFwiTGVhcm5pbmdcIiB9KSwgX2pzeChTYXZlU3RhdHVzQmFkZ2UsIHsgc3RhdHVzOiBzZXR0aW5nc1N0YXR1cyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5sZWFybkZyb21BbnN3ZXJzLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJsZWFybkZyb21BbnN3ZXJzXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkxlYXJuIGZyb20gbXkgYW5zd2Vyc1wiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiU2F2ZSBhbnN3ZXJzIHRvIGN1c3RvbSBxdWVzdGlvbnMgZm9yIGZ1dHVyZSBzdWdnZXN0aW9uc1wiIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIHRyYWNraW5nLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJUcmFja2luZ1wiIH0pLCBfanN4KFNhdmVTdGF0dXNCYWRnZSwgeyBzdGF0dXM6IHNldHRpbmdzU3RhdHVzIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiY2hlY2tib3gtbGFiZWxcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNldHRpbmdzLmF1dG9UcmFja0FwcGxpY2F0aW9uc0VuYWJsZWQsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcImF1dG9UcmFja0FwcGxpY2F0aW9uc0VuYWJsZWRcIiwgZS50YXJnZXQuY2hlY2tlZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiVHJhY2sgc3VibWl0dGVkIGFwcGxpY2F0aW9uc1wiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiQ3JlYXRlIGFuIGFwcGxpZWQgb3Bwb3J0dW5pdHkgd2hlbiBhbiBhdXRvZmlsbGVkIGFwcGxpY2F0aW9uIGZvcm0gaXMgc3VibWl0dGVkXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3MuY2FwdHVyZVNjcmVlbnNob3RFbmFibGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJjYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWRcIiwgZS50YXJnZXQuY2hlY2tlZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiQ2FwdHVyZSBzY3JlZW5zaG90IHdoZW4gdHJhY2tpbmdcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIk9mZiBieSBkZWZhdWx0OyBmb3JtIHZhbHVlcyBhcmUgbmV2ZXIgY2FwdHVyZWRcIiB9KV0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCBzY3JhcGUtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24taGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkJ1bGsgc2NyYXBlXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJDb250cm9scyB0aGUgYnVsayBzY3JhcGUgb24gV2F0ZXJsb29Xb3JrcyAoYW5kIG90aGVyIGJ1bGsgc291cmNlcykuIFRocm90dGxlIGlzIGhvdyBsb25nIHdlIHdhaXQgYmV0d2VlbiByb3cgY2xpY2tzOyBjaHVuayBzaXplIGlzIGhvdyBtYW55IHNjcmFwZWQgam9icyB3ZSBpbXBvcnQgcGVyIEhUVFAgcmVxdWVzdC5cIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1yb3dcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcIm51bWJlci1pbnB1dFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiUm93IHRocm90dGxlIChtcylcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgbWluOiAxMDAsIG1heDogNTAwMCwgdmFsdWU6IHNldHRpbmdzLnNjcmFwZVRocm90dGxlTXMsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gTnVtYmVyLnBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJzY3JhcGVUaHJvdHRsZU1zXCIsIE1hdGgubWF4KDEwMCwgTWF0aC5taW4oNTAwMCwgbmV4dCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSldIH0pLCBfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcIm51bWJlci1pbnB1dFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiSW1wb3J0IGNodW5rIHNpemVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgbWluOiAxLCBtYXg6IDUwLCB2YWx1ZTogc2V0dGluZ3Muc2NyYXBlQ2h1bmtTaXplLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IE51bWJlci5wYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG5leHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2NyYXBlQ2h1bmtTaXplXCIsIE1hdGgubWF4KDEsIE1hdGgubWluKDUwLCBuZXh0KSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLXJvd1wiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwibnVtYmVyLWlucHV0XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJNYXggam9icyAvIHNjcmFwZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBtaW46IDEsIG1heDogMTAwMCwgdmFsdWU6IHNldHRpbmdzLnNjcmFwZU1heEpvYnMsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gTnVtYmVyLnBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJzY3JhcGVNYXhKb2JzXCIsIE1hdGgubWF4KDEsIE1hdGgubWluKDEwMDAsIG5leHQpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJudW1iZXItaW5wdXRcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIk1heCBwYWdlcyAvIHNjcmFwZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcIm51bWJlclwiLCBtaW46IDEsIG1heDogMjAwLCB2YWx1ZTogc2V0dGluZ3Muc2NyYXBlTWF4UGFnZXMsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gTnVtYmVyLnBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJzY3JhcGVNYXhQYWdlc1wiLCBNYXRoLm1heCgxLCBNYXRoLm1pbigyMDAsIG5leHQpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5zY3JhcGVEZWR1cGVFbmFibGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJzY3JhcGVEZWR1cGVFbmFibGVkXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlNraXAgcG9zdGluZ3MgYWxyZWFkeSBpbXBvcnRlZFwiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiQXNrcyB0aGUgQVBJIGZvciB5b3VyIGltcG9ydGVkIHBvc3RpbmcgSURzIGJlZm9yZSBzY3JhcGluZzsgc2tpcHMgbWF0Y2hpbmcgcm93cyB3aXRob3V0IG9wZW5pbmcgdGhlaXIgbW9kYWwuXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgY29tcGFjdC1jYXJkIG5vdGlmaWNhdGlvbnMtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24taGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIk5vdGlmaWNhdGlvbnNcIiB9KSwgX2pzeChTYXZlU3RhdHVzQmFkZ2UsIHsgc3RhdHVzOiBzZXR0aW5nc1N0YXR1cyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5ub3RpZnlPbkpvYkRldGVjdGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJub3RpZnlPbkpvYkRldGVjdGVkXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlNob3cgYmFkZ2Ugd2hlbiBqb2IgZGV0ZWN0ZWRcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIkRpc3BsYXkgYSBiYWRnZSBvbiB0aGUgZXh0ZW5zaW9uIGljb24gd2hlbiBhIGpvYiBsaXN0aW5nIGlzIGZvdW5kXCIgfSldIH0pXSB9KSwgbGVhcm5lZEFuc3dlcnMubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgc2F2ZWQtYW5zd2Vycy1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoMlwiLCB7IGNoaWxkcmVuOiBbXCJTYXZlZCBBbnN3ZXJzIChcIiwgbGVhcm5lZEFuc3dlcnMubGVuZ3RoLCBcIilcIl0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2Vycy1saXN0XCIsIGNoaWxkcmVuOiBsZWFybmVkQW5zd2Vycy5tYXAoKGFuc3dlcikgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuc3dlci1pdGVtXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhbnN3ZXItcXVlc3Rpb25cIiwgY2hpbGRyZW46IGFuc3dlci5xdWVzdGlvbiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhbnN3ZXItdGV4dFwiLCBjaGlsZHJlbjogYW5zd2VyLmFuc3dlciB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2VyLW1ldGFcIiwgY2hpbGRyZW46IFthbnN3ZXIuc291cmNlQ29tcGFueSAmJiBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBhbnN3ZXIuc291cmNlQ29tcGFueSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2hpbGRyZW46IFtcIlVzZWQgXCIsIGFuc3dlci50aW1lc1VzZWQsIFwieFwiXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJkZWxldGUtYnRuXCIsIG9uQ2xpY2s6ICgpID0+IGhhbmRsZURlbGV0ZUFuc3dlcihhbnN3ZXIuaWQpLCBjaGlsZHJlbjogXCJEZWxldGVcIiB9KV0gfSldIH0sIGFuc3dlci5pZCkpKSB9KV0gfSkpLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCBhYm91dC1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2hpbGRyZW46IFwiQWJvdXRcIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcImFib3V0XCIsIGNoaWxkcmVuOiBbXCJTbG90aGluZyBCcm93c2VyIEV4dGVuc2lvbiB2XCIsIGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbl0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImFib3V0XCIsIGNoaWxkcmVuOiBfanN4KFwiYVwiLCB7IGhyZWY6IFwiaHR0cHM6Ly9naXRodWIuY29tL0FOb25BQmVudG8vc2xvdGhpbmdcIiwgdGFyZ2V0OiBcIl9ibGFua1wiLCByZWw6IFwibm9vcGVuZXIgbm9yZWZlcnJlclwiLCBjaGlsZHJlbjogXCJWaWV3IG9uIEdpdEh1YlwiIH0pIH0pXSB9KV0gfSkpO1xufVxuZnVuY3Rpb24gU2F2ZVN0YXR1c0JhZGdlKHsgc3RhdHVzIH0pIHtcbiAgICBpZiAoc3RhdHVzLnN0YXRlID09PSBcImlkbGVcIilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgbGFiZWwgPSBsYWJlbEZvclN0YXR1cyhzdGF0dXMpO1xuICAgIHJldHVybiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGBzYXZlLXN0YXR1cyBzYXZlLXN0YXR1cy0ke3N0YXR1cy5zdGF0ZX1gLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogbGFiZWwgfSkpO1xufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tIFwicmVhY3QtZG9tL2NsaWVudFwiO1xuaW1wb3J0IE9wdGlvbnNBcHAgZnJvbSBcIi4vQXBwXCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKTtcbmlmIChjb250YWluZXIpIHtcbiAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChjb250YWluZXIpO1xuICAgIHJvb3QucmVuZGVyKF9qc3goUmVhY3QuU3RyaWN0TW9kZSwgeyBjaGlsZHJlbjogX2pzeChPcHRpb25zQXBwLCB7fSkgfSkpO1xufVxuIiwiLyoqXG4gKiBVc2VyLWZhY2luZyBlcnJvciBzdHJpbmcgbWFwcGluZyBmb3IgdGhlIFNsb3RoaW5nIGV4dGVuc2lvbi5cbiAqXG4gKiBUaGUgcG9wdXAgKGFuZCBhbnkgb3RoZXIgZXh0ZW5zaW9uIHN1cmZhY2UpIHNob3VsZCBuZXZlciBzaG93IHJhd1xuICogYFwiUmVxdWVzdCBmYWlsZWQ6IDUwM1wiYCAvIGBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcImAgc3RyaW5ncy4gV3JhcCBhbnlcbiAqIGVycm9yIHBhdGggaW4gYG1lc3NhZ2VGb3JFcnJvcihlcnIpYCB0byBnZXQgYW4gRW5nbGlzaCBzZW50ZW5jZSBzYWZlXG4gKiBmb3IgZW5kLXVzZXJzLlxuICpcbiAqIE1pcnJvciBvZiB0aGUgbWVzc2FnZSB0b25lIHVzZWQgYnkgYGFwcHMvd2ViLy4uLi9leHRlbnNpb24vY29ubmVjdC9wYWdlLnRzeGBcbiAqIGBtZXNzYWdlRm9yU3RhdHVzYCDigJQgdGhlIGNvbm5lY3QgcGFnZSBrZWVwcyBpdHMgb3duIGNvcHkgYmVjYXVzZSBpdCBzaXRzXG4gKiBpbnNpZGUgdGhlIG5leHQtaW50bCB0cmVlIChkaWZmZXJlbnQgcGFja2FnZSBib3VuZGFyeSksIGJ1dCB0aGVcbiAqIHVzZXItdmlzaWJsZSBzdHJpbmdzIHNob3VsZCBzdGF5IGFsaWduZWQuIElmIHlvdSBjaGFuZ2Ugb25lLCBjaGFuZ2UgYm90aC5cbiAqXG4gKiBFbmdsaXNoLW9ubHkgYnkgZGVzaWduOiB0aGUgZXh0ZW5zaW9uIGl0c2VsZiBkb2VzIG5vdCB1c2UgbmV4dC1pbnRsLlxuICovXG4vKipcbiAqIE1hcHMgYW4gSFRUUCBzdGF0dXMgY29kZSB0byBhIGh1bWFuLWZyaWVuZGx5IG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlRm9yU3RhdHVzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09IDQwMSB8fCBzdGF0dXMgPT09IDQwMykge1xuICAgICAgICByZXR1cm4gXCJTaWduIGluIGV4cGlyZWQuIFJlY29ubmVjdCB0aGUgZXh0ZW5zaW9uLlwiO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID09PSA0MjkpIHtcbiAgICAgICAgcmV0dXJuIFwiV2UncmUgcmF0ZS1saW1pdGVkLiBUcnkgYWdhaW4gaW4gYSBtaW51dGUuXCI7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPj0gNTAwKSB7XG4gICAgICAgIHJldHVybiBcIlNsb3RoaW5nIHNlcnZlcnMgYXJlIGhhdmluZyBhIHByb2JsZW0uXCI7XG4gICAgfVxuICAgIHJldHVybiBcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJldHJ5RXhoYXVzdGVkTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gXCJTbG90aGluZyBpcyBzdGlsbCBub3QgcmVzcG9uZGluZyBhZnRlciByZXRyeWluZy4gVHJ5IGFnYWluIGluIGEgbWludXRlLlwiO1xufVxuLyoqXG4gKiBCZXN0LWVmZm9ydCBtYXBwaW5nIG9mIGFuIHVua25vd24gdGhyb3duIHZhbHVlIHRvIGEgaHVtYW4tZnJpZW5kbHlcbiAqIG1lc3NhZ2UuIFJlY29nbmlzZXMgdGhlIHNwZWNpZmljIHBocmFzZXMgdGhlIGFwaS1jbGllbnQgdGhyb3dzIHRvZGF5XG4gKiAoYFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiYCwgYFwiTm90IGF1dGhlbnRpY2F0ZWRcImAsIGBcIlJlcXVlc3QgZmFpbGVkOiA8Y29kZT5cImAsXG4gKiBgXCJGYWlsZWQgdG8gZmV0Y2hcImApIGFuZCBmYWxscyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBtZXNzYWdlIGZvciBhbnl0aGluZ1xuICogZWxzZSDigJQgdGhhdCdzIGFsbW9zdCBhbHdheXMgbW9yZSB1c2VmdWwgdGhhbiBhIGdlbmVyaWMgY2F0Y2gtYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZUZvckVycm9yKGVycikge1xuICAgIC8vIEdlbmVyaWMgbmV0d29yayBmYWlsdXJlIChmZXRjaCBpbiBzZXJ2aWNlIHdvcmtlcnMgdGhyb3dzIFR5cGVFcnJvciBoZXJlKVxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFwiTmV0d29yayBlcnJvci4gQ2hlY2sgeW91ciBjb25uZWN0aW9uIGFuZCB0cnkgYWdhaW4uXCI7XG4gICAgfVxuICAgIGNvbnN0IHJhdyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlwiO1xuICAgIGlmICghcmF3KVxuICAgICAgICByZXR1cm4gXCJTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbiAgICAvLyBBdXRoLXNoYXBlZCBtZXNzYWdlcyBmcm9tIFNsb3RoaW5nQVBJQ2xpZW50LlxuICAgIGlmIChyYXcgPT09IFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiIHx8XG4gICAgICAgIHJhdyA9PT0gXCJOb3QgYXV0aGVudGljYXRlZFwiIHx8XG4gICAgICAgIC91bmF1dGhvci9pLnRlc3QocmF3KSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZUZvclN0YXR1cyg0MDEpO1xuICAgIH1cbiAgICAvLyBgUmVxdWVzdCBmYWlsZWQ6IDUwM2Ag4oCUIHJlY292ZXIgdGhlIHN0YXR1cyBjb2RlLlxuICAgIGNvbnN0IG1hdGNoID0gcmF3Lm1hdGNoKC9SZXF1ZXN0IGZhaWxlZDpcXHMqKFxcZHszfSkvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgY29kZSA9IE51bWJlcihtYXRjaFsxXSk7XG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoY29kZSkpXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZUZvclN0YXR1cyhjb2RlKTtcbiAgICB9XG4gICAgY29uc3QgcmV0cnlNYXRjaCA9IHJhdy5tYXRjaCgvUmVxdWVzdCBzdGlsbCBmYWlsaW5nIGFmdGVyIHJldHJ5OlxccyooXFxkezN9KS8pO1xuICAgIGlmIChyZXRyeU1hdGNoKSB7XG4gICAgICAgIHJldHVybiByZXRyeUV4aGF1c3RlZE1lc3NhZ2UoKTtcbiAgICB9XG4gICAgLy8gQnJvd3NlciBmZXRjaCBmYWlsdXJlcyBidWJibGUgdXAgYXMgXCJGYWlsZWQgdG8gZmV0Y2hcIi5cbiAgICBpZiAoL2ZhaWxlZCB0byBmZXRjaC9pLnRlc3QocmF3KSB8fCAvbmV0d29yay9pLnRlc3QocmF3KSkge1xuICAgICAgICByZXR1cm4gXCJOZXR3b3JrIGVycm9yLiBDaGVjayB5b3VyIGNvbm5lY3Rpb24gYW5kIHRyeSBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgLy8gRm9yIGFueXRoaW5nIGVsc2UsIHRoZSB1bmRlcmx5aW5nIG1lc3NhZ2UgaXMgdXN1YWxseSBhIHNlbnRlbmNlIGFscmVhZHlcbiAgICAvLyAoZS5nLiBcIkNvdWxkbid0IHJlYWQgdGhlIGZ1bGwgam9iIGRlc2NyaXB0aW9uIGZyb20gdGhpcyBwYWdlLlwiKS5cbiAgICByZXR1cm4gcmF3O1xufVxuIiwiLyoqXG4gKiBQNC8jNDAg4oCUIExvbmctbGl2ZWQgcG9ydCBuYW1lIHVzZWQgYnkgdGhlIGlubGluZSBBSSBhc3Npc3RhbnQuIFRoZSBjb250ZW50XG4gKiBzY3JpcHQgY2FsbHMgYGNocm9tZS5ydW50aW1lLmNvbm5lY3QoeyBuYW1lOiBDSEFUX1BPUlRfTkFNRSB9KWAgYW5kIHRoZVxuICogYmFja2dyb3VuZCdzIGBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RgIGxpc3RlbmVyIGZpbHRlcnMgYnkgdGhpcyBuYW1lLlxuICovXG5leHBvcnQgY29uc3QgQ0hBVF9QT1JUX05BTUUgPSBcInNsb3RoaW5nLWNoYXQtc3RyZWFtXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgICBhdXRvRmlsbEVuYWJsZWQ6IHRydWUsXG4gICAgc2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzOiB0cnVlLFxuICAgIG1pbmltdW1Db25maWRlbmNlOiAwLjUsXG4gICAgbGVhcm5Gcm9tQW5zd2VyczogdHJ1ZSxcbiAgICBub3RpZnlPbkpvYkRldGVjdGVkOiB0cnVlLFxuICAgIGF1dG9UcmFja0FwcGxpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXG4gICAgY2FwdHVyZVNjcmVlbnNob3RFbmFibGVkOiBmYWxzZSxcbiAgICBzY3JhcGVUaHJvdHRsZU1zOiA1MDAsXG4gICAgc2NyYXBlQ2h1bmtTaXplOiA1LFxuICAgIHNjcmFwZU1heEpvYnM6IDIwMCxcbiAgICBzY3JhcGVNYXhQYWdlczogNTAsXG4gICAgc2NyYXBlRGVkdXBlRW5hYmxlZDogdHJ1ZSxcbn07XG5leHBvcnQgY29uc3QgTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9BUElfQkFTRV9VUkwgPSBwcm9jZXNzLmVudi5TTE9USElOR19FWFRFTlNJT05fQVBJX0JBU0VfVVJMIHx8IFwiaHR0cHM6Ly9zbG90aGluZy53b3JrXCI7XG5leHBvcnQgY29uc3QgU0hPVUxEX1BST01PVEVfTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCA9IERFRkFVTFRfQVBJX0JBU0VfVVJMICE9PSBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9