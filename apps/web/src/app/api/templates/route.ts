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
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteReusableResumeTemplate,
  deleteDocumentTemplateV3,
  listReusableResumeTemplates,
  listDocumentTemplatesV3,
  updateReusableResumeTemplateMetadata,
  updateDocumentTemplateV3Metadata,
} from "@/lib/db/template-migrations";
import { TEMPLATES } from "@/lib/resume/templates";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  ApiErrors,
  successResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-utils";

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

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const reusableRows = listReusableResumeTemplates(authResult.userId);
    const documentTemplateV3Rows = listDocumentTemplatesV3(authResult.userId);
    const reusableTemplates = Array.isArray(reusableRows) ? reusableRows : [];
    const documentTemplatesV3 = Array.isArray(documentTemplateV3Rows)
      ? documentTemplateV3Rows
      : [];

    const builtIn = TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: "built-in" as const,
    }));

    const customV4 = reusableTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description:
        t.description ??
        (t.sourceType
          ? `Reusable template from ${t.sourceType.toUpperCase()}`
          : "Reusable template"),
      type: "custom" as const,
      customDescription: t.description,
      sourceFilename: t.sourceFilename,
      sourceType: t.sourceType,
      schemaVersion: t.template.schemaVersion,
      reusableTemplate: t.template,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const customV3 = documentTemplatesV3.map((t) => ({
      id: t.id,
      name: t.name,
      description:
        t.description ??
        (t.sourceType
          ? `Visual template from ${t.sourceType.toUpperCase()}`
          : "Visual template"),
      type: "custom" as const,
      customDescription: t.description,
      sourceFilename: t.sourceFilename,
      sourceType: t.sourceType,
      schemaVersion: t.template.schemaVersion,
      documentTemplateV3: t.template,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return successResponse({
      templates: [...builtIn, ...customV4, ...customV3],
    });
  } catch (error) {
    console.error("List templates error:", error);
    return errorResponse("internal_error", "Failed to list templates");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    return NextResponse.json(
      {
        error: "Use /api/templates/migrate to import a V3 visual template.",
        code: "legacy_template_creation_disabled",
      },
      { status: 410 },
    );
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

    const deleted =
      deleteReusableResumeTemplate(id, authResult.userId) ||
      deleteDocumentTemplateV3(id, authResult.userId);
    if (!deleted) {
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
    const updated =
      updateReusableResumeTemplateMetadata(id, authResult.userId, {
        name,
        description,
      }) ??
      updateDocumentTemplateV3Metadata(id, authResult.userId, {
        name,
        description,
      });
    if (!updated) {
      return ApiErrors.notFound("Template");
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Update template error:", error);
    return errorResponse("internal_error", "Failed to update template");
  }
}
