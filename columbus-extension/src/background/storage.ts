// Extension storage utilities

import type { ExtensionStorage, ExtensionSettings, ExtensionProfile } from '@/shared/types';
import { DEFAULT_SETTINGS, DEFAULT_API_BASE_URL } from '@/shared/types';

const STORAGE_KEY = 'columbus_extension';

export function mergeSettingsWithDefaults(
  settings?: Partial<ExtensionSettings>
): ExtensionSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}

export async function getStorage(): Promise<ExtensionStorage> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const stored = result[STORAGE_KEY] as Partial<ExtensionStorage> | undefined;
      resolve({
        apiBaseUrl: DEFAULT_API_BASE_URL,
        ...stored,
        settings: mergeSettingsWithDefaults(stored?.settings),
      });
    });
  });
}

export async function setStorage(updates: Partial<ExtensionStorage>): Promise<void> {
  const current = await getStorage();
  const updated = { ...current, ...updates };

  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, resolve);
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(STORAGE_KEY, resolve);
  });
}

// Auth token helpers
export async function setAuthToken(token: string, expiresAt: string): Promise<void> {
  await setStorage({
    authToken: token,
    tokenExpiry: expiresAt,
  });
}

export async function clearAuthToken(): Promise<void> {
  await setStorage({
    authToken: undefined,
    tokenExpiry: undefined,
    cachedProfile: undefined,
    profileCachedAt: undefined,
  });
}

export async function getAuthToken(): Promise<string | null> {
  const storage = await getStorage();

  if (!storage.authToken) return null;

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

export async function getCachedProfile(): Promise<ExtensionProfile | null> {
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

export async function setCachedProfile(profile: ExtensionProfile): Promise<void> {
  await setStorage({
    cachedProfile: profile,
    profileCachedAt: new Date().toISOString(),
  });
}

export async function clearCachedProfile(): Promise<void> {
  await setStorage({
    cachedProfile: undefined,
    profileCachedAt: undefined,
  });
}

// Settings helpers
export async function getSettings(): Promise<ExtensionSettings> {
  const storage = await getStorage();
  return storage.settings;
}

export async function updateSettings(updates: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const storage = await getStorage();
  const updated = mergeSettingsWithDefaults({ ...storage.settings, ...updates });
  await setStorage({ settings: updated });
  return updated;
}

// API URL helper
export async function setApiBaseUrl(url: string): Promise<void> {
  await setStorage({ apiBaseUrl: url });
}

export async function getApiBaseUrl(): Promise<string> {
  const storage = await getStorage();
  return storage.apiBaseUrl;
}
