// Resume template definitions and management
export type { ResumeTemplate, TemplateStyles } from "./template-types";
import type { ResumeTemplate } from "./template-types";
import { getCustomTemplate } from "@/lib/db/custom-templates";
import { TEMPLATES } from "./template-data";

// Re-export client-safe template data
export { TEMPLATES, getTemplate, generateTemplateCSS } from "./template-data";

// Get template by ID, checking custom templates first (server-only)
export function getTemplateWithCustom(
  id: string,
  userId?: string
): ResumeTemplate {
  // Check built-in templates first
  const builtIn = TEMPLATES.find((t) => t.id === id);
  if (builtIn) return builtIn;

  // Check custom templates
  try {
    const custom = getCustomTemplate(id, userId || "default");
    if (custom) {
      return {
        id: custom.id,
        name: custom.name,
        description: `Custom template${custom.sourceDocumentId ? " (from uploaded resume)" : ""}`,
        styles: custom.analyzedStyles.styles,
      };
    }
  } catch {
    // Database not available (e.g., in tests)
  }

  return TEMPLATES[0];
}
