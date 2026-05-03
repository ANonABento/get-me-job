/**
 * Columbus Extension E2E Tests
 *
 * Loads the built extension in a persistent Chromium context and verifies:
 * - Background service worker starts without errors
 * - Popup renders expected DOM
 * - Options page renders expected DOM
 * - Content script injects on a fixture page without errors
 * - LinkedIn scraper selectors extract expected fields from the fixture HTML
 */
import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const pathToExtension = path.join(__dirname, '../../dist');
const fixturesPath = path.join(__dirname, '../fixtures');

// Time to let content.js initialise after navigation (MV3 injection is async)
const CONTENT_SCRIPT_INIT_MS = 800;

let context: BrowserContext;
let extensionId: string;
let userDataDir: string;

async function gotoLinkedInFixture(page: Page) {
  const fixturePath = path.resolve(fixturesPath, 'linkedin-mock.html');
  await page.goto(`file://${fixturePath}`);
  await page.waitForLoadState('domcontentloaded');
}

test.beforeAll(async () => {
  userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'columbus-pw-'));

  context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',           // required in CI environments without a user namespace
      '--disable-setuid-sandbox',
    ],
  });

  // Wait for the background service worker to register
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker', { timeout: 10_000 });
  }

  // chrome-extension://<id>/background.js → split on '/' → index 2
  extensionId = background.url().split('/')[2];
});

test.afterAll(async () => {
  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

test('background service worker registers with a valid extension ID', () => {
  expect(extensionId).toBeTruthy();
  // Extension IDs are 32 lowercase letters
  expect(extensionId).toMatch(/^[a-z]{32}$/);
});

test('popup renders Columbus heading and Connect Account button', async () => {
  const page = await context.newPage();
  try {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Wait for React to mount and auth check to complete (transitions out of loading state)
    await expect(page.locator('button:has-text("Connect Account")')).toBeVisible({
      timeout: 10_000,
    });

    // Heading — use hasText to avoid matching on the first h1 regardless of content
    await expect(page.locator('h1', { hasText: 'Columbus' })).toBeVisible();

    // Subtitle visible in unauthenticated state
    await expect(page.locator('.popup-container')).toBeVisible();
  } finally {
    await page.close();
  }
});

test('options page renders Columbus Settings heading and API URL input', async () => {
  const page = await context.newPage();
  try {
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    // Wait for React to mount and settings to load (transitions out of loading state)
    await expect(page.locator('h1:has-text("Columbus Settings")')).toBeVisible({
      timeout: 10_000,
    });

    // Connection section should have a URL input
    await expect(page.locator('input[type="url"]')).toBeVisible();

    // Should have a Save button
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
  } finally {
    await page.close();
  }
});

test('content script injects on fixture page without throwing errors', async () => {
  const page = await context.newPage();
  const errors: string[] = [];

  page.on('pageerror', (err) => errors.push(err.message));

  try {
    await gotoLinkedInFixture(page);

    // Give content.js time to initialise on the page
    await page.waitForTimeout(CONTENT_SCRIPT_INIT_MS);

    // No uncaught errors should originate from the extension content script
    const contentScriptErrors = errors.filter(
      (e) => e.includes('[Columbus]') || e.includes('content.js')
    );
    expect(contentScriptErrors).toHaveLength(0);
  } finally {
    await page.close();
  }
});

test('LinkedIn scraper selectors extract title, company, and location from fixture', async () => {
  const page = await context.newPage();
  try {
    await gotoLinkedInFixture(page);

    // Mirror the exact selector logic from LinkedInScraper / BaseScraper
    const job = await page.evaluate(() => {
      // Iterates selectors and returns the first non-empty text match,
      // mirroring the calling loop in LinkedInScraper.extractJobTitle/extractCompany
      const extractText = (selectors: string[]): string | null => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          const text = el?.textContent?.trim();
          if (text) return text;
        }
        return null;
      };

      // Mirrors LinkedInScraper.extractLocation() — skips elements whose text
      // contains "applicant" or "ago"
      const extractLocation = (selectors: string[]): string | null => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          const text = el?.textContent?.trim();
          if (text && !text.includes('applicant') && !text.includes('ago')) {
            return text;
          }
        }
        return null;
      };

      const title = extractText([
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        'h1.t-24',
      ]);

      const company = extractText([
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name',
        '.jobs-top-card__company-url',
        '.job-details-jobs-unified-top-card__primary-description-container a',
      ]);

      const location = extractLocation([
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__bullet',
      ]);

      const hasDescription = !!document.querySelector('.jobs-description__content');

      // Verify structured data is present (used by extractStructuredData)
      let structuredDataLocation: string | null = null;
      try {
        const ldJson = document.querySelector('script[type="application/ld+json"]');
        if (ldJson?.textContent) {
          const data = JSON.parse(ldJson.textContent);
          structuredDataLocation = data.jobLocation?.address?.addressLocality ?? null;
        }
      } catch {
        // ignore
      }

      return { title, company, location, hasDescription, structuredDataLocation };
    });

    expect(job.title).toBe('Senior Software Engineer');
    expect(job.company).toBe('Acme Corp');
    expect(job.location).toBe('San Francisco, CA');
    expect(job.hasDescription).toBe(true);
    expect(job.structuredDataLocation).toBe('San Francisco, CA');
  } finally {
    await page.close();
  }
});

test('LinkedIn job list selectors extract cards from fixture', async () => {
  const page = await context.newPage();
  try {
    await gotoLinkedInFixture(page);

    // Mirrors LinkedInScraper.scrapeJobList() card extraction
    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        '.job-card-container, .jobs-search-results__list-item, .scaffold-layout__list-item'
      );

      return Array.from(cards).map((card) => {
        const titleEl = card.querySelector(
          '.job-card-list__title, .job-card-container__link, a[data-control-name="job_card_title"]'
        );
        const companyEl = card.querySelector(
          '.job-card-container__company-name, .job-card-container__primary-description'
        );
        const locationEl = card.querySelector('.job-card-container__metadata-item');

        return {
          title: titleEl?.textContent?.trim() ?? null,
          company: companyEl?.textContent?.trim() ?? null,
          location: locationEl?.textContent?.trim() ?? null,
          url: (titleEl as HTMLAnchorElement | null)?.href ?? null,
        };
      });
    });

    expect(jobs).toHaveLength(2);
    expect(jobs[0].title).toBe('Frontend Engineer');
    expect(jobs[0].company).toBe('Beta Inc');
    expect(jobs[0].location).toBe('New York, NY');
    expect(jobs[1].title).toBe('Backend Engineer');
    expect(jobs[1].company).toBe('Gamma LLC');
    expect(jobs[1].location).toBe('Remote');
  } finally {
    await page.close();
  }
});
