import type { ApplicationSubmission, ScrapedJob } from '@/shared/types';

export interface SubmissionSignal {
  site: 'linkedin' | 'greenhouse' | 'lever' | 'generic';
  method: string;
}

const SUCCESS_URL_PATTERN =
  /(application[_-]?submitted|confirmation|thank[_-]?you|success|submitted|thanks)/i;
const SUCCESS_TEXT_PATTERN =
  /(application submitted|your application has been submitted|thanks for applying|thank you for applying|we('ve| have)? received your application)/i;
const SUBMIT_TEXT_PATTERN = /\b(submit application|send application|apply|apply now)\b/i;
const NON_FINAL_ACTION_PATTERN = /\b(save|start|next|continue|review|preview|back)\b/i;

export function detectTrackedSite(url: string): SubmissionSignal['site'] | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();

  if (host.endsWith('linkedin.com')) return 'linkedin';
  if (host.includes('greenhouse.io') || host.includes('greenhouse.com')) return 'greenhouse';
  if (host.endsWith('lever.co')) return 'lever';

  return null;
}

export function isLikelyFinalSubmitElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  const element = target.closest('button, input[type="submit"], input[type="button"], a[role="button"]');
  if (!element) return false;

  const text = [
    element.textContent,
    element.getAttribute('aria-label'),
    element.getAttribute('value'),
    element.getAttribute('data-test'),
  ]
    .filter(Boolean)
    .join(' ');

  return SUBMIT_TEXT_PATTERN.test(text) && !NON_FINAL_ACTION_PATTERN.test(text);
}

export function detectSubmissionFromUrl(previousUrl: string, currentUrl: string): SubmissionSignal | null {
  if (previousUrl === currentUrl || !SUCCESS_URL_PATTERN.test(currentUrl)) {
    return null;
  }

  const site = detectTrackedSite(currentUrl) || 'generic';
  return { site, method: `${site}-url` };
}

export function detectSubmissionFromText(text: string, url: string): SubmissionSignal | null {
  if (!SUCCESS_TEXT_PATTERN.test(text)) {
    return null;
  }

  const site = detectTrackedSite(url) || 'generic';
  return { site, method: `${site}-confirmation-text` };
}

export function buildApplicationSubmission(
  job: ScrapedJob,
  signal: SubmissionSignal,
  submissionUrl: string,
  submittedAt = new Date().toISOString()
): ApplicationSubmission {
  return {
    ...job,
    submittedAt,
    submissionUrl,
    detectionMethod: signal.method,
  };
}

export class ApplicationSubmissionTracker {
  private previousUrl = window.location.href;
  private lastAutoFillAt = 0;
  private logged = false;
  private restoreHistoryMethods: (() => void) | null = null;

  constructor(
    private readonly getScrapedJob: () => ScrapedJob | null,
    private readonly logApplication: (application: ApplicationSubmission) => Promise<void>,
    private readonly autoFillWindowMs = 60 * 60 * 1000
  ) {}

  markAutoFilled(): void {
    this.lastAutoFillAt = Date.now();
    this.logged = false;
  }

  start(): void {
    document.addEventListener('submit', this.handleSubmit, true);
    document.addEventListener('click', this.handleClick, true);
    window.addEventListener('popstate', this.handleUrlChange);
    window.addEventListener('hashchange', this.handleUrlChange);
    this.patchHistoryMethods();
  }

  stop(): void {
    document.removeEventListener('submit', this.handleSubmit, true);
    document.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('popstate', this.handleUrlChange);
    window.removeEventListener('hashchange', this.handleUrlChange);
    this.restoreHistoryMethods?.();
    this.restoreHistoryMethods = null;
  }

  checkCurrentPage(): void {
    this.handleUrlChange();
    this.maybeLog(detectSubmissionFromText(document.body?.innerText || '', window.location.href));
  }

  private readonly handleSubmit = () => {
    window.setTimeout(() => this.checkCurrentPage(), 1500);
  };

  private readonly handleClick = (event: MouseEvent) => {
    if (isLikelyFinalSubmitElement(event.target)) {
      window.setTimeout(() => this.checkCurrentPage(), 1500);
    }
  };

  private readonly handleUrlChange = () => {
    const currentUrl = window.location.href;
    const signal = detectSubmissionFromUrl(this.previousUrl, currentUrl);
    this.previousUrl = currentUrl;
    this.maybeLog(signal);
  };

  private patchHistoryMethods(): void {
    if (this.restoreHistoryMethods) return;

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const notifyUrlChange = () => window.setTimeout(this.handleUrlChange, 0);

    const patchedPushState = function pushState(
      data: unknown,
      unused: string,
      url?: string | URL | null
    ): void {
      originalPushState.call(this, data, unused, url);
      notifyUrlChange();
    };

    const patchedReplaceState = function replaceState(
      data: unknown,
      unused: string,
      url?: string | URL | null
    ): void {
      originalReplaceState.call(this, data, unused, url);
      notifyUrlChange();
    };

    history.pushState = patchedPushState;
    history.replaceState = patchedReplaceState;

    this.restoreHistoryMethods = () => {
      if (history.pushState === patchedPushState) {
        history.pushState = originalPushState;
      }
      if (history.replaceState === patchedReplaceState) {
        history.replaceState = originalReplaceState;
      }
    };
  }

  private maybeLog(signal: SubmissionSignal | null): void {
    const job = this.getScrapedJob();
    const autoFilledRecently = Date.now() - this.lastAutoFillAt <= this.autoFillWindowMs;

    if (!signal || !job || !autoFilledRecently || this.logged) {
      return;
    }

    this.logged = true;
    void this.logApplication(buildApplicationSubmission(job, signal, window.location.href)).catch((error) => {
      this.logged = false;
      console.error('[Columbus] Failed to log application:', error);
    });
  }
}
