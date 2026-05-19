import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getTemplateMigrationDraft,
  saveDocumentTemplateV2,
  updateTemplateMigrationDraft,
} from "@/lib/db/template-migrations";

export const dynamic = "force-dynamic";

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

  const saved = saveDocumentTemplateV2(authResult.userId, draft.template);
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
      documentTemplate: saved.template,
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
