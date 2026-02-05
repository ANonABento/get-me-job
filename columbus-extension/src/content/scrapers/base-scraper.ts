// Base scraper interface and utilities

import type { ScrapedJob } from '@/shared/types';

export abstract class BaseScraper {
  abstract readonly source: string;
  abstract readonly urlPatterns: RegExp[];

  abstract canHandle(url: string): boolean;
  abstract scrapeJobListing(): Promise<ScrapedJob | null>;
  abstract scrapeJobList(): Promise<ScrapedJob[]>;

  // Shared utilities
  protected extractTextContent(selector: string): string | null {
    const el = document.querySelector(selector);
    return el?.textContent?.trim() || null;
  }

  protected extractHtmlContent(selector: string): string | null {
    const el = document.querySelector(selector);
    return el?.innerHTML?.trim() || null;
  }

  protected extractAttribute(selector: string, attr: string): string | null {
    const el = document.querySelector(selector);
    return el?.getAttribute(attr) || null;
  }

  protected extractAllText(selector: string): string[] {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements)
      .map((el) => el.textContent?.trim())
      .filter((text): text is string => !!text);
  }

  protected waitForElement(selector: string, timeout = 5000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver((_, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
      }, timeout);
    });
  }

  protected extractRequirements(text: string): string[] {
    const requirements: string[] = [];

    // Split by common bullet patterns
    const lines = text.split(/\n|•|◦|◆|▪|●|-\s|\*\s/);

    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned.length > 20 && cleaned.length < 500) {
        // Check if it looks like a requirement
        if (
          cleaned.match(
            /^(you|we|the|must|should|will|experience|proficiency|knowledge|ability|strong|excellent)/i
          ) ||
          cleaned.match(/required|preferred|bonus|plus/i) ||
          cleaned.match(/^\d+\+?\s*years?/i)
        ) {
          requirements.push(cleaned);
        }
      }
    }

    return requirements.slice(0, 15);
  }

  protected extractKeywords(text: string): string[] {
    const keywords: Set<string> = new Set();

    // Common tech skills patterns
    const techPatterns = [
      /\b(react|angular|vue|svelte|next\.?js|nuxt)\b/gi,
      /\b(node\.?js|express|fastify|nest\.?js)\b/gi,
      /\b(python|django|flask|fastapi)\b/gi,
      /\b(java|spring|kotlin)\b/gi,
      /\b(go|golang|rust|c\+\+|c#|\.net)\b/gi,
      /\b(typescript|javascript|es6)\b/gi,
      /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch)\b/gi,
      /\b(aws|gcp|azure|docker|kubernetes|k8s)\b/gi,
      /\b(git|ci\/cd|jenkins|github\s*actions)\b/gi,
      /\b(graphql|rest|api|microservices)\b/gi,
    ];

    for (const pattern of techPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((m) => keywords.add(m.toLowerCase().trim()));
      }
    }

    return Array.from(keywords);
  }

  protected detectJobType(text: string): 'full-time' | 'part-time' | 'contract' | 'internship' | undefined {
    const lower = text.toLowerCase();

    if (lower.includes('intern') || lower.includes('internship') || lower.includes('co-op')) {
      return 'internship';
    }
    if (lower.includes('contract') || lower.includes('contractor')) {
      return 'contract';
    }
    if (lower.includes('part-time') || lower.includes('part time')) {
      return 'part-time';
    }
    if (lower.includes('full-time') || lower.includes('full time')) {
      return 'full-time';
    }

    return undefined;
  }

  protected detectRemote(text: string): boolean {
    const lower = text.toLowerCase();
    return (
      lower.includes('remote') ||
      lower.includes('work from home') ||
      lower.includes('wfh') ||
      lower.includes('fully distributed') ||
      lower.includes('anywhere')
    );
  }

  protected extractSalary(text: string): string | undefined {
    // Match salary patterns like $100,000 - $150,000 or $100k - $150k
    const pattern =
      /\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?(?:\s*(?:per|\/)\s*(?:year|yr|annum|annual|hour|hr))?/gi;
    const match = pattern.exec(text);
    return match ? match[0] : undefined;
  }

  protected cleanDescription(html: string): string {
    // Remove HTML tags but preserve line breaks
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
