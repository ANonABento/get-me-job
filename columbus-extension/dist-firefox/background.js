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
        return this.authenticatedFetch('/api/jobs', {
            method: 'POST',
            body: JSON.stringify({
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                responsibilities: job.responsibilities || [],
                type: job.type,
                remote: job.remote,
                salary: job.salary,
                url: job.url,
                deadline: job.deadline,
                status: 'saved',
            }),
        });
    }
    async importJobsBatch(jobs) {
        return this.authenticatedFetch('/api/extension/scrape/batch', {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLFlBQVk7QUFDcEI7QUFDQSxZQUFZLGNBQWM7QUFDMUIsMkJBQTJCLGVBQWU7QUFDMUMsU0FBUztBQUNUO0FBQ0EsMkJBQTJCLHNDQUFzQztBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EsNENBQTRDLG1DQUFtQztBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxzQkFBc0I7QUFDcEU7QUFDQTtBQUNBLDhDQUE4Qyx3QkFBd0I7QUFDdEU7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvc2hhcmVkL3R5cGVzLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvYXBpLWNsaWVudC50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTaGFyZWQgdHlwZXMgZm9yIENvbHVtYnVzIGV4dGVuc2lvblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSB7XG4gICAgYXV0b0ZpbGxFbmFibGVkOiB0cnVlLFxuICAgIHNob3dDb25maWRlbmNlSW5kaWNhdG9yczogdHJ1ZSxcbiAgICBtaW5pbXVtQ29uZmlkZW5jZTogMC41LFxuICAgIGxlYXJuRnJvbUFuc3dlcnM6IHRydWUsXG4gICAgbm90aWZ5T25Kb2JEZXRlY3RlZDogdHJ1ZSxcbn07XG5leHBvcnQgY29uc3QgREVGQVVMVF9BUElfQkFTRV9VUkwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcbiIsIi8vIEV4dGVuc2lvbiBzdG9yYWdlIHV0aWxpdGllc1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9BUElfQkFTRV9VUkwgfSBmcm9tICdAL3NoYXJlZC90eXBlcyc7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdjb2x1bWJ1c19leHRlbnNpb24nO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0W1NUT1JBR0VfS0VZXTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGFwaUJhc2VVcmw6IERFRkFVTFRfQVBJX0JBU0VfVVJMLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBERUZBVUxUX1NFVFRJTkdTLFxuICAgICAgICAgICAgICAgIC4uLnN0b3JlZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTdG9yYWdlKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLmN1cnJlbnQsIC4uLnVwZGF0ZXMgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogdXBkYXRlZCB9LCByZXNvbHZlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShTVE9SQUdFX0tFWSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG4vLyBBdXRoIHRva2VuIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBdXRoVG9rZW4odG9rZW4sIGV4cGlyZXNBdCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHRva2VuLFxuICAgICAgICB0b2tlbkV4cGlyeTogZXhwaXJlc0F0LFxuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQXV0aFRva2VuKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdXRoVG9rZW4oKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBDaGVjayBleHBpcnlcbiAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICBjb25zdCBleHBpcnkgPSBuZXcgRGF0ZShzdG9yYWdlLnRva2VuRXhwaXJ5KTtcbiAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG59XG4vLyBQcm9maWxlIGNhY2hlIGhlbHBlcnNcbmNvbnN0IFBST0ZJTEVfQ0FDSEVfVFRMID0gNSAqIDYwICogMTAwMDsgLy8gNSBtaW51dGVzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkUHJvZmlsZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5jYWNoZWRQcm9maWxlIHx8ICFzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkQXQgPSBuZXcgRGF0ZShzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCk7XG4gICAgaWYgKERhdGUubm93KCkgLSBjYWNoZWRBdC5nZXRUaW1lKCkgPiBQUk9GSUxFX0NBQ0hFX1RUTCkge1xuICAgICAgICByZXR1cm4gbnVsbDsgLy8gQ2FjaGUgZXhwaXJlZFxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5jYWNoZWRQcm9maWxlO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiBwcm9maWxlLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckNhY2hlZFByb2ZpbGUoKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG4vLyBTZXR0aW5ncyBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5zZXR0aW5ncztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyh1cGRhdGVzKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5zdG9yYWdlLnNldHRpbmdzLCAuLi51cGRhdGVzIH07XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IHNldHRpbmdzOiB1cGRhdGVkIH0pO1xuICAgIHJldHVybiB1cGRhdGVkO1xufVxuLy8gQVBJIFVSTCBoZWxwZXJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBcGlCYXNlVXJsKHVybCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhcGlCYXNlVXJsOiB1cmwgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpQmFzZVVybCgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLmFwaUJhc2VVcmw7XG59XG4iLCIvLyBDb2x1bWJ1cyBBUEkgY2xpZW50IGZvciBleHRlbnNpb25cbmltcG9ydCB7IGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UgfSBmcm9tICcuL3N0b3JhZ2UnO1xuZXhwb3J0IGNsYXNzIENvbHVtYnVzQVBJQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcihiYXNlVXJsKSB7XG4gICAgICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICB9XG4gICAgYXN5bmMgZ2V0QXV0aFRva2VuKCkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIENoZWNrIGV4cGlyeVxuICAgICAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICAgICAgY29uc3QgZXhwaXJ5ID0gbmV3IERhdGUoc3RvcmFnZS50b2tlbkV4cGlyeSk7XG4gICAgICAgICAgICBpZiAoZXhwaXJ5IDwgbmV3IERhdGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRva2VuIGV4cGlyZWQsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U3RvcmFnZSh7IGF1dGhUb2tlbjogdW5kZWZpbmVkLCB0b2tlbkV4cGlyeTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdG9yYWdlLmF1dGhUb2tlbjtcbiAgICB9XG4gICAgYXN5bmMgYXV0aGVudGljYXRlZEZldGNoKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuZ2V0QXV0aFRva2VuKCk7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGF1dGhlbnRpY2F0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0ke3BhdGh9YCwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdYLUV4dGVuc2lvbi1Ub2tlbic6IHRva2VuLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAvLyBDbGVhciBpbnZhbGlkIHRva2VuXG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U3RvcmFnZSh7IGF1dGhUb2tlbjogdW5kZWZpbmVkLCB0b2tlbkV4cGlyeTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXV0aGVudGljYXRpb24gZXhwaXJlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHsgZXJyb3I6ICdSZXF1ZXN0IGZhaWxlZCcgfSkpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmVycm9yIHx8IGBSZXF1ZXN0IGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9XG4gICAgYXN5bmMgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMuZ2V0QXV0aFRva2VuKCk7XG4gICAgICAgIGlmICghdG9rZW4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vYXV0aC92ZXJpZnknKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBnZXRQcm9maWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvZXh0ZW5zaW9uL3Byb2ZpbGUnKTtcbiAgICB9XG4gICAgYXN5bmMgaW1wb3J0Sm9iKGpvYikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goJy9hcGkvam9icycsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBqb2IudGl0bGUsXG4gICAgICAgICAgICAgICAgY29tcGFueTogam9iLmNvbXBhbnksXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IGpvYi5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogam9iLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogam9iLnJlcXVpcmVtZW50cyxcbiAgICAgICAgICAgICAgICByZXNwb25zaWJpbGl0aWVzOiBqb2IucmVzcG9uc2liaWxpdGllcyB8fCBbXSxcbiAgICAgICAgICAgICAgICB0eXBlOiBqb2IudHlwZSxcbiAgICAgICAgICAgICAgICByZW1vdGU6IGpvYi5yZW1vdGUsXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBqb2Iuc2FsYXJ5LFxuICAgICAgICAgICAgICAgIHVybDogam9iLnVybCxcbiAgICAgICAgICAgICAgICBkZWFkbGluZTogam9iLmRlYWRsaW5lLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ3NhdmVkJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgaW1wb3J0Sm9ic0JhdGNoKGpvYnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9zY3JhcGUvYmF0Y2gnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgam9icyB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHNhdmVMZWFybmVkQW5zd2VyKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKCcvYXBpL2V4dGVuc2lvbi9sZWFybmVkLWFuc3dlcnMnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgc2VhcmNoU2ltaWxhckFuc3dlcnMocXVlc3Rpb24pIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzL3NlYXJjaCcsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBxdWVzdGlvbiB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHRzO1xuICAgIH1cbiAgICBhc3luYyBnZXRMZWFybmVkQW5zd2VycygpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaCgnL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzJyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hbnN3ZXJzO1xuICAgIH1cbiAgICBhc3luYyBkZWxldGVMZWFybmVkQW5zd2VyKGlkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYXV0aGVudGljYXRlZEZldGNoKGAvYXBpL2V4dGVuc2lvbi9sZWFybmVkLWFuc3dlcnMvJHtpZH1gLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgdXBkYXRlTGVhcm5lZEFuc3dlcihpZCwgYW5zd2VyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChgL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzLyR7aWR9YCwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBhbnN3ZXIgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxubGV0IGNsaWVudCA9IG51bGw7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QVBJQ2xpZW50KCkge1xuICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgICAgIGNsaWVudCA9IG5ldyBDb2x1bWJ1c0FQSUNsaWVudChzdG9yYWdlLmFwaUJhc2VVcmwpO1xuICAgIH1cbiAgICByZXR1cm4gY2xpZW50O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0QVBJQ2xpZW50KCkge1xuICAgIGNsaWVudCA9IG51bGw7XG59XG4iLCIvLyBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBDb2x1bWJ1cyBleHRlbnNpb25cbmltcG9ydCB7IGdldEFQSUNsaWVudCwgcmVzZXRBUElDbGllbnQgfSBmcm9tICcuL2FwaS1jbGllbnQnO1xuaW1wb3J0IHsgc2V0QXV0aFRva2VuLCBjbGVhckF1dGhUb2tlbiwgZ2V0Q2FjaGVkUHJvZmlsZSwgc2V0Q2FjaGVkUHJvZmlsZSwgZ2V0QXBpQmFzZVVybCwgfSBmcm9tICcuL3N0b3JhZ2UnO1xuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKVxuICAgICAgICAudGhlbihzZW5kUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBNZXNzYWdlIGhhbmRsZXIgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgfSk7XG4gICAgLy8gUmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYXN5bmMgcmVzcG9uc2VcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICBjYXNlICdHRVRfQVVUSF9TVEFUVVMnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldEF1dGhTdGF0dXMoKTtcbiAgICAgICAgY2FzZSAnT1BFTl9BVVRIJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcGVuQXV0aCgpO1xuICAgICAgICBjYXNlICdMT0dPVVQnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUxvZ291dCgpO1xuICAgICAgICBjYXNlICdHRVRfUFJPRklMRSc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlR2V0UHJvZmlsZSgpO1xuICAgICAgICBjYXNlICdJTVBPUlRfSk9CJzpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVJbXBvcnRKb2IobWVzc2FnZS5wYXlsb2FkKTtcbiAgICAgICAgY2FzZSAnSU1QT1JUX0pPQlNfQkFUQ0gnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUltcG9ydEpvYnNCYXRjaChtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTQVZFX0FOU1dFUic6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2F2ZUFuc3dlcihtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlICdTRUFSQ0hfQU5TV0VSUyc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2VhcmNoQW5zd2VycyhtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWAgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRBdXRoU3RhdHVzKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSBhd2FpdCBjbGllbnQuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBhd2FpdCBnZXRBcGlCYXNlVXJsKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBpc0F1dGhlbnRpY2F0ZWQsIGFwaUJhc2VVcmwgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLCBhcGlCYXNlVXJsOiBhd2FpdCBnZXRBcGlCYXNlVXJsKCkgfSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVPcGVuQXV0aCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gYXdhaXQgZ2V0QXBpQmFzZVVybCgpO1xuICAgICAgICBjb25zdCBhdXRoVXJsID0gYCR7YXBpQmFzZVVybH0vZXh0ZW5zaW9uL2Nvbm5lY3RgO1xuICAgICAgICAvLyBPcGVuIGF1dGggcGFnZSBpbiBuZXcgdGFiXG4gICAgICAgIGF3YWl0IGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogYXV0aFVybCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9nb3V0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgIHJlc2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldFByb2ZpbGUoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgICAgICAgY29uc3QgY2FjaGVkID0gYXdhaXQgZ2V0Q2FjaGVkUHJvZmlsZSgpO1xuICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBjYWNoZWQgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGZXRjaCBmcm9tIEFQSVxuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGNsaWVudC5nZXRQcm9maWxlKCk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBwcm9maWxlXG4gICAgICAgIGF3YWl0IHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHByb2ZpbGUgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydEpvYihqb2IpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmltcG9ydEpvYihqb2IpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUltcG9ydEpvYnNCYXRjaChqb2JzKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5pbXBvcnRKb2JzQmF0Y2goam9icyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2F2ZUFuc3dlcihkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zYXZlTGVhcm5lZEFuc3dlcih7XG4gICAgICAgICAgICBxdWVzdGlvbjogZGF0YS5xdWVzdGlvbixcbiAgICAgICAgICAgIGFuc3dlcjogZGF0YS5hbnN3ZXIsXG4gICAgICAgICAgICBzb3VyY2VVcmw6IGRhdGEudXJsLFxuICAgICAgICAgICAgc291cmNlQ29tcGFueTogZGF0YS5jb21wYW55LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZWFyY2hBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBjbGllbnQuc2VhcmNoU2ltaWxhckFuc3dlcnMocXVlc3Rpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHRzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG4vLyBIYW5kbGUgYXV0aCBjYWxsYmFjayBmcm9tIENvbHVtYnVzIHdlYiBhcHBcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdBVVRIX0NBTExCQUNLJyAmJiBtZXNzYWdlLnRva2VuICYmIG1lc3NhZ2UuZXhwaXJlc0F0KSB7XG4gICAgICAgIHNldEF1dGhUb2tlbihtZXNzYWdlLnRva2VuLCBtZXNzYWdlLmV4cGlyZXNBdClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJlc2V0QVBJQ2xpZW50KCk7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSk7XG4vLyBIYW5kbGUga2V5Ym9hcmQgc2hvcnRjdXRzXG5jaHJvbWUuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKGFzeW5jIChjb21tYW5kKSA9PiB7XG4gICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgICBpZiAoIXRhYj8uaWQpXG4gICAgICAgIHJldHVybjtcbiAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICAgICAgY2FzZSAnZmlsbC1mb3JtJzpcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiAnVFJJR0dFUl9GSUxMJyB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbXBvcnQtam9iJzpcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiAnVFJJR0dFUl9JTVBPUlQnIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufSk7XG4vLyBIYW5kbGUgZXh0ZW5zaW9uIGluc3RhbGwvdXBkYXRlXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoZGV0YWlscykgPT4ge1xuICAgIGlmIChkZXRhaWxzLnJlYXNvbiA9PT0gJ2luc3RhbGwnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEV4dGVuc2lvbiBpbnN0YWxsZWQnKTtcbiAgICAgICAgLy8gQ291bGQgb3BlbiBvbmJvYXJkaW5nIHBhZ2UgaGVyZVxuICAgIH1cbiAgICBlbHNlIGlmIChkZXRhaWxzLnJlYXNvbiA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gRXh0ZW5zaW9uIHVwZGF0ZWQgdG8nLCBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24pO1xuICAgIH1cbn0pO1xuY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlciBzdGFydGVkJyk7XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9