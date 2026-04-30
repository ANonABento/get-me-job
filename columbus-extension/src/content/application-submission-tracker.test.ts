import { describe, expect, it, vi } from 'vitest';
import {
  ApplicationSubmissionTracker,
  buildApplicationSubmission,
  detectSubmissionFromText,
  detectSubmissionFromUrl,
  detectTrackedSite,
  isLikelyFinalSubmitElement,
} from './application-submission-tracker';
import type { ScrapedJob } from '@/shared/types';

describe('application submission detection', () => {
  it('detects tracked application sites', () => {
    expect(detectTrackedSite('https://www.linkedin.com/jobs/view/123')).toBe('linkedin');
    expect(detectTrackedSite('https://boards.greenhouse.io/acme/jobs/123')).toBe('greenhouse');
    expect(detectTrackedSite('https://jobs.lever.co/acme/123')).toBe('lever');
    expect(detectTrackedSite('https://example.com/jobs/123')).toBeNull();
    expect(detectTrackedSite('not a url')).toBeNull();
  });

  it('detects success URL changes for three supported sites', () => {
    expect(
      detectSubmissionFromUrl(
        'https://www.linkedin.com/jobs/view/123',
        'https://www.linkedin.com/jobs/view/123/application-submitted'
      )
    ).toEqual({ site: 'linkedin', method: 'linkedin-url' });
    expect(
      detectSubmissionFromUrl(
        'https://boards.greenhouse.io/acme/jobs/123',
        'https://boards.greenhouse.io/acme/jobs/123/confirmation'
      )
    ).toEqual({ site: 'greenhouse', method: 'greenhouse-url' });
    expect(
      detectSubmissionFromUrl(
        'https://jobs.lever.co/acme/123',
        'https://jobs.lever.co/acme/123/thanks'
      )
    ).toEqual({ site: 'lever', method: 'lever-url' });
  });

  it('detects confirmation copy', () => {
    expect(
      detectSubmissionFromText(
        'Thanks for applying. We received your application.',
        'https://jobs.lever.co/acme/123'
      )
    ).toEqual({ site: 'lever', method: 'lever-confirmation-text' });
  });

  it('distinguishes final submit actions from intermediate buttons', () => {
    const submit = document.createElement('button');
    submit.textContent = 'Submit application';

    const next = document.createElement('button');
    next.textContent = 'Continue';

    expect(isLikelyFinalSubmitElement(submit)).toBe(true);
    expect(isLikelyFinalSubmitElement(next)).toBe(false);
  });

  it('builds application submission payloads from the scraped job', () => {
    const job: ScrapedJob = {
      title: 'Frontend Engineer',
      company: 'Acme',
      description: 'Build UI',
      requirements: ['React'],
      url: 'https://www.linkedin.com/jobs/view/123',
      source: 'linkedin',
    };

    expect(
      buildApplicationSubmission(
        job,
        { site: 'linkedin', method: 'linkedin-confirmation-text' },
        'https://www.linkedin.com/jobs/view/123/application-submitted',
        '2026-04-30T12:00:00.000Z'
      )
    ).toEqual({
      ...job,
      submittedAt: '2026-04-30T12:00:00.000Z',
      submissionUrl: 'https://www.linkedin.com/jobs/view/123/application-submitted',
      detectionMethod: 'linkedin-confirmation-text',
    });
  });

  it('detects SPA history URL changes after auto-fill', async () => {
    const job: ScrapedJob = {
      title: 'Frontend Engineer',
      company: 'Acme',
      description: 'Build UI',
      requirements: ['React'],
      url: window.location.href,
      source: 'generic',
    };
    const logApplication = vi.fn().mockResolvedValue(undefined);
    const tracker = new ApplicationSubmissionTracker(() => job, logApplication, 1000);

    history.replaceState({}, '', '/jobs/123');
    tracker.markAutoFilled();
    tracker.start();

    try {
      history.pushState({}, '', '/jobs/123/application-submitted');
      await new Promise((resolve) => window.setTimeout(resolve, 0));

      expect(logApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Frontend Engineer',
          detectionMethod: 'generic-url',
          submissionUrl: expect.stringContaining('/jobs/123/application-submitted'),
        })
      );
    } finally {
      tracker.stop();
    }
  });
});
