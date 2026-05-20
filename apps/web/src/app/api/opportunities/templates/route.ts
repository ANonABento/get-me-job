/**
 * @route GET /api/opportunities/templates
 * @description List all built-in and custom resume templates
 * @auth Required
 * @response ResumeTemplatesResponse from @/types/api
 */
import { TEMPLATES } from "@/lib/resume/pdf";
import {
  listReusableResumeTemplates,
  listDocumentTemplatesV3,
} from "@/lib/db/template-migrations";
import { requireAuth, isAuthError } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const builtIn = TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: "built-in" as const,
    }));

    const reusable = listReusableResumeTemplates(authResult.userId).map(
      (t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "Reusable template",
        type: "custom" as const,
        schemaVersion: 4,
        sourceFilename: t.sourceFilename,
        sourceType: t.sourceType,
      }),
    );

    const custom = listDocumentTemplatesV3(authResult.userId).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? "Visual template",
      type: "custom" as const,
      schemaVersion: 3,
      sourceFilename: t.sourceFilename,
      sourceType: t.sourceType,
    }));

    return successResponse({ templates: [...builtIn, ...reusable, ...custom] });
  } catch (error) {
    console.error("List templates error:", error);
    return errorResponse("internal_error", "Failed to list templates");
  }
}
