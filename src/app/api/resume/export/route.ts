import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getGeneratedResume } from "@/lib/db";
import { generateResumeLatex, LATEX_TEMPLATES } from "@/lib/resume/latex-generator";
import type { TailoredResume } from "@/lib/resume/generator";
import { exec } from "child_process";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  return NextResponse.json({
    templates: LATEX_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      layout: t.layout,
    })),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { resumeId, templateId = "modern", options = {}, compilePdf = false } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    const savedResume = getGeneratedResume(resumeId, authResult.userId);
    if (!savedResume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const resume: TailoredResume = JSON.parse(savedResume.contentJson);
    const latex = generateResumeLatex(resume, templateId, options);

    if (compilePdf) {
      try {
        const tmpDir = await mkdtemp(join(tmpdir(), "resume-"));
        const texPath = join(tmpDir, "resume.tex");
        const pdfPath = join(tmpDir, "resume.pdf");

        await writeFile(texPath, latex);
        await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`, {
          timeout: 30000,
        });

        const pdfBuffer = await readFile(pdfPath);

        // Cleanup temp files
        const cleanupFiles = ["resume.tex", "resume.pdf", "resume.aux", "resume.log", "resume.out"];
        await Promise.allSettled(
          cleanupFiles.map((f) => unlink(join(tmpDir, f)))
        );

        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="resume.pdf"`,
          },
        });
      } catch {
        // pdflatex not available or compilation failed, fall back to .tex
        return new NextResponse(latex, {
          headers: {
            "Content-Type": "application/x-tex",
            "Content-Disposition": `attachment; filename="resume.tex"`,
            "X-Fallback": "pdflatex-unavailable",
          },
        });
      }
    }

    return new NextResponse(latex, {
      headers: {
        "Content-Type": "application/x-tex",
        "Content-Disposition": `attachment; filename="resume.tex"`,
      },
    });
  } catch (error) {
    console.error("LaTeX export error:", error);
    return NextResponse.json(
      { error: "Failed to export resume", details: String(error) },
      { status: 500 }
    );
  }
}
