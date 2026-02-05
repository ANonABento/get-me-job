// Lever job board scraper

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class LeverScraper extends BaseScraper {
  readonly source = 'lever';
  readonly urlPatterns = [
    /jobs\.lever\.co\/[\w-]+\/[\w-]+/,
    /[\w-]+\.lever\.co\/[\w-]+/,
  ];

  canHandle(url: string): boolean {
    return this.urlPatterns.some((p) => p.test(url));
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Wait for job content to load
    try {
      await this.waitForElement('.posting-headline h2, .posting-headline h1, .section-wrapper', 3000);
    } catch {
      // Continue with available data
    }

    const title = this.extractJobTitle();
    const company = this.extractCompany();
    const location = this.extractLocation();
    const description = this.extractDescription();

    if (!title || !company || !description) {
      console.log('[Columbus] Lever scraper: Missing required fields', { title, company, description: !!description });
      return null;
    }

    const structuredData = this.extractStructuredData();
    const commitment = this.extractCommitment();

    return {
      title,
      company,
      location: location || structuredData?.location,
      description,
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary: this.extractSalary(description) || structuredData?.salary,
      type: this.detectJobTypeFromCommitment(commitment) || this.detectJobType(description),
      remote: this.detectRemote(location || '') || this.detectRemote(description),
      url: window.location.href,
      source: this.source,
      sourceJobId: this.extractJobId(),
      postedAt: structuredData?.postedAt,
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Job postings on company page
    const jobCards = document.querySelectorAll(
      '.posting, [data-qa="posting-name"]'
    );

    for (const card of jobCards) {
      try {
        const titleEl = card.querySelector('.posting-title h5, .posting-name, a[data-qa="posting-name"]');
        const locationEl = card.querySelector('.location, .posting-categories .sort-by-location, .workplaceTypes');
        const commitmentEl = card.querySelector('.commitment, .posting-categories .sort-by-commitment');

        const title = titleEl?.textContent?.trim();
        const location = locationEl?.textContent?.trim();
        const commitment = commitmentEl?.textContent?.trim();
        const url = (card.querySelector('a.posting-title, a[data-qa="posting-name"]') as HTMLAnchorElement)?.href ||
                    (card as HTMLAnchorElement).href;

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
            type: this.detectJobTypeFromCommitment(commitment),
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping Lever job card:', err);
      }
    }

    return jobs;
  }

  private extractJobTitle(): string | null {
    const selectors = [
      '.posting-headline h2',
      '.posting-headline h1',
      '[data-qa="posting-name"]',
      '.posting-header h2',
      '.section.page-centered.posting-header h1',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractCompany(): string | null {
    // Try logo alt text
    const logo = document.querySelector('.main-header-logo img, .posting-header .logo img, header img');
    if (logo) {
      const alt = logo.getAttribute('alt');
      if (alt && alt !== 'Company Logo') return alt;
    }

    // Try page title
    const pageTitle = document.title;
    if (pageTitle) {
      // Format: "Job Title - Company Name"
      const parts = pageTitle.split(' - ');
      if (parts.length >= 2) {
        return parts[parts.length - 1].replace(' Jobs', '').trim();
      }
    }

    // Extract from URL
    const match = window.location.href.match(/lever\.co\/([^/]+)/);
    if (match) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return null;
  }

  private extractLocation(): string | null {
    const selectors = [
      '.posting-categories .location',
      '.posting-headline .location',
      '.sort-by-location',
      '.workplaceTypes',
      '[data-qa="posting-location"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractCommitment(): string | null {
    const selectors = [
      '.posting-categories .commitment',
      '.sort-by-commitment',
      '[data-qa="posting-commitment"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractDescription(): string | null {
    const selectors = [
      '.posting-page .content',
      '.section-wrapper.page-full-width',
      '.section.page-centered',
      '[data-qa="job-description"]',
      '.posting-description',
    ];

    for (const selector of selectors) {
      // For Lever, we want to get all content sections
      const sections = document.querySelectorAll(selector);
      if (sections.length > 0) {
        const html = Array.from(sections)
          .map((s) => s.innerHTML)
          .join('\n\n');
        if (html.length > 100) {
          return this.cleanDescription(html);
        }
      }
    }

    // Try getting the main content area
    const mainContent = document.querySelector('.content-wrapper .content, main .content');
    if (mainContent) {
      return this.cleanDescription(mainContent.innerHTML);
    }

    return null;
  }

  private extractJobId(): string | undefined {
    // From URL: jobs.lever.co/company/job-id-uuid
    const match = window.location.href.match(/lever\.co\/[^/]+\/([a-f0-9-]+)/i);
    return match?.[1];
  }

  private extractJobIdFromUrl(url: string): string | undefined {
    const match = url.match(/lever\.co\/[^/]+\/([a-f0-9-]+)/i);
    return match?.[1];
  }

  private detectJobTypeFromCommitment(
    commitment: string | null
  ): 'full-time' | 'part-time' | 'contract' | 'internship' | undefined {
    if (!commitment) return undefined;

    const lower = commitment.toLowerCase();
    if (lower.includes('full-time') || lower.includes('full time')) return 'full-time';
    if (lower.includes('part-time') || lower.includes('part time')) return 'part-time';
    if (lower.includes('contract') || lower.includes('contractor')) return 'contract';
    if (lower.includes('intern')) return 'internship';

    return undefined;
  }

  private extractStructuredData(): {
    location?: string;
    salary?: string;
    postedAt?: string;
  } | null {
    try {
      const ldJsonElements = document.querySelectorAll('script[type="application/ld+json"]');

      for (const el of ldJsonElements) {
        if (!el.textContent) continue;

        const data = JSON.parse(el.textContent);
        const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;

        if (!jobData || jobData['@type'] !== 'JobPosting') continue;

        return {
          location: typeof jobData.jobLocation === 'string'
            ? jobData.jobLocation
            : jobData.jobLocation?.address?.addressLocality ||
              jobData.jobLocation?.name,
          salary: jobData.baseSalary?.value
            ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''}`
            : undefined,
          postedAt: jobData.datePosted,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
