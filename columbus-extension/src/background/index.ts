// Background service worker for Columbus extension

import type { ExtensionMessage, ExtensionResponse, ScrapedJob, DetectedField } from '@/shared/types';
import { getAPIClient, resetAPIClient } from './api-client';
import {
  getStorage,
  setAuthToken,
  clearAuthToken,
  getCachedProfile,
  setCachedProfile,
  getApiBaseUrl,
} from './storage';
import { setBadgeForTab, clearBadgeForTab } from './badge';

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('[Columbus] Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<ExtensionResponse> {
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
      return handleImportJob(message.payload as ScrapedJob);

    case 'IMPORT_JOBS_BATCH':
      return handleImportJobsBatch(message.payload as ScrapedJob[]);

    case 'SAVE_ANSWER':
      return handleSaveAnswer(message.payload as {
        question: string;
        answer: string;
        url?: string;
        company?: string;
      });

    case 'SEARCH_ANSWERS':
      return handleSearchAnswers(message.payload as string);

    case 'GET_LEARNED_ANSWERS':
      return handleGetLearnedAnswers();

    case 'DELETE_ANSWER':
      return handleDeleteAnswer(message.payload as string);

    case 'JOB_DETECTED': {
      const tabId = sender.tab?.id;
      if (!tabId) return { success: false, error: 'No tab ID in sender' };
      await setBadgeForTab(tabId);
      return { success: true };
    }

    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

async function handleGetAuthStatus(): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const isAuthenticated = await client.isAuthenticated();
    const apiBaseUrl = await getApiBaseUrl();

    return {
      success: true,
      data: { isAuthenticated, apiBaseUrl },
    };
  } catch (error) {
    return {
      success: true,
      data: { isAuthenticated: false, apiBaseUrl: await getApiBaseUrl() },
    };
  }
}

async function handleOpenAuth(): Promise<ExtensionResponse> {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const authUrl = `${apiBaseUrl}/extension/connect`;

    // Open auth page in new tab
    await chrome.tabs.create({ url: authUrl });

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleLogout(): Promise<ExtensionResponse> {
  try {
    await clearAuthToken();
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

async function handleImportJob(job: ScrapedJob): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.importJob(job);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function handleImportJobsBatch(jobs: ScrapedJob[]): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const result = await client.importJobsBatch(jobs);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
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

async function handleSearchAnswers(question: string): Promise<ExtensionResponse> {
  try {
    const client = await getAPIClient();
    const results = await client.searchSimilarAnswers(question);
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
  if (!tab?.id) return;

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
    clearBadgeForTab(tabId).catch(() => {});
  }
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Columbus] Extension installed');
    // Could open onboarding page here
  } else if (details.reason === 'update') {
    console.log('[Columbus] Extension updated to', chrome.runtime.getManifest().version);
  }
});

console.log('[Columbus] Background service worker started');
