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
        return this.authenticatedFetch('/api/extension/jobs', {
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
                deadline: job.deadline,
            }),
        });
    }
    async importJobsBatch(jobs) {
        return this.authenticatedFetch('/api/extension/jobs', {
            method: 'POST',
            body: JSON.stringify({
                jobs,
                title: 'batch',
                company: 'batch',
            }),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ3pDO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsWUFBWTtBQUN6QztBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLFlBQVk7QUFDekM7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxZQUFZO0FBQ3BCO0FBQ0EsWUFBWSxjQUFjO0FBQzFCLDJCQUEyQixlQUFlO0FBQzFDLFNBQVM7QUFDVDtBQUNBLDJCQUEyQixzQ0FBc0M7QUFDakUsU0FBUztBQUNUO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLDRDQUE0QyxtQ0FBbUM7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsc0JBQXNCO0FBQ3BFO0FBQ0E7QUFDQSw4Q0FBOEMsd0JBQXdCO0FBQ3RFO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC90eXBlcy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9zdG9yYWdlLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL2FwaS1jbGllbnQudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU2hhcmVkIHR5cGVzIGZvciBDb2x1bWJ1cyBleHRlbnNpb25cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGF1dG9GaWxsRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93Q29uZmlkZW5jZUluZGljYXRvcnM6IHRydWUsXG4gICAgbWluaW11bUNvbmZpZGVuY2U6IDAuNSxcbiAgICBsZWFybkZyb21BbnN3ZXJzOiB0cnVlLFxuICAgIG5vdGlmeU9uSm9iRGV0ZWN0ZWQ6IHRydWUsXG59O1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQVBJX0JBU0VfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG4iLCIvLyBFeHRlbnNpb24gc3RvcmFnZSB1dGlsaXRpZXNcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERFRkFVTFRfQVBJX0JBU0VfVVJMIH0gZnJvbSAnQC9zaGFyZWQvdHlwZXMnO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAnY29sdW1idXNfZXh0ZW5zaW9uJztcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IHJlc3VsdFtTVE9SQUdFX0tFWV07XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBhcGlCYXNlVXJsOiBERUZBVUxUX0FQSV9CQVNFX1VSTCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogREVGQVVMVF9TRVRUSU5HUyxcbiAgICAgICAgICAgICAgICAuLi5zdG9yZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmFnZSh1cGRhdGVzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5jdXJyZW50LCAuLi51cGRhdGVzIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtTVE9SQUdFX0tFWV06IHVwZGF0ZWQgfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoU1RPUkFHRV9LRVksIHJlc29sdmUpO1xuICAgIH0pO1xufVxuLy8gQXV0aCB0b2tlbiBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXV0aFRva2VuKHRva2VuLCBleHBpcmVzQXQpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB0b2tlbixcbiAgICAgICAgdG9rZW5FeHBpcnk6IGV4cGlyZXNBdCxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckF1dGhUb2tlbigpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB1bmRlZmluZWQsXG4gICAgICAgIHRva2VuRXhwaXJ5OiB1bmRlZmluZWQsXG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXV0aFRva2VuKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgLy8gQ2hlY2sgZXhwaXJ5XG4gICAgaWYgKHN0b3JhZ2UudG9rZW5FeHBpcnkpIHtcbiAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoc3RvcmFnZS50b2tlbkV4cGlyeSk7XG4gICAgICAgIGlmIChleHBpcnkgPCBuZXcgRGF0ZSgpKSB7XG4gICAgICAgICAgICBhd2FpdCBjbGVhckF1dGhUb2tlbigpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuYXV0aFRva2VuO1xufVxuLy8gUHJvZmlsZSBjYWNoZSBoZWxwZXJzXG5jb25zdCBQUk9GSUxFX0NBQ0hFX1RUTCA9IDUgKiA2MCAqIDEwMDA7IC8vIDUgbWludXRlc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhY2hlZFByb2ZpbGUoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuY2FjaGVkUHJvZmlsZSB8fCAhc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZEF0ID0gbmV3IERhdGUoc3RvcmFnZS5wcm9maWxlQ2FjaGVkQXQpO1xuICAgIGlmIChEYXRlLm5vdygpIC0gY2FjaGVkQXQuZ2V0VGltZSgpID4gUFJPRklMRV9DQUNIRV9UVEwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIENhY2hlIGV4cGlyZWRcbiAgICB9XG4gICAgcmV0dXJuIHN0b3JhZ2UuY2FjaGVkUHJvZmlsZTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDYWNoZWRQcm9maWxlKHByb2ZpbGUpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogcHJvZmlsZSxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJDYWNoZWRQcm9maWxlKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogdW5kZWZpbmVkLFxuICAgIH0pO1xufVxuLy8gU2V0dGluZ3MgaGVscGVyc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNldHRpbmdzKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgcmV0dXJuIHN0b3JhZ2Uuc2V0dGluZ3M7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3ModXBkYXRlcykge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgY29uc3QgdXBkYXRlZCA9IHsgLi4uc3RvcmFnZS5zZXR0aW5ncywgLi4udXBkYXRlcyB9O1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBzZXR0aW5nczogdXBkYXRlZCB9KTtcbiAgICByZXR1cm4gdXBkYXRlZDtcbn1cbi8vIEFQSSBVUkwgaGVscGVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXBpQmFzZVVybCh1cmwpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgYXBpQmFzZVVybDogdXJsIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUJhc2VVcmwoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5hcGlCYXNlVXJsO1xufVxuIiwiLy8gQ29sdW1idXMgQVBJIGNsaWVudCBmb3IgZXh0ZW5zaW9uXG5pbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlJztcbmV4cG9ydCBjbGFzcyBDb2x1bWJ1c0FQSUNsaWVudCB7XG4gICAgY29uc3RydWN0b3IoYmFzZVVybCkge1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gICAgfVxuICAgIGFzeW5jIGdldEF1dGhUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yYWdlLmF1dGhUb2tlbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDaGVjayBleHBpcnlcbiAgICAgICAgaWYgKHN0b3JhZ2UudG9rZW5FeHBpcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKHN0b3JhZ2UudG9rZW5FeHBpcnkpO1xuICAgICAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUb2tlbiBleHBpcmVkLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhdXRoVG9rZW46IHVuZGVmaW5lZCwgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG4gICAgfVxuICAgIGFzeW5jIGF1dGhlbnRpY2F0ZWRGZXRjaChwYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhdXRoZW50aWNhdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt0aGlzLmJhc2VVcmx9JHtwYXRofWAsIHtcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnWC1FeHRlbnNpb24tVG9rZW4nOiB0b2tlbixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgaW52YWxpZCB0b2tlblxuICAgICAgICAgICAgICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhdXRoVG9rZW46IHVuZGVmaW5lZCwgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGV4cGlyZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7IGVycm9yOiAnUmVxdWVzdCBmYWlsZWQnIH0pKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5lcnJvciB8fCBgUmVxdWVzdCBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgfVxuICAgIGFzeW5jIGlzQXV0aGVudGljYXRlZCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2F1dGgvdmVyaWZ5Jyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZ2V0UHJvZmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9wcm9maWxlJyk7XG4gICAgfVxuICAgIGFzeW5jIGltcG9ydEpvYihqb2IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9qb2JzJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGpvYi50aXRsZSxcbiAgICAgICAgICAgICAgICBjb21wYW55OiBqb2IuY29tcGFueSxcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogam9iLmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBqb2IuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBqb2IucmVxdWlyZW1lbnRzLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpYmlsaXRpZXM6IGpvYi5yZXNwb25zaWJpbGl0aWVzIHx8IFtdLFxuICAgICAgICAgICAgICAgIGtleXdvcmRzOiBqb2Iua2V5d29yZHMgfHwgW10sXG4gICAgICAgICAgICAgICAgdHlwZTogam9iLnR5cGUsXG4gICAgICAgICAgICAgICAgcmVtb3RlOiBqb2IucmVtb3RlLFxuICAgICAgICAgICAgICAgIHNhbGFyeTogam9iLnNhbGFyeSxcbiAgICAgICAgICAgICAgICB1cmw6IGpvYi51cmwsXG4gICAgICAgICAgICAgICAgZGVhZGxpbmU6IGpvYi5kZWFkbGluZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgaW1wb3J0Sm9ic0JhdGNoKGpvYnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9qb2JzJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgam9icyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2JhdGNoJyxcbiAgICAgICAgICAgICAgICBjb21wYW55OiAnYmF0Y2gnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBzYXZlTGVhcm5lZEFuc3dlcihkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHNlYXJjaFNpbWlsYXJBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy9zZWFyY2gnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcXVlc3Rpb24gfSksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzdWx0cztcbiAgICB9XG4gICAgYXN5bmMgZ2V0TGVhcm5lZEFuc3dlcnMoKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2VycycpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYW5zd2VycztcbiAgICB9XG4gICAgYXN5bmMgZGVsZXRlTGVhcm5lZEFuc3dlcihpZCkge1xuICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChgL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzLyR7aWR9YCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHVwZGF0ZUxlYXJuZWRBbnN3ZXIoaWQsIGFuc3dlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goYC9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy8ke2lkfWAsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYW5zd2VyIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG59XG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmxldCBjbGllbnQgPSBudWxsO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFQSUNsaWVudCgpIHtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgICAgICBjbGllbnQgPSBuZXcgQ29sdW1idXNBUElDbGllbnQoc3RvcmFnZS5hcGlCYXNlVXJsKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsaWVudDtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXNldEFQSUNsaWVudCgpIHtcbiAgICBjbGllbnQgPSBudWxsO1xufVxuIiwiLy8gQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBmb3IgQ29sdW1idXMgZXh0ZW5zaW9uXG5pbXBvcnQgeyBnZXRBUElDbGllbnQsIHJlc2V0QVBJQ2xpZW50IH0gZnJvbSAnLi9hcGktY2xpZW50JztcbmltcG9ydCB7IHNldEF1dGhUb2tlbiwgY2xlYXJBdXRoVG9rZW4sIGdldENhY2hlZFByb2ZpbGUsIHNldENhY2hlZFByb2ZpbGUsIGdldEFwaUJhc2VVcmwsIH0gZnJvbSAnLi9zdG9yYWdlJztcbi8vIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0cyBhbmQgcG9wdXBcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcilcbiAgICAgICAgLnRoZW4oc2VuZFJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gTWVzc2FnZSBoYW5kbGVyIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgIH0pO1xuICAgIC8vIFJldHVybiB0cnVlIHRvIGluZGljYXRlIGFzeW5jIHJlc3BvbnNlXG4gICAgcmV0dXJuIHRydWU7XG59KTtcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnR0VUX0FVVEhfU1RBVFVTJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVHZXRBdXRoU3RhdHVzKCk7XG4gICAgICAgIGNhc2UgJ09QRU5fQVVUSCc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlT3BlbkF1dGgoKTtcbiAgICAgICAgY2FzZSAnTE9HT1VUJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVMb2dvdXQoKTtcbiAgICAgICAgY2FzZSAnR0VUX1BST0ZJTEUnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldFByb2ZpbGUoKTtcbiAgICAgICAgY2FzZSAnSU1QT1JUX0pPQic6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlSW1wb3J0Sm9iKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIGNhc2UgJ0lNUE9SVF9KT0JTX0JBVENIJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVJbXBvcnRKb2JzQmF0Y2gobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnU0FWRV9BTlNXRVInOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVNhdmVBbnN3ZXIobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnU0VBUkNIX0FOU1dFUlMnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVNlYXJjaEFuc3dlcnMobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnR0VUX0xFQVJORURfQU5TV0VSUyc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlR2V0TGVhcm5lZEFuc3dlcnMoKTtcbiAgICAgICAgY2FzZSAnREVMRVRFX0FOU1dFUic6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRGVsZXRlQW5zd2VyKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEF1dGhTdGF0dXMoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IGF3YWl0IGNsaWVudC5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IGF3YWl0IGdldEFwaUJhc2VVcmwoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGlzQXV0aGVudGljYXRlZCwgYXBpQmFzZVVybCB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGlzQXV0aGVudGljYXRlZDogZmFsc2UsIGFwaUJhc2VVcmw6IGF3YWl0IGdldEFwaUJhc2VVcmwoKSB9LFxuICAgICAgICB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU9wZW5BdXRoKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBhd2FpdCBnZXRBcGlCYXNlVXJsKCk7XG4gICAgICAgIGNvbnN0IGF1dGhVcmwgPSBgJHthcGlCYXNlVXJsfS9leHRlbnNpb24vY29ubmVjdGA7XG4gICAgICAgIC8vIE9wZW4gYXV0aCBwYWdlIGluIG5ldyB0YWJcbiAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBhdXRoVXJsIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dvdXQoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY2xlYXJBdXRoVG9rZW4oKTtcbiAgICAgICAgcmVzZXRBUElDbGllbnQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0UHJvZmlsZSgpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBDaGVjayBjYWNoZSBmaXJzdFxuICAgICAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCBnZXRDYWNoZWRQcm9maWxlKCk7XG4gICAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGNhY2hlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEZldGNoIGZyb20gQVBJXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgY2xpZW50LmdldFByb2ZpbGUoKTtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHByb2ZpbGVcbiAgICAgICAgYXdhaXQgc2V0Q2FjaGVkUHJvZmlsZShwcm9maWxlKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJvZmlsZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0Sm9iKGpvYikge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuaW1wb3J0Sm9iKGpvYik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0Sm9ic0JhdGNoKGpvYnMpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmltcG9ydEpvYnNCYXRjaChqb2JzKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTYXZlQW5zd2VyKGRhdGEpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNhdmVMZWFybmVkQW5zd2VyKHtcbiAgICAgICAgICAgIHF1ZXN0aW9uOiBkYXRhLnF1ZXN0aW9uLFxuICAgICAgICAgICAgYW5zd2VyOiBkYXRhLmFuc3dlcixcbiAgICAgICAgICAgIHNvdXJjZVVybDogZGF0YS51cmwsXG4gICAgICAgICAgICBzb3VyY2VDb21wYW55OiBkYXRhLmNvbXBhbnksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNlYXJjaEFuc3dlcnMocXVlc3Rpb24pIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGNsaWVudC5zZWFyY2hTaW1pbGFyQW5zd2VycyhxdWVzdGlvbik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdHMgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldExlYXJuZWRBbnN3ZXJzKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgY2xpZW50LmdldExlYXJuZWRBbnN3ZXJzKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGFuc3dlcnMgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZUFuc3dlcihpZCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBhd2FpdCBjbGllbnQuZGVsZXRlTGVhcm5lZEFuc3dlcihpZCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbi8vIEhhbmRsZSBhdXRoIGNhbGxiYWNrIGZyb20gQ29sdW1idXMgd2ViIGFwcFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlRXh0ZXJuYWwuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0FVVEhfQ0FMTEJBQ0snICYmIG1lc3NhZ2UudG9rZW4gJiYgbWVzc2FnZS5leHBpcmVzQXQpIHtcbiAgICAgICAgc2V0QXV0aFRva2VuKG1lc3NhZ2UudG9rZW4sIG1lc3NhZ2UuZXhwaXJlc0F0KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmVzZXRBUElDbGllbnQoKTtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcbi8vIEhhbmRsZSBrZXlib2FyZCBzaG9ydGN1dHNcbmNocm9tZS5jb21tYW5kcy5vbkNvbW1hbmQuYWRkTGlzdGVuZXIoYXN5bmMgKGNvbW1hbmQpID0+IHtcbiAgICBjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pO1xuICAgIGlmICghdGFiPy5pZClcbiAgICAgICAgcmV0dXJuO1xuICAgIHN3aXRjaCAoY29tbWFuZCkge1xuICAgICAgICBjYXNlICdmaWxsLWZvcm0nOlxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6ICdUUklHR0VSX0ZJTEwnIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ltcG9ydC1qb2InOlxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6ICdUUklHR0VSX0lNUE9SVCcgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59KTtcbi8vIEhhbmRsZSBleHRlbnNpb24gaW5zdGFsbC91cGRhdGVcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKChkZXRhaWxzKSA9PiB7XG4gICAgaWYgKGRldGFpbHMucmVhc29uID09PSAnaW5zdGFsbCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gRXh0ZW5zaW9uIGluc3RhbGxlZCcpO1xuICAgICAgICAvLyBDb3VsZCBvcGVuIG9uYm9hcmRpbmcgcGFnZSBoZXJlXG4gICAgfVxuICAgIGVsc2UgaWYgKGRldGFpbHMucmVhc29uID09PSAndXBkYXRlJykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBFeHRlbnNpb24gdXBkYXRlZCB0bycsIGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbik7XG4gICAgfVxufSk7XG5jb25zb2xlLmxvZygnW0NvbHVtYnVzXSBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIHN0YXJ0ZWQnKTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=