/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/shared/types.ts
// Shared types for Columbus extension
const DEFAULT_SETTINGS = {
    autoFillEnabled: true,
    showConfidenceIndicators: true,
    minimumConfidence: 0.5,
    learnFromAnswers: true,
    notifyOnJobDetected: true,
};
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

;// ./src/background/storage.ts
// Extension storage utilities

const STORAGE_KEY = 'columbus_extension';
async function getStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const stored = result[STORAGE_KEY];
            resolve({
                apiBaseUrl: DEFAULT_API_BASE_URL,
                settings: DEFAULT_SETTINGS,
                ...stored,
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

;// ./src/background/badge.ts

const BADGE_TEXT = '!';
const BADGE_COLOR = '#3b82f6';
const BADGE_TITLE = 'Job detected — press Cmd+Shift+I to import';
async function setBadgeForTab(tabId) {
    const settings = await getSettings();
    if (!settings.notifyOnJobDetected)
        return;
    await Promise.all([
        chrome.action.setBadgeText({ text: BADGE_TEXT, tabId }),
        chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId }),
        chrome.action.setTitle({ title: BADGE_TITLE, tabId }),
    ]);
}
async function clearBadgeForTab(tabId) {
    await Promise.all([
        chrome.action.setBadgeText({ text: '', tabId }),
        chrome.action.setTitle({ title: '', tabId }),
    ]);
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
        case 'JOB_DETECTED': {
            const tabId = sender.tab?.id;
            if (!tabId)
                return { success: false, error: 'No tab ID in sender' };
            await setBadgeForTab(tabId);
            return { success: true };
        }
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
// Clear badge when a tab navigates to a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading' && changeInfo.url) {
        clearBadgeForTab(tabId).catch(() => { });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZC90eXBlcy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9zdG9yYWdlLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL2FwaS1jbGllbnQudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvYmFkZ2UudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU2hhcmVkIHR5cGVzIGZvciBDb2x1bWJ1cyBleHRlbnNpb25cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGF1dG9GaWxsRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93Q29uZmlkZW5jZUluZGljYXRvcnM6IHRydWUsXG4gICAgbWluaW11bUNvbmZpZGVuY2U6IDAuNSxcbiAgICBsZWFybkZyb21BbnN3ZXJzOiB0cnVlLFxuICAgIG5vdGlmeU9uSm9iRGV0ZWN0ZWQ6IHRydWUsXG59O1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVBJX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG4iLCIvLyBFeHRlbnNpb24gc3RvcmFnZSB1dGlsaXRpZXNcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERFRkFVTFRfQVBJX0JBU0VfVVJMIH0gZnJvbSAnQC9zaGFyZWQvdHlwZXMnO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAnY29sdW1idXNfZXh0ZW5zaW9uJztcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IHJlc3VsdFtTVE9SQUdFX0tFWV07XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBhcGlCYXNlVXJsOiBERUZBVUxUX0FQSV9CQVNFX1VSTCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogREVGQVVMVF9TRVRUSU5HUyxcbiAgICAgICAgICAgICAgICAuLi5zdG9yZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmFnZSh1cGRhdGVzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5jdXJyZW50LCAuLi51cGRhdGVzIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtTVE9SQUdFX0tFWV06IHVwZGF0ZWQgfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoU1RPUkFHRV9LRVksIHJlc29sdmUpO1xuICAgIH0pO1xufVxuLy8gQXV0aCB0b2tlbiBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXV0aFRva2VuKHRva2VuLCBleHBpcmVzQXQpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB0b2tlbixcbiAgICAgICAgdG9rZW5FeHBpcnk6IGV4cGlyZXNBdCxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckF1dGhUb2tlbigpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgIHRva2VuRXhwaXJ5OiB1bmRlZmluZWQsXG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXV0aFRva2VuKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gQ2hlY2sgZXhwaXJ5XG4gICAgaWYgKHN0b3JhZ2UudG9rZW5FeHBpcnkpIHtcbiAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoc3RvcmFnZS50b2tlbkV4cGlyeSk7XG4gICAgICAgIGlmIChleHBpcnkgPCBuZXcgRGF0ZSgpKSB7XG4gICAgICAgICAgICBhd2FpdCBjbGVhckF1dGhUb2tlbigpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuYXV0aFRva2VuO1xufVxuLy8gUHJvZmlsZSBjYWNoZSBoZWxwZXJzXG5jb25zdCBQUk9GSUxFX0NBQ0hFX1RUTCA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhY2hlZFByb2ZpbGUoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuY2FjaGVkUHJvZmlsZSB8fCAhc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZEF0ID0gbmV3IERhdGUoc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpO1xuICAgIGlmIChEYXRlLm5vdygpIC0gY2FjaGVkQXQuZ2V0VGltZSgpID4gUFJPRklMRV9DQUNIRV9UVEwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIENhY2hlIGV4cGlyZWRcbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuY2FjaGVkUHJvZmlsZTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDYWNoZWRQcm9maWxlKHByb2ZpbGUpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogcHJvZmlsZSxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJDYWNoZWRQcm9maWxlKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogdW5kZWZpbmVkLFxuICAgIH0pO1xufVxuLy8gU2V0dGluZ3MgaGVscGVyc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgcmV0dXJuIHN0b3JhZ2Uuc2V0dGluZ3M7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3ModXBkYXRlcykge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgY29uc3QgdXBkYXRlZCA9IHsgLi4uc3RvcmFnZS5zZXR0aW5ncywgLi4udXBkYXRlcyB9O1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBzZXR0aW5nczogdXBkYXRlZCB9KTtcbiAgICByZXR1cm4gdXBkYXRlZDtcbn1cbi8vIEFQSSBVUkwgaGVscGVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXBpQmFzZVVybCh1cmwpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgYXBpQmFzZVVybDogdXJsIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUJhc2VVcmwoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5hcGlCYXNlVXJsO1xufVxuIiwiLy8gQ29sdW1idXMgQVBJIGNsaWVudCBmb3IgZXh0ZW5zaW9uXG5pbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcbmV4cG9ydCBjbGFzcyBDb2x1bWJ1c0FQSUNsaWVudCB7XG4gICAgY29uc3RydWN0b3IoYmFzZVVybCkge1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gICAgfVxuICAgIGFzeW5jIGdldEF1dGhUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDaGVjayBleHBpcnlcbiAgICAgICAgaWYgKHN0b3JhZ2UudG9rZW5FeHBpcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKHN0b3JhZ2UudG9rZW5FeHBpcnkpO1xuICAgICAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUb2tlbiBleHBpcmVkLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhdXRoVG9rZW46IHVuZGVmaW5lZCwgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG4gICAgfVxuICAgIGFzeW5jIGF1dGhlbnRpY2F0ZWRGZXRjaChwYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhdXRoZW50aWNhdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmJhc2VVcmx9JHtwYXRofWAsIHtcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnWC1FeHRlbnNpb24tVG9rZW4nOiB0b2tlbixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgaW52YWxpZCB0b2tlblxuICAgICAgICAgICAgICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhdXRoVG9rZW46IHVuZGVmaW5lZCwgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGV4cGlyZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7IGVycm9yOiAnUmVxdWVzdCBmYWlsZWQnIH0pKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5lcnJvciB8fCBgUmVxdWVzdCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgfVxuICAgIGFzeW5jIGlzQXV0aGVudGljYXRlZCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2F1dGgvdmVyaWZ5Jyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZ2V0UHJvZmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9wcm9maWxlJyk7XG4gICAgfVxuICAgIGFzeW5jIGltcG9ydEpvYihqb2IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL29wcG9ydHVuaXRpZXMvZnJvbS1leHRlbnNpb24nLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICB0aXRsZTogam9iLnRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbXBhbnk6IGpvYi5jb21wYW55LFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBqb2IubG9jYXRpb24sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGpvYi5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IGpvYi5yZXF1aXJlbWVudHMsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2liaWxpdGllczogam9iLnJlc3BvbnNpYmlsaXRpZXMgfHwgW10sXG4gICAgICAgICAgICAgICAga2V5d29yZHM6IGpvYi5rZXl3b3JkcyB8fCBbXSxcbiAgICAgICAgICAgICAgICB0eXBlOiBqb2IudHlwZSxcbiAgICAgICAgICAgICAgICByZW1vdGU6IGpvYi5yZW1vdGUsXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBqb2Iuc2FsYXJ5LFxuICAgICAgICAgICAgICAgIHVybDogam9iLnVybCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IGpvYi5zb3VyY2UsXG4gICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IGpvYi5zb3VyY2VKb2JJZCxcbiAgICAgICAgICAgICAgICBwb3N0ZWRBdDogam9iLnBvc3RlZEF0LFxuICAgICAgICAgICAgICAgIGRlYWRsaW5lOiBqb2IuZGVhZGxpbmUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIGltcG9ydEpvYnNCYXRjaChqb2JzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9vcHBvcnR1bml0aWVzL2Zyb20tZXh0ZW5zaW9uJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGpvYnMgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBzYXZlTGVhcm5lZEFuc3dlcihkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHNlYXJjaFNpbWlsYXJBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy9zZWFyY2gnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcXVlc3Rpb24gfSksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzdWx0cztcbiAgICB9XG4gICAgYXN5bmMgZ2V0TGVhcm5lZEFuc3dlcnMoKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2VycycpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYW5zd2VycztcbiAgICB9XG4gICAgYXN5bmMgZGVsZXRlTGVhcm5lZEFuc3dlcihpZCkge1xuICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChgL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzLyR7aWR9YCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHVwZGF0ZUxlYXJuZWRBbnN3ZXIoaWQsIGFuc3dlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goYC9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy8ke2lkfWAsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYW5zd2VyIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmxldCBjbGllbnQgPSBudWxsO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFQSUNsaWVudCgpIHtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgICAgICBjbGllbnQgPSBuZXcgQ29sdW1idXNBUElDbGllbnQoc3RvcmFnZS5hcGlCYXNlVXJsKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsaWVudDtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXNldEFQSUNsaWVudCgpIHtcbiAgICBjbGllbnQgPSBudWxsO1xufVxuIiwiaW1wb3J0IHsgZ2V0U2V0dGluZ3MgfSBmcm9tICcuL3N0b3JhZ2UnO1xuZXhwb3J0IGNvbnN0IEJBREdFX1RFWFQgPSAnISc7XG5leHBvcnQgY29uc3QgQkFER0VfQ09MT1IgPSAnIzNiODJmNic7XG5leHBvcnQgY29uc3QgQkFER0VfVElUTEUgPSAnSm9iIGRldGVjdGVkIOKAlCBwcmVzcyBDbWQrU2hpZnQrSSB0byBpbXBvcnQnO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEJhZGdlRm9yVGFiKHRhYklkKSB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRTZXR0aW5ncygpO1xuICAgIGlmICghc2V0dGluZ3Mubm90aWZ5T25Kb2JEZXRlY3RlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgY2hyb21lLmFjdGlvbi5zZXRCYWRnZVRleHQoeyB0ZXh0OiBCQURHRV9URVhULCB0YWJJZCB9KSxcbiAgICAgICAgY2hyb21lLmFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiBCQURHRV9DT0xPUiwgdGFiSWQgfSksXG4gICAgICAgIGNocm9tZS5hY3Rpb24uc2V0VGl0bGUoeyB0aXRsZTogQkFER0VfVElUTEUsIHRhYklkIH0pLFxuICAgIF0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQmFkZ2VGb3JUYWIodGFiSWQpIHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJycsIHRhYklkIH0pLFxuICAgICAgICBjaHJvbWUuYWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6ICcnLCB0YWJJZCB9KSxcbiAgICBdKTtcbn1cbiIsIi8vIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgZm9yIENvbHVtYnVzIGV4dGVuc2lvblxuaW1wb3J0IHsgZ2V0QVBJQ2xpZW50LCByZXNldEFQSUNsaWVudCB9IGZyb20gJy4vYXBpLWNsaWVudCc7XG5pbXBvcnQgeyBzZXRBdXRoVG9rZW4sIGNsZWFyQXV0aFRva2VuLCBnZXRDYWNoZWRQcm9maWxlLCBzZXRDYWNoZWRQcm9maWxlLCBnZXRBcGlCYXNlVXJsLCB9IGZyb20gJy4vc3RvcmFnZSc7XG5pbXBvcnQgeyBzZXRCYWRnZUZvclRhYiwgY2xlYXJCYWRnZUZvclRhYiB9IGZyb20gJy4vYmFkZ2UnO1xuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKVxuICAgICAgICAudGhlbihzZW5kUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBNZXNzYWdlIGhhbmRsZXIgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgfSk7XG4gICAgLy8gUmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYXN5bmMgcmVzcG9uc2VcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICBjYXNlICdHRVRfQVVUSF9TVEFUVVMnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldEF1dGhTdGF0dXMoKTtcbiAgICAgICAgY2FzZSAnT1BFTl9BVVRIJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcGVuQXV0aCgpO1xuICAgICAgICBjYXNlICdMT0dPVVQnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUxvZ291dCgpO1xuICAgICAgICBjYXNlICdHRVRfUFJPRklMRSc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlR2V0UHJvZmlsZSgpO1xuICAgICAgICBjYXNlICdJTVBPUlRfSk9CJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVJbXBvcnRKb2IobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnSU1QT1JUX0pPQlNfQkFUQ0gnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUltcG9ydEpvYnNCYXRjaChtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTQVZFX0FOU1dFUic6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2F2ZUFuc3dlcihtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTRUFSQ0hfQU5TV0VSUyc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2VhcmNoQW5zd2VycyhtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdHRVRfTEVBUk5FRF9BTlNXRVJTJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVHZXRMZWFybmVkQW5zd2VycygpO1xuICAgICAgICBjYXNlICdERUxFVEVfQU5TV0VSJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVEZWxldGVBbnN3ZXIobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnSk9CX0RFVEVDVEVEJzoge1xuICAgICAgICAgICAgY29uc3QgdGFiSWQgPSBzZW5kZXIudGFiPy5pZDtcbiAgICAgICAgICAgIGlmICghdGFiSWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gdGFiIElEIGluIHNlbmRlcicgfTtcbiAgICAgICAgICAgIGF3YWl0IHNldEJhZGdlRm9yVGFiKHRhYklkKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWAgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRBdXRoU3RhdHVzKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSBhd2FpdCBjbGllbnQuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBhd2FpdCBnZXRBcGlCYXNlVXJsKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBpc0F1dGhlbnRpY2F0ZWQsIGFwaUJhc2VVcmwgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLCBhcGlCYXNlVXJsOiBhd2FpdCBnZXRBcGlCYXNlVXJsKCkgfSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVPcGVuQXV0aCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gYXdhaXQgZ2V0QXBpQmFzZVVybCgpO1xuICAgICAgICBjb25zdCBhdXRoVXJsID0gYCR7YXBpQmFzZVVybH0vZXh0ZW5zaW9uL2Nvbm5lY3RgO1xuICAgICAgICAvLyBPcGVuIGF1dGggcGFnZSBpbiBuZXcgdGFiXG4gICAgICAgIGF3YWl0IGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogYXV0aFVybCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9nb3V0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgIHJlc2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFByb2ZpbGUoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgICAgICAgY29uc3QgY2FjaGVkID0gYXdhaXQgZ2V0Q2FjaGVkUHJvZmlsZSgpO1xuICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjYWNoZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGZXRjaCBmcm9tIEFQSVxuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGNsaWVudC5nZXRQcm9maWxlKCk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBwcm9maWxlXG4gICAgICAgIGF3YWl0IHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHByb2ZpbGUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydEpvYihqb2IpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmltcG9ydEpvYihqb2IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydEpvYnNCYXRjaChqb2JzKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5pbXBvcnRKb2JzQmF0Y2goam9icyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2F2ZUFuc3dlcihkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zYXZlTGVhcm5lZEFuc3dlcih7XG4gICAgICAgICAgICBxdWVzdGlvbjogZGF0YS5xdWVzdGlvbixcbiAgICAgICAgICAgIGFuc3dlcjogZGF0YS5hbnN3ZXIsXG4gICAgICAgICAgICBzb3VyY2VVcmw6IGRhdGEudXJsLFxuICAgICAgICAgICAgc291cmNlQ29tcGFueTogZGF0YS5jb21wYW55LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZWFyY2hBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBjbGllbnQuc2VhcmNoU2ltaWxhckFuc3dlcnMocXVlc3Rpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHRzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRMZWFybmVkQW5zd2VycygpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IGNsaWVudC5nZXRMZWFybmVkQW5zd2VycygpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBhbnN3ZXJzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVBbnN3ZXIoaWQpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgYXdhaXQgY2xpZW50LmRlbGV0ZUxlYXJuZWRBbnN3ZXIoaWQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG4vLyBIYW5kbGUgYXV0aCBjYWxsYmFjayBmcm9tIENvbHVtYnVzIHdlYiBhcHBcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdBVVRIX0NBTExCQUNLJyAmJiBtZXNzYWdlLnRva2VuICYmIG1lc3NhZ2UuZXhwaXJlc0F0KSB7XG4gICAgICAgIHNldEF1dGhUb2tlbihtZXNzYWdlLnRva2VuLCBtZXNzYWdlLmV4cGlyZXNBdClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJlc2V0QVBJQ2xpZW50KCk7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSk7XG4vLyBIYW5kbGUga2V5Ym9hcmQgc2hvcnRjdXRzXG5jaHJvbWUuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKGFzeW5jIChjb21tYW5kKSA9PiB7XG4gICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgICBpZiAoIXRhYj8uaWQpXG4gICAgICAgIHJldHVybjtcbiAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICAgICAgY2FzZSAnZmlsbC1mb3JtJzpcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiAnVFJJR0dFUl9GSUxMJyB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbXBvcnQtam9iJzpcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiAnVFJJR0dFUl9JTVBPUlQnIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufSk7XG4vLyBDbGVhciBiYWRnZSB3aGVuIGEgdGFiIG5hdmlnYXRlcyB0byBhIG5ldyBVUkxcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8pID0+IHtcbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09ICdsb2FkaW5nJyAmJiBjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgICBjbGVhckJhZGdlRm9yVGFiKHRhYklkKS5jYXRjaCgoKSA9PiB7IH0pO1xuICAgIH1cbn0pO1xuLy8gSGFuZGxlIGV4dGVuc2lvbiBpbnN0YWxsL3VwZGF0ZVxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKGRldGFpbHMpID0+IHtcbiAgICBpZiAoZGV0YWlscy5yZWFzb24gPT09ICdpbnN0YWxsJykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBFeHRlbnNpb24gaW5zdGFsbGVkJyk7XG4gICAgICAgIC8vIENvdWxkIG9wZW4gb25ib2FyZGluZyBwYWdlIGhlcmVcbiAgICB9XG4gICAgZWxzZSBpZiAoZGV0YWlscy5yZWFzb24gPT09ICd1cGRhdGUnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEV4dGVuc2lvbiB1cGRhdGVkIHRvJywgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcbiAgICB9XG59KTtcbmNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIgc3RhcnRlZCcpO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==