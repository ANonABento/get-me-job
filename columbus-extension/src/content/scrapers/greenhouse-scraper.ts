// Greenhouse job board scraper

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class GreenhouseScraper extends BaseScraper {
  readonly source = 'greenhouse';
  readonly urlPatterns = [
    /boards\.greenhouse\.io\/[\w-]+\/jobs\/\d+/,
    /[\w-]+\.greenhouse\.io\/jobs\/\d+/,
    /greenhouse\.io\/embed\/job_app/,
  ];

  canHandle(url: string): boolean {
    return this.urlPatterns.some((p) => p.test(url));
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Wait for job content to load
    try {
      await this.waitForElement('.app-title, #header .company-name, .job-title', 3000);
    } catch {
      // Continue with available data
    }

    const title = this.extractJobTitle();
    const company = this.extractCompany();
    const location = this.extractLocation();
    const description = this.extractDescription();

    if (!title || !company || !description) {
      console.log('[Columbus] Greenhouse scraper: Missing required fields', { title, company, description: !!description });
      return null;
    }

    const structuredData = this.extractStructuredData();

    return {
      title,
      company,
      location: location || structuredData?.location,
      description,
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary: this.extractSalary(description) || structuredData?.salary,
      type: this.detectJobType(description) || structuredData?.type,
      remote: this.detectRemote(location || '') || this.detectRemote(description),
      url: window.location.href,
      source: this.source,
      sourceJobId: this.extractJobId(),
      postedAt: structuredData?.postedAt,
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Job cards on department/listing pages
    const jobCards = document.querySelectorAll(
      '.opening, .job-post, [data-mapped="true"], section.level-0 > div'
    );

    for (const card of jobCards) {
      try {
        const titleEl = card.querySelector('a, .opening-title, .job-title');
        const locationEl = card.querySelector('.location, .job-location, span:last-child');

        const title = titleEl?.textContent?.trim();
        const location = locationEl?.textContent?.trim();
        const url = (titleEl as HTMLAnchorElement)?.href;

        // Company is usually in header
        const company = this.extractCompany();

        if (title && url && company) {
          jobs.push({
            title,
            company,
            location,
            description: '',
            requirements: [],
            url,
            source: this.source,
            sourceJobId: this.extractJobIdFromUrl(url),
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping Greenhouse job card:', err);
      }
    }

    return jobs;
  }

  private extractJobTitle(): string | null {
    const selectors = [
      '.app-title',
      '.job-title',
      'h1.heading',
      '.job-info h1',
      '#header h1',
      'h1[class*="job"]',
      '.hero h1',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    // Try structured data
    const ldJson = this.extractStructuredData();
    if (ldJson?.title) return ldJson.title;

    return null;
  }

  private extractCompany(): string | null {
    const selectors = [
      '.company-name',
      '#header .company-name',
      '.logo-wrapper img[alt]',
      '.company-header .name',
      'meta[property="og:site_name"]',
    ];

    for (const selector of selectors) {
      if (selector.includes('meta')) {
        const meta = document.querySelector(selector);
        const content = meta?.getAttribute('content');
        if (content) return content;
      } else if (selector.includes('img[alt]')) {
        const img = document.querySelector(selector);
        const alt = img?.getAttribute('alt');
        if (alt) return alt;
      } else {
        const text = this.extractTextContent(selector);
        if (text) return text;
      }
    }

    // Extract from URL (boards.greenhouse.io/COMPANY/jobs/...)
    const match = window.location.href.match(/greenhouse\.io\/([^/]+)/);
    if (match && match[1] !== 'jobs') {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return null;
  }

  private extractLocation(): string | null {
    const selectors = [
      '.location',
      '.job-location',
      '.company-location',
      '.job-info .location',
      '#header .location',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractDescription(): string | null {
    const selectors = [
      '#content',
      '.job-description',
      '.content-wrapper .content',
      '#job_description',
      '.job-content',
      '.job-info .content',
    ];

    for (const selector of selectors) {
      const html = this.extractHtmlContent(selector);
      if (html && html.length > 100) {
        return this.cleanDescription(html);
      }
    }

    return null;
  }

  private extractJobId(): string | undefined {
    // From URL: boards.greenhouse.io/company/jobs/12345
    const match = window.location.href.match(/\/jobs\/(\d+)/);
    return match?.[1];
  }

  private extractJobIdFromUrl(url: string): string | undefined {
    const match = url.match(/\/jobs\/(\d+)/);
    return match?.[1];
  }

  private extractStructuredData(): {
    title?: string;
    location?: string;
    salary?: string;
    postedAt?: string;
    type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  } | null {
    try {
      const ldJsonElements = document.querySelectorAll('script[type="application/ld+json"]');

      for (const el of ldJsonElements) {
        if (!el.textContent) continue;

        const data = JSON.parse(el.textContent);
        const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;

        if (!jobData || jobData['@type'] !== 'JobPosting') continue;

        const employmentType = jobData.employmentType?.toLowerCase();
        let type: 'full-time' | 'part-time' | 'contract' | 'internship' | undefined;
        if (employmentType?.includes('full')) type = 'full-time';
        else if (employmentType?.includes('part')) type = 'part-time';
        else if (employmentType?.includes('contract')) type = 'contract';
        else if (employmentType?.includes('intern')) type = 'internship';

        return {
          title: jobData.title,
          location: typeof jobData.jobLocation === 'string'
            ? jobData.jobLocation
            : jobData.jobLocation?.address?.addressLocality ||
              jobData.jobLocation?.address?.name ||
              jobData.jobLocation?.name,
          salary: jobData.baseSalary?.value
            ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''}`
            : undefined,
          postedAt: jobData.datePosted,
          type,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
