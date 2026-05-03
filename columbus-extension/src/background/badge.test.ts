import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ExtensionSettings } from '@/shared/types';

// Mock chrome global before importing the module under test
const mockSetBadgeText = vi.fn().mockResolvedValue(undefined);
const mockSetBadgeBackgroundColor = vi.fn().mockResolvedValue(undefined);
const mockSetTitle = vi.fn().mockResolvedValue(undefined);

vi.stubGlobal('chrome', {
  action: {
    setBadgeText: mockSetBadgeText,
    setBadgeBackgroundColor: mockSetBadgeBackgroundColor,
    setTitle: mockSetTitle,
  },
});

vi.mock('./storage', () => ({
  getSettings: vi.fn(),
}));

import { getSettings } from './storage';
import { setBadgeForTab, clearBadgeForTab, BADGE_TEXT, BADGE_COLOR, BADGE_TITLE } from './badge';

const enabledSettings: ExtensionSettings = {
  autoFillEnabled: true,
  showConfidenceIndicators: true,
  minimumConfidence: 0.5,
  learnFromAnswers: true,
  notifyOnJobDetected: true,
};

describe('setBadgeForTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets badge text, color, and title when notifyOnJobDetected is true', async () => {
    vi.mocked(getSettings).mockResolvedValue(enabledSettings);

    await setBadgeForTab(42);

    expect(mockSetBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT, tabId: 42 });
    expect(mockSetBadgeBackgroundColor).toHaveBeenCalledWith({ color: BADGE_COLOR, tabId: 42 });
    expect(mockSetTitle).toHaveBeenCalledWith({ title: BADGE_TITLE, tabId: 42 });
  });

  it('does nothing when notifyOnJobDetected is false', async () => {
    vi.mocked(getSettings).mockResolvedValue({ ...enabledSettings, notifyOnJobDetected: false });

    await setBadgeForTab(42);

    expect(mockSetBadgeText).not.toHaveBeenCalled();
    expect(mockSetBadgeBackgroundColor).not.toHaveBeenCalled();
    expect(mockSetTitle).not.toHaveBeenCalled();
  });

  it('passes the correct tabId to all chrome action calls', async () => {
    vi.mocked(getSettings).mockResolvedValue(enabledSettings);

    await setBadgeForTab(99);

    expect(mockSetBadgeText).toHaveBeenCalledWith(expect.objectContaining({ tabId: 99 }));
    expect(mockSetBadgeBackgroundColor).toHaveBeenCalledWith(expect.objectContaining({ tabId: 99 }));
    expect(mockSetTitle).toHaveBeenCalledWith(expect.objectContaining({ tabId: 99 }));
  });
});

describe('clearBadgeForTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears badge text and title for the given tab', async () => {
    await clearBadgeForTab(42);

    expect(mockSetBadgeText).toHaveBeenCalledWith({ text: '', tabId: 42 });
    expect(mockSetTitle).toHaveBeenCalledWith({ title: '', tabId: 42 });
  });

  it('does not touch badge color when clearing', async () => {
    await clearBadgeForTab(42);

    expect(mockSetBadgeBackgroundColor).not.toHaveBeenCalled();
  });

  it('passes the correct tabId when clearing', async () => {
    await clearBadgeForTab(7);

    expect(mockSetBadgeText).toHaveBeenCalledWith(expect.objectContaining({ tabId: 7 }));
    expect(mockSetTitle).toHaveBeenCalledWith(expect.objectContaining({ tabId: 7 }));
  });
});
