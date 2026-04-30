import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../shared/types';
import { mergeSettingsWithDefaults } from './storage';

describe('mergeSettingsWithDefaults', () => {
  it('fills newly added settings for older persisted settings', () => {
    expect(
      mergeSettingsWithDefaults({
        autoFillEnabled: false,
        minimumConfidence: 0.8,
      })
    ).toEqual({
      ...DEFAULT_SETTINGS,
      autoFillEnabled: false,
      minimumConfidence: 0.8,
    });
  });

  it('returns defaults when no settings are stored', () => {
    expect(mergeSettingsWithDefaults()).toEqual(DEFAULT_SETTINGS);
  });
});
