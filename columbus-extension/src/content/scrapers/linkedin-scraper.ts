// LinkedIn job scraper

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class LinkedInScraper extends BaseScraper {
  readonly source = 'linkedin';
  readonly urlPatterns = [
    /linkedin\.com\/jobs\/view\/(\d+)/,
    /linkedin\.com\/jobs\/search/,
    /linkedin\.com\/jobs\/collections/,
  ];

  canHandle(url: string): boolean {
    return this.urlPatterns.some((p) => p.test(url));
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Wait for job details to load
    try {
      await this.waitForElement('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title', 3000);
    } catch {
      // Try alternative selectors
    }

    // Try multiple selector strategies (LinkedIn changes DOM frequently)
    const title = this.extractJobTitle();
    const company = this.extractCompany();
    const location = this.extractLocation();
    const description = this.extractDescription();

    if (!title || !company || !description) {
      console.log('[Columbus] LinkedIn scraper: Missing required fields', { title, company, description: !!description });
      return null;
    }

    // Try to extract from structured data
    const structuredData = this.extractStructuredData();

    return {
      title,
      company,
      location: location || structuredData?.location,
      description,
      requirements: this.extractRequirements(description),
      keywords: this.extractKeywords(description),
      salary: this.extractSalary(description) || structuredData?.salary,
      type: this.detectJobType(description),
      remote: this.detectRemote(location || '') || this.detectRemote(description),
      url: window.location.href,
      source: this.source,
      sourceJobId: this.extractJobId(),
      postedAt: structuredData?.postedAt,
    };
  }

  async scrapeJobList(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Job cards in search results
    const jobCards = document.querySelectorAll(
      '.job-card-container, .jobs-search-results__list-item, .scaffold-layout__list-item'
    );

    for (const card of jobCards) {
      try {
        const titleEl = card.querySelector(
          '.job-card-list__title, .job-card-container__link, a[data-control-name="job_card_title"]'
        );
        const companyEl = card.querySelector(
          '.job-card-container__company-name, .job-card-container__primary-description'
        );
        const locationEl = card.querySelector('.job-card-container__metadata-item');

        const title = titleEl?.textContent?.trim();
        const company = companyEl?.textContent?.trim();
        const location = locationEl?.textContent?.trim();
        const url = (titleEl as HTMLAnchorElement)?.href;

        if (title && company && url) {
          jobs.push({
            title,
            company,
            location,
            description: '', // Would need to navigate to get full description
            requirements: [],
            url,
            source: this.source,
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping job card:', err);
      }
    }

    return jobs;
  }

  private extractJobTitle(): string | null {
    const selectors = [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.t-24.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      '.jobs-top-card__job-title',
      'h1[class*="job-title"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractCompany(): string | null {
    const selectors = [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.jobs-top-card__company-url',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '.job-details-jobs-unified-top-card__primary-description-container a',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractLocation(): string | null {
    const selectors = [
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.jobs-top-card__bullet',
      '.job-details-jobs-unified-top-card__primary-description-container .t-black--light',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && !text.includes('applicant') && !text.includes('ago')) {
        return text;
      }
    }

    return null;
  }

  private extractDescription(): string | null {
    const selectors = [
      '.jobs-description__content',
      '.jobs-description-content__text',
      '.jobs-box__html-content',
      '#job-details',
      '.jobs-description',
    ];

    for (const selector of selectors) {
      const html = this.extractHtmlContent(selector);
      if (html) {
        return this.cleanDescription(html);
      }
    }

    return null;
  }

  private extractJobId(): string | undefined {
    const match = window.location.href.match(/\/view\/(\d+)/);
    return match?.[1];
  }

  private extractStructuredData(): { location?: string; salary?: string; postedAt?: string } | null {
    try {
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (!ldJson?.textContent) return null;

      const data = JSON.parse(ldJson.textContent);

      return {
        location: data.jobLocation?.address?.addressLocality,
        salary: data.baseSalary?.value
          ? `$${data.baseSalary.value.minValue || ''}-${data.baseSalary.value.maxValue || ''}`
          : undefined,
        postedAt: data.datePosted,
      };
    } catch {
      return null;
    }
  }
}
