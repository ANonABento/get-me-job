/**
 * @route GET /api/opportunities/[id]/generate
 * @description List available resume templates for generation
 * @route POST /api/opportunities/[id]/generate
 * @description Generate a tailored resume for an opportunity using LLM
 * @auth Required
 * @request { templateId?: string } (POST)
 * @response ResumeTemplatesResponse | ResumeGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs-async";
import { getProfile, saveGeneratedResume } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import {
  isProviderUnavailableError,
  providerNotConfiguredFallback,
  providerUnavailableFallback,
  type ProviderFallbackInfo,
} from "@/lib/llm/provider-fallback";
import {
  generateTailoredResume,
  type TailoredResume,
} from "@/lib/resume/generator";
import { generateResumeHTML, TEMPLATES } from "@/lib/resume/pdf";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import {
  getReusableResumeTemplate,
  getDocumentTemplateV3,
} from "@/lib/db/template-migrations";
import { writeFile, mkdir } from "fs/promises";
import { generateId } from "@/lib/utils";
import { PATHS } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  // Return available templates
  return NextResponse.json({
    templates: TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    // Get template from request body
    let templateId = "classic";
    try {
      const body = await request.json();
      if (body.templateId) {
        templateId = body.templateId;
      }
    } catch {
      // No body or invalid JSON, use default
    }

    const job = await getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data. Upload a resume first." },
        { status: 400 },
      );
    }

    const gate = gateOptionalAiFeature(authResult.userId, "tailor", params.id);
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    // Generate tailored resume content
    let fallback: ProviderFallbackInfo | null = null;
    let tailoredResume: TailoredResume;
    if (gate.llmConfig) {
      try {
        tailoredResume = await generateTailoredResume(
          profile,
          job,
          gate.llmConfig,
        );
      } catch (error) {
        if (!isProviderUnavailableError(error)) throw error;
        aiGate?.refund();
        aiGate = null;
        fallback = providerUnavailableFallback(gate.llmConfig);
        tailoredResume = await generateTailoredResume(profile, job, null);
      }
    } else {
      fallback = providerNotConfiguredFallback();
      tailoredResume = await generateTailoredResume(profile, job, null);
    }

    // Generate HTML with selected template
    const html = await renderTailoredResumeHtml(
      tailoredResume,
      templateId,
      authResult.userId,
    );

    // Ensure output directory exists
    await mkdir(PATHS.RESUMES_OUTPUT, { recursive: true });

    // Save HTML file
    const filename = `resume-${job.company.toLowerCase().replace(/\s+/g, "-")}-${generateId()}.html`;
    const filePath = `${PATHS.RESUMES_OUTPUT}/${filename}`;
    await writeFile(filePath, html);

    // Return URL to the HTML file (can be printed to PDF from browser)
    const pdfUrl = `/resumes/${filename}`;

    // Save to database for tracking
    const savedResume = saveGeneratedResume(
      params.id,
      templateId,
      tailoredResume,
      pdfUrl,
      undefined,
      authResult.userId,
    );

    return NextResponse.json({
      success: true,
      pdfUrl,
      resume: tailoredResume,
      savedResume,
      ...(fallback
        ? { fallbackUsed: true, providerError: fallback }
        : { fallbackUsed: false }),
    });
  } catch (error) {
    aiGate?.refund();
    console.error(
      "Generate error:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}

async function renderTailoredResumeHtml(
  resume: TailoredResume,
  templateId: string,
  userId: string,
): Promise<string> {
  const reusableTemplate = getReusableResumeTemplate(templateId, userId);
  if (reusableTemplate) {
    const { renderTailoredResumeWithReusableTemplate } =
      await import("@/lib/resume/universal-template-renderer");
    return renderTailoredResumeWithReusableTemplate(
      resume,
      reusableTemplate.template,
    );
  }
  const documentTemplateV3 = getDocumentTemplateV3(templateId, userId);
  if (documentTemplateV3) {
    const { generateResumeHTMLV3 } =
      await import("@/lib/resume/template-v3-renderer");
    return generateResumeHTMLV3(resume, documentTemplateV3.template);
  }
  const template = await getTemplateWithCustom(templateId, userId);
  return generateResumeHTML(resume, templateId, template);
}
