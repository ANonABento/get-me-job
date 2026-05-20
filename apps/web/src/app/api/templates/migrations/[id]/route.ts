import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getTemplateMigrationDraft,
  updateTemplateMigrationDraft,
} from "@/lib/db/template-migrations";
import type { TailoredResume } from "@/lib/resume/generator";
import {
  createDocumentTemplateV3FromSourceIR,
  type SourceDocumentIR,
} from "@/lib/resume/template-migration";
import {
  documentTemplateV2Schema,
  resumeSlotPathSchema,
  type DocumentTemplateV2,
  type ResumeSlotPath,
} from "@/lib/resume/template-v2";
import {
  documentTemplateV3Schema,
  type DocumentTemplateV3,
} from "@/lib/resume/template-v3";
import {
  assessTemplateMigrationFidelity,
  assessVisualTemplateFidelity,
} from "@/lib/resume/template-migration-fidelity";
import {
  inferImportedTemplateStyleTokens,
  inferResumeSemanticIR,
  semanticIRToTailoredResume,
  type ImportedTemplateStyleTokens,
  type ResumeSemanticIR,
} from "@/lib/resume/universal-template-import";
import {
  buildReusableResumeTemplateIR,
  renderReusableResumeTemplateHTML,
} from "@/lib/resume/universal-template-renderer";
import { tailoredResumeSchema } from "@/lib/schemas/tailor";

export const dynamic = "force-dynamic";

const slotCorrectionSchema = z.object({
  sourceBlockId: z.string().min(1),
  path: resumeSlotPathSchema,
  index: z.number().int().min(0).optional(),
});

const sourceBlockDecisionSchema = z.object({
  sourceBlockId: z.string().min(1),
  decorative: z.boolean(),
});

const semanticContactSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  confidence: z.number().min(0).max(1).default(0.7),
  evidenceRefs: z.array(z.string()).default([]),
});

const semanticItemSchema = z.object({
  primary: z.string().default(""),
  secondary: z.string().optional(),
  location: z.string().optional(),
  dateRange: z.string().optional(),
  meta: z.array(z.string()).default([]),
  url: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.7),
  evidenceRefs: z.array(z.string()).default([]),
});

const semanticSectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
    "awards",
    "publications",
    "custom",
  ]),
  title: z.string().min(1),
  items: z.array(semanticItemSchema).default([]),
  confidence: z.number().min(0).max(1).default(0.7),
  evidenceRefs: z.array(z.string()).default([]),
});

const semanticResumeSchema = z.object({
  version: z.literal(1),
  sourceType: z.enum(["pdf", "docx", "tex"]),
  filename: z.string(),
  contact: semanticContactSchema,
  sections: z.array(semanticSectionSchema),
  warnings: z.array(z.string()).default([]),
});

const updateMigrationSchema = z.object({
  resume: tailoredResumeSchema.optional(),
  template: documentTemplateV2Schema.optional(),
  templateV3: documentTemplateV3Schema.optional(),
  semanticResume: semanticResumeSchema.optional(),
  styleTokens: z.object({}).passthrough().optional(),
  slotCorrections: z.array(slotCorrectionSchema).optional(),
  sourceBlockDecisions: z.array(sourceBlockDecisionSchema).optional(),
  resetStyleTokens: z.boolean().optional(),
});

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const draft = getTemplateMigrationDraft(params.id, authResult.userId);
  if (!draft) {
    return NextResponse.json(
      { error: "Migration draft not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ draft: publicDraft(draft) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const draft = getTemplateMigrationDraft(params.id, authResult.userId);
  if (!draft) {
    return NextResponse.json(
      { error: "Migration draft not found" },
      { status: 404 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateMigrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  let resume = (parsed.data.resume ?? draft.resume) as TailoredResume;
  let template = cloneTemplate(parsed.data.template ?? draft.template);
  let templateV3: DocumentTemplateV3 | undefined =
    parsed.data.templateV3 ?? draft.templateV3;
  let source = cloneSource(draft.source);
  if (parsed.data.sourceBlockDecisions?.length) {
    source = applySourceBlockDecisions(
      source,
      parsed.data.sourceBlockDecisions,
    );
  }
  if (parsed.data.slotCorrections?.length) {
    resume = applySlotCorrections(
      resume,
      source.blocks,
      parsed.data.slotCorrections,
    );
    template = applyTemplateSlotCorrections(
      template,
      parsed.data.slotCorrections,
    );
    source = applySourceSlotCorrections(source, parsed.data.slotCorrections);
    templateV3 = rebuildVisualTemplateForSource(templateV3, source);
  }
  if (
    parsed.data.sourceBlockDecisions?.length &&
    !parsed.data.slotCorrections?.length
  ) {
    templateV3 = rebuildVisualTemplateForSource(templateV3, source);
  }
  const effectiveSource = sourceWithoutDecorativeBlocks(source);
  const semanticResume = parsed.data.semanticResume as
    | ResumeSemanticIR
    | undefined;
  const styleTokens = parsed.data.styleTokens as
    | ImportedTemplateStyleTokens
    | undefined;
  const shouldResetStyleTokens = parsed.data.resetStyleTokens === true;
  const reusableSemanticResume =
    semanticResume ??
    (parsed.data.sourceBlockDecisions?.length || shouldResetStyleTokens
      ? inferResumeSemanticIR(effectiveSource)
      : styleTokens
        ? draft.semanticResume
        : undefined);
  const reusableStyleTokens = reusableSemanticResume
    ? shouldResetStyleTokens
      ? inferImportedTemplateStyleTokens(effectiveSource)
      : (styleTokens ??
        draft.styleTokens ??
        inferImportedTemplateStyleTokens(effectiveSource))
    : undefined;
  const reusableTemplate =
    reusableSemanticResume && reusableStyleTokens
      ? buildReusableResumeTemplateIR(
          reusableSemanticResume,
          reusableStyleTokens,
        )
      : undefined;
  const reusableHtml =
    reusableSemanticResume && reusableTemplate
      ? renderReusableResumeTemplateHTML(
          reusableSemanticResume,
          reusableTemplate,
        )
      : undefined;

  const updates: Parameters<typeof updateTemplateMigrationDraft>[2] = {
    source,
    resume:
      reusableSemanticResume && semanticResume
        ? semanticIRToTailoredResume(reusableSemanticResume)
        : resume,
    template,
    fidelity: templateV3
      ? assessVisualTemplateFidelity(source, templateV3)
      : assessTemplateMigrationFidelity(source, template),
  };
  if (templateV3) updates.templateV3 = templateV3;
  if (reusableSemanticResume && reusableStyleTokens) {
    updates.semanticResume = reusableSemanticResume;
    updates.styleTokens = reusableStyleTokens;
    updates.reusableTemplate = reusableTemplate;
    updates.reusableHtml = reusableHtml;
  }

  const updated = updateTemplateMigrationDraft(
    params.id,
    authResult.userId,
    updates,
  );
  return NextResponse.json({ draft: updated ? publicDraft(updated) : null });
}

function rebuildVisualTemplateForSource(
  existing: DocumentTemplateV3 | null | undefined,
  source: SourceDocumentIR,
): DocumentTemplateV3 | undefined {
  if (!existing) return undefined;
  const rebuilt = createDocumentTemplateV3FromSourceIR(
    existing.id,
    existing.name,
    source,
  );
  return {
    ...rebuilt,
    description: existing.description,
    repeatGroups: existing.repeatGroups.length
      ? existing.repeatGroups
      : rebuilt.repeatGroups,
  };
}

function applySourceSlotCorrections(
  source: SourceDocumentIR,
  corrections: Array<z.infer<typeof slotCorrectionSchema>>,
): SourceDocumentIR {
  const byId = new Map(
    corrections.map((correction) => [
      correction.sourceBlockId,
      correction.path,
    ]),
  );
  return {
    ...source,
    blocks: source.blocks.map((block) => {
      const path = byId.get(block.id);
      return path ? { ...block, slotHint: path } : block;
    }),
  };
}

function applySourceBlockDecisions(
  source: SourceDocumentIR,
  decisions: Array<z.infer<typeof sourceBlockDecisionSchema>>,
): SourceDocumentIR {
  const byId = new Map(
    decisions.map((decision) => [decision.sourceBlockId, decision.decorative]),
  );
  return {
    ...source,
    blocks: source.blocks.map((block) => {
      if (!byId.has(block.id)) return block;
      const decorative = byId.get(block.id) ?? false;
      return {
        ...block,
        decorative,
        slotHint: decorative ? undefined : block.slotHint,
      };
    }),
  };
}

function sourceWithoutDecorativeBlocks(
  source: SourceDocumentIR,
): SourceDocumentIR {
  return {
    ...source,
    blocks: source.blocks.filter((block) => !block.decorative),
  };
}

function applyTemplateSlotCorrections(
  template: DocumentTemplateV2,
  corrections: Array<z.infer<typeof slotCorrectionSchema>>,
): DocumentTemplateV2 {
  for (const correction of corrections) {
    const slot = template.slots.find(
      (candidate) => candidate.path === correction.path,
    );
    if (!slot) continue;
    if (!slot.sourceBlockIds.includes(correction.sourceBlockId)) {
      slot.sourceBlockIds.push(correction.sourceBlockId);
    }
  }
  return template;
}

function applySlotCorrections(
  resume: TailoredResume,
  sourceBlocks: Array<{ id: string; text: string }>,
  corrections: Array<z.infer<typeof slotCorrectionSchema>>,
): TailoredResume {
  const next: TailoredResume = {
    ...resume,
    contact: { ...resume.contact },
    experiences: resume.experiences.map((experience) => ({
      ...experience,
      highlights: [...experience.highlights],
    })),
    education: resume.education.map((education) => ({ ...education })),
    skills: [...resume.skills],
    projects: resume.projects?.map((project) => ({
      ...project,
      highlights: [...project.highlights],
    })),
    certifications: resume.certifications
      ? [...resume.certifications]
      : undefined,
    awards: resume.awards ? [...resume.awards] : undefined,
  };

  for (const correction of corrections) {
    const block = sourceBlocks.find(
      (candidate) => candidate.id === correction.sourceBlockId,
    );
    const value = block?.text.trim();
    if (!value) continue;
    assignSlotValue(next, correction.path, value, correction.index ?? 0);
  }

  return next;
}

function assignSlotValue(
  resume: TailoredResume,
  path: ResumeSlotPath,
  value: string,
  index: number,
): void {
  switch (path) {
    case "contact.name":
      resume.contact.name = value;
      return;
    case "contact.email":
      resume.contact.email = value;
      return;
    case "contact.phone":
      resume.contact.phone = value;
      return;
    case "contact.location":
      resume.contact.location = value;
      return;
    case "contact.linkedin":
      resume.contact.linkedin = value;
      return;
    case "contact.github":
      resume.contact.github = value;
      return;
    case "summary":
      resume.summary = value;
      return;
    case "skills[]":
      appendUnique(resume.skills, ...splitList(value));
      return;
    case "certifications[]":
      resume.certifications = resume.certifications ?? [];
      appendUnique(resume.certifications, ...splitList(value));
      return;
    case "awards[]":
      resume.awards = resume.awards ?? [];
      appendUnique(resume.awards, ...splitList(value));
      return;
    default:
      assignIndexedSlot(resume, path, value, index);
  }
}

function assignIndexedSlot(
  resume: TailoredResume,
  path: ResumeSlotPath,
  value: string,
  index: number,
): void {
  if (path.startsWith("experiences[]")) {
    const experience =
      resume.experiences[index] ??
      (resume.experiences[index] = {
        title: "",
        company: "",
        dates: "",
        highlights: [],
      });
    if (path === "experiences[].title") experience.title = value;
    if (path === "experiences[].company") experience.company = value;
    if (path === "experiences[].dates") experience.dates = value;
    if (path === "experiences[].highlights[]")
      appendUnique(experience.highlights, value);
    return;
  }

  if (path.startsWith("education[]")) {
    const education =
      resume.education[index] ??
      (resume.education[index] = {
        institution: "",
        degree: "",
        field: "",
        date: "",
      });
    if (path === "education[].institution") education.institution = value;
    if (path === "education[].degree") education.degree = value;
    if (path === "education[].field") education.field = value;
    if (path === "education[].date") education.date = value;
    return;
  }

  if (path.startsWith("projects[]")) {
    resume.projects = resume.projects ?? [];
    const project =
      resume.projects[index] ??
      (resume.projects[index] = { name: "", description: "", highlights: [] });
    if (path === "projects[].name") project.name = value;
    if (path === "projects[].description") project.description = value;
    if (path === "projects[].highlights[]")
      appendUnique(project.highlights, value);
  }
}

function splitList(value: string): string[] {
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendUnique(target: string[], ...values: string[]): void {
  for (const value of values) {
    if (value && !target.includes(value)) target.push(value);
  }
}

function cloneTemplate(template: DocumentTemplateV2): DocumentTemplateV2 {
  return documentTemplateV2Schema.parse(JSON.parse(JSON.stringify(template)));
}

function cloneSource(source: SourceDocumentIR): SourceDocumentIR {
  return JSON.parse(JSON.stringify(source)) as SourceDocumentIR;
}

function publicDraft<T extends { userId?: string }>(
  draft: T,
): Omit<T, "userId"> {
  const { userId: _userId, ...rest } = draft;
  return rest;
}
