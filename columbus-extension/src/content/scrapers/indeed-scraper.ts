// Indeed job scraper

import { BaseScraper } from './base-scraper';
import type { ScrapedJob } from '@/shared/types';

export class IndeedScraper extends BaseScraper {
  readonly source = 'indeed';
  readonly urlPatterns = [
    /indeed\.com\/viewjob/,
    /indeed\.com\/jobs\//,
    /indeed\.com\/job\//,
    /indeed\.com\/rc\/clk/,
  ];

  canHandle(url: string): boolean {
    return this.urlPatterns.some((p) => p.test(url));
  }

  async scrapeJobListing(): Promise<ScrapedJob | null> {
    // Wait for job details to load
    try {
      await this.waitForElement('.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]', 3000);
    } catch {
      // Continue with available data
    }

    const title = this.extractJobTitle();
    const company = this.extractCompany();
    const location = this.extractLocation();
    const description = this.extractDescription();

    if (!title || !company || !description) {
      console.log('[Columbus] Indeed scraper: Missing required fields', { title, company, description: !!description });
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
      salary: this.extractSalaryFromPage() || this.extractSalary(description) || structuredData?.salary,
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
      '.job_seen_beacon, .jobsearch-ResultsList > li, [data-testid="job-card"]'
    );

    for (const card of jobCards) {
      try {
        const titleEl = card.querySelector(
          '.jobTitle, [data-testid="jobTitle"], h2.jobTitle a, .jcs-JobTitle'
        );
        const companyEl = card.querySelector(
          '.companyName, [data-testid="company-name"], .company_location .companyName'
        );
        const locationEl = card.querySelector(
          '.companyLocation, [data-testid="text-location"], .company_location .companyLocation'
        );
        const salaryEl = card.querySelector(
          '.salary-snippet-container, [data-testid="attribute_snippet_testid"], .estimated-salary'
        );

        const title = titleEl?.textContent?.trim();
        const company = companyEl?.textContent?.trim();
        const location = locationEl?.textContent?.trim();
        const salary = salaryEl?.textContent?.trim();

        // Get URL from title link or data attribute
        let url = (titleEl as HTMLAnchorElement)?.href;
        if (!url) {
          const jobKey = card.getAttribute('data-jk');
          if (jobKey) {
            url = `https://www.indeed.com/viewjob?jk=${jobKey}`;
          }
        }

        if (title && company && url) {
          jobs.push({
            title,
            company,
            location,
            salary,
            description: '',
            requirements: [],
            url,
            source: this.source,
            sourceJobId: this.extractJobIdFromUrl(url),
          });
        }
      } catch (err) {
        console.error('[Columbus] Error scraping Indeed job card:', err);
      }
    }

    return jobs;
  }

  private extractJobTitle(): string | null {
    const selectors = [
      '.jobsearch-JobInfoHeader-title',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1.jobsearch-JobInfoHeader-title',
      '.icl-u-xs-mb--xs h1',
      'h1[class*="JobInfoHeader"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractCompany(): string | null {
    const selectors = [
      '[data-testid="inlineHeader-companyName"] a',
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-InlineCompanyRating-companyHeader a',
      '.jobsearch-InlineCompanyRating a',
      '.icl-u-lg-mr--sm a',
      '[data-company-name="true"]',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text) return text;
    }

    return null;
  }

  private extractLocation(): string | null {
    const selectors = [
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
      '.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)',
      '.jobsearch-InlineCompanyRating + div',
      '.icl-u-xs-mt--xs .icl-u-textColor--secondary',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && !text.includes('reviews') && !text.includes('rating')) {
        return text;
      }
    }

    return null;
  }

  private extractDescription(): string | null {
    const selectors = [
      '#jobDescriptionText',
      '[data-testid="jobDescriptionText"]',
      '.jobsearch-jobDescriptionText',
      '.jobsearch-JobComponent-description',
    ];

    for (const selector of selectors) {
      const html = this.extractHtmlContent(selector);
      if (html) {
        return this.cleanDescription(html);
      }
    }

    return null;
  }

  private extractSalaryFromPage(): string | undefined {
    const selectors = [
      '[data-testid="jobsearch-JobMetadataHeader-salaryInfo"]',
      '.jobsearch-JobMetadataHeader-salaryInfo',
      '#salaryInfoAndJobType .attribute_snippet',
      '.jobsearch-JobInfoHeader-salary',
    ];

    for (const selector of selectors) {
      const text = this.extractTextContent(selector);
      if (text && text.includes('$')) {
        return text;
      }
    }

    return undefined;
  }

  private extractJobId(): string | undefined {
    // From URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const jk = urlParams.get('jk');
    if (jk) return jk;

    // From URL path
    const match = window.location.href.match(/\/job\/([a-f0-9]+)/i);
    return match?.[1];
  }

  private extractJobIdFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const jk = urlObj.searchParams.get('jk');
      if (jk) return jk;

      const match = url.match(/\/job\/([a-f0-9]+)/i);
      return match?.[1];
    } catch {
      return undefined;
    }
  }

  private extractStructuredData(): { location?: string; salary?: string; postedAt?: string } | null {
    try {
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (!ldJson?.textContent) return null;

      const data = JSON.parse(ldJson.textContent);

      // Indeed may have an array of structured data
      const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;

      if (!jobData || jobData['@type'] !== 'JobPosting') return null;

      return {
        location: jobData.jobLocation?.address?.addressLocality ||
                  jobData.jobLocation?.address?.name,
        salary: jobData.baseSalary?.value
          ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''} ${jobData.baseSalary.value.unitText || ''}`
          : undefined,
        postedAt: jobData.datePosted,
      };
    } catch {
      return null;
    }
  }
}
