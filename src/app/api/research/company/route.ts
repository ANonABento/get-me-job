/**
 * @route GET /api/research/company
 * @description Research a company with caching and optional LLM enrichment
 * @auth Required
 * @response CompanyResearchResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getLLMConfig } from "@/lib/db";
import {
  getCompanyResearch,
  saveCompanyResearch,
  isResearchStale,
} from "@/lib/db/company-research";
import {
  generateCompanyResearch,
  generateBasicResearch,
} from "@/lib/research/company";
import { requireAuth, isAuthError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get("company");
    const jobId = searchParams.get("jobId");
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = getCompanyResearch(companyName, authResult.userId);
    if (cached && !forceRefresh && !isResearchStale(cached)) {
      return NextResponse.json({
        ...cached,
        fromCache: true,
      });
    }

    // Get job details if provided
    const job = jobId ? getJob(jobId, authResult.userId) : null;
    const llmConfig = getLLMConfig();

    let researchData;
    if (llmConfig) {
      // Generate with LLM
      researchData = await generateCompanyResearch(companyName, job, llmConfig);
    } else {
      // Generate basic research without LLM
      researchData = generateBasicResearch(companyName, job);
    }

    // Save to cache
    const saved = saveCompanyResearch(
      {
        companyName,
        ...researchData,
      },
      authResult.userId
    );

    return NextResponse.json({
      ...saved,
      fromCache: false,
    });
  } catch (error) {
    console.error("Company research error:", error);
    return NextResponse.json(
      { error: "Failed to generate company research" },
      { status: 500 }
    );
  }
}
