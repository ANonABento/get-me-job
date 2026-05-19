/**
 * @route GET /api/templates
 * @route POST /api/templates
 * @route DELETE /api/templates
 * @route PATCH /api/templates
 * @description List templates (GET), create a template (POST), delete a template (DELETE), or update template metadata (PATCH)
 * @auth Required
 * @request { name: string, content: string } (POST) | { id: string } (DELETE) | { id: string, name?: string, description?: string | null } (PATCH)
 * @response TemplatesResponse from @/types/api
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  updateCustomTemplateMetadata,
} from "@/lib/db/custom-templates";
import {
  deleteDocumentTemplateV2,
  listDocumentTemplatesV2,
  updateDocumentTemplateV2Metadata,
} from "@/lib/db/template-migrations";
import { getDocument } from "@/lib/db/queries";
import { TEMPLATES } from "@/lib/resume/templates";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  ApiErrors,
  successResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-utils";
import type { AnalyzedTemplate } from "@/lib/resume/template-analyzer";

export const dynamic = "force-dynamic";

const patchTemplateSchema = z
  .object({
    id: z.string().min(1, "Template ID is required"),
    name: z
      .string()
      .trim()
      .min(1, "Template name is required")
      .max(100)
      .optional(),
    description: z.string().trim().max(300).nullable().optional(),
  })
  .refine(
    (value) => value.name !== undefined || value.description !== undefined,
    {
      message: "Template name or description is required",
    },
  );

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  analyzedStyles: z.object({
    styles: z.object({
      fontFamily: z.string(),
      fontSize: z.string(),
      headerSize: z.string(),
      sectionHeaderSize: z.string(),
      lineHeight: z.string(),
      accentColor: z.string(),
      layout: z.enum(["single-column", "two-column"]),
      headerStyle: z.enum(["centered", "left", "minimal"]),
      bulletStyle: z.enum(["disc", "dash", "arrow", "none"]),
      sectionDivider: z.enum(["line", "space", "none"]),
    }),
    charsPerLine: z.number().positive(),
    margins: z.object({
      top: z.string(),
      bottom: z.string(),
      left: z.string(),
      right: z.string(),
    }),
    sectionGap: z.string(),
  }),
  sourceDocumentId: z.string().optional(),
  sourceFilename: z.string().optional(),
  sourceType: z.enum(["pdf", "docx", "tex"]).optional(),
});

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const customTemplateRows = getCustomTemplates(authResult.userId);
    const documentTemplateV2Rows = listDocumentTemplatesV2(authResult.userId);
    const customTemplates = Array.isArray(customTemplateRows)
      ? customTemplateRows
      : [];
    const documentTemplatesV2 = Array.isArray(documentTemplateV2Rows)
      ? documentTemplateV2Rows
      : [];

    const builtIn = TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: "built-in" as const,
    }));

    const custom = customTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description:
        t.description ??
        (t.sourceType
          ? `Imported from ${t.sourceType.toUpperCase()}`
          : `Custom template${t.sourceDocumentId ? " (from uploaded resume)" : ""}`),
      type: "custom" as const,
      analyzedStyles: t.analyzedStyles,
      customDescription: t.description,
      sourceFilename: t.sourceFilename,
      sourceType: t.sourceType,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
    const customV2 = documentTemplatesV2.map((t) => ({
      id: t.id,
      name: t.name,
      description:
        t.description ??
        (t.sourceType
          ? `Recreated from ${t.sourceType.toUpperCase()}`
          : "Recreated document template"),
      type: "custom" as const,
      customDescription: t.description,
      sourceFilename: t.sourceFilename,
      sourceType: t.sourceType,
      schemaVersion: t.template.schemaVersion,
      documentTemplate: t.template,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return successResponse({ templates: [...builtIn, ...custom, ...customV2] });
  } catch (error) {
    console.error("List templates error:", error);
    return errorResponse("internal_error", "Failed to list templates");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return ApiErrors.badRequest("Invalid JSON body");
    }
    const parseResult = createTemplateSchema.safeParse(body);

    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const {
      name,
      analyzedStyles,
      sourceDocumentId,
      sourceFilename,
      sourceType,
    } = parseResult.data;

    if (sourceDocumentId && !getDocument(sourceDocumentId, authResult.userId)) {
      return ApiErrors.notFound("Source document");
    }

    const template = saveCustomTemplate(
      name,
      analyzedStyles as AnalyzedTemplate,
      sourceDocumentId,
      authResult.userId,
      sourceFilename && sourceType
        ? { filename: sourceFilename, type: sourceType }
        : undefined,
    );

    return successResponse(template, 201);
  } catch (error) {
    console.error("Create template error:", error);
    return errorResponse("internal_error", "Failed to create template");
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return ApiErrors.badRequest("Template ID is required");
    }

    const deleted = deleteCustomTemplate(id, authResult.userId);
    const deletedV2 = deleted
      ? false
      : deleteDocumentTemplateV2(id, authResult.userId);
    if (!deleted && !deletedV2) {
      return ApiErrors.notFound("Template");
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    return errorResponse("internal_error", "Failed to delete template");
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parseResult = patchTemplateSchema.safeParse(body);

    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { id, name, description } = parseResult.data;
    const updated = updateCustomTemplateMetadata(
      id,
      { name, description },
      authResult.userId,
    );
    const updatedV2 = updated
      ? null
      : updateDocumentTemplateV2Metadata(id, authResult.userId, {
          name,
          description,
        });
    if (!updated && !updatedV2) {
      return ApiErrors.notFound("Template");
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Update template error:", error);
    return errorResponse("internal_error", "Failed to update template");
  }
}
