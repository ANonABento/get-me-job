import { describe, expect, it } from 'vitest';
import { formatConfidencePercent, toggleScrapeSource } from './settings-metadata';

describe('formatConfidencePercent', () => {
  it('formats confidence as a rounded percentage', () => {
    expect(formatConfidencePercent(0.56)).toBe('56%');
    expect(formatConfidencePercent(0.555)).toBe('56%');
  });
});

describe('toggleScrapeSource', () => {
  it('adds a source once when enabled', () => {
    expect(toggleScrapeSource(['linkedin'], 'indeed', true)).toEqual([
      'linkedin',
      'indeed',
    ]);
    expect(toggleScrapeSource(['linkedin'], 'linkedin', true)).toEqual(['linkedin']);
  });

  it('removes a source when disabled', () => {
    expect(toggleScrapeSource(['linkedin', 'indeed'], 'linkedin', false)).toEqual([
      'indeed',
    ]);
  });
});
