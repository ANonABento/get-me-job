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
  getDocumentTemplateV2,
  listDocumentTemplatesV2,
} from "@/lib/db/template-migrations";
import type { TailoredResume } from "@/lib/resume/generator";
import type { LatexOptions } from "@/lib/resume/latex-generator";
import type { ServerPDFOptions } from "@/lib/resume/pdf-export";
import {
  getCoverLetterTemplate,
  getTemplate,
} from "@/lib/resume/template-data";
import { getTemplateWithCustom } from "@/lib/resume/templates";
import type { TipTapJSONContent } from "@/lib/editor/types";
import type { TemplateStyles } from "@/lib/resume/template-data";
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
  const v2Templates = listDocumentTemplatesV2(authResult.userId);
  return NextResponse.json({
    templates: [
      ...LATEX_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        layout: t.layout,
        type: "built-in" as const,
      })),
      ...v2Templates.map((template) => ({
        id: template.id,
        name: template.name,
        description:
          template.description ??
          (template.sourceFilename
            ? `Migrated from ${template.sourceFilename}`
            : "Migrated document template"),
        layout: template.template.regions.some(
          (region) => region.role === "sidebar",
        )
          ? "two-column"
          : "single-column",
        type: "custom" as const,
        schemaVersion: template.template.schemaVersion,
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
  const documentTemplate = getDocumentTemplateV2(templateId, userId);
  if (documentTemplate) {
    const { generateResumeHTMLV2 } =
      await import("@/lib/resume/template-v2-renderer");
    return generateResumeHTMLV2(resume, documentTemplate.template);
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
      const documentTemplate = resume
        ? getDocumentTemplateV2(templateId, authResult.userId)
        : null;
      if (resume && documentTemplate && !content) {
        const { convertContentToDocx } =
          await import("@/lib/builder/docx-export");
        const docxBuffer = await convertContentToDocx({
          content: resumeToTipTapContent(resume),
          mode: "resume",
          templateStyles: documentTemplateV2ToTemplateStyles(
            documentTemplate.template,
          ),
          pageSettings: documentTemplateV2ToPageSettings(
            documentTemplate.template,
          ),
          title: `${documentTemplate.name} Resume`,
        });

        return new NextResponse(new Uint8Array(docxBuffer), {
          status: 200,
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": 'attachment; filename="resume.docx"',
            "Content-Length": String(docxBuffer.length),
          },
        });
      }

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
      const documentTemplate = getDocumentTemplateV2(
        templateId,
        authResult.userId,
      );
      const latex = documentTemplate
        ? (
            await import("@/lib/resume/template-v2-renderer")
          ).generateResumeLatexV2(resume, documentTemplate.template)
        : (await import("@/lib/resume/latex-generator")).generateResumeLatex(
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
    const documentTemplate = resume
      ? getDocumentTemplateV2(templateId, authResult.userId)
      : null;
    const normalizedPageSettings = normalizePageSettings(
      (pageSettings as Partial<PageSettings> | undefined) ??
        DEFAULT_PAGE_SETTINGS,
    );
    const pdfOptions: ServerPDFOptions = documentTemplate
      ? (
          await import("@/lib/resume/template-v2-renderer")
        ).getDocumentTemplateV2PDFOptions(documentTemplate.template)
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

function resumeToTipTapContent(resume: TailoredResume): TipTapJSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "contactInfo",
        attrs: {
          name: resume.contact.name ?? "",
          email: resume.contact.email ?? "",
          phone: resume.contact.phone ?? "",
          location: resume.contact.location ?? "",
          linkedin: resume.contact.linkedin ?? "",
          github: resume.contact.github ?? "",
        },
      },
      resume.summary
        ? sectionNode("Summary", [paragraphNode(resume.summary)])
        : null,
      resume.experiences.length
        ? sectionNode(
            "Experience",
            resume.experiences.map((experience) => ({
              type: "resumeEntry",
              attrs: {
                title: experience.title,
                company: experience.company,
                dates: experience.dates,
              },
              content: [bulletListNode(experience.highlights)],
            })),
          )
        : null,
      resume.projects?.length
        ? sectionNode(
            "Projects",
            resume.projects.map((project) => ({
              type: "resumeEntry",
              attrs: {
                title: project.name,
                company: project.description,
                dates: "",
              },
              content: [bulletListNode(project.highlights)],
            })),
          )
        : null,
      resume.skills.length
        ? sectionNode("Skills", [paragraphNode(resume.skills.join(" | "))])
        : null,
      resume.education.length
        ? sectionNode(
            "Education",
            resume.education.map((education) => ({
              type: "resumeEntry",
              attrs: {
                title: [education.degree, education.field]
                  .filter(Boolean)
                  .join(" in "),
                company: education.institution,
                dates: education.date,
              },
            })),
          )
        : null,
      resume.certifications?.length
        ? sectionNode("Certifications", [bulletListNode(resume.certifications)])
        : null,
      resume.awards?.length
        ? sectionNode("Awards", [bulletListNode(resume.awards)])
        : null,
    ].filter((node): node is TipTapJSONContent => Boolean(node)),
  };
}

function sectionNode(
  title: string,
  content: TipTapJSONContent[],
): TipTapJSONContent {
  return { type: "resumeSection", attrs: { title }, content };
}

function paragraphNode(text: string): TipTapJSONContent {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function bulletListNode(values: string[]): TipTapJSONContent {
  return {
    type: "bulletList",
    content: values.map((value) => ({
      type: "listItem",
      content: [paragraphNode(value)],
    })),
  };
}

function documentTemplateV2ToTemplateStyles(
  template: import("@/lib/resume/template-v2").DocumentTemplateV2,
): TemplateStyles {
  const body = template.tokens.body;
  const heading = template.tokens.heading ?? body;
  const name = template.tokens.name ?? heading;
  const firstSection = template.regions
    .flatMap((region) => region.blocks)
    .find((block) => block.type === "section");
  return {
    fontFamily: body?.fontFamily ?? "Arial",
    fontSize: body?.fontSize ?? "11pt",
    headerSize: name?.fontSize ?? "20pt",
    sectionHeaderSize: heading?.fontSize ?? "12pt",
    lineHeight: body?.lineHeight ?? "1.4",
    accentColor: heading?.color ?? name?.color ?? "#111827",
    layout: template.regions.some((region) => region.role === "sidebar")
      ? ("two-column" as const)
      : ("single-column" as const),
    headerStyle: "left" as const,
    bulletStyle: firstSection?.style?.bulletStyle ?? "disc",
    sectionDivider: firstSection?.style?.divider ?? "line",
  };
}

function documentTemplateV2ToPageSettings(
  template: import("@/lib/resume/template-v2").DocumentTemplateV2,
): Partial<PageSettings> {
  return {
    size: template.page.size.toLowerCase() === "a4" ? "a4" : "letter",
    marginPreset: "custom",
    margins: {
      top: parseInches(template.page.margins.top, 0.75),
      right: parseInches(template.page.margins.right, 0.75),
      bottom: parseInches(template.page.margins.bottom, 0.75),
      left: parseInches(template.page.margins.left, 0.75),
    },
  };
}

function parseInches(value: string, fallback: number): number {
  const trimmed = value.trim();
  const amount = Number.parseFloat(trimmed);
  if (!Number.isFinite(amount)) return fallback;
  if (trimmed.endsWith("cm")) return amount / 2.54;
  if (trimmed.endsWith("mm")) return amount / 25.4;
  if (trimmed.endsWith("pt")) return amount / 72;
  return amount;
}
