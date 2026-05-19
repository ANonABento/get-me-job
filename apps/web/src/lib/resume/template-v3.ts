import { z } from "zod";
import { resumeSlotPathSchema } from "@/lib/resume/template-v2";

export const DOCUMENT_TEMPLATE_V3_SCHEMA_VERSION = 3;

export const boxEdgesSchema = z.object({
  top: z.string(),
  right: z.string(),
  bottom: z.string(),
  left: z.string(),
});

export const templateBoxV3Schema = z.object({
  xPt: z.number().optional(),
  yPt: z.number().optional(),
  widthPt: z.number().optional(),
  heightPt: z.number().optional(),
});

export const fillStyleSchema = z.object({
  color: z.string(),
});

export const borderStyleSchema = z.object({
  widthPt: z.number(),
  color: z.string(),
  style: z.enum(["solid", "dashed", "dotted", "double", "none"]),
});

export const borderSetSchema = z.object({
  top: borderStyleSchema.optional(),
  right: borderStyleSchema.optional(),
  bottom: borderStyleSchema.optional(),
  left: borderStyleSchema.optional(),
  insideH: borderStyleSchema.optional(),
  insideV: borderStyleSchema.optional(),
});

export const typographyTokenV3Schema = z.object({
  fontFamily: z.string(),
  fontSize: z.string(),
  lineHeight: z.string(),
  color: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  textTransform: z.enum(["none", "uppercase"]).optional(),
  letterSpacing: z.string().optional(),
});

export const sourceRefSchema = z.object({
  sourceId: z.string(),
  path: z.string().optional(),
  text: z.string().optional(),
});

export const templateDiagnosticSchema = z.object({
  id: z.string(),
  severity: z.enum(["info", "warning", "error"]),
  message: z.string(),
  sourceRefs: z.array(sourceRefSchema).default([]),
});

export const textAlignmentSchema = z.enum([
  "left",
  "center",
  "right",
  "justified",
]);

export const templateTextBlockSchema = z.object({
  kind: z.literal("text"),
  id: z.string(),
  text: z.string(),
  box: templateBoxV3Schema.optional(),
  token: z.string().optional(),
  href: z.string().optional(),
  style: typographyTokenV3Schema.partial().optional(),
  textAlign: textAlignmentSchema.optional(),
  sourceRef: sourceRefSchema.optional(),
});

export const templateSlotBlockSchema = z.object({
  kind: z.literal("slot"),
  id: z.string(),
  slotId: z.string(),
  slotOccurrence: z.number().int().nonnegative().optional(),
  box: templateBoxV3Schema.optional(),
  token: z.string().optional(),
  style: typographyTokenV3Schema.partial().optional(),
  textAlign: textAlignmentSchema.optional(),
  fallback: z.string().optional(),
  sourceRef: sourceRefSchema.optional(),
});

export const templateListBlockSchema = z.object({
  kind: z.literal("list"),
  id: z.string(),
  slotId: z.string().optional(),
  box: templateBoxV3Schema.optional(),
  items: z.array(z.string()).default([]),
  marker: z.enum(["disc", "decimal", "dash", "none"]).default("disc"),
  style: typographyTokenV3Schema.partial().optional(),
  sourceRef: sourceRefSchema.optional(),
});

export const templateSectionBlockSchema = z.object({
  kind: z.literal("section"),
  id: z.string(),
  title: z.string(),
  box: templateBoxV3Schema.optional(),
  token: z.string().optional(),
  style: typographyTokenV3Schema.partial().optional(),
  sourceRef: sourceRefSchema.optional(),
});

export type TemplateTextBlockV3 = z.infer<typeof templateTextBlockSchema>;
export type TemplateSlotBlockV3 = z.infer<typeof templateSlotBlockSchema>;
export type TemplateListBlockV3 = z.infer<typeof templateListBlockSchema>;
export type TemplateSectionBlockV3 = z.infer<typeof templateSectionBlockSchema>;

export interface TemplateTableColumn {
  widthPt?: number;
  widthPct?: number;
  minWidthPt?: number;
  alignment?: TextAlignment;
}

export interface TemplateTableCell {
  kind: "cell";
  id: string;
  colSpan?: number;
  rowSpan?: number;
  widthPt?: number;
  padding?: BoxEdges;
  borders?: BorderSet;
  fill?: FillStyle;
  verticalAlign?: "top" | "middle" | "bottom";
  textAlign?: TextAlignment;
  nodes: TemplateNodeV3[];
  sourceRef?: SourceRef;
}

export interface TemplateTableRow {
  kind: "row";
  id: string;
  role?: "section-header" | "item-header" | "item-body" | "compact-row";
  heightPt?: number;
  repeatGroupId?: string;
  cells: TemplateTableCell[];
  borders?: BorderSet;
  fill?: FillStyle;
  sourceRef?: SourceRef;
}

export interface TemplateTable {
  kind: "table";
  id: string;
  role?: "outer-frame" | "header" | "section" | "repeat-item" | "metadata";
  box?: TemplateBoxV3;
  alignment?: "left" | "center" | "right";
  columns: TemplateTableColumn[];
  rows: TemplateTableRow[];
  borders?: BorderSet;
  cellDefaults?: CellStyle;
  sourceRef?: SourceRef;
}

export type TemplateNodeV3 =
  | TemplateTable
  | TemplateTableRow
  | TemplateTableCell
  | TemplateTextBlockV3
  | TemplateSlotBlockV3
  | TemplateListBlockV3
  | TemplateSectionBlockV3;

export interface TemplateRegionV3 {
  id: string;
  role: "page-frame" | "header" | "main" | "sidebar" | "footer" | "section";
  flow: "block" | "grid" | "table" | "absolute";
  box?: TemplateBoxV3;
  style?: RegionStyle;
  nodes: TemplateNodeV3[];
}

export interface DocumentTemplateV3 {
  schemaVersion: 3;
  id: string;
  name: string;
  description?: string;
  source?: TemplateSourceRef;
  page: TemplatePage;
  tokens: Record<string, TypographyTokenV3>;
  regions: TemplateRegionV3[];
  slots: TemplateSlotV3[];
  repeatGroups: TemplateRepeatGroup[];
  diagnostics: TemplateDiagnostic[];
}

export interface TemplatePage {
  size: "letter" | "a4" | string;
  widthPt: number;
  heightPt: number;
  margins: BoxEdges;
  background?: FillStyle;
}

export interface TemplateSlotV3 {
  id: string;
  path: ResumeSlotPathV3;
  role: "text" | "richText" | "link" | "list" | "inlineList" | "metadata";
  token?: string;
  sourceRefs: SourceRef[];
  fallback?: string;
}

export interface TemplateRepeatGroup {
  id: string;
  collection:
    | "experiences"
    | "projects"
    | "education"
    | "skills"
    | "certifications"
    | "awards";
  nodeIds: string[];
  emptyBehavior: "hide" | "show-placeholder" | "reserve-space";
  sourceRefs: SourceRef[];
}

export interface TemplateSourceRef {
  filename: string;
  type: "pdf" | "docx" | "tex";
}

export interface RegionStyle {
  padding?: BoxEdges;
  fill?: FillStyle;
}

export interface CellStyle {
  padding?: BoxEdges;
  borders?: BorderSet;
  fill?: FillStyle;
  verticalAlign?: "top" | "middle" | "bottom";
}

export type TemplateBoxV3 = z.infer<typeof templateBoxV3Schema>;
export type BoxEdges = z.infer<typeof boxEdgesSchema>;
export type FillStyle = z.infer<typeof fillStyleSchema>;
export type BorderStyle = z.infer<typeof borderStyleSchema>;
export type BorderSet = z.infer<typeof borderSetSchema>;
export type TypographyTokenV3 = z.infer<typeof typographyTokenV3Schema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type TemplateDiagnostic = z.infer<typeof templateDiagnosticSchema>;
export type TextAlignment = z.infer<typeof textAlignmentSchema>;
export type ResumeSlotPathV3 = z.infer<typeof resumeSlotPathSchema>;

const templateTableColumnSchema: z.ZodType<TemplateTableColumn> = z.object({
  widthPt: z.number().optional(),
  widthPct: z.number().optional(),
  minWidthPt: z.number().optional(),
  alignment: textAlignmentSchema.optional(),
});

const templateNodeV3Schema: z.ZodType<TemplateNodeV3> = z.lazy(() =>
  z.union([
    templateTableSchema,
    templateTableRowSchema,
    templateTableCellSchema,
    templateTextBlockSchema,
    templateSlotBlockSchema,
    templateListBlockSchema,
    templateSectionBlockSchema,
  ]),
);

const templateTableCellSchema: z.ZodType<TemplateTableCell> = z.object({
  kind: z.literal("cell"),
  id: z.string(),
  colSpan: z.number().int().positive().optional(),
  rowSpan: z.number().int().positive().optional(),
  widthPt: z.number().optional(),
  padding: boxEdgesSchema.optional(),
  borders: borderSetSchema.optional(),
  fill: fillStyleSchema.optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  textAlign: textAlignmentSchema.optional(),
  nodes: z.array(templateNodeV3Schema),
  sourceRef: sourceRefSchema.optional(),
});

const templateTableRowSchema: z.ZodType<TemplateTableRow> = z.object({
  kind: z.literal("row"),
  id: z.string(),
  role: z
    .enum(["section-header", "item-header", "item-body", "compact-row"])
    .optional(),
  heightPt: z.number().optional(),
  repeatGroupId: z.string().optional(),
  cells: z.array(templateTableCellSchema),
  borders: borderSetSchema.optional(),
  fill: fillStyleSchema.optional(),
  sourceRef: sourceRefSchema.optional(),
});

const templateTableSchema: z.ZodType<TemplateTable> = z.object({
  kind: z.literal("table"),
  id: z.string(),
  role: z
    .enum(["outer-frame", "header", "section", "repeat-item", "metadata"])
    .optional(),
  box: templateBoxV3Schema.optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  columns: z.array(templateTableColumnSchema),
  rows: z.array(templateTableRowSchema),
  borders: borderSetSchema.optional(),
  cellDefaults: z
    .object({
      padding: boxEdgesSchema.optional(),
      borders: borderSetSchema.optional(),
      fill: fillStyleSchema.optional(),
      verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
    })
    .optional(),
  sourceRef: sourceRefSchema.optional(),
});

const templateRegionV3Schema: z.ZodType<TemplateRegionV3> = z.object({
  id: z.string(),
  role: z.enum([
    "page-frame",
    "header",
    "main",
    "sidebar",
    "footer",
    "section",
  ]),
  flow: z.enum(["block", "grid", "table", "absolute"]),
  box: templateBoxV3Schema.optional(),
  style: z
    .object({
      padding: boxEdgesSchema.optional(),
      fill: fillStyleSchema.optional(),
    })
    .optional(),
  nodes: z.array(templateNodeV3Schema),
});

const templateSlotV3Schema: z.ZodType<TemplateSlotV3> = z.object({
  id: z.string(),
  path: resumeSlotPathSchema,
  role: z.enum(["text", "richText", "link", "list", "inlineList", "metadata"]),
  token: z.string().optional(),
  sourceRefs: z.array(sourceRefSchema),
  fallback: z.string().optional(),
});

const templateRepeatGroupSchema: z.ZodType<TemplateRepeatGroup> = z.object({
  id: z.string(),
  collection: z.enum([
    "experiences",
    "projects",
    "education",
    "skills",
    "certifications",
    "awards",
  ]),
  nodeIds: z.array(z.string()),
  emptyBehavior: z.enum(["hide", "show-placeholder", "reserve-space"]),
  sourceRefs: z.array(sourceRefSchema),
});

export const documentTemplateV3Schema: z.ZodType<DocumentTemplateV3> = z.object(
  {
    schemaVersion: z.literal(DOCUMENT_TEMPLATE_V3_SCHEMA_VERSION),
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    source: z
      .object({
        filename: z.string(),
        type: z.enum(["pdf", "docx", "tex"]),
      })
      .optional(),
    page: z.object({
      size: z.string(),
      widthPt: z.number(),
      heightPt: z.number(),
      margins: boxEdgesSchema,
      background: fillStyleSchema.optional(),
    }),
    tokens: z.record(z.string(), typographyTokenV3Schema),
    regions: z.array(templateRegionV3Schema),
    slots: z.array(templateSlotV3Schema),
    repeatGroups: z.array(templateRepeatGroupSchema),
    diagnostics: z.array(templateDiagnosticSchema).default([]),
  },
);
