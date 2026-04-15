import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getGeneratedResume } from "@/lib/db/resumes";
import { generateResumeHTML } from "@/lib/resume/pdf";
import { generatePDF } from "@/lib/resume/pdf-export";

const exportByIdSchema = z.object({
  resumeId: z.string().min(1),
  templateId: z.string().min(1).default("classic"),
});

const exportByHtmlSchema = z.object({
  html: z.string().min(1),
});

const requestSchema = z.union([exportByIdSchema, exportByHtmlSchema]);

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Provide either { resumeId, templateId } or { html }" },
        { status: 400 }
      );
    }

    let html: string;

    if ("html" in parsed.data) {
      html = parsed.data.html;
    } else {
      const resume = getGeneratedResume(parsed.data.resumeId, authResult.userId);
      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found" },
          { status: 404 }
        );
      }
      const resumeContent = JSON.parse(resume.contentJson);
      html = generateResumeHTML(resumeContent, parsed.data.templateId);
    }

    const pdfBuffer = await generatePDF(html);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
