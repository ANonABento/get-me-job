import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig, saveGeneratedResume } from "@/lib/db";
import { generateTailoredResume } from "@/lib/resume/generator";
import { generateResumeHTML, TEMPLATES } from "@/lib/resume/pdf";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateId } from "@/lib/utils";

const OUTPUT_DIR = path.join(process.cwd(), "public", "resumes");

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
  { params }: { params: { id: string } }
) {
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

    const job = getJob(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data. Upload a resume first." },
        { status: 400 }
      );
    }

    const llmConfig = getLLMConfig();

    // Generate tailored resume content
    const tailoredResume = await generateTailoredResume(profile, job, llmConfig);

    // Generate HTML with selected template
    const html = generateResumeHTML(tailoredResume, templateId);

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Save HTML file
    const filename = `resume-${job.company.toLowerCase().replace(/\s+/g, "-")}-${generateId()}.html`;
    const filePath = path.join(OUTPUT_DIR, filename);
    await writeFile(filePath, html);

    // Return URL to the HTML file (can be printed to PDF from browser)
    const pdfUrl = `/resumes/${filename}`;

    // Save to database for tracking
    const savedResume = saveGeneratedResume(
      params.id,
      templateId,
      tailoredResume,
      pdfUrl
    );

    return NextResponse.json({
      success: true,
      pdfUrl,
      resume: tailoredResume,
      savedResume,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume", details: String(error) },
      { status: 500 }
    );
  }
}
