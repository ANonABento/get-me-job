// Message passing utilities for extension communication

import type {
  ExtensionMessage,
  ExtensionResponse,
  ExtensionProfile,
  ScrapedJob,
  LearnedAnswer,
  SimilarAnswer,
  DetectedField
} from './types';

// Type-safe message creators
export const Messages = {
  // Auth messages
  getAuthStatus: (): ExtensionMessage => ({ type: 'GET_AUTH_STATUS' }),
  openAuth: (): ExtensionMessage => ({ type: 'OPEN_AUTH' }),
  logout: (): ExtensionMessage => ({ type: 'LOGOUT' }),

  // Profile messages
  getProfile: (): ExtensionMessage => ({ type: 'GET_PROFILE' }),

  // Form filling messages
  fillForm: (fields: DetectedField[]): ExtensionMessage<DetectedField[]> => ({
    type: 'FILL_FORM',
    payload: fields,
  }),

  // Scraping messages
  scrapeJob: (): ExtensionMessage => ({ type: 'SCRAPE_JOB' }),
  scrapeJobList: (): ExtensionMessage => ({ type: 'SCRAPE_JOB_LIST' }),
  importJob: (job: ScrapedJob): ExtensionMessage<ScrapedJob> => ({
    type: 'IMPORT_JOB',
    payload: job,
  }),
  importJobsBatch: (jobs: ScrapedJob[]): ExtensionMessage<ScrapedJob[]> => ({
    type: 'IMPORT_JOBS_BATCH',
    payload: jobs,
  }),

  // Learning messages
  saveAnswer: (data: { question: string; answer: string; url?: string; company?: string }): ExtensionMessage => ({
    type: 'SAVE_ANSWER',
    payload: data,
  }),
  searchAnswers: (question: string): ExtensionMessage<string> => ({
    type: 'SEARCH_ANSWERS',
    payload: question,
  }),

  jobDetected: (meta: Pick<ScrapedJob, 'title' | 'company' | 'url'>): ExtensionMessage<Pick<ScrapedJob, 'title' | 'company' | 'url'>> => ({
    type: 'JOB_DETECTED',
    payload: meta,
  }),
};

// Response type helpers
export interface AuthStatusResponse extends ExtensionResponse<{
  isAuthenticated: boolean;
  apiBaseUrl: string;
}> {}

export interface ProfileResponse extends ExtensionResponse<ExtensionProfile> {}

export interface ImportJobResponse extends ExtensionResponse<{
  imported: number;
  opportunityIds: string[];
  pendingCount: number;
}> {}

export interface SearchAnswersResponse extends ExtensionResponse<SimilarAnswer[]> {}

// Send message to background script
export async function sendMessage<T>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: ExtensionResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response || { success: false, error: 'No response received' });
      }
    });
  });
}

// Send message to content script in specific tab
export async function sendToTab<T>(tabId: number, message: ExtensionMessage): Promise<ExtensionResponse<T>> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response: ExtensionResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response || { success: false, error: 'No response received' });
      }
    });
  });
}

// Send message to all content scripts
export async function broadcastMessage<T>(message: ExtensionMessage): Promise<void> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch {
        // Tab might not have content script loaded
      }
    }
  }
}
