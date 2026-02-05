// Waterloo Works job scraper (University of Waterloo co-op portal)

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class WaterlooWorksScraper extends BaseScraper {
  readonly source = 'waterlooworks';
  readonly urlPatterns = [/waterlooworks\.uwaterloo\.ca/];

  canHandle(url: string): boolean {
    return this.urlPatterns.some((p) => p.test(url));
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Check if user is logged in
    if (this.isLoginPage()) {
      console.log('[Columbus] Waterloo Works: Please log in first');
      return null;
    }

    // Wait for job details to load
    try {
      await this.waitForElement('.posting-details, .job-posting-details, #postingDiv', 3000);
    } catch {
      console.log('[Columbus] Waterloo Works: Could not find job details');
      return null;
    }

    const title = this.extractJobTitle();
    const company = this.extractCompany();
    const description = this.extractDescription();

    if (!title || !company || !description) {
      console.log('[Columbus] Waterloo Works scraper: Missing required fields');
      return null;
    }

    const location = this.extractLocation();
    const deadline = this.extractDeadline();
    const details = this.extractDetailsTable();

    return {
      title,
      company,
      location: location || details.location,
      description,
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary: details.salary,
      type: 'internship', // Waterloo Works is for co-op/internships
      remote: this.detectRemote(location || '') || this.detectRemote(description),
      url: window.location.href,
      source: this.source,
      sourceJobId: details.jobId,
      deadline,
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Check if logged in
    if (this.isLoginPage()) {
      console.log('[Columbus] Waterloo Works: Please log in to scrape job list');
      return jobs;
    }

    // Job listings are typically in a table
    const rows = document.querySelectorAll(
      '.job-listing-table tbody tr, #postingsTable tbody tr, .orbisModuleBody table tbody tr'
    );

    for (const row of rows) {
      try {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;

        // Typical structure: Job Title | Company | Location | Deadline | ...
        const titleCell = cells[0];
        const titleLink = titleCell.querySelector('a');
        const title = titleLink?.textContent?.trim() || titleCell.textContent?.trim();
        const url = titleLink?.href;

        const company = cells[1]?.textContent?.trim();
        const location = cells[2]?.textContent?.trim();
        const deadline = cells[3]?.textContent?.trim();

        if (title && company && url) {
          jobs.push({
            title,
            company,
            location,
            description: '', // Need to navigate for full description
            requirements: [],
            url,
            source: this.source,
            type: 'internship',
            deadline,
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping Waterloo Works row:', err);
      }
    }

    // Also try card-based layouts (newer UI)
    const cards = document.querySelectorAll('.job-card, .posting-card, [class*="posting-item"]');
    for (const card of cards) {
      try {
        const titleEl = card.querySelector('.job-title, .posting-title, h3, h4');
        const companyEl = card.querySelector('.employer-name, .company-name, [class*="employer"]');
        const locationEl = card.querySelector('.job-location, .location, [class*="location"]');
        const linkEl = card.querySelector('a[href*="posting"]');

        const title = titleEl?.textContent?.trim();
        const company = companyEl?.textContent?.trim();
        const location = locationEl?.textContent?.trim();
        const url = (linkEl as HTMLAnchorElement)?.href;

        if (title && company && url) {
          jobs.push({
            title,
            company,
            location,
            description: '',
            requirements: [],
            url,
            source: this.source,
            type: 'internship',
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping Waterloo Works card:', err);
      }
    }

    return jobs;
  }

  private isLoginPage(): boolean {
    const url = window.location.href.toLowerCase();
    return (
      url.includes('login') ||
      url.includes('signin') ||
      url.includes('cas/') ||
      document.querySelector('input[type="password"]') !== null
    );
  }

  private extractJobTitle(): string | null {
    const selectors = [
      '.posting-title',
      '.job-title',
      '#postingDiv h1',
      '.job-posting-details h1',
      '[class*="posting"] h1',
      'h1',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && text.length > 3 && text.length < 200) {
        return text;
      }
    }

    return null;
  }

  private extractCompany(): string | null {
    const selectors = [
      '.employer-name',
      '.company-name',
      '.organization-name',
      '[class*="employer"]',
      'td:contains("Organization") + td',
      'th:contains("Organization") + td',
    ];

    for (const selector of selectors) {
      try {
        const text = this.extractTextContent(selector);
        if (text && text.length > 1) return text;
      } catch {
        // Selector might be invalid
      }
    }

    // Try table-based extraction
    const rows = document.querySelectorAll('tr, .detail-row');
    for (const row of rows) {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes('organization') || text.includes('employer') || text.includes('company')) {
        const cells = row.querySelectorAll('td, .value, dd');
        if (cells.length > 0) {
          const value = cells[cells.length - 1].textContent?.trim();
          if (value && value.length > 1) return value;
        }
      }
    }

    return null;
  }

  private extractLocation(): string | null {
    const selectors = [
      '.job-location',
      '.location',
      '[class*="location"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    // Try table-based extraction
    const rows = document.querySelectorAll('tr, .detail-row');
    for (const row of rows) {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes('location') || text.includes('city') || text.includes('region')) {
        const cells = row.querySelectorAll('td, .value, dd');
        if (cells.length > 0) {
          const value = cells[cells.length - 1].textContent?.trim();
          if (value) return value;
        }
      }
    }

    return null;
  }

  private extractDescription(): string | null {
    const selectors = [
      '.job-description',
      '.posting-description',
      '#postingDiv .description',
      '.job-posting-details .description',
      '[class*="description"]',
    ];

    for (const selector of selectors) {
      const html = this.extractHtmlContent(selector);
      if (html && html.length > 50) {
        return this.cleanDescription(html);
      }
    }

    // Try to find the main content area
    const mainContent = document.querySelector('.posting-details, #postingDiv, .job-posting-details');
    if (mainContent) {
      const html = mainContent.innerHTML;
      return this.cleanDescription(html);
    }

    return null;
  }

  private extractDeadline(): string | undefined {
    const selectors = [
      '.application-deadline',
      '.deadline',
      '[class*="deadline"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    // Try table-based extraction
    const rows = document.querySelectorAll('tr, .detail-row');
    for (const row of rows) {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes('deadline') || text.includes('apply by') || text.includes('due')) {
        const cells = row.querySelectorAll('td, .value, dd');
        if (cells.length > 0) {
          const value = cells[cells.length - 1].textContent?.trim();
          if (value) return value;
        }
      }
    }

    return undefined;
  }

  private extractDetailsTable(): Record<string, string | undefined> {
    const details: Record<string, string | undefined> = {};
    const rows = document.querySelectorAll('tr, .detail-row, dt');

    for (const row of rows) {
      const text = row.textContent?.toLowerCase() || '';

      let label: string | null = null;
      let value: string | null = null;

      // Handle dt/dd pairs
      if (row.tagName === 'DT') {
        label = row.textContent?.trim() || null;
        const dd = row.nextElementSibling;
        if (dd?.tagName === 'DD') {
          value = dd.textContent?.trim() || null;
        }
      } else {
        // Handle table rows
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          label = cells[0].textContent?.trim()?.toLowerCase() || null;
          value = cells[1].textContent?.trim() || null;
        }
      }

      if (label && value) {
        if (label.includes('job id') || label.includes('posting id')) {
          details.jobId = value;
        }
        if (label.includes('location') || label.includes('city')) {
          details.location = value;
        }
        if (label.includes('salary') || label.includes('compensation') || label.includes('pay')) {
          details.salary = value;
        }
      }
    }

    return details;
  }
}
