import { z } from "zod";
import type { AnalyzedTemplate } from "@/lib/resume/template-analyzer";
import type { SectionType } from "@/lib/parser/section-detector";
import type { TemplateStyles } from "@/lib/resume/template-types";

export type { TemplateStyles };

export const IMPORTED_TEMPLATE_SCHEMA_VERSION = 1;

const templateStylesSchema = z.object({
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
});

export const importedTemplateSchema = z.object({
  schemaVersion: z.literal(IMPORTED_TEMPLATE_SCHEMA_VERSION),
  styles: templateStylesSchema,
  charsPerLine: z.number().positive(),
  margins: z.object({
    top: z.string(),
    bottom: z.string(),
    left: z.string(),
    right: z.string(),
  }),
  sectionGap: z.string(),
  pageSize: z.string().optional(),
  detectedSections: z
    .array(
      z.object({
        type: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
  source: z
    .object({
      filename: z.string(),
      type: z.enum(["pdf", "docx", "tex"]),
    })
    .optional(),
});

export type ImportedTemplate = AnalyzedTemplate & {
  schemaVersion: typeof IMPORTED_TEMPLATE_SCHEMA_VERSION;
  pageSize?: "letter" | "a4" | string;
  detectedSections?: Array<{
    type: SectionType;
    label: string;
  }>;
  source?: {
    filename: string;
    type: "pdf" | "docx" | "tex";
  };
};

export interface TemplateStyleSignals {
  styles?: Partial<TemplateStyles>;
  margins?: Partial<AnalyzedTemplate["margins"]>;
  pageSize?: string;
}

export function mergeAnalyzedAndSignals(
  analyzed: AnalyzedTemplate,
  signals: TemplateStyleSignals,
  metadata: Pick<ImportedTemplate, "detectedSections" | "source">,
): ImportedTemplate {
  return importedTemplateSchema.parse({
    ...analyzed,
    styles: {
      ...analyzed.styles,
      ...signals.styles,
    },
    margins: {
      ...analyzed.margins,
      ...signals.margins,
    },
    schemaVersion: IMPORTED_TEMPLATE_SCHEMA_VERSION,
    pageSize: signals.pageSize,
    detectedSections: metadata.detectedSections,
    source: metadata.source,
  }) as ImportedTemplate;
}
