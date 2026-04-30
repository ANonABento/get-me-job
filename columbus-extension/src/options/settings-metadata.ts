export interface ScrapeSiteOption {
  source: string;
  label: string;
  description: string;
}

export const SCRAPE_SITE_OPTIONS: ScrapeSiteOption[] = [
  {
    source: 'linkedin',
    label: 'LinkedIn',
    description: 'Job posts and search results on linkedin.com',
  },
  {
    source: 'indeed',
    label: 'Indeed',
    description: 'Listings and detail pages on indeed.com',
  },
  {
    source: 'greenhouse',
    label: 'Greenhouse',
    description: 'Company boards powered by Greenhouse',
  },
  {
    source: 'lever',
    label: 'Lever',
    description: 'Company boards powered by Lever',
  },
  {
    source: 'waterlooworks',
    label: 'WaterlooWorks',
    description: 'University of Waterloo co-op postings',
  },
  {
    source: 'unknown',
    label: 'Other sites',
    description: 'Use the generic scraper when no specialized scraper matches',
  },
];

export function formatConfidencePercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function toggleScrapeSource(
  enabledSources: string[],
  source: string,
  enabled: boolean
): string[] {
  if (enabled) {
    return enabledSources.includes(source) ? enabledSources : [...enabledSources, source];
  }

  return enabledSources.filter((enabledSource) => enabledSource !== source);
}
