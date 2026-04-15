import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getGeneratedResume } from "@/lib/db";
import { generateResumeHTML } from "@/lib/resume/pdf";
import { generatePDF } from "@/lib/resume/pdf-export";
import { generateResumeLatex, LATEX_TEMPLATES, type LatexOptions } from "@/lib/resume/latex-generator";
import type { TailoredResume } from "@/lib/resume/generator";
import { exec } from "child_process";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
const LATEX_CLEANUP_EXTENSIONS = ["resume.tex", "resume.pdf", "resume.aux", "resume.log", "resume.out"];

// GET — list available templates
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

const exportSchema = z.object({
  resumeId: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  templateId: z.string().min(1).default("classic"),
  format: z.enum(["pdf", "latex", "html"]).default("pdf"),
  latexOptions: z.record(z.string(), z.unknown()).optional(),
  compilePdf: z.boolean().default(false),
});

// POST — export resume in requested format
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = exportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Provide { resumeId, format } or { html, format }" },
        { status: 400 }
      );
    }

    const { resumeId, html: rawHtml, templateId, format, latexOptions, compilePdf } = parsed.data;

    // Get resume content
    let resume: TailoredResume | null = null;
    if (resumeId) {
      const saved = getGeneratedResume(resumeId, authResult.userId);
      if (!saved) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      resume = JSON.parse(saved.contentJson);
    }

    // Route by format
    if (format === "latex") {
      if (!resume) {
        return NextResponse.json({ error: "resumeId required for LaTeX export" }, { status: 400 });
      }
      const latex = generateResumeLatex(resume, templateId, (latexOptions || {}) as LatexOptions);

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
          await Promise.allSettled(LATEX_CLEANUP_EXTENSIONS.map((f) => unlink(join(tmpDir, f))));

          return new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="resume.pdf"`,
            },
          });
        } catch {
          // pdflatex unavailable, fall back to .tex
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
    }

    if (format === "html") {
      if (!resume) {
        return NextResponse.json({ error: "resumeId required for HTML export" }, { status: 400 });
      }
      const html = generateResumeHTML(resume, templateId);
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html", "Content-Disposition": `attachment; filename="resume.html"` },
      });
    }

    // Default: PDF
    let html: string;
    if (rawHtml) {
      html = rawHtml;
    } else if (resume) {
      html = generateResumeHTML(resume, templateId);
    } else {
      return NextResponse.json({ error: "Provide resumeId or html" }, { status: 400 });
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
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export resume" }, { status: 500 });
  }
}
