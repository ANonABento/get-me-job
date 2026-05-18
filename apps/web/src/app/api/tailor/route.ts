/**
 * @route GET /api/tailor
 * @route POST /api/tailor
 * @description List tailored resume templates (GET) or analyze a JD / generate a tailored resume from bank (POST)
 * @auth Required
 * @request { action: "analyze" | "generate" | "render", jobDescription: string, ...params } (POST)
 * @response TailorAnalysisResponse | TailorGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/api-utils";
import { getGeneratedResume, getProfile, saveGeneratedResume } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { logPromptVariantResult } from "@/lib/db/prompt-variants";
import { getGroupedBankEntries } from "@/lib/db/profile-bank";
import { createJob, getJob } from "@/lib/db/jobs";
import type { TailoredResume } from "@/lib/resume/generator";
import { linkOpportunityDocument } from "@/lib/opportunities";
import { nowEpoch } from "@/lib/format/time";
import { analyzeJobFit, extractKeywords } from "@/lib/tailor/analyze";
import { generateFromBank } from "@/lib/tailor/generate";
import { normalizeTailorSettings } from "@/lib/tailor/settings";
import { generateResumeHTML, TEMPLATES } from "@/lib/resume/pdf";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import { isTailoredResume } from "@/lib/builder/tailored-resume-api";
import { trackActivationEvent } from "@/lib/db/product-analytics";
import { tailorRequestSchema } from "@/lib/schemas";
import { writeFile, mkdir } from "fs/promises";
import { generateId } from "@/lib/utils";
import { PATHS } from "@/lib/constants";
import { requireUserAuth, isAuthError } from "@/lib/auth";
import { checkTailorQuota } from "@/lib/plan/quota";
import { safeTrackActivity } from "@/lib/streak/track";

export const dynamic = "force-dynamic";

/**
 * GET /api/tailor — returns available templates
 */
export async function GET() {
  return NextResponse.json({
    templates: TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    })),
  });
}

/**
 * POST /api/tailor — analyze JD + generate tailored resume from knowledge bank
 *
 * Body: {
 *   jobDescription: string;
 *   jobTitle?: string;
 *   company?: string;
 *   templateId?: string;
 *   action: "analyze" | "generate" | "render";
 *   resume?: TailoredResume; // required for "render"
 * }
 */
export async function POST(request: NextRequest) {
  const authResult = await requireUserAuth(request);
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const parsed = await parseJsonBody(request, tailorRequestSchema);
    if (!parsed.ok) return parsed.response;

    const body = parsed.data;
    const { action, templateId } = body;
    if (action === "render") {
      if (!isTailoredResume(body.resume)) {
        return NextResponse.json(
          { error: "A generated resume is required for template rendering." },
          { status: 400 },
        );
      }

      const template = getTemplateWithCustom(templateId, authResult.userId);
      return NextResponse.json({
        success: true,
        html: generateResumeHTML(body.resume, templateId, template),
      });
    }

    const {
      jobDescription,
      jobTitle,
      company,
      opportunityId,
      baseResumeId,
      settings: clientSettings,
    } = body;

    const existingOpportunity = opportunityId
      ? getJob(opportunityId, authResult.userId)
      : null;

    if (opportunityId && !existingOpportunity) {
      return NextResponse.json(
        { error: "Opportunity not found." },
        { status: 404 },
      );
    }

    const bankEntries = getGroupedBankEntries(authResult.userId);
    const totalEntries = Object.values(bankEntries).flat().length;

    if (totalEntries === 0) {
      return NextResponse.json(
        {
          error:
            "No knowledge bank entries found. Upload a resume first to populate your bank.",
        },
        { status: 400 },
      );
    }

    // Extract keywords and analyze fit
    const keywords = extractKeywords(jobDescription);
    const analysis = analyzeJobFit(jobDescription, bankEntries, keywords);

    if (action === "analyze") {
      return NextResponse.json({
        success: true,
        analysis: {
          matchScore: analysis.matchScore,
          keywordsFound: analysis.keywordsFound,
          keywordsMissing: analysis.keywordsMissing,
          gaps: analysis.gaps,
          matchedEntriesCount: analysis.matchedEntries.length,
          quality: analysis.quality,
        },
      });
    }

    // action === "generate"
    const quota = checkTailorQuota(authResult.userId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "Free tier monthly limit reached. Upgrade to Pro for unlimited tailored resumes.",
          code: "free_tier_quota_exceeded",
          limit: quota.limit,
          used: quota.used,
          resetAt: quota.resetAt,
          upgradeUrl: "/pricing",
        },
        { status: 429 },
      );
    }

    const profile = getProfile(authResult.userId);
    const contact = profile?.contact ?? {
      name: "Your Name",
      email: "",
      phone: "",
      location: "",
    };

    const gate = gateOptionalAiFeature(
      authResult.userId,
      "tailor",
      opportunityId || `${company}:${nowEpoch()}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;
    const llmConfig = gate.llmConfig;

    // #34 — when the popup picks a previously-tailored resume as the base,
    // hydrate it and pass it through to `generateFromBank` as the deterministic
    // seed. Falls back to the bank-derived base on any lookup miss so the
    // tailor flow keeps working if the chosen id has been deleted.
    let seedResume: TailoredResume | undefined;
    if (baseResumeId) {
      const baseRecord = getGeneratedResume(baseResumeId, authResult.userId);
      if (baseRecord?.contentJson) {
        try {
          seedResume = JSON.parse(baseRecord.contentJson) as TailoredResume;
        } catch {
          seedResume = undefined;
        }
      }
    }

    const tailorSettings = normalizeTailorSettings(clientSettings);
    const {
      resume: tailoredResume,
      baseResume,
      promptVariantId,
    } = await generateFromBank(
      {
        bankEntries,
        matchedEntries: analysis.matchedEntries,
        contact,
        summary: profile?.summary,
        jobTitle,
        company,
        jobDescription,
        userId: authResult.userId,
        seedResume,
        settings: tailorSettings,
      },
      llmConfig,
    );

    // Generate HTML
    const template = getTemplateWithCustom(templateId, authResult.userId);
    const html = generateResumeHTML(tailoredResume, templateId, template);

    // Save file
    await mkdir(PATHS.RESUMES_OUTPUT, { recursive: true });
    const filename = `resume-${company.toLowerCase().replace(/\s+/g, "-")}-${generateId()}.html`;
    const filePath = `${PATHS.RESUMES_OUTPUT}/${filename}`;
    await writeFile(filePath, html);
    const pdfUrl = `/resumes/${filename}`;

    // Save a job record so it appears in the job tracker, unless this run
    // came from an existing opportunity in the bank.
    const job =
      existingOpportunity ??
      createJob(
        {
          title: jobTitle,
          company,
          description: jobDescription,
          keywords,
          requirements: [],
          responsibilities: [],
          status: "saved",
        },
        authResult.userId,
      );

    // Save the generated resume
    const savedResume = saveGeneratedResume(
      job.id,
      templateId,
      tailoredResume,
      pdfUrl,
      analysis.matchScore,
      authResult.userId,
    );

    if (opportunityId) {
      linkOpportunityDocument(
        opportunityId,
        { resumeId: savedResume.id },
        authResult.userId,
      );
    }

    if (promptVariantId) {
      logPromptVariantResult(
        authResult.userId,
        promptVariantId,
        job.id,
        savedResume.id,
        analysis.matchScore,
      );
    }

    const { unlocked } = await safeTrackActivity(
      authResult.userId,
      "tailor_generated",
    );
    try {
      trackActivationEvent({
        event: "resume_tailored",
        userId: authResult.userId,
        source: "api/tailor",
        metadata: {
          opportunityId: opportunityId ?? null,
          matchScore: analysis.matchScore,
        },
      });
    } catch (analyticsError) {
      console.error("Tailor analytics failed:", analyticsError);
    }

    return NextResponse.json({
      success: true,
      html,
      pdfUrl,
      resume: tailoredResume,
      baseResume,
      savedResume,
      jobId: job.id,
      analysis: {
        matchScore: analysis.matchScore,
        keywordsFound: analysis.keywordsFound,
        keywordsMissing: analysis.keywordsMissing,
        gaps: analysis.gaps,
        matchedEntriesCount: analysis.matchedEntries.length,
        quality: analysis.quality,
      },
      unlocked,
      usedLLM: llmConfig !== null,
      fallbackUsed: llmConfig === null,
      fallbackReason: llmConfig ? null : "provider_not_configured",
    });
  } catch (error) {
    aiGate?.refund();
    console.error(
      "Tailor error:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json(
      { error: "Failed to tailor resume" },
      { status: 500 },
    );
  }
}
