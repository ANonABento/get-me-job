// Scraper registry - maps URLs to appropriate scrapers

import type { BaseScraper } from './base-scraper';
import { LinkedInScraper } from './linkedin-scraper';
import { WaterlooWorksScraper } from './waterloo-works-scraper';
import { IndeedScraper } from './indeed-scraper';
import { GreenhouseScraper } from './greenhouse-scraper';
import { LeverScraper } from './lever-scraper';
import { GenericScraper } from './generic-scraper';

// Initialize all scrapers
const scrapers: BaseScraper[] = [
  new LinkedInScraper(),
  new WaterlooWorksScraper(),
  new IndeedScraper(),
  new GreenhouseScraper(),
  new LeverScraper(),
];

const genericScraper = new GenericScraper();

/**
 * Get the appropriate scraper for a URL
 */
export function getScraperForUrl(url: string): BaseScraper {
  const scraper = scrapers.find((s) => s.canHandle(url));
  return scraper || genericScraper;
}

/**
 * Check if we have a specialized scraper for this URL
 */
export function hasSpecializedScraper(url: string): boolean {
  return scrapers.some((s) => s.canHandle(url));
}

/**
 * Get all available scraper sources
 */
export function getAvailableSources(): string[] {
  return scrapers.map((s) => s.source);
}
