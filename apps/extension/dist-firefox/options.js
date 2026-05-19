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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQWE7O0FBRWIsUUFBUSxtQkFBTyxDQUFDLEdBQVc7QUFDM0IsSUFBSSxJQUFxQztBQUN6QyxFQUFFLFNBQWtCO0FBQ3BCLEVBQUUseUJBQW1CO0FBQ3JCLEVBQUUsS0FBSztBQUFBLFVBa0JOOzs7Ozs7Ozs7QUN4QkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2EsTUFBTSxtQkFBTyxDQUFDLEdBQU8sNktBQTZLO0FBQy9NLGtCQUFrQixVQUFVLGVBQWUscUJBQXFCLDZCQUE2QiwwQkFBMEIsMERBQTBELDRFQUE0RSxPQUFPLHdEQUF3RCx5QkFBZ0IsR0FBRyxXQUFXLEdBQUcsWUFBWTs7Ozs7Ozs7QUNWNVY7O0FBRWIsSUFBSSxJQUFxQztBQUN6QyxFQUFFLHlDQUFxRTtBQUN2RSxFQUFFLEtBQUs7QUFBQSxFQUVOOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNORDtBQUM4STtBQUM5STtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLHNEQUF3QztBQUN2RSx1Q0FBdUMsdUNBQXlCO0FBQ2hFO0FBQ0Esa0JBQWtCLGtDQUFvQjtBQUN0Qyx3Q0FBd0Msa0NBQW9CO0FBQzVEO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixHQUFHLDhCQUFnQix1QkFBdUI7QUFDdEUsYUFBYTtBQUNiLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0EsbUNBQW1DLHdCQUF3QjtBQUMzRCxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGFBQWEsSUFBSTtBQUM1QztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsdUJBQXVCLDBDQUEwQztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTywrQkFBK0IsbUVBQW1CLElBQUU7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSxpRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsdUJBQXVCLDJCQUEyQjtBQUNsRDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQiw2REFBYSxJQUFFO0FBQ2xDO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBLHNCQUFzQjtBQUN0Qix1QkFBdUIsbUJBQW1CO0FBQzFDO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsdUJBQXVCLGlCQUFpQjtBQUN4QztBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsd0NBQXdDO0FBQy9EO0FBQ0E7QUFDTywwQkFBMEIseURBQVM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG9EQUFvRDtBQUMxRSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIseUJBQXlCO0FBQ3BELEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7OztBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFFQUFxRTtBQUNyRTtBQUNBO0FBQ087QUFDQTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsYUFBYTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1QitEO0FBQ1g7QUFDb0I7QUFDMkI7QUFDekM7QUFDOEI7QUFDekU7QUFDZix5Q0FBeUMsa0JBQVEsQ0FBQyw4QkFBZ0I7QUFDbEUsZ0NBQWdDLGtCQUFRLENBQUMsa0NBQW9CO0FBQzdELGdEQUFnRCxrQkFBUTtBQUN4RCxrQ0FBa0Msa0JBQVE7QUFDMUM7QUFDQTtBQUNBLDRDQUE0QyxrQkFBUTtBQUNwRDtBQUNBLEtBQUs7QUFDTCxnREFBZ0Qsa0JBQVE7QUFDeEQ7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLGdCQUFNLEdBQUc7QUFDeEMsNkJBQTZCLGdCQUFNO0FBQ25DLDhCQUE4QixnQkFBTTtBQUNwQyxpQ0FBaUMsZ0JBQU07QUFDdkMsSUFBSSxtQkFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxPQUFPO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFdBQVc7QUFDM0IsZ0JBQWdCLGFBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyx1QkFBdUIsMENBQWUsT0FBTztBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsdUJBQXVCO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsRUFBRSxxQkFBcUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLGlCQUFpQjtBQUM3QztBQUNBLGtCQUFrQixjQUFjO0FBQ2hDLGdDQUFnQyxnQkFBZ0I7QUFDaEQ7QUFDQSxvQ0FBb0MsZUFBZTtBQUNuRDtBQUNBLGFBQWEsRUFBRSxlQUFlO0FBQzlCO0FBQ0E7QUFDQSxnQ0FBZ0MsdUJBQXVCLDBDQUFlLE9BQU87QUFDN0U7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGlCQUFpQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGFBQWE7QUFDL0IsOEJBQThCLGdCQUFnQjtBQUM5QztBQUNBLGtDQUFrQyxlQUFlO0FBQ2pEO0FBQ0EsYUFBYSxFQUFFLGVBQWU7QUFDOUI7QUFDQTtBQUNBLDhCQUE4Qix1QkFBdUIsMENBQWUsT0FBTztBQUMzRTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsbUJBQUksVUFBVSwwQ0FBMEMsbUJBQUksVUFBVSx1REFBdUQsR0FBRztBQUNoSjtBQUNBLFlBQVksb0JBQUssVUFBVSwyQ0FBMkMsb0JBQUssYUFBYSxXQUFXLG1CQUFJLFVBQVUsMEZBQTBGLEdBQUcsb0JBQUssVUFBVSxxQ0FBcUMsbUJBQUksU0FBUywrQkFBK0IsR0FBRyxtQkFBSSxRQUFRLGlGQUFpRixJQUFJLElBQUksR0FBRyxvQkFBSyxjQUFjLHVEQUF1RCxtQkFBSSxTQUFTLHdCQUF3QixHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksV0FBVyxtQkFBSSxXQUFXLDhCQUE4QixHQUFHLG1CQUFJLFlBQVksd0RBQXdELElBQUksR0FBRyxvQkFBSyxVQUFVLHFDQUFxQyxtQkFBSSxZQUFZLHFGQUFxRixrQ0FBb0IsRUFBRSxHQUFHLG1CQUFJLGFBQWEsd0lBQXdJLEdBQUcsbUJBQUksb0JBQW9CLHNCQUFzQixJQUFJLElBQUksSUFBSSxHQUFHLG9CQUFLLGNBQWMscURBQXFELG9CQUFLLFVBQVUsc0NBQXNDLG1CQUFJLFNBQVMsdUJBQXVCLEdBQUcsbUJBQUksb0JBQW9CLHdCQUF3QixJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSxnSUFBZ0ksR0FBRyxtQkFBSSxXQUFXLDhCQUE4QixJQUFJLEdBQUcsbUJBQUksWUFBWSx1RUFBdUUsSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksd0NBQXdDLG1CQUFJLFlBQVksa0pBQWtKLEdBQUcsbUJBQUksV0FBVyx3Q0FBd0MsSUFBSSxHQUFHLG1CQUFJLFlBQVksMkRBQTJELElBQUksR0FBRyxvQkFBSyxVQUFVLHVDQUF1QyxvQkFBSyxZQUFZLFdBQVcsbUJBQUksV0FBVywwQ0FBMEMsR0FBRyxtQkFBSSxZQUFZLCtEQUErRCxJQUFJLEdBQUcsb0JBQUssVUFBVSxxQ0FBcUMsbUJBQUksWUFBWSwwS0FBMEssR0FBRyxvQkFBSyxXQUFXLCtEQUErRCxJQUFJLElBQUksSUFBSSxHQUFHLG9CQUFLLGNBQWMsa0VBQWtFLG9CQUFLLFVBQVUsc0NBQXNDLG1CQUFJLFNBQVMsc0JBQXNCLEdBQUcsbUJBQUksb0JBQW9CLHdCQUF3QixJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSxrSUFBa0ksR0FBRyxtQkFBSSxXQUFXLG1DQUFtQyxJQUFJLEdBQUcsbUJBQUksWUFBWSxxRUFBcUUsSUFBSSxJQUFJLEdBQUcsb0JBQUssY0FBYyxxREFBcUQsb0JBQUssVUFBVSxzQ0FBc0MsbUJBQUksU0FBUyxzQkFBc0IsR0FBRyxtQkFBSSxvQkFBb0Isd0JBQXdCLElBQUksR0FBRyxvQkFBSyxVQUFVLHVDQUF1QyxvQkFBSyxZQUFZLHdDQUF3QyxtQkFBSSxZQUFZLDBKQUEwSixHQUFHLG1CQUFJLFdBQVcsMENBQTBDLElBQUksR0FBRyxtQkFBSSxZQUFZLDRGQUE0RixJQUFJLEdBQUcsb0JBQUssVUFBVSx1Q0FBdUMsb0JBQUssWUFBWSx3Q0FBd0MsbUJBQUksWUFBWSxrSkFBa0osR0FBRyxtQkFBSSxXQUFXLDhDQUE4QyxJQUFJLEdBQUcsbUJBQUksWUFBWSwyQkFBMkIsaUNBQWlDLElBQUksSUFBSSxHQUFHLG9CQUFLLGNBQWMsbURBQW1ELG9CQUFLLFVBQVUsc0NBQXNDLG1CQUFJLFNBQVMseUJBQXlCLEdBQUcsbUJBQUksb0JBQW9CLHdCQUF3QixJQUFJLEdBQUcsbUJBQUksWUFBWSxnSUFBZ0ksa0VBQWtFLEdBQUcsb0JBQUssVUFBVSxxQ0FBcUMsb0JBQUssWUFBWSxzQ0FBc0MsbUJBQUksV0FBVywrQkFBK0IsR0FBRyxtQkFBSSxZQUFZO0FBQ3IrSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxJQUFJLEdBQUcsb0JBQUssWUFBWSxzQ0FBc0MsbUJBQUksV0FBVywrQkFBK0IsR0FBRyxtQkFBSSxZQUFZO0FBQzFLO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLElBQUksSUFBSSxHQUFHLG9CQUFLLFVBQVUscUNBQXFDLG9CQUFLLFlBQVksc0NBQXNDLG1CQUFJLFdBQVcsK0JBQStCLEdBQUcsbUJBQUksWUFBWTtBQUNsTztBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxJQUFJLEdBQUcsb0JBQUssWUFBWSxzQ0FBc0MsbUJBQUksV0FBVyxnQ0FBZ0MsR0FBRyxtQkFBSSxZQUFZO0FBQzNLO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLElBQUksSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksd0NBQXdDLG1CQUFJLFlBQVksd0lBQXdJLEdBQUcsbUJBQUksV0FBVyw0Q0FBNEMsSUFBSSxHQUFHLG1CQUFJLFlBQVksdUVBQXVFLG1EQUFtRCxJQUFJLElBQUksR0FBRyxvQkFBSyxjQUFjLHVFQUF1RSxvQkFBSyxVQUFVLHNDQUFzQyxtQkFBSSxTQUFTLDJCQUEyQixHQUFHLG1CQUFJLG9CQUFvQix3QkFBd0IsSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUNBQXVDLG9CQUFLLFlBQVksd0NBQXdDLG1CQUFJLFlBQVksd0lBQXdJLEdBQUcsbUJBQUksV0FBVywwQ0FBMEMsSUFBSSxHQUFHLG1CQUFJLFlBQVksK0VBQStFLElBQUksSUFBSSxpQ0FBaUMsb0JBQUssY0FBYywwREFBMEQsb0JBQUssU0FBUywyREFBMkQsR0FBRyxtQkFBSSxVQUFVLHFFQUFxRSxvQkFBSyxVQUFVLHFDQUFxQyxtQkFBSSxVQUFVLHlEQUF5RCxHQUFHLG1CQUFJLFVBQVUsbURBQW1ELEdBQUcsb0JBQUssVUFBVSw2REFBNkQsbUJBQUksV0FBVyxnQ0FBZ0MsR0FBRyxvQkFBSyxXQUFXLDRDQUE0QyxHQUFHLG1CQUFJLGFBQWEsMkZBQTJGLElBQUksSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLG9CQUFLLGNBQWMsa0RBQWtELG1CQUFJLFNBQVMsbUJBQW1CLEdBQUcsb0JBQUssUUFBUSxzR0FBc0csR0FBRyxtQkFBSSxRQUFRLDhCQUE4QixtQkFBSSxRQUFRLDBIQUEwSCxHQUFHLElBQUksSUFBSTtBQUMxMkU7QUFDQSwyQkFBMkIsUUFBUTtBQUNuQztBQUNBO0FBQ0Esa0JBQWtCLGNBQWM7QUFDaEMsWUFBWSxtQkFBSSxXQUFXLHNDQUFzQyxhQUFhLDJEQUEyRDtBQUN6STs7O0FDL0tnRDtBQUN0QjtBQUNvQjtBQUNmO0FBQ1Q7QUFDdEI7QUFDQTtBQUNBLGlCQUFpQiw0QkFBVTtBQUMzQixnQkFBZ0IsbUJBQUksQ0FBQyxnQkFBZ0IsSUFBSSxVQUFVLG1CQUFJLENBQUMsVUFBVSxJQUFJLEdBQUc7QUFDekU7Ozs7Ozs7Ozs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELEVBQUU7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJFQUEyRSxFQUFFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3hFQTtBQUNBO0FBQ0EsMENBQTBDLHNCQUFzQjtBQUNoRTtBQUNBO0FBQ087QUFDQTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDQSw2QkFBNkIsdUJBQTJDLElBQUksQ0FBdUI7QUFDbkciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdC1kb21AMTguMy4xX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvcmVhY3QtZG9tL2NsaWVudC5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0L2pzeC1ydW50aW1lLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9zdG9yYWdlLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvb3B0aW9ucy9zYXZlLXN0YXR1cy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL29wdGlvbnMvQXBwLnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL29wdGlvbnMvaW5kZXgudHN4Iiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL2Vycm9yLW1lc3NhZ2VzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL3R5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IG0uY3JlYXRlUm9vdDtcbiAgZXhwb3J0cy5oeWRyYXRlUm9vdCA9IG0uaHlkcmF0ZVJvb3Q7XG59IGVsc2Uge1xuICB2YXIgaSA9IG0uX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IGZ1bmN0aW9uKGMsIG8pIHtcbiAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBtLmNyZWF0ZVJvb3QoYywgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBleHBvcnRzLmh5ZHJhdGVSb290ID0gZnVuY3Rpb24oYywgaCwgbykge1xuICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG0uaHlkcmF0ZVJvb3QoYywgaCwgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO3ZhciBmPXJlcXVpcmUoXCJyZWFjdFwiKSxrPVN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpLGw9U3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLG09T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxuPWYuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQuUmVhY3RDdXJyZW50T3duZXIscD17a2V5OiEwLHJlZjohMCxfX3NlbGY6ITAsX19zb3VyY2U6ITB9O1xuZnVuY3Rpb24gcShjLGEsZyl7dmFyIGIsZD17fSxlPW51bGwsaD1udWxsO3ZvaWQgMCE9PWcmJihlPVwiXCIrZyk7dm9pZCAwIT09YS5rZXkmJihlPVwiXCIrYS5rZXkpO3ZvaWQgMCE9PWEucmVmJiYoaD1hLnJlZik7Zm9yKGIgaW4gYSltLmNhbGwoYSxiKSYmIXAuaGFzT3duUHJvcGVydHkoYikmJihkW2JdPWFbYl0pO2lmKGMmJmMuZGVmYXVsdFByb3BzKWZvcihiIGluIGE9Yy5kZWZhdWx0UHJvcHMsYSl2b2lkIDA9PT1kW2JdJiYoZFtiXT1hW2JdKTtyZXR1cm57JCR0eXBlb2Y6ayx0eXBlOmMsa2V5OmUscmVmOmgscHJvcHM6ZCxfb3duZXI6bi5jdXJyZW50fX1leHBvcnRzLkZyYWdtZW50PWw7ZXhwb3J0cy5qc3g9cTtleHBvcnRzLmpzeHM9cTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiLy8gRXh0ZW5zaW9uIHN0b3JhZ2UgdXRpbGl0aWVzXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBERUZBVUxUX0FQSV9CQVNFX1VSTCwgTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCwgU0hPVUxEX1BST01PVEVfTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCwgfSBmcm9tIFwiQC9zaGFyZWQvdHlwZXNcIjtcbmNvbnN0IFNUT1JBR0VfS0VZID0gXCJzbG90aGluZ19leHRlbnNpb25cIjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IHJlc3VsdFtTVE9SQUdFX0tFWV07XG4gICAgICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gU0hPVUxEX1BST01PVEVfTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCAmJlxuICAgICAgICAgICAgICAgIHN0b3JlZD8uYXBpQmFzZVVybCA9PT0gTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCAmJlxuICAgICAgICAgICAgICAgICFzdG9yZWQuYXV0aFRva2VuXG4gICAgICAgICAgICAgICAgPyBERUZBVUxUX0FQSV9CQVNFX1VSTFxuICAgICAgICAgICAgICAgIDogc3RvcmVkPy5hcGlCYXNlVXJsIHx8IERFRkFVTFRfQVBJX0JBU0VfVVJMO1xuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgLi4uc3RvcmVkLFxuICAgICAgICAgICAgICAgIGFwaUJhc2VVcmwsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHsgLi4uREVGQVVMVF9TRVRUSU5HUywgLi4uc3RvcmVkPy5zZXR0aW5ncyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN0b3JhZ2UodXBkYXRlcykge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgY29uc3QgdXBkYXRlZCA9IHsgLi4uY3VycmVudCwgLi4udXBkYXRlcyB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBbU1RPUkFHRV9LRVldOiB1cGRhdGVkIH0sIHJlc29sdmUpO1xuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU3RvcmFnZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFNUT1JBR0VfS0VZLCByZXNvbHZlKTtcbiAgICB9KTtcbn1cbi8vIEF1dGggdG9rZW4gaGVscGVyc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEF1dGhUb2tlbih0b2tlbiwgZXhwaXJlc0F0LCBhcGlCYXNlVXJsKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGF1dGhUb2tlbjogdG9rZW4sXG4gICAgICAgIHRva2VuRXhwaXJ5OiBleHBpcmVzQXQsXG4gICAgICAgIC4uLihhcGlCYXNlVXJsID8geyBhcGlCYXNlVXJsIH0gOiB7fSksXG4gICAgICAgIGxhc3RTZWVuQXV0aEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSk7XG4gICAgYXdhaXQgc2V0U2Vzc2lvbkF1dGhDYWNoZSh0cnVlKTtcbn1cbi8qKlxuICogUmVjb3JkcyB0aGF0IHdlIGp1c3Qgb2JzZXJ2ZWQgYSB3b3JraW5nIGF1dGhlbnRpY2F0ZWQgc3RhdGUuIENhbGxlZCBieSB0aGVcbiAqIEFQSSBjbGllbnQgYWZ0ZXIgYSBzdWNjZXNzZnVsIGBpc0F1dGhlbnRpY2F0ZWQoKWAgY2hlY2sgc28gdGhlIHBvcHVwIGNhblxuICogZGlzdGluZ3Vpc2ggYSByZWFsIGxvZ291dCBmcm9tIGEgc2VydmljZS13b3JrZXIgc3RhdGUtbG9zcyBldmVudC5cbiAqXG4gKiBEaXN0aW5jdCBmcm9tIGBzZXRBdXRoVG9rZW5gIGJlY2F1c2Ugd2UgZG9uJ3QgYWx3YXlzIGhhdmUgYSBmcmVzaCB0b2tlbiB0b1xuICogd3JpdGUg4oCUIHNvbWV0aW1lcyB3ZSBqdXN0IHZlcmlmaWVkIHRoZSBleGlzdGluZyBvbmUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYXJrQXV0aFNlZW4oKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IGxhc3RTZWVuQXV0aEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSk7XG59XG4vKipcbiAqIFwiU2Vzc2lvbiBsb3N0XCIgdmlldyAocG9wdXAsICMyNykgc2hvd3Mgd2hlbiB3ZSBoYXZlIG5vIGBhdXRoVG9rZW5gIGJ1dFxuICogYGxhc3RTZWVuQXV0aEF0YCBpcyB3aXRoaW4gdGhpcyB3aW5kb3cuIEJleW9uZCB0aGUgd2luZG93IHdlIHRyZWF0IHRoZVxuICogZXh0ZW5zaW9uIGFzIGEgZnJlc2ggaW5zdGFsbCAvIHRydWUgbG9nb3V0IGFuZCBzaG93IHRoZSBub3JtYWwgaGVyby5cbiAqL1xuZXhwb3J0IGNvbnN0IFNFU1NJT05fTE9TVF9XSU5ET1dfTVMgPSAyNCAqIDYwICogNjAgKiAxMDAwOyAvLyAyNGhcbi8qKlxuICogUmV0dXJucyB0cnVlIHdoZW4gdGhlIHBvcHVwIHNob3VsZCByZW5kZXIgdGhlIFwiU2Vzc2lvbiBsb3N0IOKAlCByZWNvbm5lY3RcIlxuICogYnJhbmNoIGluc3RlYWQgb2YgdGhlIHVuYXV0aGVudGljYXRlZCBoZXJvLiBTZWUgIzI3LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTZXNzaW9uTG9zdChzdG9yYWdlLCBub3cgPSBEYXRlLm5vdygpKSB7XG4gICAgaWYgKHN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFzdG9yYWdlLmxhc3RTZWVuQXV0aEF0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgbGFzdFNlZW4gPSBuZXcgRGF0ZShzdG9yYWdlLmxhc3RTZWVuQXV0aEF0KS5nZXRUaW1lKCk7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobGFzdFNlZW4pKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIG5vdyAtIGxhc3RTZWVuIDw9IFNFU1NJT05fTE9TVF9XSU5ET1dfTVM7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJBdXRoVG9rZW4oKSB7XG4gICAgLy8gTk9URTogd2UgaW50ZW50aW9uYWxseSBkbyBOT1QgY2xlYXIgYGxhc3RTZWVuQXV0aEF0YCBoZXJlLiBBIHRydWUgbG9nb3V0XG4gICAgLy8gcGF0aCAoaGFuZGxlTG9nb3V0KSBjYWxscyBgZm9yZ2V0QXV0aEhpc3RvcnlgIGFmdGVyd2FyZHM7IHRoaXMgaGVscGVyIGlzXG4gICAgLy8gYWxzbyB1c2VkIHdoZW4gYSB0b2tlbiBxdWlldGx5IGV4cGlyZXMgb3IgYSA0MDEgdHJpcHMgdGhlIGFwaS1jbGllbnQsXG4gICAgLy8gYW5kIGluIHRob3NlIGNhc2VzIHRoZSBzZXNzaW9uLWxvc3QgVUkgaXMgZXhhY3RseSB3aGF0IHdlIHdhbnQgdG8gc2hvdy5cbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgIHRva2VuRXhwaXJ5OiB1bmRlZmluZWQsXG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG4vKipcbiAqIFdpcGVzIHRoZSBcIndlJ3ZlIHNlZW4geW91IGJlZm9yZVwiIGJyZWFkY3J1bWIgc28gdGhlIHBvcHVwIHNob3dzIHRoZVxuICogdW5hdXRoZW50aWNhdGVkIGhlcm8gb24gbmV4dCBvcGVuLiBDYWxsIHRoaXMgZnJvbSBleHBsaWNpdC1sb2dvdXQgZmxvd3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb3JnZXRBdXRoSGlzdG9yeSgpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgbGFzdFNlZW5BdXRoQXQ6IHVuZGVmaW5lZCB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdXRoVG9rZW4oKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBDaGVjayBleHBpcnlcbiAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICBjb25zdCBleHBpcnkgPSBuZXcgRGF0ZShzdG9yYWdlLnRva2VuRXhwaXJ5KTtcbiAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG59XG4vLyBQcm9maWxlIGNhY2hlIGhlbHBlcnNcbmNvbnN0IFBST0ZJTEVfQ0FDSEVfVFRMID0gNSAqIDYwICogMTAwMDsgLy8gNSBtaW51dGVzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkUHJvZmlsZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5jYWNoZWRQcm9maWxlIHx8ICFzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkQXQgPSBuZXcgRGF0ZShzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCk7XG4gICAgaWYgKERhdGUubm93KCkgLSBjYWNoZWRBdC5nZXRUaW1lKCkgPiBQUk9GSUxFX0NBQ0hFX1RUTCkge1xuICAgICAgICByZXR1cm4gbnVsbDsgLy8gQ2FjaGUgZXhwaXJlZFxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5jYWNoZWRQcm9maWxlO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiBwcm9maWxlLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckNhY2hlZFByb2ZpbGUoKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG4vLyBTZXR0aW5ncyBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5zZXR0aW5ncztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyh1cGRhdGVzKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5zdG9yYWdlLnNldHRpbmdzLCAuLi51cGRhdGVzIH07XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IHNldHRpbmdzOiB1cGRhdGVkIH0pO1xuICAgIHJldHVybiB1cGRhdGVkO1xufVxuLy8gQVBJIFVSTCBoZWxwZXJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBcGlCYXNlVXJsKHVybCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhcGlCYXNlVXJsOiB1cmwgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpQmFzZVVybCgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLmFwaUJhc2VVcmw7XG59XG4vLyAtLS0tIFNlc3Npb24tc2NvcGVkIGF1dGggY2FjaGUgKCMzMCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gYGNocm9tZS5zdG9yYWdlLnNlc3Npb25gIGlzIGluLW1lbW9yeSBvbmx5IOKAlCBpdCBzdXJ2aXZlcyBzdXNwZW5kaW5nIHRoZVxuLy8gc2VydmljZSB3b3JrZXIgYnV0IGlzIHdpcGVkIG9uIGJyb3dzZXIgcmVzdGFydCwgd2hpY2ggaXMgZXhhY3RseSB3aGF0IHdlXG4vLyB3YW50IGZvciBhIHNob3J0LWxpdmVkIGF1dGggdmVyZGljdCBjYWNoZS4gVXNpbmcgc2Vzc2lvbiAobm90IGxvY2FsKVxuLy8gYWxzbyBtZWFucyB3ZSBuZXZlciBwZXJzaXN0IHRoZSB2ZXJkaWN0IHRvIGRpc2suXG4vL1xuLy8gVGhlIGNhY2hlIHN0b3JlcyBgeyBhdXRoZW50aWNhdGVkOiBib29sZWFuLCBhdDogSVNPIHN0cmluZyB9YCBzbyB0aGVcbi8vIHBvcHVwIGNhbiByZXR1cm4gYSByZXN1bHQgaW4gPDUwbXMgb24gdGhlIHNlY29uZCBvcGVuIHdpdGhpbiBhIG1pbnV0ZSxcbi8vIHdoaWxlIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdCByZXZhbGlkYXRlcyBpbiB0aGUgYmFja2dyb3VuZC5cbmV4cG9ydCBjb25zdCBBVVRIX0NBQ0hFX1RUTF9NUyA9IDYwICogMTAwMDtcbmNvbnN0IEFVVEhfQ0FDSEVfS0VZID0gXCJzbG90aGluZ19hdXRoX2NhY2hlXCI7XG4vKipcbiAqIFJlYWRzIHRoZSBzZXNzaW9uLXNjb3BlZCBhdXRoIHZlcmRpY3QgY2FjaGUuIFJldHVybnMgbnVsbCB3aGVuOlxuICogLSB0aGUgZW50cnkgaGFzIG5ldmVyIGJlZW4gd3JpdHRlbixcbiAqIC0gdGhlIGVudHJ5IGlzIG9sZGVyIHRoYW4gQVVUSF9DQUNIRV9UVExfTVMsXG4gKiAtIHRoZSBlbnRyeSdzIHRpbWVzdGFtcCBpcyB1bnBhcnNlYWJsZSwgb3JcbiAqIC0gY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbiBpcyB1bmF2YWlsYWJsZSAoZS5nLiBvbGRlciBicm93c2VycykuXG4gKlxuICogT3B0aW9uYWwgYG5vd2AgcGFyYW1ldGVyIGV4aXN0cyBmb3IgdGVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXNzaW9uQXV0aENhY2hlKG5vdyA9IERhdGUubm93KCkpIHtcbiAgICBjb25zdCBzZXNzaW9uU3RvcmUgPSBjaHJvbWUuc3RvcmFnZT8uc2Vzc2lvbjtcbiAgICBpZiAoIXNlc3Npb25TdG9yZSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNlc3Npb25TdG9yZS5nZXQoQVVUSF9DQUNIRV9LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gcmVzdWx0Py5bQVVUSF9DQUNIRV9LRVldO1xuICAgICAgICAgICAgaWYgKCFlbnRyeSB8fCB0eXBlb2YgZW50cnkuYXQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGF0ID0gbmV3IERhdGUoZW50cnkuYXQpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGF0KSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdyAtIGF0ID4gQVVUSF9DQUNIRV9UVExfTVMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoeyBhdXRoZW50aWNhdGVkOiAhIWVudHJ5LmF1dGhlbnRpY2F0ZWQsIGF0OiBlbnRyeS5hdCB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vKipcbiAqIFdyaXRlcyBhIGZyZXNoIHZlcmRpY3QgdG8gdGhlIHNlc3Npb24tc2NvcGVkIGNhY2hlLiBOby1vcHMgd2hlblxuICogY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbiBpcyB1bmF2YWlsYWJsZSBzbyBjYWxsZXJzIGRvbid0IG5lZWQgdG8gZ3VhcmQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTZXNzaW9uQXV0aENhY2hlKGF1dGhlbnRpY2F0ZWQpIHtcbiAgICBjb25zdCBzZXNzaW9uU3RvcmUgPSBjaHJvbWUuc3RvcmFnZT8uc2Vzc2lvbjtcbiAgICBpZiAoIXNlc3Npb25TdG9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGVudHJ5ID0ge1xuICAgICAgICBhdXRoZW50aWNhdGVkLFxuICAgICAgICBhdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNlc3Npb25TdG9yZS5zZXQoeyBbQVVUSF9DQUNIRV9LRVldOiBlbnRyeSB9LCAoKSA9PiByZXNvbHZlKCkpO1xuICAgIH0pO1xufVxuLyoqXG4gKiBEcm9wcyB0aGUgY2FjaGVkIHZlcmRpY3QuIENhbGwgdGhpcyBvbiBhbnkgNDAxIHNvIHRoZSBuZXh0IHBvcHVwIG9wZW5cbiAqIGRvZXNuJ3QgdHJ1c3QgYSBzdGFsZSBcImF1dGhlbnRpY2F0ZWRcIiBhbnN3ZXIuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclNlc3Npb25BdXRoQ2FjaGUoKSB7XG4gICAgY29uc3Qgc2Vzc2lvblN0b3JlID0gY2hyb21lLnN0b3JhZ2U/LnNlc3Npb247XG4gICAgaWYgKCFzZXNzaW9uU3RvcmUpXG4gICAgICAgIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2Vzc2lvblN0b3JlLnJlbW92ZShBVVRIX0NBQ0hFX0tFWSwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cbiIsIi8qKlxuICogTWluaW1hbCBzYXZlLXN0YXR1cyBzdGF0ZSBtYWNoaW5lIGZvciB0aGUgZXh0ZW5zaW9uIG9wdGlvbnMgcGFnZS5cbiAqXG4gKiBNaXJyb3JzIHRoZSBwYXR0ZXJuIGluIGFwcHMvd2ViL3NyYy9jb21wb25lbnRzL3N0dWRpby9zYXZlLXN0YXR1cy50cyBidXRcbiAqIHBhcmVkIGRvd246IHRoZSBvcHRpb25zIHN1cmZhY2Ugb25seSBuZWVkcyBpZGxlIOKGkiBzYXZpbmcg4oaSIHNhdmVkIOKGkiBpZGxlLFxuICogd2l0aCBhIDJzIGxpbmdlciBvbiBcInNhdmVkXCIgYW5kIGEgc3RpY2t5IFwiZXJyb3JcIiBzdGF0ZS5cbiAqXG4gKiBQdXJlIGhlbHBlcnMgKG5vIFJlYWN0IHN0YXRlKSBzbyB0aGV5J3JlIHRyaXZpYWxseSB1bml0LXRlc3RhYmxlOyB0aGVcbiAqIHBhZ2UgZ2x1ZXMgdGhlbSB0b2dldGhlciB3aXRoIHVzZVN0YXRlICsgc2V0VGltZW91dC5cbiAqL1xuZXhwb3J0IGNvbnN0IFNBVkVEX0xJTkdFUl9NUyA9IDIwMDA7XG5leHBvcnQgY29uc3QgQVVUT19TQVZFX0RFQk9VTkNFX01TID0gNTAwO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmxpbmUgbGFiZWwgZm9yIGEgZ2l2ZW4gc3RhdHVzLiBLZXB0IGhlcmUgc28gdGhlIHRlc3Qgc3VpdGVcbiAqIGNhbiBhc3NlcnQgYWdhaW5zdCB0aGUgZXhhY3Qgc3RyaW5ncyB3aXRob3V0IHJlbmRlcmluZyB0aGUgY29tcG9uZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFiZWxGb3JTdGF0dXMoc3RhdHVzKSB7XG4gICAgc3dpdGNoIChzdGF0dXMuc3RhdGUpIHtcbiAgICAgICAgY2FzZSBcInNhdmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIFwiU2F2aW5n4oCmXCI7XG4gICAgICAgIGNhc2UgXCJzYXZlZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiU2F2ZWQg4pyTXCI7XG4gICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1cy5lcnJvciA/IGBTYXZlIGZhaWxlZCDigJQgJHtzdGF0dXMuZXJyb3J9YCA6IFwiU2F2ZSBmYWlsZWRcIjtcbiAgICAgICAgY2FzZSBcImlkbGVcIjpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERFRkFVTFRfQVBJX0JBU0VfVVJMIH0gZnJvbSBcIkAvc2hhcmVkL3R5cGVzXCI7XG5pbXBvcnQgeyB1cGRhdGVTZXR0aW5ncywgZ2V0U2V0dGluZ3MsIGdldEFwaUJhc2VVcmwsIHNldEFwaUJhc2VVcmwsIH0gZnJvbSBcIi4uL2JhY2tncm91bmQvc3RvcmFnZVwiO1xuaW1wb3J0IHsgbWVzc2FnZUZvckVycm9yIH0gZnJvbSBcIkAvc2hhcmVkL2Vycm9yLW1lc3NhZ2VzXCI7XG5pbXBvcnQgeyBBVVRPX1NBVkVfREVCT1VOQ0VfTVMsIFNBVkVEX0xJTkdFUl9NUywgbGFiZWxGb3JTdGF0dXMsIH0gZnJvbSBcIi4vc2F2ZS1zdGF0dXNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE9wdGlvbnNBcHAoKSB7XG4gICAgY29uc3QgW3NldHRpbmdzLCBzZXRTZXR0aW5nc1N0YXRlXSA9IHVzZVN0YXRlKERFRkFVTFRfU0VUVElOR1MpO1xuICAgIGNvbnN0IFthcGlVcmwsIHNldEFwaVVybF0gPSB1c2VTdGF0ZShERUZBVUxUX0FQSV9CQVNFX1VSTCk7XG4gICAgY29uc3QgW2xlYXJuZWRBbnN3ZXJzLCBzZXRMZWFybmVkQW5zd2Vyc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgLy8gU2F2ZS1zdGF0dXMgaW5kaWNhdG9yIChzZWUgc2F2ZS1zdGF0dXMudHMpLiBPbmUgcGVyIHN1cmZhY2Ugc28gdGhlIFVSTFxuICAgIC8vIHNhdmUgYnV0dG9uIGRvZXNuJ3QgZmxpY2tlciB0aGUgY2hlY2tib3ggYXJlYSwgYW5kIHZpY2UgdmVyc2EuXG4gICAgY29uc3QgW2FwaVVybFN0YXR1cywgc2V0QXBpVXJsU3RhdHVzXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgc3RhdGU6IFwiaWRsZVwiLFxuICAgIH0pO1xuICAgIGNvbnN0IFtzZXR0aW5nc1N0YXR1cywgc2V0U2V0dGluZ3NTdGF0dXNdID0gdXNlU3RhdGUoe1xuICAgICAgICBzdGF0ZTogXCJpZGxlXCIsXG4gICAgfSk7XG4gICAgLy8gQXV0by1zYXZlIGRlYm91bmNlIOKAlCBhIHNpbmdsZSB0aW1lciBpcyBlbm91Z2ggYmVjYXVzZSB3ZSBvbmx5IGV2ZXJcbiAgICAvLyBuZWVkIHRvIGZsdXNoIHRoZSBsYXRlc3Qgc2V0dGluZ3Mgb2JqZWN0LiBUaGUgcGVuZGluZyBjaGFuZ2VzIHJlZlxuICAgIC8vIGFjY3VtdWxhdGVzIHVwZGF0ZXMgdGhhdCBhcnJpdmUgd2l0aGluIHRoZSBkZWJvdW5jZSB3aW5kb3cuXG4gICAgY29uc3QgcGVuZGluZ1NldHRpbmdzUmVmID0gdXNlUmVmKHt9KTtcbiAgICBjb25zdCBkZWJvdW5jZVRpbWVyUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IHNhdmVkRmFkZVRpbWVyUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IGFwaVNhdmVkRmFkZVRpbWVyUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRTZXR0aW5ncygpO1xuICAgICAgICBsb2FkTGVhcm5lZEFuc3dlcnMoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlmIChkZWJvdW5jZVRpbWVyUmVmLmN1cnJlbnQpXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGRlYm91bmNlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudClcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBpZiAoYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudClcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgIH07XG4gICAgfSwgW10pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFtzZXR0aW5nc0RhdGEsIHVybF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgZ2V0U2V0dGluZ3MoKSxcbiAgICAgICAgICAgICAgICBnZXRBcGlCYXNlVXJsKCksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHNldFNldHRpbmdzU3RhdGUoc2V0dGluZ3NEYXRhKTtcbiAgICAgICAgICAgIHNldEFwaVVybCh1cmwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldFNldHRpbmdzU3RhdHVzKHsgc3RhdGU6IFwiZXJyb3JcIiwgZXJyb3I6IG1lc3NhZ2VGb3JFcnJvcihlcnIpIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gbG9hZExlYXJuZWRBbnN3ZXJzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRfQVVUSF9TVEFUVVNcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZT8uZGF0YT8uaXNBdXRoZW50aWNhdGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIC8vIEZldGNoIGxlYXJuZWQgYW5zd2VycyB2aWEgYmFja2dyb3VuZCBzY3JpcHRcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVF9MRUFSTkVEX0FOU1dFUlNcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdD8uc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldExlYXJuZWRBbnN3ZXJzKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgbGVhcm5lZCBhbnN3ZXJzOlwiLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZUFuc3dlcihpZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiREVMRVRFX0FOU1dFUlwiLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IGlkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0Py5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2V0TGVhcm5lZEFuc3dlcnMoKHByZXYpID0+IHByZXYuZmlsdGVyKChhKSA9PiBhLmlkICE9PSBpZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIGFuc3dlcjpcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGEgc2luZ2xlIHNldHRpbmcgbG9jYWxseSBhbmQgc2NoZWR1bGVzIGEgZGVib3VuY2VkIGZsdXNoLlxuICAgICAqIE11bHRpcGxlIHJhcGlkIGNoYW5nZXMgKHJhbmdlIHNsaWRlciBkcmFnLCByZXBlYXRlZCBjaGVja2JveCBjbGlja3MpXG4gICAgICogY29hbGVzY2UgaW50byBhIHNpbmdsZSB1cGRhdGVTZXR0aW5ncyBjYWxsIGFmdGVyIEFVVE9fU0FWRV9ERUJPVU5DRV9NU1xuICAgICAqIG9mIHF1aWV0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhbmRsZVNldHRpbmdDaGFuZ2Uoa2V5LCB2YWx1ZSkge1xuICAgICAgICBzZXRTZXR0aW5nc1N0YXRlKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBba2V5XTogdmFsdWUgfSkpO1xuICAgICAgICBwZW5kaW5nU2V0dGluZ3NSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIC4uLnBlbmRpbmdTZXR0aW5nc1JlZi5jdXJyZW50LFxuICAgICAgICAgICAgW2tleV06IHZhbHVlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoZGVib3VuY2VUaW1lclJlZi5jdXJyZW50KVxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGRlYm91bmNlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgIGlmIChzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZWJvdW5jZVRpbWVyUmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGZsdXNoU2V0dGluZ3MoKTtcbiAgICAgICAgfSwgQVVUT19TQVZFX0RFQk9VTkNFX01TKTtcbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gZmx1c2hTZXR0aW5ncygpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZyA9IHBlbmRpbmdTZXR0aW5nc1JlZi5jdXJyZW50O1xuICAgICAgICBwZW5kaW5nU2V0dGluZ3NSZWYuY3VycmVudCA9IHt9O1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMocGVuZGluZykubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRTZXR0aW5nc1N0YXR1cyh7IHN0YXRlOiBcInNhdmluZ1wiIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU2V0dGluZ3MocGVuZGluZyk7XG4gICAgICAgICAgICBzZXRTZXR0aW5nc1N0YXR1cyh7IHN0YXRlOiBcInNhdmVkXCIgfSk7XG4gICAgICAgICAgICBzYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0U2V0dGluZ3NTdGF0dXMoeyBzdGF0ZTogXCJpZGxlXCIgfSk7XG4gICAgICAgICAgICAgICAgc2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICB9LCBTQVZFRF9MSU5HRVJfTVMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldFNldHRpbmdzU3RhdHVzKHsgc3RhdGU6IFwiZXJyb3JcIiwgZXJyb3I6IG1lc3NhZ2VGb3JFcnJvcihlcnIpIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUFwaVVybENoYW5nZSgpIHtcbiAgICAgICAgc2V0QXBpVXJsU3RhdHVzKHsgc3RhdGU6IFwic2F2aW5nXCIgfSk7XG4gICAgICAgIGlmIChhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBhcGlTYXZlZEZhZGVUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc2V0QXBpQmFzZVVybChhcGlVcmwpO1xuICAgICAgICAgICAgc2V0QXBpVXJsU3RhdHVzKHsgc3RhdGU6IFwic2F2ZWRcIiB9KTtcbiAgICAgICAgICAgIGFwaVNhdmVkRmFkZVRpbWVyUmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRBcGlVcmxTdGF0dXMoeyBzdGF0ZTogXCJpZGxlXCIgfSk7XG4gICAgICAgICAgICAgICAgYXBpU2F2ZWRGYWRlVGltZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICB9LCBTQVZFRF9MSU5HRVJfTVMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEFwaVVybFN0YXR1cyh7IHN0YXRlOiBcImVycm9yXCIsIGVycm9yOiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobG9hZGluZykge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwib3B0aW9ucy1jb250YWluZXJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibG9hZGluZ1wiLCBjaGlsZHJlbjogXCJMb2FkaW5nIHNldHRpbmdzLi4uXCIgfSkgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm9wdGlvbnMtY29udGFpbmVyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjaGlsZHJlbjogW19qc3goXCJpbWdcIiwgeyBjbGFzc05hbWU6IFwiaGVhZGVyLW1hcmtcIiwgc3JjOiBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJicmFuZC9zbG90aGluZy1tYXJrLnBuZ1wiKSwgYWx0OiBcIlwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoZWFkZXItdGV4dFwiLCBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNoaWxkcmVuOiBcIlNsb3RoaW5nIFNldHRpbmdzXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInN1YnRpdGxlXCIsIGNoaWxkcmVuOiBcIkNvbm5lY3Rpb24sIGF1dG9maWxsLCBsZWFybmluZywgYW5kIHRyYWNraW5nXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgY29ubmVjdGlvbi1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2hpbGRyZW46IFwiQ29ubmVjdGlvblwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTbG90aGluZyBBUEkgVVJMXCIgfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIlRoZSBVUkwgd2hlcmUgeW91ciBTbG90aGluZyBhcHAgaXMgcnVubmluZ1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaW5wdXQtZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInVybFwiLCB2YWx1ZTogYXBpVXJsLCBvbkNoYW5nZTogKGUpID0+IHNldEFwaVVybChlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBERUZBVUxUX0FQSV9CQVNFX1VSTCB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGhhbmRsZUFwaVVybENoYW5nZSwgZGlzYWJsZWQ6IGFwaVVybFN0YXR1cy5zdGF0ZSA9PT0gXCJzYXZpbmdcIiwgY2hpbGRyZW46IGFwaVVybFN0YXR1cy5zdGF0ZSA9PT0gXCJzYXZpbmdcIiA/IFwiU2F2aW5n4oCmXCIgOiBcIlNhdmVcIiB9KSwgX2pzeChTYXZlU3RhdHVzQmFkZ2UsIHsgc3RhdHVzOiBhcGlVcmxTdGF0dXMgfSldIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIGF1dG9maWxsLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJBdXRvLUZpbGxcIiB9KSwgX2pzeChTYXZlU3RhdHVzQmFkZ2UsIHsgc3RhdHVzOiBzZXR0aW5nc1N0YXR1cyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5hdXRvRmlsbEVuYWJsZWQsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcImF1dG9GaWxsRW5hYmxlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJFbmFibGUgYXV0by1maWxsXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJBdXRvbWF0aWNhbGx5IGRldGVjdCBmb3JtIGZpZWxkcyBvbiBqb2IgYXBwbGljYXRpb24gcGFnZXNcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5zaG93Q29uZmlkZW5jZUluZGljYXRvcnMsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcInNob3dDb25maWRlbmNlSW5kaWNhdG9yc1wiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTaG93IGNvbmZpZGVuY2UgaW5kaWNhdG9yc1wiIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiRGlzcGxheSBjb25maWRlbmNlIGxldmVscyBmb3IgZGV0ZWN0ZWQgZmllbGRzXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJNaW5pbXVtIGNvbmZpZGVuY2UgdGhyZXNob2xkXCIgfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIk9ubHkgZmlsbCBmaWVsZHMgd2l0aCBjb25maWRlbmNlIGFib3ZlIHRoaXMgbGV2ZWxcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJhbmdlLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJyYW5nZVwiLCBtaW46IFwiMFwiLCBtYXg6IFwiMVwiLCBzdGVwOiBcIjAuMVwiLCB2YWx1ZTogc2V0dGluZ3MubWluaW11bUNvbmZpZGVuY2UsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlU2V0dGluZ0NoYW5nZShcIm1pbmltdW1Db25maWRlbmNlXCIsIHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpKSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2hpbGRyZW46IFtNYXRoLnJvdW5kKHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlICogMTAwKSwgXCIlXCJdIH0pXSB9KV0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCBjb21wYWN0LWNhcmQgbGVhcm5pbmctY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24taGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkxlYXJuaW5nXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3MubGVhcm5Gcm9tQW5zd2Vycywgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwibGVhcm5Gcm9tQW5zd2Vyc1wiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJMZWFybiBmcm9tIG15IGFuc3dlcnNcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIlNhdmUgYW5zd2VycyB0byBjdXN0b20gcXVlc3Rpb25zIGZvciBmdXR1cmUgc3VnZ2VzdGlvbnNcIiB9KV0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZ3MtY2FyZCB0cmFja2luZy1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2VjdGlvbi1oZWFkXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2hpbGRyZW46IFwiVHJhY2tpbmdcIiB9KSwgX2pzeChTYXZlU3RhdHVzQmFkZ2UsIHsgc3RhdHVzOiBzZXR0aW5nc1N0YXR1cyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctZ3JvdXBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImNoZWNrYm94LWxhYmVsXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBzZXR0aW5ncy5hdXRvVHJhY2tBcHBsaWNhdGlvbnNFbmFibGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZVNldHRpbmdDaGFuZ2UoXCJhdXRvVHJhY2tBcHBsaWNhdGlvbnNFbmFibGVkXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlRyYWNrIHN1Ym1pdHRlZCBhcHBsaWNhdGlvbnNcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIkNyZWF0ZSBhbiBhcHBsaWVkIG9wcG9ydHVuaXR5IHdoZW4gYW4gYXV0b2ZpbGxlZCBhcHBsaWNhdGlvbiBmb3JtIGlzIHN1Ym1pdHRlZFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1ncm91cFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiY2hlY2tib3gtbGFiZWxcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IHNldHRpbmdzLmNhcHR1cmVTY3JlZW5zaG90RW5hYmxlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwiY2FwdHVyZVNjcmVlbnNob3RFbmFibGVkXCIsIGUudGFyZ2V0LmNoZWNrZWQpIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkNhcHR1cmUgc2NyZWVuc2hvdCB3aGVuIHRyYWNraW5nXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJPZmYgYnkgZGVmYXVsdDsgZm9ybSB2YWx1ZXMgYXJlIG5ldmVyIGNhcHR1cmVkXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgc2NyYXBlLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJCdWxrIHNjcmFwZVwiIH0pLCBfanN4KFNhdmVTdGF0dXNCYWRnZSwgeyBzdGF0dXM6IHNldHRpbmdzU3RhdHVzIH0pXSB9KSwgX2pzeChcInNtYWxsXCIsIHsgY2hpbGRyZW46IFwiQ29udHJvbHMgdGhlIGJ1bGsgc2NyYXBlIG9uIFdhdGVybG9vV29ya3MgKGFuZCBvdGhlciBidWxrIHNvdXJjZXMpLiBUaHJvdHRsZSBpcyBob3cgbG9uZyB3ZSB3YWl0IGJldHdlZW4gcm93IGNsaWNrczsgY2h1bmsgc2l6ZSBpcyBob3cgbWFueSBzY3JhcGVkIGpvYnMgd2UgaW1wb3J0IHBlciBIVFRQIHJlcXVlc3QuXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmctcm93XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJudW1iZXItaW5wdXRcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlJvdyB0aHJvdHRsZSAobXMpXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIG1pbjogMTAwLCBtYXg6IDUwMDAsIHZhbHVlOiBzZXR0aW5ncy5zY3JhcGVUaHJvdHRsZU1zLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IE51bWJlci5wYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG5leHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2NyYXBlVGhyb3R0bGVNc1wiLCBNYXRoLm1heCgxMDAsIE1hdGgubWluKDUwMDAsIG5leHQpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJudW1iZXItaW5wdXRcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkltcG9ydCBjaHVuayBzaXplXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwibnVtYmVyXCIsIG1pbjogMSwgbWF4OiA1MCwgdmFsdWU6IHNldHRpbmdzLnNjcmFwZUNodW5rU2l6ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBOdW1iZXIucGFyc2VJbnQoZS50YXJnZXQudmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShuZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlU2V0dGluZ0NoYW5nZShcInNjcmFwZUNodW5rU2l6ZVwiLCBNYXRoLm1heCgxLCBNYXRoLm1pbig1MCwgbmV4dCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2V0dGluZy1yb3dcIiwgY2hpbGRyZW46IFtfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcIm51bWJlci1pbnB1dFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTWF4IGpvYnMgLyBzY3JhcGVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgbWluOiAxLCBtYXg6IDEwMDAsIHZhbHVlOiBzZXR0aW5ncy5zY3JhcGVNYXhKb2JzLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IE51bWJlci5wYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG5leHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2NyYXBlTWF4Sm9ic1wiLCBNYXRoLm1heCgxLCBNYXRoLm1pbigxMDAwLCBuZXh0KSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KV0gfSksIF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwibnVtYmVyLWlucHV0XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJNYXggcGFnZXMgLyBzY3JhcGVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJudW1iZXJcIiwgbWluOiAxLCBtYXg6IDIwMCwgdmFsdWU6IHNldHRpbmdzLnNjcmFwZU1heFBhZ2VzLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IE51bWJlci5wYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKG5leHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2NyYXBlTWF4UGFnZXNcIiwgTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAwLCBuZXh0KSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3Muc2NyYXBlRGVkdXBlRW5hYmxlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwic2NyYXBlRGVkdXBlRW5hYmxlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTa2lwIHBvc3RpbmdzIGFscmVhZHkgaW1wb3J0ZWRcIiB9KV0gfSksIF9qc3goXCJzbWFsbFwiLCB7IGNoaWxkcmVuOiBcIkFza3MgdGhlIEFQSSBmb3IgeW91ciBpbXBvcnRlZCBwb3N0aW5nIElEcyBiZWZvcmUgc2NyYXBpbmc7IHNraXBzIG1hdGNoaW5nIHJvd3Mgd2l0aG91dCBvcGVuaW5nIHRoZWlyIG1vZGFsLlwiIH0pXSB9KV0gfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIGNvbXBhY3QtY2FyZCBub3RpZmljYXRpb25zLWNhcmRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZWN0aW9uLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjaGlsZHJlbjogXCJOb3RpZmljYXRpb25zXCIgfSksIF9qc3goU2F2ZVN0YXR1c0JhZGdlLCB7IHN0YXR1czogc2V0dGluZ3NTdGF0dXMgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5nLWdyb3VwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJjaGVja2JveC1sYWJlbFwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogc2V0dGluZ3Mubm90aWZ5T25Kb2JEZXRlY3RlZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVTZXR0aW5nQ2hhbmdlKFwibm90aWZ5T25Kb2JEZXRlY3RlZFwiLCBlLnRhcmdldC5jaGVja2VkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTaG93IGJhZGdlIHdoZW4gam9iIGRldGVjdGVkXCIgfSldIH0pLCBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCJEaXNwbGF5IGEgYmFkZ2Ugb24gdGhlIGV4dGVuc2lvbiBpY29uIHdoZW4gYSBqb2IgbGlzdGluZyBpcyBmb3VuZFwiIH0pXSB9KV0gfSksIGxlYXJuZWRBbnN3ZXJzLmxlbmd0aCA+IDAgJiYgKF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJzZXR0aW5ncy1jYXJkIHNhdmVkLWFuc3dlcnMtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDJcIiwgeyBjaGlsZHJlbjogW1wiU2F2ZWQgQW5zd2VycyAoXCIsIGxlYXJuZWRBbnN3ZXJzLmxlbmd0aCwgXCIpXCJdIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuc3dlcnMtbGlzdFwiLCBjaGlsZHJlbjogbGVhcm5lZEFuc3dlcnMubWFwKChhbnN3ZXIpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhbnN3ZXItaXRlbVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2VyLXF1ZXN0aW9uXCIsIGNoaWxkcmVuOiBhbnN3ZXIucXVlc3Rpb24gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5zd2VyLXRleHRcIiwgY2hpbGRyZW46IGFuc3dlci5hbnN3ZXIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuc3dlci1tZXRhXCIsIGNoaWxkcmVuOiBbYW5zd2VyLnNvdXJjZUNvbXBhbnkgJiYgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogYW5zd2VyLnNvdXJjZUNvbXBhbnkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJVc2VkIFwiLCBhbnN3ZXIudGltZXNVc2VkLCBcInhcIl0gfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiZGVsZXRlLWJ0blwiLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVEZWxldGVBbnN3ZXIoYW5zd2VyLmlkKSwgY2hpbGRyZW46IFwiRGVsZXRlXCIgfSldIH0pXSB9LCBhbnN3ZXIuaWQpKSkgfSldIH0pKSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcInNldHRpbmdzLWNhcmQgYWJvdXQtY2FyZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNoaWxkcmVuOiBcIkFib3V0XCIgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJhYm91dFwiLCBjaGlsZHJlbjogW1wiU2xvdGhpbmcgQnJvd3NlciBFeHRlbnNpb24gdlwiLCBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb25dIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJhYm91dFwiLCBjaGlsZHJlbjogX2pzeChcImFcIiwgeyBocmVmOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9BTm9uQUJlbnRvL3Nsb3RoaW5nXCIsIHRhcmdldDogXCJfYmxhbmtcIiwgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiwgY2hpbGRyZW46IFwiVmlldyBvbiBHaXRIdWJcIiB9KSB9KV0gfSldIH0pKTtcbn1cbmZ1bmN0aW9uIFNhdmVTdGF0dXNCYWRnZSh7IHN0YXR1cyB9KSB7XG4gICAgaWYgKHN0YXR1cy5zdGF0ZSA9PT0gXCJpZGxlXCIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGxhYmVsID0gbGFiZWxGb3JTdGF0dXMoc3RhdHVzKTtcbiAgICByZXR1cm4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBgc2F2ZS1zdGF0dXMgc2F2ZS1zdGF0dXMtJHtzdGF0dXMuc3RhdGV9YCwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGxhYmVsIH0pKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCBPcHRpb25zQXBwIGZyb20gXCIuL0FwcFwiO1xuaW1wb3J0IFwiLi9zdHlsZXMuY3NzXCI7XG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIik7XG5pZiAoY29udGFpbmVyKSB7XG4gICAgY29uc3Qgcm9vdCA9IGNyZWF0ZVJvb3QoY29udGFpbmVyKTtcbiAgICByb290LnJlbmRlcihfanN4KFJlYWN0LlN0cmljdE1vZGUsIHsgY2hpbGRyZW46IF9qc3goT3B0aW9uc0FwcCwge30pIH0pKTtcbn1cbiIsIi8qKlxuICogVXNlci1mYWNpbmcgZXJyb3Igc3RyaW5nIG1hcHBpbmcgZm9yIHRoZSBTbG90aGluZyBleHRlbnNpb24uXG4gKlxuICogVGhlIHBvcHVwIChhbmQgYW55IG90aGVyIGV4dGVuc2lvbiBzdXJmYWNlKSBzaG91bGQgbmV2ZXIgc2hvdyByYXdcbiAqIGBcIlJlcXVlc3QgZmFpbGVkOiA1MDNcImAgLyBgXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCJgIHN0cmluZ3MuIFdyYXAgYW55XG4gKiBlcnJvciBwYXRoIGluIGBtZXNzYWdlRm9yRXJyb3IoZXJyKWAgdG8gZ2V0IGFuIEVuZ2xpc2ggc2VudGVuY2Ugc2FmZVxuICogZm9yIGVuZC11c2Vycy5cbiAqXG4gKiBNaXJyb3Igb2YgdGhlIG1lc3NhZ2UgdG9uZSB1c2VkIGJ5IGBhcHBzL3dlYi8uLi4vZXh0ZW5zaW9uL2Nvbm5lY3QvcGFnZS50c3hgXG4gKiBgbWVzc2FnZUZvclN0YXR1c2Ag4oCUIHRoZSBjb25uZWN0IHBhZ2Uga2VlcHMgaXRzIG93biBjb3B5IGJlY2F1c2UgaXQgc2l0c1xuICogaW5zaWRlIHRoZSBuZXh0LWludGwgdHJlZSAoZGlmZmVyZW50IHBhY2thZ2UgYm91bmRhcnkpLCBidXQgdGhlXG4gKiB1c2VyLXZpc2libGUgc3RyaW5ncyBzaG91bGQgc3RheSBhbGlnbmVkLiBJZiB5b3UgY2hhbmdlIG9uZSwgY2hhbmdlIGJvdGguXG4gKlxuICogRW5nbGlzaC1vbmx5IGJ5IGRlc2lnbjogdGhlIGV4dGVuc2lvbiBpdHNlbGYgZG9lcyBub3QgdXNlIG5leHQtaW50bC5cbiAqL1xuLyoqXG4gKiBNYXBzIGFuIEhUVFAgc3RhdHVzIGNvZGUgdG8gYSBodW1hbi1mcmllbmRseSBtZXNzYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZUZvclN0YXR1cyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSA0MDEgfHwgc3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgcmV0dXJuIFwiU2lnbiBpbiBleHBpcmVkLiBSZWNvbm5lY3QgdGhlIGV4dGVuc2lvbi5cIjtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgIHJldHVybiBcIldlJ3JlIHJhdGUtbGltaXRlZC4gVHJ5IGFnYWluIGluIGEgbWludXRlLlwiO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID49IDUwMCkge1xuICAgICAgICByZXR1cm4gXCJTbG90aGluZyBzZXJ2ZXJzIGFyZSBoYXZpbmcgYSBwcm9ibGVtLlwiO1xuICAgIH1cbiAgICByZXR1cm4gXCJTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXRyeUV4aGF1c3RlZE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIFwiU2xvdGhpbmcgaXMgc3RpbGwgbm90IHJlc3BvbmRpbmcgYWZ0ZXIgcmV0cnlpbmcuIFRyeSBhZ2FpbiBpbiBhIG1pbnV0ZS5cIjtcbn1cbi8qKlxuICogQmVzdC1lZmZvcnQgbWFwcGluZyBvZiBhbiB1bmtub3duIHRocm93biB2YWx1ZSB0byBhIGh1bWFuLWZyaWVuZGx5XG4gKiBtZXNzYWdlLiBSZWNvZ25pc2VzIHRoZSBzcGVjaWZpYyBwaHJhc2VzIHRoZSBhcGktY2xpZW50IHRocm93cyB0b2RheVxuICogKGBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcImAsIGBcIk5vdCBhdXRoZW50aWNhdGVkXCJgLCBgXCJSZXF1ZXN0IGZhaWxlZDogPGNvZGU+XCJgLFxuICogYFwiRmFpbGVkIHRvIGZldGNoXCJgKSBhbmQgZmFsbHMgYmFjayB0byB0aGUgb3JpZ2luYWwgbWVzc2FnZSBmb3IgYW55dGhpbmdcbiAqIGVsc2Ug4oCUIHRoYXQncyBhbG1vc3QgYWx3YXlzIG1vcmUgdXNlZnVsIHRoYW4gYSBnZW5lcmljIGNhdGNoLWFsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VGb3JFcnJvcihlcnIpIHtcbiAgICAvLyBHZW5lcmljIG5ldHdvcmsgZmFpbHVyZSAoZmV0Y2ggaW4gc2VydmljZSB3b3JrZXJzIHRocm93cyBUeXBlRXJyb3IgaGVyZSlcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgVHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBcIk5ldHdvcmsgZXJyb3IuIENoZWNrIHlvdXIgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluLlwiO1xuICAgIH1cbiAgICBjb25zdCByYXcgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJcIjtcbiAgICBpZiAoIXJhdylcbiAgICAgICAgcmV0dXJuIFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG4gICAgLy8gQXV0aC1zaGFwZWQgbWVzc2FnZXMgZnJvbSBTbG90aGluZ0FQSUNsaWVudC5cbiAgICBpZiAocmF3ID09PSBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcIiB8fFxuICAgICAgICByYXcgPT09IFwiTm90IGF1dGhlbnRpY2F0ZWRcIiB8fFxuICAgICAgICAvdW5hdXRob3IvaS50ZXN0KHJhdykpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JTdGF0dXMoNDAxKTtcbiAgICB9XG4gICAgLy8gYFJlcXVlc3QgZmFpbGVkOiA1MDNgIOKAlCByZWNvdmVyIHRoZSBzdGF0dXMgY29kZS5cbiAgICBjb25zdCBtYXRjaCA9IHJhdy5tYXRjaCgvUmVxdWVzdCBmYWlsZWQ6XFxzKihcXGR7M30pLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBOdW1iZXIobWF0Y2hbMV0pO1xuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKGNvZGUpKVxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JTdGF0dXMoY29kZSk7XG4gICAgfVxuICAgIGNvbnN0IHJldHJ5TWF0Y2ggPSByYXcubWF0Y2goL1JlcXVlc3Qgc3RpbGwgZmFpbGluZyBhZnRlciByZXRyeTpcXHMqKFxcZHszfSkvKTtcbiAgICBpZiAocmV0cnlNYXRjaCkge1xuICAgICAgICByZXR1cm4gcmV0cnlFeGhhdXN0ZWRNZXNzYWdlKCk7XG4gICAgfVxuICAgIC8vIEJyb3dzZXIgZmV0Y2ggZmFpbHVyZXMgYnViYmxlIHVwIGFzIFwiRmFpbGVkIHRvIGZldGNoXCIuXG4gICAgaWYgKC9mYWlsZWQgdG8gZmV0Y2gvaS50ZXN0KHJhdykgfHwgL25ldHdvcmsvaS50ZXN0KHJhdykpIHtcbiAgICAgICAgcmV0dXJuIFwiTmV0d29yayBlcnJvci4gQ2hlY2sgeW91ciBjb25uZWN0aW9uIGFuZCB0cnkgYWdhaW4uXCI7XG4gICAgfVxuICAgIC8vIEZvciBhbnl0aGluZyBlbHNlLCB0aGUgdW5kZXJseWluZyBtZXNzYWdlIGlzIHVzdWFsbHkgYSBzZW50ZW5jZSBhbHJlYWR5XG4gICAgLy8gKGUuZy4gXCJDb3VsZG4ndCByZWFkIHRoZSBmdWxsIGpvYiBkZXNjcmlwdGlvbiBmcm9tIHRoaXMgcGFnZS5cIikuXG4gICAgcmV0dXJuIHJhdztcbn1cbiIsIi8qKlxuICogUDQvIzQwIOKAlCBMb25nLWxpdmVkIHBvcnQgbmFtZSB1c2VkIGJ5IHRoZSBpbmxpbmUgQUkgYXNzaXN0YW50LiBUaGUgY29udGVudFxuICogc2NyaXB0IGNhbGxzIGBjaHJvbWUucnVudGltZS5jb25uZWN0KHsgbmFtZTogQ0hBVF9QT1JUX05BTUUgfSlgIGFuZCB0aGVcbiAqIGJhY2tncm91bmQncyBgY2hyb21lLnJ1bnRpbWUub25Db25uZWN0YCBsaXN0ZW5lciBmaWx0ZXJzIGJ5IHRoaXMgbmFtZS5cbiAqL1xuZXhwb3J0IGNvbnN0IENIQVRfUE9SVF9OQU1FID0gXCJzbG90aGluZy1jaGF0LXN0cmVhbVwiO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XG4gICAgYXV0b0ZpbGxFbmFibGVkOiB0cnVlLFxuICAgIHNob3dDb25maWRlbmNlSW5kaWNhdG9yczogdHJ1ZSxcbiAgICBtaW5pbXVtQ29uZmlkZW5jZTogMC41LFxuICAgIGxlYXJuRnJvbUFuc3dlcnM6IHRydWUsXG4gICAgbm90aWZ5T25Kb2JEZXRlY3RlZDogdHJ1ZSxcbiAgICBhdXRvVHJhY2tBcHBsaWNhdGlvbnNFbmFibGVkOiB0cnVlLFxuICAgIGNhcHR1cmVTY3JlZW5zaG90RW5hYmxlZDogZmFsc2UsXG4gICAgc2NyYXBlVGhyb3R0bGVNczogNTAwLFxuICAgIHNjcmFwZUNodW5rU2l6ZTogNSxcbiAgICBzY3JhcGVNYXhKb2JzOiAyMDAsXG4gICAgc2NyYXBlTWF4UGFnZXM6IDUwLFxuICAgIHNjcmFwZURlZHVwZUVuYWJsZWQ6IHRydWUsXG59O1xuZXhwb3J0IGNvbnN0IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVBJX0JBU0VfVVJMID0gcHJvY2Vzcy5lbnYuU0xPVEhJTkdfRVhURU5TSU9OX0FQSV9CQVNFX1VSTCB8fCBcImh0dHBzOi8vc2xvdGhpbmcud29ya1wiO1xuZXhwb3J0IGNvbnN0IFNIT1VMRF9QUk9NT1RFX0xFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkwgPSBERUZBVUxUX0FQSV9CQVNFX1VSTCAhPT0gTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==