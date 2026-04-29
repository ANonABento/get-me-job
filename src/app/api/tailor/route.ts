/**
 * @route GET /api/tailor
 * @route POST /api/tailor
 * @description List tailored resume templates (GET) or analyze a JD / generate a tailored resume from bank (POST)
 * @auth Required
 * @request { action: "analyze" | "generate" | "render", jobDescription: string, ...params } (POST)
 * @response TailorAnalysisResponse | TailorGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getProfile, getLLMConfig, saveGeneratedResume } from "@/lib/db";
import { getGroupedBankEntries } from "@/lib/db/profile-bank";
import { createJob, getJob } from "@/lib/db/jobs";
import { linkOpportunityDocument } from "@/lib/opportunities";
import { analyzeJobFit, extractKeywords } from "@/lib/tailor/analyze";
import { generateFromBank } from "@/lib/tailor/generate";
import { generateResumeHTML, TEMPLATES } from "@/lib/resume/pdf";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import {
  isTailorAction,
  isTailoredResume,
} from "@/lib/builder/tailored-resume-api";
import { writeFile, mkdir } from "fs/promises";
import { generateId } from "@/lib/utils";
import { PATHS } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

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
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const action = isTailorAction(body.action) ? body.action : "analyze";
    const templateId =
      typeof body.templateId === "string" ? body.templateId : "classic";

    if (body.action !== undefined && !isTailorAction(body.action)) {
      return NextResponse.json(
        { error: "Unsupported tailor action." },
        { status: 400 }
      );
    }

    if (action === "render") {
      if (!isTailoredResume(body.resume)) {
        return NextResponse.json(
          { error: "A generated resume is required for template rendering." },
          { status: 400 }
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
      jobTitle = "Unknown Position",
      company = "Unknown Company",
    } = body as {
      jobDescription?: string;
      jobTitle?: string;
      company?: string;
      opportunityId?: unknown;
    };
    const opportunityId =
      typeof body.opportunityId === "string" ? body.opportunityId.trim() : "";

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "Job description is too short. Please paste the full JD." },
        { status: 400 }
      );
    }

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
          error: "No knowledge bank entries found. Upload a resume first to populate your bank.",
        },
        { status: 400 }
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
        },
      });
    }

    // action === "generate"
    const profile = getProfile(authResult.userId);
    const contact = profile?.contact ?? {
      name: "Your Name",
      email: "",
      phone: "",
      location: "",
    };

    const llmConfig = getLLMConfig(authResult.userId);

    const tailoredResume = await generateFromBank(
      {
        bankEntries,
        matchedEntries: analysis.matchedEntries,
        contact,
        summary: profile?.summary,
        jobTitle,
        company,
        jobDescription,
      },
      llmConfig
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
        authResult.userId
      );

    // Save the generated resume
    const savedResume = saveGeneratedResume(
      job.id,
      templateId,
      tailoredResume,
      pdfUrl,
      analysis.matchScore,
      authResult.userId
    );

    if (opportunityId) {
      linkOpportunityDocument(
        opportunityId,
        { resumeId: savedResume.id },
        authResult.userId,
      );
    }

    return NextResponse.json({
      success: true,
      html,
      pdfUrl,
      resume: tailoredResume,
      savedResume,
      jobId: job.id,
      analysis: {
        matchScore: analysis.matchScore,
        keywordsFound: analysis.keywordsFound,
        keywordsMissing: analysis.keywordsMissing,
        gaps: analysis.gaps,
        matchedEntriesCount: analysis.matchedEntries.length,
      },
    });
  } catch (error) {
    console.error("Tailor error:", error);
    return NextResponse.json(
      { error: "Failed to tailor resume", details: String(error) },
      { status: 500 }
    );
  }
}
