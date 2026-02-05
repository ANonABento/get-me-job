// Generic job scraper for unknown sites

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class GenericScraper extends BaseScraper {
  readonly source = 'unknown';
  readonly urlPatterns: RegExp[] = [];

  canHandle(_url: string): boolean {
    // Generic scraper always returns true as fallback
    return true;
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Try to extract job information using common patterns

    // Check for structured data first
    const structuredData = this.extractStructuredData();
    if (structuredData) {
      return structuredData;
    }

    // Try common selectors
    const title = this.findTitle();
    const company = this.findCompany();
    const description = this.findDescription();

    if (!title || !description) {
      console.log('[Columbus] Generic scraper: Could not find required fields');
      return null;
    }

    const location = this.findLocation();

    return {
      title,
      company: company || 'Unknown Company',
      location,
      description,
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary: this.extractSalary(description),
      type: this.detectJobType(description),
      remote: this.detectRemote(location || '') || this.detectRemote(description),
      url: window.location.href,
      source: this.detectSource(),
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    // Generic scraping of job lists is unreliable
    // Return empty array for unknown sites
    return [];
  }

  private extractStructuredData(): ScrapedJob | null {
    try {
      // Look for JSON-LD job posting schema
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');

      for (const script of scripts) {
        const data = JSON.parse(script.textContent || '');

        // Handle single job posting
        if (data['@type'] === 'JobPosting') {
          return this.parseJobPostingSchema(data);
        }

        // Handle array of items
        if (Array.isArray(data)) {
          const jobPosting = data.find((item) => item['@type'] === 'JobPosting');
          if (jobPosting) {
            return this.parseJobPostingSchema(jobPosting);
          }
        }

        // Handle @graph
        if (data['@graph']) {
          const jobPosting = data['@graph'].find((item: { '@type': string }) => item['@type'] === 'JobPosting');
          if (jobPosting) {
            return this.parseJobPostingSchema(jobPosting);
          }
        }
      }
    } catch (err) {
      console.log('[Columbus] Could not parse structured data:', err);
    }

    return null;
  }

  private parseJobPostingSchema(data: Record<string, unknown>): ScrapedJob {
    const title = (data.title as string) || '';
    const company = (data.hiringOrganization as Record<string, string>)?.name || '';
    const description = (data.description as string) || '';

    // Extract location
    let location: string | undefined;
    const jobLocation = data.jobLocation as Record<string, unknown>;
    if (jobLocation) {
      const address = jobLocation.address as Record<string, string>;
      if (address) {
        location = [address.addressLocality, address.addressRegion, address.addressCountry]
          .filter(Boolean)
          .join(', ');
      }
    }

    // Extract salary
    let salary: string | undefined;
    const baseSalary = data.baseSalary as Record<string, unknown>;
    if (baseSalary) {
      const value = baseSalary.value as Record<string, number>;
      if (value) {
        const currency = (baseSalary.currency as string) || 'USD';
        const min = value.minValue;
        const max = value.maxValue;
        if (min && max) {
          salary = `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
        } else if (value as unknown as number) {
          salary = `${currency} ${(value as unknown as number).toLocaleString()}`;
        }
      }
    }

    return {
      title,
      company,
      location,
      description: this.cleanDescription(description),
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary,
      type: this.parseEmploymentType(data.employmentType as string),
      remote: this.detectRemote(description),
      url: window.location.href,
      source: this.detectSource(),
      postedAt: data.datePosted as string,
    };
  }

  private parseEmploymentType(type?: string): 'full-time' | 'part-time' | 'contract' | 'internship' | undefined {
    if (!type) return undefined;
    const lower = type.toLowerCase();

    if (lower.includes('full')) return 'full-time';
    if (lower.includes('part')) return 'part-time';
    if (lower.includes('contract') || lower.includes('temporary')) return 'contract';
    if (lower.includes('intern')) return 'internship';

    return undefined;
  }

  private findTitle(): string | null {
    // Common title selectors
    const selectors = [
      'h1[class*="title"]',
      'h1[class*="job"]',
      '.job-title',
      '.posting-title',
      '[class*="job-title"]',
      '[class*="posting-title"]',
      'h1',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && text.length > 3 && text.length < 200) {
        // Filter out common non-title content
        if (!text.toLowerCase().includes('sign in') && !text.toLowerCase().includes('log in')) {
          return text;
        }
      }
    }

    // Try document title
    const docTitle = document.title;
    if (docTitle && docTitle.length > 5) {
      // Remove common suffixes
      const cleaned = docTitle
        .replace(/\s*[-|]\s*.+$/, '')
        .replace(/\s*at\s+.+$/i, '')
        .trim();
      if (cleaned.length > 3) {
        return cleaned;
      }
    }

    return null;
  }

  private findCompany(): string | null {
    const selectors = [
      '[class*="company-name"]',
      '[class*="employer"]',
      '[class*="organization"]',
      '.company',
      '.employer',
      'a[href*="company"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && text.length > 1 && text.length < 100) {
        return text;
      }
    }

    // Try meta tags
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      const content = ogSiteName.getAttribute('content');
      if (content) return content;
    }

    return null;
  }

  private findDescription(): string | null {
    const selectors = [
      '.job-description',
      '.posting-description',
      '[class*="job-description"]',
      '[class*="posting-description"]',
      '[class*="description"]',
      'article',
      '.content',
      'main',
    ];

    for (const selector of selectors) {
      const html = this.extractHtmlContent(selector);
      if (html && html.length > 100) {
        return this.cleanDescription(html);
      }
    }

    return null;
  }

  private findLocation(): string | null {
    const selectors = [
      '[class*="location"]',
      '[class*="address"]',
      '.location',
      '.job-location',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && text.length > 2 && text.length < 100) {
        return text;
      }
    }

    return null;
  }

  private detectSource(): string {
    const hostname = window.location.hostname.toLowerCase();

    // Remove common prefixes
    const cleaned = hostname
      .replace(/^www\./, '')
      .replace(/^jobs\./, '')
      .replace(/^careers\./, '');

    // Extract main domain
    const parts = cleaned.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }

    return cleaned;
  }
}
