// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DetectedField, ExtensionSettings } from "@/shared/types";

const mocks = vi.hoisted(() => ({
  buildPageSnapshot: vi.fn(),
}));

vi.mock("./page-snapshot", () => ({
  buildPageSnapshot: mocks.buildPageSnapshot,
}));

import {
  isLikelySearchOrLoginForm,
  looksLikeApplicationForm,
  SubmitWatcher,
} from "./submit-watcher";

const enabledSettings: ExtensionSettings = {
  autoFillEnabled: true,
  showConfidenceIndicators: true,
  minimumConfidence: 0.5,
  learnFromAnswers: true,
  notifyOnJobDetected: true,
  autoTrackApplicationsEnabled: true,
  captureScreenshotEnabled: false,
  scrapeThrottleMs: 500,
  scrapeChunkSize: 5,
  scrapeMaxJobs: 200,
  scrapeMaxPages: 50,
  scrapeDedupeEnabled: true,
};

describe("submit tracking heuristics", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("ignores search, login, and signup style forms", () => {
    document.body.innerHTML = `
      <form id="login-form"><input type="email" name="email" /></form>
      <form id="search"><input type="search" name="q" /></form>
    `;

    expect(
      isLikelySearchOrLoginForm(
        document.querySelector("#login-form")!,
        "https://example.com/login",
      ),
    ).toBe(true);
    expect(
      isLikelySearchOrLoginForm(
        document.querySelector("#search")!,
        "https://example.com/jobs",
      ),
    ).toBe(true);
  });

  it("recognizes a typical application form", () => {
    document.body.innerHTML = `
      <form id="application">
        <input id="first" />
        <input id="email" />
        <textarea id="cover"></textarea>
      </form>
    `;
    const form = document.querySelector("form")!;

    expect(looksLikeApplicationForm(fieldsFor(form), form)).toBe(true);
  });
});

describe("SubmitWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    mocks.buildPageSnapshot.mockResolvedValue({
      url: "https://boards.greenhouse.io/acme/jobs/123",
      host: "boards.greenhouse.io",
      title: "Apply",
      headline: "Frontend Engineer",
      submittedAt: "2026-05-10T00:00:00.000Z",
    });
  });

  it("tracks an autofilled application submit without serializing form values", async () => {
    document.body.innerHTML = `
      <form id="application">
        <input id="first" value="SECRET_MARKER" />
        <input id="email" value="person@example.com" />
        <textarea id="cover">private answer</textarea>
      </form>
    `;
    const form = document.querySelector("form")!;
    const onTracked = vi.fn();
    const watcher = new SubmitWatcher({
      getDetectedFields: () => fieldsFor(form),
      getScrapedJob: () => ({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
        requirements: [],
        url: "https://boards.greenhouse.io/acme/jobs/123",
        source: "greenhouse",
      }),
      getSettings: async () => enabledSettings,
      wasAutofilled: () => true,
      onTracked,
    });

    watcher.attach();
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    await flushAsyncSubmitTracking();

    expect(onTracked).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(onTracked.mock.calls[0][0])).not.toContain(
      "SECRET_MARKER",
    );
    watcher.detach();
  });

  it("respects autoTrackApplicationsEnabled=false", async () => {
    document.body.innerHTML = `
      <form id="application">
        <input id="first" />
        <input id="email" />
        <textarea id="cover"></textarea>
      </form>
    `;
    const form = document.querySelector("form")!;
    const onTracked = vi.fn();
    const watcher = new SubmitWatcher({
      getDetectedFields: () => fieldsFor(form),
      getScrapedJob: () => null,
      getSettings: async () => ({
        ...enabledSettings,
        autoTrackApplicationsEnabled: false,
      }),
      wasAutofilled: () => true,
      onTracked,
    });

    watcher.attach();
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    await flushAsyncSubmitTracking();

    expect(onTracked).not.toHaveBeenCalled();
    watcher.detach();
  });
});

function flushAsyncSubmitTracking(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

function fieldsFor(form: HTMLFormElement): DetectedField[] {
  const elements = Array.from(
    form.querySelectorAll("input, textarea"),
  ) as Array<HTMLInputElement | HTMLTextAreaElement>;

  return [
    {
      element: elements[0],
      fieldType: "firstName",
      confidence: 0.8,
    },
    {
      element: elements[1],
      fieldType: "email",
      confidence: 0.8,
    },
    {
      element: elements[2],
      fieldType: "coverLetter",
      confidence: 0.8,
    },
  ];
}
