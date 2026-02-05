// Content script entry point for Columbus extension

// Import styles for content script
import './ui/styles.css';

import { FieldDetector } from './auto-fill/field-detector';
import { FieldMapper } from './auto-fill/field-mapper';
import { AutoFillEngine } from './auto-fill/engine';
import { getScraperForUrl } from './scrapers/scraper-registry';
import type { ExtensionProfile, ScrapedJob, DetectedField } from '@/shared/types';
import { sendMessage, Messages } from '@/shared/messages';

// Initialize components
const fieldDetector = new FieldDetector();
let autoFillEngine: AutoFillEngine | null = null;
let cachedProfile: ExtensionProfile | null = null;
let detectedFields: DetectedField[] = [];
let scrapedJob: ScrapedJob | null = null;

// Scan page on load
scanPage();

// Re-scan on dynamic content changes
const observer = new MutationObserver(debounce(scanPage, 500));
observer.observe(document.body, { childList: true, subtree: true });

async function scanPage() {
  // Detect forms
  const forms = document.querySelectorAll('form');
  for (const form of forms) {
    const fields = fieldDetector.detectFields(form);
    if (fields.length > 0) {
      detectedFields = fields;
      console.log('[Columbus] Detected fields:', fields.length);
    }
  }

  // Check for job listing
  const scraper = getScraperForUrl(window.location.href);
  if (scraper.canHandle(window.location.href)) {
    try {
      scrapedJob = await scraper.scrapeJobListing();
      if (scrapedJob) {
        console.log('[Columbus] Scraped job:', scrapedJob.title);
      }
    } catch (err) {
      console.error('[Columbus] Scrape error:', err);
    }
  }
}

// Handle messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ success: false, error: err.message }));
  return true; // Async response
});

async function handleMessage(message: { type: string; payload?: unknown }) {
  switch (message.type) {
    case 'GET_PAGE_STATUS':
      return {
        hasForm: detectedFields.length > 0,
        hasJobListing: scrapedJob !== null,
        detectedFields: detectedFields.length,
        scrapedJob,
      };

    case 'TRIGGER_FILL':
      return handleFillForm();

    case 'TRIGGER_IMPORT':
      if (scrapedJob) {
        return sendMessage(Messages.importJob(scrapedJob));
      }
      return { success: false, error: 'No job detected' };

    case 'SCRAPE_JOB':
      const scraper = getScraperForUrl(window.location.href);
      if (scraper.canHandle(window.location.href)) {
        scrapedJob = await scraper.scrapeJobListing();
        return { success: true, data: scrapedJob };
      }
      return { success: false, error: 'No scraper available for this site' };

    case 'SCRAPE_JOB_LIST':
      const listScraper = getScraperForUrl(window.location.href);
      if (listScraper.canHandle(window.location.href)) {
        const jobs = await listScraper.scrapeJobList();
        return { success: true, data: jobs };
      }
      return { success: false, error: 'No scraper available for this site' };

    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

async function handleFillForm() {
  if (detectedFields.length === 0) {
    return { success: false, error: 'No fields detected' };
  }

  // Get profile if not cached
  if (!cachedProfile) {
    const response = await sendMessage<ExtensionProfile>(Messages.getProfile());
    if (!response.success || !response.data) {
      return { success: false, error: 'Failed to load profile' };
    }
    cachedProfile = response.data;
  }

  // Create mapper and engine
  const mapper = new FieldMapper(cachedProfile);
  autoFillEngine = new AutoFillEngine(fieldDetector, mapper);

  // Fill the form
  const result = await autoFillEngine.fillForm(detectedFields);
  return { success: true, data: result };
}

// Utility: debounce function
function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

console.log('[Columbus] Content script loaded');
