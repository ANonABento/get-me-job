// Resume template definitions and management
export type { ResumeTemplate, TemplateStyles } from "./template-types";
import type { ResumeTemplate } from "./template-types";
import type { AnalyzedTemplate } from "./template-analyzer";
import { getCustomTemplate } from "@/lib/db/custom-templates";
import { TEMPLATES } from "./template-data";

// Re-export client-safe template data
export { TEMPLATES, getTemplate, generateTemplateCSS } from "./template-data";

// Matches hardcoded values that were in pdf.ts before the extras-aware refactor
export const BUILT_IN_DEFAULT_EXTRAS: Pick<
  AnalyzedTemplate,
  "charsPerLine" | "margins" | "sectionGap"
> = {
  charsPerLine: 90,
  margins: {
    top: "0.5in",
    bottom: "0.5in",
    left: "0.5in",
    right: "0.5in",
  },
  sectionGap: "14px",
};

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

export function getTemplateExtrasWithCustom(
  id: string,
  userId?: string
): Pick<AnalyzedTemplate, "charsPerLine" | "margins" | "sectionGap"> {
  if (TEMPLATES.some((t) => t.id === id)) {
    return BUILT_IN_DEFAULT_EXTRAS;
  }

  try {
    const custom = getCustomTemplate(id, userId || "default");
    if (custom) {
      const { charsPerLine, margins, sectionGap } = custom.analyzedStyles;
      return { charsPerLine, margins, sectionGap };
    }
  } catch {
    // Database not available (e.g., in tests)
  }

  return BUILT_IN_DEFAULT_EXTRAS;
}
