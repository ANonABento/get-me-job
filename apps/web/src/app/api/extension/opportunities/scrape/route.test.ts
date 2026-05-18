import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  scrapeOpportunityFromUrl: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/opportunities/scrape", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/opportunities/scrape")>();
  return {
    ...actual,
    scrapeOpportunityFromUrl: mocks.scrapeOpportunityFromUrl,
  };
});

import { OpportunityScrapeError } from "@/lib/opportunities/scrape";
import { POST } from "./route";

function scrapeRequest(body: unknown) {
  return new NextRequest(
    "http://localhost/api/extension/opportunities/scrape",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("extension opportunities scrape route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({
      success: true,
      userId: "user-1",
    });
  });

  it("returns a scraped opportunity for an extension-token request", async () => {
    const opportunity = {
      title: "Engineer",
      company: "Acme",
      description: "Build software",
      requirements: [],
      responsibilities: [],
      keywords: [],
      remote: false,
      status: "saved",
      source: "lever",
      url: "https://jobs.lever.co/acme/123",
    };
    mocks.scrapeOpportunityFromUrl.mockResolvedValueOnce(opportunity);

    const response = await POST(
      scrapeRequest({ url: "https://jobs.lever.co/acme/123" }),
    );

    expect(mocks.scrapeOpportunityFromUrl).toHaveBeenCalledWith(
      "https://jobs.lever.co/acme/123",
    );
    await expect(response.json()).resolves.toEqual({ opportunity });
  });

  it("returns auth failures from extension auth", async () => {
    mocks.requireExtensionAuth.mockReturnValueOnce({
      success: false,
      response: Response.json({ error: "Invalid token" }, { status: 401 }),
    });

    const response = await POST(
      scrapeRequest({ url: "https://jobs.lever.co/acme/123" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.scrapeOpportunityFromUrl).not.toHaveBeenCalled();
  });

  it("maps scraper errors to graceful API responses", async () => {
    mocks.scrapeOpportunityFromUrl.mockRejectedValueOnce(
      new OpportunityScrapeError(
        "unsupported_site",
        "This URL is not from a supported job board.",
      ),
    );

    const response = await POST(
      scrapeRequest({ url: "https://example.com/job" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "This URL is not from a supported job board.",
      code: "unsupported_site",
    });
  });
});
