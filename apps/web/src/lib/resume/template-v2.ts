import { z } from "zod";
import type { ImportedTemplate } from "@/lib/templates/template-schema";

export const DOCUMENT_TEMPLATE_V2_SCHEMA_VERSION = 2;

export const resumeSlotPathSchema = z.enum([
  "contact.name",
  "contact.email",
  "contact.phone",
  "contact.location",
  "contact.linkedin",
  "contact.github",
  "summary",
  "experiences[].title",
  "experiences[].company",
  "experiences[].dates",
  "experiences[].highlights[]",
  "skills[]",
  "education[].institution",
  "education[].degree",
  "education[].field",
  "education[].date",
  "projects[].name",
  "projects[].description",
  "projects[].highlights[]",
  "certifications[]",
  "awards[]",
]);

export type ResumeSlotPath = z.infer<typeof resumeSlotPathSchema>;

const templateBoxSchema = z.object({
  xPt: z.number().optional(),
  yPt: z.number().optional(),
  widthPt: z.number().optional(),
  heightPt: z.number().optional(),
});

const typographyTokenSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.string(),
  lineHeight: z.string(),
  color: z.string().optional(),
  fontWeight: z.string().optional(),
  textTransform: z.enum(["none", "uppercase"]).optional(),
  letterSpacing: z.string().optional(),
});

const blockStyleSchema = z.object({
  marginBottom: z.string().optional(),
  headingMarginBottom: z.string().optional(),
  divider: z.enum(["line", "space", "none"]).optional(),
  bulletStyle: z.enum(["disc", "dash", "arrow", "none"]).optional(),
});

const templateSlotSchema = z.object({
  id: z.string(),
  path: resumeSlotPathSchema,
  role: z.enum(["text", "list", "link"]),
  label: z.string(),
  token: z.string().optional(),
  box: templateBoxSchema.optional(),
  sourceBlockIds: z.array(z.string()).default([]),
});

const templateBlockSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "heading", "slot", "list", "section", "table"]),
  text: z.string().optional(),
  token: z.string().optional(),
  slotId: z.string().optional(),
  slotPath: resumeSlotPathSchema.optional(),
  repeat: z
    .enum([
      "experiences",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
    ])
    .optional(),
  children: z.array(z.string()).default([]),
  box: templateBoxSchema.optional(),
  style: blockStyleSchema.optional(),
  columns: z.number().int().positive().optional(),
  columnWidthsPt: z.array(z.number()).optional(),
});

const templateRegionSchema = z.object({
  id: z.string(),
  role: z.enum(["header", "main", "sidebar", "footer"]),
  flow: z.enum(["block", "flex", "grid", "table", "absolute"]).default("block"),
  blocks: z.array(templateBlockSchema),
  box: templateBoxSchema.optional(),
  columns: z.number().int().positive().optional(),
});

export const documentTemplateV2Schema = z.object({
  schemaVersion: z.literal(DOCUMENT_TEMPLATE_V2_SCHEMA_VERSION),
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
    size: z.string().default("letter"),
    margins: z.object({
      top: z.string(),
      bottom: z.string(),
      left: z.string(),
      right: z.string(),
    }),
  }),
  tokens: z.record(z.string(), typographyTokenSchema),
  regions: z.array(templateRegionSchema),
  slots: z.array(templateSlotSchema),
  diagnostics: z.array(z.string()).default([]),
});

export type TemplateBox = z.infer<typeof templateBoxSchema>;
export type TemplateBlockStyle = z.infer<typeof blockStyleSchema>;
export type TemplateSlot = z.infer<typeof templateSlotSchema>;
export type TemplateBlock = z.infer<typeof templateBlockSchema>;
export type TemplateRegion = z.infer<typeof templateRegionSchema>;
export type DocumentTemplateV2 = z.infer<typeof documentTemplateV2Schema>;

export function createDocumentTemplateV2FromImportedTemplate(
  id: string,
  name: string,
  imported: ImportedTemplate,
  diagnostics: string[] = [],
): DocumentTemplateV2 {
  const styles = imported.styles;
  const sectionStyle = blockStyle(imported);
  const mainBlocks: TemplateBlock[] = [
    section("summary", "Summary", "slot-summary", sectionStyle),
    repeatedExperienceBlock(sectionStyle),
    repeatedProjectBlock(sectionStyle),
    section("skills", "Skills", "slot-skills", sectionStyle),
    repeatedEducationBlock(sectionStyle),
    section(
      "certifications",
      "Certifications",
      "slot-certifications",
      sectionStyle,
    ),
    section("awards", "Awards", "slot-awards", sectionStyle),
  ];
  const header: TemplateRegion = {
    id: "region-header",
    role: "header",
    flow: "block",
    blocks: [
      { id: "block-name", type: "slot", slotId: "slot-name", children: [] },
      {
        id: "block-contact",
        type: "section",
        children: [
          "slot-email",
          "slot-phone",
          "slot-location",
          "slot-linkedin",
          "slot-github",
        ],
      },
    ],
  };

  return documentTemplateV2Schema.parse({
    schemaVersion: DOCUMENT_TEMPLATE_V2_SCHEMA_VERSION,
    id,
    name,
    description: imported.source
      ? `Migrated from ${imported.source.filename}`
      : "Migrated document template",
    source: imported.source,
    page: {
      size: imported.pageSize ?? "letter",
      margins: imported.margins,
    },
    tokens: {
      name: token(styles.fontFamily, styles.headerSize, styles.lineHeight, {
        color: styles.accentColor,
        fontWeight: "700",
      }),
      heading: token(
        styles.fontFamily,
        styles.sectionHeaderSize,
        styles.lineHeight,
        {
          color: styles.accentColor,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0",
        },
      ),
      body: token(styles.fontFamily, styles.fontSize, styles.lineHeight),
      "body-strong": token(
        styles.fontFamily,
        styles.fontSize,
        styles.lineHeight,
        {
          fontWeight: "700",
        },
      ),
      meta: token(styles.fontFamily, "10pt", styles.lineHeight, {
        color: "#555555",
      }),
    },
    regions:
      styles.layout === "two-column"
        ? [
            header,
            {
              id: "region-sidebar",
              role: "sidebar",
              flow: "block",
              blocks: [
                section("skills", "Skills", "slot-skills", sectionStyle),
                section(
                  "certifications",
                  "Certifications",
                  "slot-certifications",
                  sectionStyle,
                ),
                section("awards", "Awards", "slot-awards", sectionStyle),
              ],
            },
            {
              id: "region-main",
              role: "main",
              flow: "block",
              blocks: mainBlocks.filter(
                (block) =>
                  ![
                    "section-skills",
                    "section-certifications",
                    "section-awards",
                  ].includes(block.id),
              ),
            },
          ]
        : [
            header,
            {
              id: "region-main",
              role: "main",
              flow: "block",
              blocks: mainBlocks,
            },
          ],
    slots: [
      slot("slot-name", "contact.name", "text", "Name", "name"),
      slot("slot-email", "contact.email", "link", "Email", "meta"),
      slot("slot-phone", "contact.phone", "text", "Phone", "meta"),
      slot("slot-location", "contact.location", "text", "Location", "meta"),
      slot("slot-linkedin", "contact.linkedin", "link", "LinkedIn", "meta"),
      slot("slot-github", "contact.github", "link", "GitHub", "meta"),
      slot("slot-summary", "summary", "text", "Summary", "body"),
      slot(
        "slot-experience-title",
        "experiences[].title",
        "text",
        "Experience title",
        "body-strong",
      ),
      slot(
        "slot-experience-company",
        "experiences[].company",
        "text",
        "Experience company",
        "body",
      ),
      slot(
        "slot-experience-dates",
        "experiences[].dates",
        "text",
        "Experience dates",
        "meta",
      ),
      slot(
        "slot-experience-highlights",
        "experiences[].highlights[]",
        "list",
        "Experience bullets",
        "body",
      ),
      slot("slot-skills", "skills[]", "list", "Skills", "body"),
      slot(
        "slot-education-institution",
        "education[].institution",
        "text",
        "Education institution",
        "body",
      ),
      slot(
        "slot-education-degree",
        "education[].degree",
        "text",
        "Education degree",
        "body-strong",
      ),
      slot(
        "slot-education-field",
        "education[].field",
        "text",
        "Education field",
        "body",
      ),
      slot(
        "slot-education-date",
        "education[].date",
        "text",
        "Education date",
        "meta",
      ),
      slot(
        "slot-project-name",
        "projects[].name",
        "text",
        "Project name",
        "body-strong",
      ),
      slot(
        "slot-project-description",
        "projects[].description",
        "text",
        "Project description",
        "body",
      ),
      slot(
        "slot-project-highlights",
        "projects[].highlights[]",
        "list",
        "Project bullets",
        "body",
      ),
      slot(
        "slot-certifications",
        "certifications[]",
        "list",
        "Certifications",
        "body",
      ),
      slot("slot-awards", "awards[]", "list", "Awards", "body"),
    ],
    diagnostics,
  });
}

function token(
  fontFamily: string,
  fontSize: string,
  lineHeight: string,
  extra: Record<string, string> = {},
) {
  return { fontFamily, fontSize, lineHeight, ...extra };
}

function slot(
  id: string,
  path: ResumeSlotPath,
  role: TemplateSlot["role"],
  label: string,
  tokenName: string,
): TemplateSlot {
  return { id, path, role, label, token: tokenName, sourceBlockIds: [] };
}

function blockStyle(imported: ImportedTemplate): TemplateBlockStyle {
  return {
    marginBottom: imported.sectionGap,
    headingMarginBottom: "6px",
    divider: imported.styles.sectionDivider,
    bulletStyle: imported.styles.bulletStyle,
  };
}

function section(
  id: string,
  label: string,
  slotId: string,
  style: TemplateBlockStyle,
): TemplateBlock {
  return {
    id: `section-${id}`,
    type: "section",
    text: label,
    token: "heading",
    children: [slotId],
    style,
  };
}

function repeatedExperienceBlock(style: TemplateBlockStyle): TemplateBlock {
  return {
    id: "section-experience",
    type: "section",
    text: "Experience",
    token: "heading",
    repeat: "experiences",
    children: [
      "slot-experience-title",
      "slot-experience-company",
      "slot-experience-dates",
      "slot-experience-highlights",
    ],
    style,
  };
}

function repeatedProjectBlock(style: TemplateBlockStyle): TemplateBlock {
  return {
    id: "section-projects",
    type: "section",
    text: "Projects",
    token: "heading",
    repeat: "projects",
    children: [
      "slot-project-name",
      "slot-project-description",
      "slot-project-highlights",
    ],
    style,
  };
}

function repeatedEducationBlock(style: TemplateBlockStyle): TemplateBlock {
  return {
    id: "section-education",
    type: "section",
    text: "Education",
    token: "heading",
    repeat: "education",
    children: [
      "slot-education-degree",
      "slot-education-field",
      "slot-education-institution",
      "slot-education-date",
    ],
    style,
  };
}
