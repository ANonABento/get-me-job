// Cross-browser API wrapper
// Uses webextension-polyfill for Firefox compatibility

import browser from 'webextension-polyfill';

// Re-export the polyfilled browser API
// This provides a Promise-based API that works in both Chrome and Firefox
export { browser };

// Type-safe storage helpers
export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    const result = await browser.storage.local.get(key);
    return result[key] as T | undefined;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  },

  async remove(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  },

  async clear(): Promise<void> {
    await browser.storage.local.clear();
  },
};

// Runtime message helpers
export const runtime = {
  async sendMessage<T = unknown>(message: unknown): Promise<T> {
    return browser.runtime.sendMessage(message) as Promise<T>;
  },

  onMessage: browser.runtime.onMessage,

  getURL(path: string): string {
    return browser.runtime.getURL(path);
  },
};

// Tabs helpers
export const tabs = {
  async query(queryInfo: browser.Tabs.QueryQueryInfoType): Promise<browser.Tabs.Tab[]> {
    return browser.tabs.query(queryInfo);
  },

  async sendMessage<T = unknown>(tabId: number, message: unknown): Promise<T> {
    return browser.tabs.sendMessage(tabId, message) as Promise<T>;
  },

  async create(createProperties: browser.Tabs.CreateCreatePropertiesType): Promise<browser.Tabs.Tab> {
    return browser.tabs.create(createProperties);
  },
};

// Scripting helpers (Chrome MV3)
export const scripting = {
  async executeScript(
    tabId: number,
    func: () => void
  ): Promise<unknown[]> {
    // Use chrome.scripting for Chrome MV3, fallback to tabs.executeScript for Firefox
    if (typeof chrome !== 'undefined' && chrome.scripting) {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func,
      });
      return results.map((r) => r.result);
    } else {
      // Firefox MV2 fallback
      return browser.tabs.executeScript(tabId, {
        code: `(${func.toString()})()`,
      });
    }
  },
};

// Commands helpers
export const commands = browser.commands;
