/**
 * @route GET /api/companies/[id]/enrich
 * @description Fetch (or refresh) the public-data dossier for an opportunity's company.
 * @auth Required
 * @query refresh=true — bypasses the 24h cache.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAuthError, requireAuth } from "@/lib/auth";
import { getJob } from "@/lib/db/jobs";
import {
  getCompanyEnrichment,
  isEnrichmentFresh,
  saveCompanyEnrichment,
} from "@/lib/db/company-enrichment";
import { enrichCompany } from "@/lib/enrichment";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const job = getJob(params.id, authResult.userId);
  if (!job) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 },
    );
  }

  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "true";
  const cached = getCompanyEnrichment(job.company, authResult.userId);
  if (cached && !forceRefresh && isEnrichmentFresh(cached.enrichedAt)) {
    return NextResponse.json({
      company: cached.companyName,
      enrichment: cached.enrichment,
      enrichedAt: cached.enrichedAt,
      fromCache: true,
    });
  }

  try {
    const enrichment = await enrichCompany({
      company: job.company,
      sourceUrl: job.url ?? null,
    });
    const saved = saveCompanyEnrichment(
      job.company,
      enrichment,
      authResult.userId,
    );
    return NextResponse.json({
      company: saved.companyName,
      enrichment: saved.enrichment,
      enrichedAt: saved.enrichedAt,
      fromCache: false,
    });
  } catch (error) {
    console.error("Company enrichment error:", error);
    return NextResponse.json(
      { error: "Failed to enrich company" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  return GET(request, context);
}
