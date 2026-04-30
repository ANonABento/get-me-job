/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/shared/types.ts
// Shared types for Columbus extension
const DEFAULT_SETTINGS = {
    autoFillEnabled: true,
    showConfidenceIndicators: true,
    minimumConfidence: 0.5,
    learnFromAnswers: true,
    autoDetectPrompts: true,
    notifyOnJobDetected: true,
    showSalaryOverlay: true,
    enableJobScraping: true,
    enabledScraperSources: ['linkedin', 'indeed', 'greenhouse', 'lever', 'waterlooworks', 'unknown'],
};
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

;// ./src/background/storage.ts
// Extension storage utilities

const STORAGE_KEY = 'columbus_extension';
function mergeSettingsWithDefaults(settings) {
    return {
        ...DEFAULT_SETTINGS,
        ...settings,
    };
}
async function getStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const stored = result[STORAGE_KEY];
            resolve({
                apiBaseUrl: DEFAULT_API_BASE_URL,
                ...stored,
                settings: mergeSettingsWithDefaults(stored?.settings),
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
async function setAuthToken(token, expiresAt) {
    await setStorage({
        authToken: token,
        tokenExpiry: expiresAt,
    });
}
async function clearAuthToken() {
    await setStorage({
        authToken: undefined,
        tokenExpiry: undefined,
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
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
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
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
    const updated = mergeSettingsWithDefaults({ ...storage.settings, ...updates });
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

;// ./src/background/api-client.ts
// Columbus API client for extension

class ColumbusAPIClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }
    async getAuthToken() {
        const storage = await getStorage();
        if (!storage.authToken)
            return null;
        // Check expiry
        if (storage.tokenExpiry) {
            const expiry = new Date(storage.tokenExpiry);
            if (expiry < new Date()) {
                // Token expired, clear it
                await setStorage({ authToken: undefined, tokenExpiry: undefined });
                return null;
            }
        }
        return storage.authToken;
    }
    async authenticatedFetch(path, options = {}) {
        const token = await this.getAuthToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Token': token,
                ...options.headers,
            },
        });
        if (!response.ok) {
            if (response.status === 401) {
                // Clear invalid token
                await setStorage({ authToken: undefined, tokenExpiry: undefined });
                throw new Error('Authentication expired');
            }
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `Request failed: ${response.status}`);
        }
        return response.json();
    }
    async isAuthenticated() {
        const token = await this.getAuthToken();
        if (!token)
            return false;
        try {
            await this.authenticatedFetch('/api/extension/auth/verify');
            return true;
        }
        catch {
            return false;
        }
    }
    async getProfile() {
        return this.authenticatedFetch('/api/extension/profile');
    }
    async importJob(job) {
        return this.authenticatedFetch('/api/opportunities/from-extension', {
            method: 'POST',
            body: JSON.stringify({
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                responsibilities: job.responsibilities || [],
                keywords: job.keywords || [],
                type: job.type,
                remote: job.remote,
                salary: job.salary,
                url: job.url,
                source: job.source,
                sourceJobId: job.sourceJobId,
                postedAt: job.postedAt,
                deadline: job.deadline,
            }),
        });
    }
    async importJobsBatch(jobs) {
        return this.authenticatedFetch('/api/opportunities/from-extension', {
            method: 'POST',
            body: JSON.stringify({ jobs }),
        });
    }
    async saveLearnedAnswer(data) {
        return this.authenticatedFetch('/api/extension/learned-answers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async searchSimilarAnswers(question) {
        const response = await this.authenticatedFetch('/api/extension/learned-answers/search', {
            method: 'POST',
            body: JSON.stringify({ question }),
        });
        return response.results;
    }
    async getLearnedAnswers() {
        const response = await this.authenticatedFetch('/api/extension/learned-answers');
        return response.answers;
    }
    async deleteLearnedAnswer(id) {
        await this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
            method: 'DELETE',
        });
    }
    async updateLearnedAnswer(id, answer) {
        return this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ answer }),
        });
    }
}
// Singleton instance
let client = null;
async function getAPIClient() {
    if (!client) {
        const storage = await getStorage();
        client = new ColumbusAPIClient(storage.apiBaseUrl);
    }
    return client;
}
function resetAPIClient() {
    client = null;
}

;// ./src/background/index.ts
// Background service worker for Columbus extension


// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
        .then(sendResponse)
        .catch((error) => {
        console.error('[Columbus] Message handler error:', error);
        sendResponse({ success: false, error: error.message });
    });
    // Return true to indicate async response
    return true;
});
async function handleMessage(message, sender) {
    switch (message.type) {
        case 'GET_AUTH_STATUS':
            return handleGetAuthStatus();
        case 'OPEN_AUTH':
            return handleOpenAuth();
        case 'LOGOUT':
            return handleLogout();
        case 'GET_PROFILE':
            return handleGetProfile();
        case 'IMPORT_JOB':
            return handleImportJob(message.payload);
        case 'IMPORT_JOBS_BATCH':
            return handleImportJobsBatch(message.payload);
        case 'SAVE_ANSWER':
            return handleSaveAnswer(message.payload);
        case 'SEARCH_ANSWERS':
            return handleSearchAnswers(message.payload);
        case 'GET_LEARNED_ANSWERS':
            return handleGetLearnedAnswers();
        case 'DELETE_ANSWER':
            return handleDeleteAnswer(message.payload);
        default:
            return { success: false, error: `Unknown message type: ${message.type}` };
    }
}
async function handleGetAuthStatus() {
    try {
        const client = await getAPIClient();
        const isAuthenticated = await client.isAuthenticated();
        const apiBaseUrl = await getApiBaseUrl();
        return {
            success: true,
            data: { isAuthenticated, apiBaseUrl },
        };
    }
    catch (error) {
        return {
            success: true,
            data: { isAuthenticated: false, apiBaseUrl: await getApiBaseUrl() },
        };
    }
}
async function handleOpenAuth() {
    try {
        const apiBaseUrl = await getApiBaseUrl();
        const authUrl = `${apiBaseUrl}/extension/connect`;
        // Open auth page in new tab
        await chrome.tabs.create({ url: authUrl });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleLogout() {
    try {
        await clearAuthToken();
        resetAPIClient();
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetProfile() {
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
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleImportJob(job) {
    try {
        const client = await getAPIClient();
        const result = await client.importJob(job);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleImportJobsBatch(jobs) {
    try {
        const client = await getAPIClient();
        const result = await client.importJobsBatch(jobs);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleSaveAnswer(data) {
    try {
        const client = await getAPIClient();
        const result = await client.saveLearnedAnswer({
            question: data.question,
            answer: data.answer,
            sourceUrl: data.url,
            sourceCompany: data.company,
        });
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleSearchAnswers(question) {
    try {
        const client = await getAPIClient();
        const results = await client.searchSimilarAnswers(question);
        return { success: true, data: results };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetLearnedAnswers() {
    try {
        const client = await getAPIClient();
        const answers = await client.getLearnedAnswers();
        return { success: true, data: answers };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleDeleteAnswer(id) {
    try {
        const client = await getAPIClient();
        await client.deleteLearnedAnswer(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
// Handle auth callback from Columbus web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_CALLBACK' && message.token && message.expiresAt) {
        setAuthToken(message.token, message.expiresAt)
            .then(() => {
            resetAPIClient();
            sendResponse({ success: true });
        })
            .catch((error) => {
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
});
// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id)
        return;
    switch (command) {
        case 'fill-form':
            chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_FILL' });
            break;
        case 'import-job':
            chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_IMPORT' });
            break;
    }
});
// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[Columbus] Extension installed');
        // Could open onboarding page here
    }
    else if (details.reason === 'update') {
        console.log('[Columbus] Extension updated to', chrome.runtime.getManifest().version);
    }
});
console.log('[Columbus] Background service worker started');

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsWUFBWTtBQUN6QztBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLFlBQVk7QUFDekM7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixZQUFZO0FBQ3pDO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsWUFBWTtBQUNwQjtBQUNBLFlBQVksY0FBYztBQUMxQiwyQkFBMkIsZUFBZTtBQUMxQyxTQUFTO0FBQ1Q7QUFDQSwyQkFBMkIsc0NBQXNDO0FBQ2pFLFNBQVM7QUFDVDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSw0Q0FBNEMsbUNBQW1DO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLHNCQUFzQjtBQUNwRTtBQUNBO0FBQ0EsOENBQThDLHdCQUF3QjtBQUN0RTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9zaGFyZWQvdHlwZXMudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvc3RvcmFnZS50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9hcGktY2xpZW50LnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNoYXJlZCB0eXBlcyBmb3IgQ29sdW1idXMgZXh0ZW5zaW9uXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgICBhdXRvRmlsbEVuYWJsZWQ6IHRydWUsXG4gICAgc2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzOiB0cnVlLFxuICAgIG1pbmltdW1Db25maWRlbmNlOiAwLjUsXG4gICAgbGVhcm5Gcm9tQW5zd2VyczogdHJ1ZSxcbiAgICBhdXRvRGV0ZWN0UHJvbXB0czogdHJ1ZSxcbiAgICBub3RpZnlPbkpvYkRldGVjdGVkOiB0cnVlLFxuICAgIHNob3dTYWxhcnlPdmVybGF5OiB0cnVlLFxuICAgIGVuYWJsZUpvYlNjcmFwaW5nOiB0cnVlLFxuICAgIGVuYWJsZWRTY3JhcGVyU291cmNlczogWydsaW5rZWRpbicsICdpbmRlZWQnLCAnZ3JlZW5ob3VzZScsICdsZXZlcicsICd3YXRlcmxvb3dvcmtzJywgJ3Vua25vd24nXSxcbn07XG5leHBvcnQgY29uc3QgREVGQVVMVF9BUElfQkFTRV9VUkwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcbiIsIi8vIEV4dGVuc2lvbiBzdG9yYWdlIHV0aWxpdGllc1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9BUElfQkFTRV9VUkwgfSBmcm9tICdAL3NoYXJlZC90eXBlcyc7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdjb2x1bWJ1c19leHRlbnNpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU2V0dGluZ3NXaXRoRGVmYXVsdHMoc2V0dGluZ3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5ERUZBVUxUX1NFVFRJTkdTLFxuICAgICAgICAuLi5zZXR0aW5ncyxcbiAgICB9O1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0W1NUT1JBR0VfS0VZXTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGFwaUJhc2VVcmw6IERFRkFVTFRfQVBJX0JBU0VfVVJMLFxuICAgICAgICAgICAgICAgIC4uLnN0b3JlZCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogbWVyZ2VTZXR0aW5nc1dpdGhEZWZhdWx0cyhzdG9yZWQ/LnNldHRpbmdzKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTdG9yYWdlKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLmN1cnJlbnQsIC4uLnVwZGF0ZXMgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogdXBkYXRlZCB9LCByZXNvbHZlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShTVE9SQUdFX0tFWSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG4vLyBBdXRoIHRva2VuIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBdXRoVG9rZW4odG9rZW4sIGV4cGlyZXNBdCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHRva2VuLFxuICAgICAgICB0b2tlbkV4cGlyeTogZXhwaXJlc0F0LFxuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQXV0aFRva2VuKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdXRoVG9rZW4oKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBDaGVjayBleHBpcnlcbiAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICBjb25zdCBleHBpcnkgPSBuZXcgRGF0ZShzdG9yYWdlLnRva2VuRXhwaXJ5KTtcbiAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG59XG4vLyBQcm9maWxlIGNhY2hlIGhlbHBlcnNcbmNvbnN0IFBST0ZJTEVfQ0FDSEVfVFRMID0gNSAqIDYwICogMTAwMDsgLy8gNSBtaW51dGVzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkUHJvZmlsZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5jYWNoZWRQcm9maWxlIHx8ICFzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkQXQgPSBuZXcgRGF0ZShzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCk7XG4gICAgaWYgKERhdGUubm93KCkgLSBjYWNoZWRBdC5nZXRUaW1lKCkgPiBQUk9GSUxFX0NBQ0hFX1RUTCkge1xuICAgICAgICByZXR1cm4gbnVsbDsgLy8gQ2FjaGUgZXhwaXJlZFxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5jYWNoZWRQcm9maWxlO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiBwcm9maWxlLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckNhY2hlZFByb2ZpbGUoKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG4vLyBTZXR0aW5ncyBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5zZXR0aW5ncztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyh1cGRhdGVzKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0gbWVyZ2VTZXR0aW5nc1dpdGhEZWZhdWx0cyh7IC4uLnN0b3JhZ2Uuc2V0dGluZ3MsIC4uLnVwZGF0ZXMgfSk7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IHNldHRpbmdzOiB1cGRhdGVkIH0pO1xuICAgIHJldHVybiB1cGRhdGVkO1xufVxuLy8gQVBJIFVSTCBoZWxwZXJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBcGlCYXNlVXJsKHVybCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhcGlCYXNlVXJsOiB1cmwgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpQmFzZVVybCgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLmFwaUJhc2VVcmw7XG59XG4iLCIvLyBDb2x1bWJ1cyBBUEkgY2xpZW50IGZvciBleHRlbnNpb25cbmltcG9ydCB7IGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuZXhwb3J0IGNsYXNzIENvbHVtYnVzQVBJQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcihiYXNlVXJsKSB7XG4gICAgICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICB9XG4gICAgYXN5bmMgZ2V0QXV0aFRva2VuKCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIENoZWNrIGV4cGlyeVxuICAgICAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoc3RvcmFnZS50b2tlbkV4cGlyeSk7XG4gICAgICAgICAgICBpZiAoZXhwaXJ5IDwgbmV3IERhdGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRva2VuIGV4cGlyZWQsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U3RvcmFnZSh7IGF1dGhUb2tlbjogdW5kZWZpbmVkLCB0b2tlbkV4cGlyeTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdG9yYWdlLmF1dGhUb2tlbjtcbiAgICB9XG4gICAgYXN5bmMgYXV0aGVudGljYXRlZEZldGNoKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuZ2V0QXV0aFRva2VuKCk7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGF1dGhlbnRpY2F0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0ke3BhdGh9YCwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdYLUV4dGVuc2lvbi1Ub2tlbic6IHRva2VuLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAvLyBDbGVhciBpbnZhbGlkIHRva2VuXG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U3RvcmFnZSh7IGF1dGhUb2tlbjogdW5kZWZpbmVkLCB0b2tlbkV4cGlyeTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXV0aGVudGljYXRpb24gZXhwaXJlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHsgZXJyb3I6ICdSZXF1ZXN0IGZhaWxlZCcgfSkpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmVycm9yIHx8IGBSZXF1ZXN0IGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9XG4gICAgYXN5bmMgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuZ2V0QXV0aFRva2VuKCk7XG4gICAgICAgIGlmICghdG9rZW4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vYXV0aC92ZXJpZnknKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBnZXRQcm9maWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL3Byb2ZpbGUnKTtcbiAgICB9XG4gICAgYXN5bmMgaW1wb3J0Sm9iKGpvYikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvb3Bwb3J0dW5pdGllcy9mcm9tLWV4dGVuc2lvbicsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBqb2IudGl0bGUsXG4gICAgICAgICAgICAgICAgY29tcGFueTogam9iLmNvbXBhbnksXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IGpvYi5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogam9iLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogam9iLnJlcXVpcmVtZW50cyxcbiAgICAgICAgICAgICAgICByZXNwb25zaWJpbGl0aWVzOiBqb2IucmVzcG9uc2liaWxpdGllcyB8fCBbXSxcbiAgICAgICAgICAgICAgICBrZXl3b3Jkczogam9iLmtleXdvcmRzIHx8IFtdLFxuICAgICAgICAgICAgICAgIHR5cGU6IGpvYi50eXBlLFxuICAgICAgICAgICAgICAgIHJlbW90ZTogam9iLnJlbW90ZSxcbiAgICAgICAgICAgICAgICBzYWxhcnk6IGpvYi5zYWxhcnksXG4gICAgICAgICAgICAgICAgdXJsOiBqb2IudXJsLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogam9iLnNvdXJjZSxcbiAgICAgICAgICAgICAgICBzb3VyY2VKb2JJZDogam9iLnNvdXJjZUpvYklkLFxuICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBqb2IucG9zdGVkQXQsXG4gICAgICAgICAgICAgICAgZGVhZGxpbmU6IGpvYi5kZWFkbGluZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgaW1wb3J0Sm9ic0JhdGNoKGpvYnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL29wcG9ydHVuaXRpZXMvZnJvbS1leHRlbnNpb24nLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgam9icyB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHNhdmVMZWFybmVkQW5zd2VyKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9sZWFybmVkLWFuc3dlcnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgc2VhcmNoU2ltaWxhckFuc3dlcnMocXVlc3Rpb24pIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzL3NlYXJjaCcsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBxdWVzdGlvbiB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHRzO1xuICAgIH1cbiAgICBhc3luYyBnZXRMZWFybmVkQW5zd2VycygpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzJyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hbnN3ZXJzO1xuICAgIH1cbiAgICBhc3luYyBkZWxldGVMZWFybmVkQW5zd2VyKGlkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYXV0aGVudGljYXRlZEZldGNoKGAvYXBpL2V4dGVuc2lvbi9sZWFybmVkLWFuc3dlcnMvJHtpZH1gLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgdXBkYXRlTGVhcm5lZEFuc3dlcihpZCwgYW5zd2VyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChgL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzLyR7aWR9YCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBhbnN3ZXIgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxubGV0IGNsaWVudCA9IG51bGw7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QVBJQ2xpZW50KCkge1xuICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgICAgIGNsaWVudCA9IG5ldyBDb2x1bWJ1c0FQSUNsaWVudChzdG9yYWdlLmFwaUJhc2VVcmwpO1xuICAgIH1cbiAgICByZXR1cm4gY2xpZW50O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0QVBJQ2xpZW50KCkge1xuICAgIGNsaWVudCA9IG51bGw7XG59XG4iLCIvLyBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBDb2x1bWJ1cyBleHRlbnNpb25cbmltcG9ydCB7IGdldEFQSUNsaWVudCwgcmVzZXRBUElDbGllbnQgfSBmcm9tICcuL2FwaS1jbGllbnQnO1xuaW1wb3J0IHsgc2V0QXV0aFRva2VuLCBjbGVhckF1dGhUb2tlbiwgZ2V0Q2FjaGVkUHJvZmlsZSwgc2V0Q2FjaGVkUHJvZmlsZSwgZ2V0QXBpQmFzZVVybCwgfSBmcm9tICcuL3N0b3JhZ2UnO1xuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKVxuICAgICAgICAudGhlbihzZW5kUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBNZXNzYWdlIGhhbmRsZXIgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgfSk7XG4gICAgLy8gUmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYXN5bmMgcmVzcG9uc2VcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICBjYXNlICdHRVRfQVVUSF9TVEFUVVMnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldEF1dGhTdGF0dXMoKTtcbiAgICAgICAgY2FzZSAnT1BFTl9BVVRIJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcGVuQXV0aCgpO1xuICAgICAgICBjYXNlICdMT0dPVVQnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUxvZ291dCgpO1xuICAgICAgICBjYXNlICdHRVRfUFJPRklMRSc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlR2V0UHJvZmlsZSgpO1xuICAgICAgICBjYXNlICdJTVBPUlRfSk9CJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVJbXBvcnRKb2IobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnSU1QT1JUX0pPQlNfQkFUQ0gnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUltcG9ydEpvYnNCYXRjaChtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTQVZFX0FOU1dFUic6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2F2ZUFuc3dlcihtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTRUFSQ0hfQU5TV0VSUyc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2VhcmNoQW5zd2VycyhtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdHRVRfTEVBUk5FRF9BTlNXRVJTJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVHZXRMZWFybmVkQW5zd2VycygpO1xuICAgICAgICBjYXNlICdERUxFVEVfQU5TV0VSJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVEZWxldGVBbnN3ZXIobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVua25vd24gbWVzc2FnZSB0eXBlOiAke21lc3NhZ2UudHlwZX1gIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QXV0aFN0YXR1cygpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgaXNBdXRoZW50aWNhdGVkID0gYXdhaXQgY2xpZW50LmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gYXdhaXQgZ2V0QXBpQmFzZVVybCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHsgaXNBdXRoZW50aWNhdGVkLCBhcGlCYXNlVXJsIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHsgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSwgYXBpQmFzZVVybDogYXdhaXQgZ2V0QXBpQmFzZVVybCgpIH0sXG4gICAgICAgIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlT3BlbkF1dGgoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IGF3YWl0IGdldEFwaUJhc2VVcmwoKTtcbiAgICAgICAgY29uc3QgYXV0aFVybCA9IGAke2FwaUJhc2VVcmx9L2V4dGVuc2lvbi9jb25uZWN0YDtcbiAgICAgICAgLy8gT3BlbiBhdXRoIHBhZ2UgaW4gbmV3IHRhYlxuICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGF1dGhVcmwgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvZ291dCgpIHtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBjbGVhckF1dGhUb2tlbigpO1xuICAgICAgICByZXNldEFQSUNsaWVudCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRQcm9maWxlKCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGNvbnN0IGNhY2hlZCA9IGF3YWl0IGdldENhY2hlZFByb2ZpbGUoKTtcbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogY2FjaGVkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gRmV0Y2ggZnJvbSBBUElcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBjbGllbnQuZ2V0UHJvZmlsZSgpO1xuICAgICAgICAvLyBDYWNoZSB0aGUgcHJvZmlsZVxuICAgICAgICBhd2FpdCBzZXRDYWNoZWRQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBwcm9maWxlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRKb2Ioam9iKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5pbXBvcnRKb2Ioam9iKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVJbXBvcnRKb2JzQmF0Y2goam9icykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuaW1wb3J0Sm9ic0JhdGNoKGpvYnMpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNhdmVBbnN3ZXIoZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuc2F2ZUxlYXJuZWRBbnN3ZXIoe1xuICAgICAgICAgICAgcXVlc3Rpb246IGRhdGEucXVlc3Rpb24sXG4gICAgICAgICAgICBhbnN3ZXI6IGRhdGEuYW5zd2VyLFxuICAgICAgICAgICAgc291cmNlVXJsOiBkYXRhLnVybCxcbiAgICAgICAgICAgIHNvdXJjZUNvbXBhbnk6IGRhdGEuY29tcGFueSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VhcmNoQW5zd2VycyhxdWVzdGlvbikge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgY2xpZW50LnNlYXJjaFNpbWlsYXJBbnN3ZXJzKHF1ZXN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0cyB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0TGVhcm5lZEFuc3dlcnMoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IGFuc3dlcnMgPSBhd2FpdCBjbGllbnQuZ2V0TGVhcm5lZEFuc3dlcnMoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYW5zd2VycyB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGVsZXRlQW5zd2VyKGlkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGF3YWl0IGNsaWVudC5kZWxldGVMZWFybmVkQW5zd2VyKGlkKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuLy8gSGFuZGxlIGF1dGggY2FsbGJhY2sgZnJvbSBDb2x1bWJ1cyB3ZWIgYXBwXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBpZiAobWVzc2FnZS50eXBlID09PSAnQVVUSF9DQUxMQkFDSycgJiYgbWVzc2FnZS50b2tlbiAmJiBtZXNzYWdlLmV4cGlyZXNBdCkge1xuICAgICAgICBzZXRBdXRoVG9rZW4obWVzc2FnZS50b2tlbiwgbWVzc2FnZS5leHBpcmVzQXQpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXNldEFQSUNsaWVudCgpO1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn0pO1xuLy8gSGFuZGxlIGtleWJvYXJkIHNob3J0Y3V0c1xuY2hyb21lLmNvbW1hbmRzLm9uQ29tbWFuZC5hZGRMaXN0ZW5lcihhc3luYyAoY29tbWFuZCkgPT4ge1xuICAgIGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XG4gICAgaWYgKCF0YWI/LmlkKVxuICAgICAgICByZXR1cm47XG4gICAgc3dpdGNoIChjb21tYW5kKSB7XG4gICAgICAgIGNhc2UgJ2ZpbGwtZm9ybSc6XG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHsgdHlwZTogJ1RSSUdHRVJfRklMTCcgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaW1wb3J0LWpvYic6XG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHsgdHlwZTogJ1RSSUdHRVJfSU1QT1JUJyB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn0pO1xuLy8gSGFuZGxlIGV4dGVuc2lvbiBpbnN0YWxsL3VwZGF0ZVxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKGRldGFpbHMpID0+IHtcbiAgICBpZiAoZGV0YWlscy5yZWFzb24gPT09ICdpbnN0YWxsJykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBFeHRlbnNpb24gaW5zdGFsbGVkJyk7XG4gICAgICAgIC8vIENvdWxkIG9wZW4gb25ib2FyZGluZyBwYWdlIGhlcmVcbiAgICB9XG4gICAgZWxzZSBpZiAoZGV0YWlscy5yZWFzb24gPT09ICd1cGRhdGUnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEV4dGVuc2lvbiB1cGRhdGVkIHRvJywgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcbiAgICB9XG59KTtcbmNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgc3RhcnRlZCcpO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==