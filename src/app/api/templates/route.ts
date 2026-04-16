/**
 * @route GET /api/templates
 * @route POST /api/templates
 * @route DELETE /api/templates
 * @route PATCH /api/templates
 * @description List templates (GET), create a template (POST), delete a template (DELETE), or rename a template (PATCH)
 * @auth Required
 * @request { name: string, content: string } (POST) | { id: string } (DELETE) | { id: string, name: string } (PATCH)
 * @response TemplatesResponse from @/types/api
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  updateCustomTemplateName,
} from "@/lib/db/custom-templates";
import { TEMPLATES } from "@/lib/resume/templates";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  ApiErrors,
  successResponse,
  validationErrorResponse,
  errorResponse,
} from "@/lib/api-utils";
import type { AnalyzedTemplate } from "@/lib/resume/template-analyzer";

const patchTemplateSchema = z.object({
  id: z.string().min(1, "Template ID is required"),
  name: z.string().min(1, "Template name is required").max(100),
});

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
});

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const customTemplates = getCustomTemplates(authResult.userId);

    const builtIn = TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: "built-in" as const,
    }));

    const custom = customTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: `Custom template${t.sourceDocumentId ? " (from uploaded resume)" : ""}`,
      type: "custom" as const,
      analyzedStyles: t.analyzedStyles,
      createdAt: t.createdAt,
    }));

    return successResponse({ templates: [...builtIn, ...custom] });
  } catch (error) {
    console.error("List templates error:", error);
    return errorResponse("internal_error", "Failed to list templates");
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parseResult = createTemplateSchema.safeParse(body);

    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { name, analyzedStyles, sourceDocumentId } = parseResult.data;

    const template = saveCustomTemplate(
      name,
      analyzedStyles as AnalyzedTemplate,
      sourceDocumentId,
      authResult.userId
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

    const { id, name } = parseResult.data;
    const updated = updateCustomTemplateName(id, name, authResult.userId);
    if (!updated) {
      return ApiErrors.notFound("Template");
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("Update template error:", error);
    return errorResponse("internal_error", "Failed to update template");
  }
}
