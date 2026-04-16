/**
 * @route GET /api/jobs/templates
 * @description List all built-in and custom resume templates
 * @auth Required
 * @response ResumeTemplatesResponse from @/types/api
 */
import { TEMPLATES } from "@/lib/resume/pdf";
import { getCustomTemplates } from "@/lib/db/custom-templates";
import { requireAuth, isAuthError } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

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

    const custom = getCustomTemplates(authResult.userId).map((t) => ({
      id: t.id,
      name: t.name,
      description: `Custom template${t.sourceDocumentId ? " (from uploaded resume)" : ""}`,
      type: "custom" as const,
    }));

    return successResponse({ templates: [...builtIn, ...custom] });
  } catch (error) {
    console.error("List templates error:", error);
    return errorResponse("internal_error", "Failed to list templates");
  }
}
