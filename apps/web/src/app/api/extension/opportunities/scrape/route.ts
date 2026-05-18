import { nowEpoch } from "@/lib/format/time";
/**
 * @route POST /api/extension/opportunities/scrape
 * @description Scrape a supported job-board URL via extension-token auth.
 * @auth Extension token
 * @request { url: string }
 * @response { opportunity: ScrapedOpportunity }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { getClientIdentifier, rateLimiters } from "@/lib/rate-limit";
import {
  OpportunityScrapeError,
  scrapeOpportunityFromUrl,
} from "@/lib/opportunities/scrape";

export const dynamic = "force-dynamic";

interface ScrapeRequest {
  url?: unknown;
}

function errorResponse(error: OpportunityScrapeError) {
  return NextResponse.json(
    { error: error.message, code: error.code },
    { status: error.status },
  );
}

export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) return authResult.response;

  const rateLimit = rateLimiters.standard(
    getClientIdentifier(request, authResult.userId),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many scrape requests. Please try again later.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(
            1,
            Math.ceil((rateLimit.resetAt - nowEpoch()) / 1000),
          ).toString(),
        },
      },
    );
  }

  try {
    let body: ScrapeRequest;
    try {
      body = (await request.json()) as ScrapeRequest;
    } catch {
      return errorResponse(
        new OpportunityScrapeError(
          "invalid_url",
          "A valid JSON body with a URL is required.",
        ),
      );
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      return errorResponse(
        new OpportunityScrapeError("invalid_url", "A URL is required."),
      );
    }

    const opportunity = await scrapeOpportunityFromUrl(body.url.trim());
    return NextResponse.json({ opportunity });
  } catch (error) {
    if (error instanceof OpportunityScrapeError) {
      return errorResponse(error);
    }

    console.error("Extension opportunity scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape opportunity.", code: "scrape_failed" },
      { status: 500 },
    );
  }
}
