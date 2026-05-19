import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getTemplateMigrationDraft,
  saveDocumentTemplateV3,
  updateTemplateMigrationDraft,
} from "@/lib/db/template-migrations";
import { assessVisualTemplateFidelity } from "@/lib/resume/template-migration-fidelity";

export const dynamic = "force-dynamic";

const LOW_VISUAL_FIDELITY_MESSAGE =
  "Could not read enough layout structure from this file. Try DOCX/LaTeX, or use a selectable PDF with visible text.";

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

  if (!draft.templateV3) {
    return NextResponse.json(
      {
        error: "This draft does not contain a V3 visual template.",
        code: "visual_template_missing",
      },
      { status: 422 },
    );
  }

  const visualFidelity = assessVisualTemplateFidelity(
    draft.source,
    draft.templateV3,
  );
  if (visualFidelity.status === "low") {
    return NextResponse.json(
      {
        error: LOW_VISUAL_FIDELITY_MESSAGE,
        code: "visual_fidelity_low",
        fidelity: visualFidelity,
      },
      { status: 422 },
    );
  }

  const saved = saveDocumentTemplateV3(authResult.userId, draft.templateV3);
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
      documentTemplateV3: saved.template,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    },
    draft: updated ? publicDraft(updated) : null,
  });
}

function publicDraft<T extends { userId?: string }>(
  draft: T,
): Omit<T, "userId"> {
  const { userId: _userId, ...rest } = draft;
  return rest;
}
