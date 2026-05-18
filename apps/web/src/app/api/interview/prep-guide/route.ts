/**
 * @route GET /api/interview/prep-guide
 * @description Generate an interview prep guide for a specific job, returned as JSON or Markdown
 * @auth Required
 * @response JSON guide or Markdown document
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { getCompanyResearch } from "@/lib/db/company-research";
import {
  generatePrepGuide,
  generateExportableDocument,
} from "@/lib/interview/prep-guide";
import { requireAuth, isAuthError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const format = searchParams.get("format"); // "json" or "markdown"

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 },
      );
    }

    const job = getJob(jobId, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile(authResult.userId);
    const gate = gateOptionalAiFeature(
      authResult.userId,
      "interview_turn",
      jobId,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;
    const companyResearch = getCompanyResearch(job.company, authResult.userId);
    let usedLLM = false;
    let fallbackReason: "provider_not_configured" | "llm_error" | null =
      gate.llmConfig ? null : "provider_not_configured";

    let guide;
    try {
      guide = await generatePrepGuide(
        job,
        profile,
        companyResearch,
        gate.llmConfig,
      );
      usedLLM = gate.llmConfig !== null;
    } catch (llmError) {
      aiGate?.refund();
      fallbackReason = "llm_error";
      console.error("Prep guide LLM generation failed:", llmError);
      guide = await generatePrepGuide(job, profile, companyResearch, null);
    }

    if (format === "markdown") {
      const markdown = generateExportableDocument(guide);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="interview-prep-${job.company.replace(/\s+/g, "-")}.md"`,
        },
      });
    }

    return NextResponse.json({
      ...guide,
      usedLLM,
      fallbackUsed: !usedLLM,
      fallbackReason: usedLLM ? null : fallbackReason,
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Prep guide error:", error);
    return NextResponse.json(
      { error: "Failed to generate preparation guide" },
      { status: 500 },
    );
  }
}
