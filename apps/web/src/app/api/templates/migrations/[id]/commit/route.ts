import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getTemplateMigrationDraft,
  saveReusableResumeTemplate,
  saveDocumentTemplateV3,
  updateTemplateMigrationDraft,
} from "@/lib/db/template-migrations";
import { assessVisualTemplateFidelity } from "@/lib/resume/template-migration-fidelity";

export const dynamic = "force-dynamic";

const LOW_VISUAL_FIDELITY_MESSAGE =
  "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.";
const REUSABLE_TEMPLATE_NOT_READY_MESSAGE =
  "Reusable template artifacts are not ready to save. Review semantic mapping, style tokens, and reusable render before committing.";

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const draft = getTemplateMigrationDraft(params.id, authResult.userId);
  if (!draft) {
    return NextResponse.json(
      { error: "Migration draft not found" },
      { status: 404 },
    );
  }

  if (!draft.reusableTemplate && !draft.templateV3) {
    return NextResponse.json(
      {
        error: "This draft does not contain a reusable or V3 visual template.",
        code: "visual_template_missing",
      },
      { status: 422 },
    );
  }

  const visualFidelity = draft.templateV3
    ? assessVisualTemplateFidelity(draft.source, draft.templateV3)
    : null;
  if (!draft.reusableTemplate && visualFidelity?.status === "low") {
    return NextResponse.json(
      {
        error: LOW_VISUAL_FIDELITY_MESSAGE,
        code: "visual_fidelity_low",
        fidelity: visualFidelity,
      },
      { status: 422 },
    );
  }
  if (draft.reusableTemplate) {
    const readinessIssues = reusableTemplateReadinessIssues(draft);
    if (readinessIssues.length) {
      return NextResponse.json(
        {
          error: REUSABLE_TEMPLATE_NOT_READY_MESSAGE,
          code: "reusable_template_not_ready",
          issues: readinessIssues,
        },
        { status: 422 },
      );
    }
  }

  const saved = draft.reusableTemplate
    ? saveReusableResumeTemplate(authResult.userId, {
        ...draft.reusableTemplate,
        name: draft.templateV3?.name ?? draft.reusableTemplate.name,
      })
    : saveDocumentTemplateV3(authResult.userId, draft.templateV3);
  const updated = updateTemplateMigrationDraft(params.id, authResult.userId, {
    status: "committed",
    committedTemplateId: saved.id,
  });

  return NextResponse.json({
    template: {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      sourceFilename: saved.sourceFilename,
      sourceType: saved.sourceType,
      schemaVersion: saved.template.schemaVersion,
      ...(saved.template.schemaVersion === 4
        ? { reusableTemplate: saved.template }
        : { documentTemplateV3: saved.template }),
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    },
    draft: updated ? publicDraft(updated) : null,
  });
}

function reusableTemplateReadinessIssues(draft: {
  reusableTemplate?: {
    sectionOrder?: unknown;
    components?: unknown;
  } | null;
  reusableHtml?: unknown;
  semanticResume?: { sections?: unknown } | null;
  styleTokens?: unknown;
  universalAnalysis?: {
    scores?: {
      semanticCoverage?: unknown;
      styleCoverage?: unknown;
      layoutResilience?: unknown;
    };
  } | null;
}): string[] {
  const issues: string[] = [];
  const sectionOrder = Array.isArray(draft.reusableTemplate?.sectionOrder)
    ? draft.reusableTemplate.sectionOrder
    : [];
  const components = Array.isArray(draft.reusableTemplate?.components)
    ? draft.reusableTemplate.components
    : [];
  const semanticSections = Array.isArray(draft.semanticResume?.sections)
    ? draft.semanticResume.sections
    : [];
  const scores = draft.universalAnalysis?.scores ?? {};

  if (!sectionOrder.length) {
    issues.push("Reusable template has no section order.");
  }
  if (!components.length) {
    issues.push("Reusable template has no reusable components.");
  }
  if (typeof draft.reusableHtml !== "string" || !draft.reusableHtml.trim()) {
    issues.push("Reusable render HTML is missing.");
  }
  if (!semanticSections.length) {
    issues.push("Semantic resume sections are missing.");
  }
  if (!draft.styleTokens || typeof draft.styleTokens !== "object") {
    issues.push("Style tokens are missing.");
  }
  if (numberScore(scores.semanticCoverage) < 0.55) {
    issues.push("Semantic coverage is below the save threshold.");
  }
  if (numberScore(scores.styleCoverage) < 0.45) {
    issues.push("Style coverage is below the save threshold.");
  }
  if (numberScore(scores.layoutResilience) < 0.7) {
    issues.push("Layout resilience is below the save threshold.");
  }

  return issues;
}

function numberScore(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function publicDraft<T extends { userId?: string }>(
  draft: T,
): Omit<T, "userId"> {
  const { userId: _userId, ...rest } = draft;
  return rest;
}
