/**
 * @route GET /api/resume/export
 * @route POST /api/resume/export
 * @description GET: List available export templates. POST: Export a resume as PDF, DOCX, HTML, or LaTeX.
 * @auth Required
 * @request { resumeId: string, template: string, format: "pdf" | "docx" | "html" | "latex" } (POST)
 * @response ResumeTemplatesResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getGeneratedResume } from "@/lib/db";
import {
  getReusableResumeTemplate,
  getDocumentTemplateV3,
  listReusableResumeTemplates,
  listDocumentTemplatesV3,
} from "@/lib/db/template-migrations";
import type { TailoredResume } from "@/lib/resume/generator";
import type { LatexOptions } from "@/lib/resume/latex-generator";
import type { ServerPDFOptions } from "@/lib/resume/pdf-export";
import {
  getCoverLetterTemplate,
  getTemplate,
} from "@/lib/resume/template-data";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import {
  DEFAULT_PAGE_SETTINGS,
  normalizePageSettings,
  pageSettingsToPdfMargin,
  type PageSettings,
} from "@/lib/editor/page-settings";
import { exec } from "child_process";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);
const LATEX_CLEANUP_EXTENSIONS = [
  "resume.tex",
  "resume.pdf",
  "resume.aux",
  "resume.log",
  "resume.out",
];

// GET — list available templates
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const { LATEX_TEMPLATES } = await import("@/lib/resume/latex-generator");
  const reusableTemplates = listReusableResumeTemplates(authResult.userId);
  const v3Templates = listDocumentTemplatesV3(authResult.userId);
  return NextResponse.json({
    templates: [
      ...LATEX_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        layout: t.layout,
        type: "built-in" as const,
      })),
      ...reusableTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description ?? "Reusable template",
        layout:
          template.template.tokens.layout.columns?.value === 2
            ? "two-column"
            : "single-column",
        type: "custom" as const,
        schemaVersion: 4,
        sourceFilename: template.sourceFilename,
        sourceType: template.sourceType,
      })),
      ...v3Templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description ?? "Visual template",
        layout: template.template.regions.some(
          (region) => region.role === "sidebar",
        )
          ? "two-column"
          : "single-column",
        type: "custom" as const,
        schemaVersion: 3,
        sourceFilename: template.sourceFilename,
        sourceType: template.sourceType,
      })),
    ],
  });
}

const exportSchema = z.object({
  resumeId: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  content: z.unknown().optional(),
  mode: z.enum(["resume", "cover_letter"]).default("resume"),
  templateId: z.string().min(1).default("classic"),
  format: z.enum(["pdf", "latex", "html", "docx"]).default("pdf"),
  latexOptions: z.record(z.string(), z.unknown()).optional(),
  compilePdf: z.boolean().default(false),
  pageSettings: z
    .object({
      size: z.enum(["letter", "a4"]).optional(),
      marginPreset: z.enum(["narrow", "normal", "wide", "custom"]).optional(),
      margins: z
        .object({
          top: z.number().optional(),
          right: z.number().optional(),
          bottom: z.number().optional(),
          left: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});

async function renderResumeHtml(
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
  const { generateResumeHTML } = await import("@/lib/resume/pdf");
  const template = getTemplateWithCustom(templateId, userId);
  return generateResumeHTML(resume, templateId, template);
}

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
        { status: 400 },
      );
    }

    const {
      resumeId,
      html: rawHtml,
      content,
      mode,
      templateId,
      format,
      latexOptions,
      compilePdf,
      pageSettings,
    } = parsed.data;

    // Get resume content
    let resume: TailoredResume | null = null;
    if (resumeId) {
      const saved = getGeneratedResume(resumeId, authResult.userId);
      if (!saved) {
        return NextResponse.json(
          { error: "Resume not found" },
          { status: 404 },
        );
      }
      resume = JSON.parse(saved.contentJson);
    }

    // Route by format
    if (format === "docx") {
      if (!content || typeof content !== "object") {
        return NextResponse.json(
          { error: "content required for DOCX export" },
          { status: 400 },
        );
      }

      const { convertContentToDocx } =
        await import("@/lib/builder/docx-export");
      const template =
        mode === "cover_letter"
          ? getCoverLetterTemplate(templateId)
          : getTemplate(templateId);
      const docxBuffer = await convertContentToDocx({
        content,
        mode,
        templateStyles: template?.styles,
        pageSettings: pageSettings as Partial<PageSettings> | undefined,
        title:
          mode === "cover_letter"
            ? `${template?.name ?? "Studio"} Cover Letter`
            : `${template?.name ?? "Studio"} Resume`,
      });

      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="document.docx"',
          "Content-Length": String(docxBuffer.length),
        },
      });
    }

    if (format === "latex") {
      if (!resume) {
        return NextResponse.json(
          { error: "resumeId required for LaTeX export" },
          { status: 400 },
        );
      }
      const latex = (
        await import("@/lib/resume/latex-generator")
      ).generateResumeLatex(
        resume,
        templateId,
        (latexOptions || {}) as LatexOptions,
      );

      if (compilePdf) {
        try {
          const tmpDir = await mkdtemp(join(tmpdir(), "resume-"));
          const texPath = join(tmpDir, "resume.tex");
          const pdfPath = join(tmpDir, "resume.pdf");

          await writeFile(texPath, latex);
          await execAsync(
            `pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texPath}"`,
            {
              timeout: 30000,
            },
          );

          const pdfBuffer = await readFile(pdfPath);
          await Promise.allSettled(
            LATEX_CLEANUP_EXTENSIONS.map((f) => unlink(join(tmpDir, f))),
          );

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
        return NextResponse.json(
          { error: "resumeId required for HTML export" },
          { status: 400 },
        );
      }
      const html = await renderResumeHtml(
        resume,
        templateId,
        authResult.userId,
      );
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="resume.html"`,
        },
      });
    }

    // Default: PDF
    let html: string;
    if (rawHtml) {
      html = rawHtml;
    } else if (resume) {
      html = await renderResumeHtml(resume, templateId, authResult.userId);
    } else {
      return NextResponse.json(
        { error: "Provide resumeId or html" },
        { status: 400 },
      );
    }

    const { generatePDF } = await import("@/lib/resume/pdf-export");
    const reusableTemplate = resume
      ? getReusableResumeTemplate(templateId, authResult.userId)
      : null;
    const documentTemplateV3 =
      resume && !reusableTemplate
        ? getDocumentTemplateV3(templateId, authResult.userId)
        : null;
    const normalizedPageSettings = normalizePageSettings(
      (pageSettings as Partial<PageSettings> | undefined) ??
        DEFAULT_PAGE_SETTINGS,
    );
    const pdfOptions: ServerPDFOptions = reusableTemplate
      ? {
          format:
            reusableTemplate.template.page.size.toLowerCase() === "a4"
              ? "A4"
              : "Letter",
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        }
      : documentTemplateV3
        ? {
            format:
              documentTemplateV3.template.page.size.toLowerCase() === "a4"
                ? "A4"
                : "Letter",
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
          }
        : {
            format: normalizedPageSettings.size === "a4" ? "A4" : "Letter",
            margin: pageSettingsToPdfMargin(normalizedPageSettings),
          };
    const pdfBuffer = await generatePDF(html, {
      format: pdfOptions.format,
      margin: pdfOptions.margin,
    });
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
    return NextResponse.json(
      { error: "Failed to export resume" },
      { status: 500 },
    );
  }
}
