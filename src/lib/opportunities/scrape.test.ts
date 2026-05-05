import { afterEach, describe, expect, it, vi } from "vitest";

// Stub DNS so scrape's SSRF guard doesn't make real network calls.
const { dnsLookupMock } = vi.hoisted(() => ({
  dnsLookupMock: vi
    .fn()
    .mockResolvedValue({ address: "108.174.10.10", family: 4 }),
}));
vi.mock("node:dns/promises", () => {
  const mod = { lookup: dnsLookupMock };
  return { ...mod, default: mod };
});

import {
  OpportunityScrapeError,
  detectOpportunitySource,
  normalizeOpportunityUrl,
  scrapeOpportunityFromHtml,
  scrapeOpportunityFromUrl,
} from "./scrape";

const greenhouseHtml = `
<!doctype html>
<html>
  <head><title>Senior Engineer</title></head>
  <body>
    <h1 class="app-title">Senior Software Engineer</h1>
    <div class="company-name">Acme</div>
    <div class="location">Remote</div>
    <div id="content">
      <p>We build useful software for customers around the world.</p>
      <p>You have strong TypeScript, React, and API experience.</p>
      <p>Required experience includes 5+ years building reliable services.</p>
      <p>The role is full-time and fully remote with salary $120,000 - $150,000 per year.</p>
    </div>
  </body>
</html>
`;

describe("opportunity scraping", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes and validates scrape URLs", () => {
    expect(normalizeOpportunityUrl("https://jobs.lever.co/acme/123")).toBe("https://jobs.lever.co/acme/123");
    expect(() => normalizeOpportunityUrl("ftp://jobs.lever.co/acme/123")).toThrow(OpportunityScrapeError);
  });

  it("detects supported opportunity sources", () => {
    expect(detectOpportunitySource("https://www.linkedin.com/jobs/view/123")).toBe("linkedin");
    expect(detectOpportunitySource("https://www.indeed.com/viewjob?jk=abc")).toBe("indeed");
    expect(detectOpportunitySource("https://boards.greenhouse.io/acme/jobs/123")).toBe("greenhouse");
    expect(detectOpportunitySource("https://jobs.lever.co/acme/123")).toBe("lever");
    expect(detectOpportunitySource("https://waterlooworks.uwaterloo.ca/postings/123")).toBe("waterlooworks");
    expect(detectOpportunitySource("https://example.com/jobs/123")).toBeNull();
  });

  it("does not detect supported sources from lookalike hosts", () => {
    expect(detectOpportunitySource("https://jobs.lever.co.evil.test/acme/123")).toBeNull();
    expect(detectOpportunitySource("https://boards.greenhouse.io.evil.test/acme/jobs/123")).toBeNull();
  });

  it("scrapes a supported job board page with the Columbus scrapers", async () => {
    const opportunity = await scrapeOpportunityFromHtml(
      "https://boards.greenhouse.io/acme/jobs/123",
      greenhouseHtml
    );

    expect(opportunity).toMatchObject({
      title: "Senior Software Engineer",
      company: "Acme",
      location: "Remote",
      remote: true,
      source: "greenhouse",
      url: "https://boards.greenhouse.io/acme/jobs/123",
      status: "saved",
      salary: "$120,000 - $150,000 per year",
      type: "full-time",
    });
    expect(opportunity.requirements).toContain("You have strong TypeScript, React, and API experience.");
    expect(opportunity.keywords).toEqual(expect.arrayContaining(["typescript", "react", "api"]));
  });

  it("restores the test DOM globals after scraping", async () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalNavigator = globalThis.navigator;
    const originalMutationObserver = globalThis.MutationObserver;

    await scrapeOpportunityFromHtml(
      "https://boards.greenhouse.io/acme/jobs/123",
      greenhouseHtml
    );

    expect(globalThis.window).toBe(originalWindow);
    expect(globalThis.document).toBe(originalDocument);
    expect(globalThis.navigator).toBe(originalNavigator);
    expect(globalThis.MutationObserver).toBe(originalMutationObserver);
  });

  it("rejects unsupported job boards before fetching", async () => {
    vi.stubGlobal("fetch", vi.fn());

    await expect(scrapeOpportunityFromUrl("https://example.com/jobs/123")).rejects.toMatchObject({
      code: "unsupported_site",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("surfaces upstream rate limits", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 429 })));

    await expect(scrapeOpportunityFromUrl("https://jobs.lever.co/acme/123")).rejects.toMatchObject({
      code: "rate_limited",
      status: 429,
    });
  });

  it("blocks DNS-rebinding to private IPs even on allowlisted hosts", async () => {
    dnsLookupMock.mockResolvedValueOnce({
      address: "169.254.169.254",
      family: 4,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      scrapeOpportunityFromUrl("https://jobs.lever.co/acme/123"),
    ).rejects.toMatchObject({ code: "invalid_url" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
