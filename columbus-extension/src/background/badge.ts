import { getSettings } from './storage';

export const BADGE_TEXT = '!';
export const BADGE_COLOR = '#3b82f6';
export const BADGE_TITLE = 'Job detected — press Cmd+Shift+I to import';

export async function setBadgeForTab(tabId: number): Promise<void> {
  const settings = await getSettings();
  if (!settings.notifyOnJobDetected) return;

  await Promise.all([
    chrome.action.setBadgeText({ text: BADGE_TEXT, tabId }),
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId }),
    chrome.action.setTitle({ title: BADGE_TITLE, tabId }),
  ]);
}

export async function clearBadgeForTab(tabId: number): Promise<void> {
  await Promise.all([
    chrome.action.setBadgeText({ text: '', tabId }),
    chrome.action.setTitle({ title: '', tabId }),
  ]);
}
