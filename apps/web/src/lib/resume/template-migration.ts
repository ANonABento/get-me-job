import { inflateRawSync } from "zlib";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";
import type { LLMClient } from "@/lib/llm/client";
import type { TailoredResume } from "@/lib/resume/generator";
import {
  createDocumentTemplateV2FromImportedTemplate,
  type DocumentTemplateV2,
  type TemplateRegion,
  type ResumeSlotPath,
} from "@/lib/resume/template-v2";
import {
  extractTemplateFromFile,
  getTemplateSourceType,
  type TemplateSourceType,
} from "@/lib/templates/import";
import {
  assessTemplateMigrationFidelity,
  type TemplateMigrationFidelityReport,
} from "@/lib/resume/template-migration-fidelity";

export interface SourceDocumentIR {
  sourceType: TemplateSourceType;
  filename: string;
  pages: SourcePage[];
  blocks: SourceBlock[];
  rawText: string;
  diagnostics: string[];
}

export interface SourcePage {
  id: string;
  number: number;
  widthPt?: number;
  heightPt?: number;
}

export interface SourceBlock {
  id: string;
  pageId: string;
  type: "paragraph" | "heading" | "list-item" | "table-row" | "link";
  text: string;
  slotHint?: ResumeSlotPath;
  bbox?: {
    xPt: number;
    yPt: number;
    widthPt: number;
    heightPt: number;
  };
  style?: {
    fontFamily?: string;
    fontSizePt?: number;
    bold?: boolean;
    color?: string;
    alignment?: "left" | "center" | "right" | "justified";
    styleId?: string;
  };
  cells?: string[];
  cellMetadata?: Array<{
    text: string;
    widthPt?: number;
    gridSpan?: number;
    alignment?: "left" | "center" | "right" | "justified";
  }>;
  href?: string;
}

export interface TemplateMigrationDraft {
  id: string;
  userId: string;
  status: "reviewing" | "committed";
  sourceFilename: string;
  sourceType: TemplateSourceType;
  source: SourceDocumentIR;
  resume: TailoredResume;
  template: DocumentTemplateV2;
  fidelity: TemplateMigrationFidelityReport;
  warnings: string[];
  confidence: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
  committedTemplateId?: string | null;
}

export interface CreateTemplateMigrationDraftOptions {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  userId: string;
  llmClient?: LLMClient | null;
  now?: string;
}

const SECTION_NAMES = new Set([
  "summary",
  "professional summary",
  "profile",
  "experience",
  "work experience",
  "professional experience",
  "work history",
  "skills",
  "technical skills",
  "education",
  "projects",
  "academic projects",
  "certifications",
  "awards",
]);

export async function createTemplateMigrationDraft({
  buffer,
  filename,
  mimeType,
  userId,
  llmClient = null,
  now = nowIso(),
}: CreateTemplateMigrationDraftOptions): Promise<TemplateMigrationDraft> {
  const sourceType = getTemplateSourceType(filename, mimeType);
  if (!sourceType) throw new Error("Unsupported template source type");

  const [source, extracted] = await Promise.all([
    extractSourceDocumentIR(buffer, filename, sourceType),
    extractTemplateFromFile({ buffer, filename, mimeType, llmClient }),
  ]);
  applySemanticSlotHints(source);
  const resume = mapSourceIRToResume(source);
  const template = createDocumentTemplateV2FromImportedTemplate(
    generateId(),
    filename.replace(/\.[^.]+$/, "").slice(0, 100) || "Migrated template",
    extracted.template,
    source.diagnostics,
  );
  applySourceStyleHints(template, source);
  applySlotSourceHints(template, source.blocks);
  applyLayoutHints(template, source);
  const fidelity = assessTemplateMigrationFidelity(source, template);

  return {
    id: generateId(),
    userId,
    status: "reviewing",
    sourceFilename: filename,
    sourceType,
    source,
    resume,
    template,
    fidelity,
    warnings: [...extracted.warnings, ...source.diagnostics],
    confidence: extracted.confidence,
    createdAt: now,
    updatedAt: now,
    committedTemplateId: null,
  };
}

export async function extractSourceDocumentIR(
  buffer: Buffer,
  filename: string,
  sourceType: TemplateSourceType,
): Promise<SourceDocumentIR> {
  if (sourceType === "docx") return extractDocxIR(buffer, filename);
  if (sourceType === "tex")
    return extractLatexIR(buffer.toString("utf8"), filename);
  return extractPdfIR(buffer, filename);
}

export function mapSourceIRToResume(source: SourceDocumentIR): TailoredResume {
  const lines = source.blocks
    .filter((block) => block.text.trim())
    .map((block) =>
      block.type === "list-item" ? `- ${block.text.trim()}` : block.text.trim(),
    );
  const sections = groupLinesBySection(lines);
  const contactLines = lines.slice(0, 5).join(" ");
  const firstLine = lines[0] ?? "";
  return {
    contact: {
      name: firstLine && !firstLine.includes("@") ? firstLine : "",
      email:
        contactLines.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "",
      phone:
        contactLines.match(
          /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
        )?.[0] ?? "",
      location: "",
      linkedin:
        contactLines.match(
          /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i,
        )?.[0] ?? "",
      github:
        contactLines.match(
          /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+/i,
        )?.[0] ?? "",
    },
    summary: firstSectionText(sections, ["summary", "profile"]),
    experiences: parseExperienceLines(
      firstSectionLines(sections, [
        "experience",
        "work experience",
        "professional experience",
      ]),
    ),
    skills: parseSkills(
      firstSectionLines(sections, ["skills", "technical skills"]),
    ),
    education: parseEducation(firstSectionLines(sections, ["education"])),
    projects: parseProjects(firstSectionLines(sections, ["projects"])),
    certifications: parsePlainList(
      firstSectionLines(sections, ["certifications"]),
    ),
    awards: parsePlainList(firstSectionLines(sections, ["awards"])),
  };
}

async function extractPdfIR(
  buffer: Buffer,
  filename: string,
): Promise<SourceDocumentIR> {
  const positioned = await extractPositionedPdfIR(buffer, filename).catch(
    () => null,
  );
  if (positioned?.blocks.length) return positioned;
  const raw = buffer.toString("latin1");
  return buildLineIR(
    "pdf",
    filename,
    raw.replace(/[^\x20-\x7E\n]+/g, " ").slice(0, 6000),
    [
      "PDF text extraction fell back to raw readable strings; review mapping carefully.",
    ],
    pdfPage(raw),
  );
}

async function extractPositionedPdfIR(
  buffer: Buffer,
  filename: string,
): Promise<SourceDocumentIR> {
  const { extractPdfPositions } = await import("@/lib/parse/pdf-positions");
  const positioned = await extractPdfPositions(buffer, { includeJunk: true });
  const pages: SourcePage[] = positioned.pageDimensions.map((page) => ({
    id: `page-${page.page}`,
    number: page.page,
    widthPt: page.width,
    heightPt: page.height,
  }));
  const blocks: SourceBlock[] = [];
  for (const page of pages) {
    const items = positioned.items.filter((item) => item.page === page.number);
    const lines = groupPositionedItems(items);
    for (const line of lines) {
      for (const segment of splitPositionedLine(line.items)) {
        const text = normalizePositionedText(joinPositionedText(segment));
        if (!text) continue;
        const bbox = bboxFor(segment);
        blocks.push({
          id: `block-${blocks.length + 1}`,
          pageId: page.id,
          type: isHeadingText(text) ? "heading" : "paragraph",
          text,
          slotHint: inferSlotHint(text),
          bbox,
          style: { fontSizePt: Math.round(bbox.heightPt * 10) / 10 },
        });
      }
    }
  }
  await repairGlyphDamagedPdfText(buffer, blocks);
  return {
    sourceType: "pdf",
    filename,
    pages: pages.length ? pages : [pdfPage(buffer.toString("latin1"))],
    blocks,
    rawText: blocks.map((block) => block.text).join("\n"),
    diagnostics: [
      "PDF text positions were used to infer line spacing, margins, and column layout.",
    ],
  };
}

async function repairGlyphDamagedPdfText(
  buffer: Buffer,
  blocks: SourceBlock[],
): Promise<void> {
  const parsedLines = await extractPdfParseLines(buffer);
  if (
    parsedLines.length < blocks.length * 0.8 ||
    parsedLines.length > blocks.length * 1.25
  ) {
    return;
  }

  for (const [index, block] of blocks.entries()) {
    const text = parsedLines[index];
    if (!text) continue;
    block.text = text;
    block.type = isHeadingText(text) ? "heading" : block.type;
    block.slotHint = inferSlotHint(text);
  }
}

async function extractPdfParseLines(buffer: Buffer): Promise<string[]> {
  try {
    const pdf = (await import("pdf-parse")).default;
    const data = await pdf(buffer);
    const lines = cleanPdfText(data.text);
    if (lines.length) return lines;
  } catch {
    // Fall through to embedded literal-string extraction.
  }
  return extractEmbeddedPdfLines(buffer);
}

function cleanPdfText(text: string): string[] {
  return text
    .replace(/þÿ/g, "")
    .replace(/\u0000/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractEmbeddedPdfLines(buffer: Buffer): string[] {
  const raw = buffer.toString("latin1");
  const values: string[] = [];
  const literalPattern = /\((?:\\.|[^\\)])*\)/g;
  const textRunPattern = /(\((?:\\.|[^\\)])*\)\s*Tj)/g;
  const textArrayPattern = /\[([\s\S]*?)\]\s*TJ/g;
  let match: RegExpExecArray | null;
  while ((match = textRunPattern.exec(raw)) !== null) {
    const literal = match[0].match(literalPattern)?.[0];
    if (literal) values.push(decodePdfLiteral(literal.slice(1, -1)));
  }
  while ((match = textArrayPattern.exec(raw)) !== null) {
    for (const literal of match[1].match(literalPattern) ?? []) {
      values.push(decodePdfLiteral(literal.slice(1, -1)));
    }
  }
  return cleanPdfText(values.join("\n"));
}

function decodePdfLiteral(value: string): string {
  const decoded = value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([0-7]{1,3})/g, (_match, octal: string) =>
      String.fromCharCode(parseInt(octal, 8)),
    );
  const bytes = Buffer.from(
    Array.from(decoded, (char) => char.charCodeAt(0) & 0xff),
  );
  const hasUtf16Bom = bytes[0] === 0xfe && bytes[1] === 0xff;
  const nullByteCount = bytes.filter((byte) => byte === 0).length;
  if (!hasUtf16Bom && nullByteCount <= bytes.length / 4) {
    return decoded.replace(/\0/g, "");
  }
  const chars: string[] = [];
  const start = hasUtf16Bom ? 2 : 0;
  for (let i = start; i + 1 < bytes.length; i += 2) {
    const code = (bytes[i] << 8) | bytes[i + 1];
    if (code > 0) chars.push(String.fromCharCode(code));
  }
  return chars.join("");
}

function extractDocxIR(buffer: Buffer, filename: string): SourceDocumentIR {
  const entries = readZipTextEntries(buffer);
  const xml = entries["word/document.xml"] ?? "";
  const styles = parseDocxStyles(entries["word/styles.xml"] ?? "");
  const page = docxPage(xml);
  const blocks: SourceBlock[] = [];
  let blockIndex = 0;
  for (const child of xml.matchAll(/<w:(p|tbl)\b[\s\S]*?<\/w:\1>/g)) {
    const tagName = child[1];
    const childXml = child[0];
    if (tagName === "tbl") {
      const gridWidths = Array.from(
        childXml.matchAll(/<w:gridCol\b[^>]*w:w="([0-9.]+)"/g),
      ).map((match) => Number(match[1]) / 20);
      for (const row of childXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)) {
        let gridIndex = 0;
        const cellMetadata = Array.from(
          row[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g),
        )
          .map((cell) => {
            const metadata = docxCellMetadata(cell[0]);
            const span = Math.max(1, metadata.gridSpan ?? 1);
            const gridWidth = gridWidths
              .slice(gridIndex, gridIndex + span)
              .reduce((sum, value) => sum + value, 0);
            const width = metadata.widthPt ?? (gridWidth || undefined);
            gridIndex += span;
            return { ...metadata, widthPt: width };
          })
          .filter((cell) => cell.text);
        if (cellMetadata.length > 1) {
          blocks.push({
            id: `block-${++blockIndex}`,
            pageId: "page-1",
            type: "table-row",
            text: cellMetadata.map((cell) => cell.text).join(" | "),
            cells: cellMetadata.map((cell) => cell.text),
            cellMetadata,
          });
        }
      }
      continue;
    }

    const text = xmlText(childXml);
    if (!text) continue;
    const styleId = childXml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1];
    const style = mergeDocxStyle(
      styles[styleId ?? ""],
      docxParagraphStyle(childXml),
      {
        styleId,
      },
    );
    blocks.push({
      id: `block-${++blockIndex}`,
      pageId: "page-1",
      type:
        isHeadingText(text) || /heading|title/i.test(styleId ?? "")
          ? "heading"
          : /<w:numPr\b|<w:numId\b/.test(childXml)
            ? "list-item"
            : "paragraph",
      text,
      slotHint: inferSlotHint(text),
      style,
    });
  }
  return {
    sourceType: "docx",
    filename,
    pages: [page],
    blocks,
    rawText: blocks.map((block) => block.text).join("\n"),
    diagnostics: blocks.some((block) => block.type === "table-row")
      ? ["DOCX table geometry was used to infer grid-style template sections."]
      : [],
  };
}

export function applySourceStyleHints(
  template: DocumentTemplateV2,
  source: SourceDocumentIR,
): void {
  const bodyStyle = firstStyle(
    source.blocks.filter(
      (block) => block.type === "paragraph" || block.type === "list-item",
    ),
  );
  const headingStyle = firstStyle(
    source.blocks.filter((block) => block.type === "heading"),
  );
  const nameStyle = source.blocks[0]?.style;

  applyTokenStyle(template.tokens.body, bodyStyle);
  applyTokenStyle(template.tokens["body-strong"], bodyStyle);
  applyTokenStyle(template.tokens.heading, headingStyle);
  applyTokenStyle(template.tokens.name, nameStyle ?? headingStyle);

  if (headingStyle?.bold !== undefined) {
    template.tokens.heading.fontWeight = headingStyle.bold ? "700" : "400";
  }
  if (nameStyle?.bold !== undefined) {
    template.tokens.name.fontWeight = nameStyle.bold ? "700" : "400";
  }
}

function extractLatexIR(source: string, filename: string): SourceDocumentIR {
  const clean = source.replace(/%.*$/gm, "");
  const expanded = expandLatexCustomMacros(clean)
    .replace(
      /\\resumeSubheading\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/g,
      "\n$3 | $1 | $2 | $4\n",
    )
    .replace(/\\resumeProjectHeading\{([^}]*)\}\{([^}]*)\}/g, "\n$1 | $2\n")
    .replace(/\\resume(?:Sub)?Item\{([^}]*)\}/g, "\n- $1\n")
    .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, "$2 <$1>")
    .replace(/\\url\{([^}]+)\}/g, "$1")
    .replace(
      /\\begin\{tabular\}\{[^}]*}([\s\S]*?)\\end\{tabular}/g,
      (_match, body: string) =>
        body
          .split(/\\\\/)
          .map((row) => row.replace(/\\hline|\\cline\{[^}]+}/g, "").trim())
          .filter(Boolean)
          .map(
            (row) =>
              `\n__TABLE_ROW__ ${row
                .split("&")
                .map((cell) => cell.trim())
                .join(" | ")}\n`,
          )
          .join(""),
    )
    .replace(/\\(section|subsection|subsubsection)\*?\{([^}]*)\}/g, "\n$2\n")
    .replace(/\\item(?:\[[^\]]+])?\s*/g, "\n- ")
    .replace(/\\\\/g, "\n")
    .replace(/&/g, " | ")
    .replace(/\\(?:textbf|textit|emph|underline)\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*])?(?:\{[^}]*\})?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  return buildLineIR(
    "tex",
    filename,
    expanded.trim(),
    [
      /\\newcommand|\\def/.test(clean) ? "latex_custom_macros_expanded" : "",
      "latex_style_hints_inferred",
    ].filter(Boolean),
    latexPage(clean),
  );
}

function buildLineIR(
  sourceType: TemplateSourceType,
  filename: string,
  text: string,
  diagnostics: string[],
  page: SourcePage,
): SourceDocumentIR {
  const blocks = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map<SourceBlock>((line, index) => {
      if (line.startsWith("__TABLE_ROW__")) {
        const cells = line.replace(/^__TABLE_ROW__\s*/, "").split(/\s+\|\s+/);
        return {
          id: `block-${index + 1}`,
          pageId: page.id,
          type: "table-row",
          text: cells.join(" | "),
          cells,
          cellMetadata: cells.map((cell) => ({ text: cell })),
        };
      }
      return {
        id: `block-${index + 1}`,
        pageId: page.id,
        type: line.startsWith("- ")
          ? "list-item"
          : isHeadingText(line)
            ? "heading"
            : "paragraph",
        text: line.replace(/^-\s+/, ""),
        slotHint: inferSlotHint(line),
      };
    });
  return {
    sourceType,
    filename,
    pages: [page],
    blocks,
    rawText: text,
    diagnostics,
  };
}

function applySlotSourceHints(
  template: DocumentTemplateV2,
  blocks: SourceBlock[],
): void {
  for (const slot of template.slots) {
    const matchingBlocks = blocks.filter(
      (block) => block.slotHint === slot.path,
    );
    const ids = matchingBlocks.map((block) => block.id);
    if (ids.length) {
      slot.sourceBlockIds = ids;
      const boxes = matchingBlocks
        .map((block) => block.bbox)
        .filter((box): box is NonNullable<SourceBlock["bbox"]> => Boolean(box));
      if (boxes.length) slot.box = unionBox(boxes);
    }
  }
}

function applySemanticSlotHints(source: SourceDocumentIR): void {
  let section = "";
  let experienceEntryStarted = false;
  let educationEntryStarted = false;
  let projectEntryStarted = false;

  for (const [index, block] of source.blocks.entries()) {
    const normalized = normalizeSectionName(block.text);
    if (SECTION_NAMES.has(normalized)) {
      section = normalized;
      experienceEntryStarted = false;
      educationEntryStarted = false;
      projectEntryStarted = false;
      continue;
    }

    const inferred = inferSlotHint(block.text);
    if (inferred) {
      block.slotHint = inferred;
      continue;
    }

    if (!section && index <= 4) {
      block.slotHint = inferContactSlotHint(block.text, index);
      continue;
    }

    if (
      section === "summary" ||
      section === "professional summary" ||
      section === "profile"
    ) {
      block.slotHint = "summary";
      continue;
    }

    if (section === "skills" || section === "technical skills") {
      block.slotHint = "skills[]";
      continue;
    }

    if (section === "certifications") {
      block.slotHint = "certifications[]";
      continue;
    }

    if (section === "awards") {
      block.slotHint = "awards[]";
      continue;
    }

    if (
      section === "experience" ||
      section === "work experience" ||
      section === "professional experience" ||
      section === "work history"
    ) {
      if (block.type === "list-item") {
        block.slotHint = "experiences[].highlights[]";
      } else if (
        !experienceEntryStarted ||
        looksLikeExperienceHeader(block.text)
      ) {
        block.slotHint = "experiences[].title";
        experienceEntryStarted = true;
      } else if (hasDateRange(block.text)) {
        block.slotHint = "experiences[].dates";
      } else {
        block.slotHint = "experiences[].company";
      }
      continue;
    }

    if (section === "education") {
      if (!educationEntryStarted) {
        block.slotHint = "education[].institution";
        educationEntryStarted = true;
      } else if (hasDateRange(block.text)) {
        block.slotHint = "education[].date";
      } else if (
        /\b(B\.?S\.?|M\.?S\.?|BA|MA|PhD|Bachelor|Master|Doctor|Degree)\b/i.test(
          block.text,
        )
      ) {
        block.slotHint = "education[].degree";
      } else {
        block.slotHint = "education[].field";
      }
      continue;
    }

    if (section === "projects" || section === "academic projects") {
      if (block.type === "list-item") {
        block.slotHint = "projects[].highlights[]";
      } else if (!projectEntryStarted) {
        block.slotHint = "projects[].name";
        projectEntryStarted = true;
      } else {
        block.slotHint = "projects[].description";
      }
    }
  }
}

export function applyLayoutHints(
  template: DocumentTemplateV2,
  source: SourceDocumentIR,
): void {
  const tableRows = source.blocks.filter(
    (block) => block.type === "table-row" && block.cellMetadata?.length,
  );
  if (tableRows.length) {
    const columns = Math.max(
      ...tableRows.map((row) =>
        row.cellMetadata!.reduce((sum, cell) => sum + (cell.gridSpan ?? 1), 0),
      ),
    );
    const skills = findBlock(template, "section-skills");
    if (skills) {
      skills.columns = columns;
      const widths = inferTableColumnWidths(tableRows);
      if (widths.length) skills.columnWidthsPt = widths;
    }
    template.diagnostics.push("source_table_geometry_inferred");
  }
  const page = source.pages[0];
  const boxes = source.blocks
    .map((block) => block.bbox)
    .filter((box): box is NonNullable<SourceBlock["bbox"]> => Boolean(box));
  if (!page?.widthPt || !page.heightPt || !boxes.length) return;
  const minX = Math.min(...boxes.map((box) => box.xPt));
  const minY = Math.min(...boxes.map((box) => box.yPt));
  const maxX = Math.max(...boxes.map((box) => box.xPt + box.widthPt));
  const maxY = Math.max(...boxes.map((box) => box.yPt + box.heightPt));
  template.page.margins = {
    top: ptToIn(minY),
    right: ptToIn(page.widthPt - maxX),
    bottom: ptToIn(page.heightPt - maxY),
    left: ptToIn(minX),
  };
  applyColumnGeometryHints(template, boxes, page.widthPt);
}

function findBlock(template: DocumentTemplateV2, id: string) {
  return template.regions
    .flatMap((region) => region.blocks)
    .find((block) => block.id === id);
}

function inferTableColumnWidths(tableRows: SourceBlock[]): number[] {
  const columnTotals: number[] = [];
  const columnCounts: number[] = [];
  for (const row of tableRows) {
    let columnIndex = 0;
    for (const cell of row.cellMetadata ?? []) {
      const span = Math.max(1, cell.gridSpan ?? 1);
      const width = cell.widthPt;
      if (width && Number.isFinite(width)) {
        const perColumn = width / span;
        for (let i = 0; i < span; i += 1) {
          columnTotals[columnIndex + i] =
            (columnTotals[columnIndex + i] ?? 0) + perColumn;
          columnCounts[columnIndex + i] =
            (columnCounts[columnIndex + i] ?? 0) + 1;
        }
      }
      columnIndex += span;
    }
  }
  return columnTotals
    .map((total, index) =>
      columnCounts[index]
        ? Math.round((total / columnCounts[index]) * 100) / 100
        : 0,
    )
    .filter((width) => width > 0);
}

function applyColumnGeometryHints(
  template: DocumentTemplateV2,
  boxes: Array<NonNullable<SourceBlock["bbox"]>>,
  pageWidthPt: number,
): void {
  if (template.regions.some((region) => region.role === "sidebar")) return;
  const usableBoxes = boxes.filter(
    (box) => box.widthPt > 12 && box.heightPt > 4,
  );
  if (usableBoxes.length < 8) return;

  const centers = usableBoxes
    .map((box) => box.xPt + box.widthPt / 2)
    .sort((a, b) => a - b);
  let largestGap = 0;
  let split = 0;
  for (let i = 1; i < centers.length; i += 1) {
    const gap = centers[i] - centers[i - 1];
    if (gap > largestGap) {
      largestGap = gap;
      split = (centers[i] + centers[i - 1]) / 2;
    }
  }

  const leftCount = usableBoxes.filter(
    (box) => box.xPt + box.widthPt / 2 < split,
  ).length;
  const rightCount = usableBoxes.length - leftCount;
  const splitIsPlausible =
    largestGap > pageWidthPt * 0.08 &&
    split > pageWidthPt * 0.2 &&
    split < pageWidthPt * 0.55 &&
    leftCount >= 3 &&
    rightCount >= 3;
  if (!splitIsPlausible) return;

  const header = template.regions.find((region) => region.role === "header");
  const mainBlocks = template.regions
    .filter((region) => region.role !== "header")
    .flatMap((region) => region.blocks);
  const sidebarBlockIds = new Set([
    "section-skills",
    "section-certifications",
    "section-awards",
  ]);
  const sidebarBlocks = mainBlocks.filter((block) =>
    sidebarBlockIds.has(block.id),
  );
  const remainingBlocks = mainBlocks.filter(
    (block) => !sidebarBlockIds.has(block.id),
  );
  if (!sidebarBlocks.length || !remainingBlocks.length) return;

  const regions: TemplateRegion[] = [];
  if (header) regions.push(header);
  regions.push({
    id: "region-sidebar",
    role: "sidebar",
    flow: "block",
    box: { widthPt: Math.round(split) },
    blocks: sidebarBlocks,
  });
  regions.push({
    id: "region-main",
    role: "main",
    flow: "block",
    blocks: remainingBlocks,
  });
  template.regions = regions;
  template.diagnostics.push("source_column_geometry_inferred");
}

function groupLinesBySection(lines: string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current = "";
  for (const line of lines) {
    const normalized = normalizeSectionName(line);
    if (SECTION_NAMES.has(normalized)) {
      current = normalized;
      sections.set(current, []);
    } else if (current) {
      sections.get(current)?.push(line);
    }
  }
  return sections;
}

function firstSectionLines(sections: Map<string, string[]>, names: string[]) {
  for (const name of names) {
    const lines = sections.get(name);
    if (lines?.length) return lines;
  }
  return [];
}

function firstSectionText(sections: Map<string, string[]>, names: string[]) {
  return firstSectionLines(sections, names).join(" ").trim();
}

function parseExperienceLines(lines: string[]): TailoredResume["experiences"] {
  const result: TailoredResume["experiences"] = [];
  let current: TailoredResume["experiences"][number] | null = null;
  for (const line of lines) {
    const isBullet = /^(?:-|\u2022)/.test(line) || line.length > 80;
    if (
      !isBullet &&
      /(\d{4}|present|engineer|manager|developer|intern)/i.test(line)
    ) {
      if (current) result.push(current);
      const parts = line.split(/\s+\|\s+|\s+-\s+/).map((part) => part.trim());
      current = {
        title: parts[0] ?? "",
        company: parts[1] ?? "",
        dates: parts.slice(2).join(" - "),
        highlights: [],
      };
    } else if (current) {
      current.highlights.push(line.replace(/^(?:-|\u2022)\s*/, ""));
    }
  }
  if (current) result.push(current);
  return result;
}

function parseSkills(lines: string[]) {
  return lines
    .flatMap((line) => line.split(/[,;|]/))
    .map((skill) => skill.replace(/^(?:-|\u2022)\s*/, "").trim())
    .filter(Boolean);
}

function parseEducation(lines: string[]): TailoredResume["education"] {
  return lines.filter(Boolean).map((line) => {
    const parts = line.split(/\s+\|\s+|\s+-\s+/).map((part) => part.trim());
    return {
      institution: parts[0] ?? "",
      degree: parts[1] ?? "",
      field: parts[2] ?? "",
      date: parts[3] ?? "",
    };
  });
}

function parseProjects(
  lines: string[],
): NonNullable<TailoredResume["projects"]> {
  const projects: NonNullable<TailoredResume["projects"]> = [];
  let current: NonNullable<TailoredResume["projects"]>[number] | null = null;
  for (const line of lines) {
    const isBullet = /^(?:-|\u2022)/.test(line) || line.length > 100;
    if (!isBullet) {
      if (current) projects.push(current);
      const parts = line.split(/\s+\|\s+|\s+-\s+/).map((part) => part.trim());
      current = {
        name: parts[0] ?? "",
        description: parts.slice(1).join(" - "),
        highlights: [],
      };
    } else if (current) {
      current.highlights.push(line.replace(/^(?:-|\u2022)\s*/, ""));
    }
  }
  if (current) projects.push(current);
  return projects;
}

function parsePlainList(lines: string[]) {
  return lines
    .flatMap((line) => line.split(/\n|[,;](?=\s*[A-Z0-9])/))
    .map((item) => item.replace(/^(?:-|\u2022)\s*/, "").trim())
    .filter(Boolean);
}

function inferSlotHint(line: string): ResumeSlotPath | undefined {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line))
    return "contact.email";
  if (/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(line))
    return "contact.phone";
  if (/linkedin\.com/i.test(line)) return "contact.linkedin";
  if (/github\.com/i.test(line)) return "contact.github";
  if (/skills?/i.test(line)) return "skills[]";
  return undefined;
}

function inferContactSlotHint(
  line: string,
  index: number,
): ResumeSlotPath | undefined {
  const inferred = inferSlotHint(line);
  if (inferred) return inferred;
  if (index === 0 && !line.includes("@")) return "contact.name";
  if (/[A-Za-z]+,\s*[A-Z]{2}\b|remote|hybrid|onsite/i.test(line)) {
    return "contact.location";
  }
  return undefined;
}

function looksLikeExperienceHeader(line: string): boolean {
  return /\b(engineer|developer|designer|manager|director|analyst|consultant|intern|lead|architect)\b/i.test(
    line,
  );
}

function hasDateRange(line: string): boolean {
  return /(?:19|20)\d{2}|present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(
    line,
  );
}

function isHeadingText(text: string): boolean {
  const normalized = normalizeSectionName(text);
  return SECTION_NAMES.has(normalized) || /^[A-Z][A-Z\s/&-]{2,}$/.test(text);
}

function normalizeSectionName(text: string) {
  return text
    .replace(/^(?:-|\u2022)\s*/, "")
    .replace(/[:|]+$/g, "")
    .trim()
    .toLowerCase();
}

function pdfPage(raw: string): SourcePage {
  const mediaBox = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)/);
  return {
    id: "page-1",
    number: 1,
    widthPt: mediaBox ? Number(mediaBox[1]) : 612,
    heightPt: mediaBox ? Number(mediaBox[2]) : 792,
  };
}

function docxPage(xml: string): SourcePage {
  const tag = xml.match(/<w:pgSz\b[^>]*>/)?.[0] ?? "";
  const width = readNumberAttribute(tag, "w");
  const height = readNumberAttribute(tag, "h");
  return {
    id: "page-1",
    number: 1,
    widthPt: width ? width / 20 : 612,
    heightPt: height ? height / 20 : 792,
  };
}

function latexPage(source: string): SourcePage {
  const a4 = /\ba4paper\b/i.test(source);
  return {
    id: "page-1",
    number: 1,
    widthPt: a4 ? 595 : 612,
    heightPt: a4 ? 842 : 792,
  };
}

function xmlText(xml: string) {
  return xml
    .replace(/<w:tab\/>/g, " | ")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function docxCellMetadata(xml: string) {
  const widthTwips = readNumberAttribute(
    xml.match(/<w:tcW\b[^>]*>/)?.[0] ?? "",
    "w",
  );
  const gridSpan = readNumberAttribute(
    xml.match(/<w:gridSpan\b[^>]*>/)?.[0] ?? "",
    "val",
  );
  const alignment = docxAlignment(xml);
  return {
    text: xmlText(xml),
    widthPt: widthTwips ? widthTwips / 20 : undefined,
    gridSpan: gridSpan && gridSpan > 1 ? gridSpan : undefined,
    alignment,
  };
}

function readNumberAttribute(tag: string, name: string): number | undefined {
  const match = tag.match(new RegExp(`w:${name}="([0-9.]+)"`));
  return match ? Number(match[1]) : undefined;
}

function parseDocxStyles(
  xml: string,
): Record<string, NonNullable<SourceBlock["style"]>> {
  const styles: Record<string, NonNullable<SourceBlock["style"]>> = {};
  for (const style of xml.matchAll(/<w:style\b[\s\S]*?<\/w:style>/g)) {
    const styleXml = style[0];
    const styleId = styleXml.match(/w:styleId="([^"]+)"/)?.[1];
    if (!styleId) continue;
    styles[styleId] = mergeDocxStyle(
      { styleId },
      {
        ...docxParagraphStyle(styleXml),
        styleId,
      },
    );
  }
  return styles;
}

function docxParagraphStyle(xml: string): NonNullable<SourceBlock["style"]> {
  const rPr = Array.from(xml.matchAll(/<w:rPr\b[\s\S]*?<\/w:rPr>/g))
    .map((match) => match[0])
    .join("");
  return {
    bold: docxBold(rPr),
    fontSizePt: docxFontSizePt(rPr),
    fontFamily: docxFontFamily(rPr),
    color: docxColor(rPr),
    alignment: docxAlignment(xml),
  };
}

function mergeDocxStyle(
  ...styles: Array<NonNullable<SourceBlock["style"]> | undefined>
): NonNullable<SourceBlock["style"]> {
  return styles.reduce<NonNullable<SourceBlock["style"]>>(
    (merged, style) => ({
      ...merged,
      ...Object.fromEntries(
        Object.entries(style ?? {}).filter(
          ([_key, value]) => value !== undefined,
        ),
      ),
    }),
    {},
  );
}

function docxFontSizePt(xml: string): number | undefined {
  const value = readNumberAttribute(
    xml.match(/<w:sz\b[^>]*>/)?.[0] ?? "",
    "val",
  );
  return value ? value / 2 : undefined;
}

function docxFontFamily(xml: string): string | undefined {
  const tag = xml.match(/<w:rFonts\b[^>]*>/)?.[0] ?? "";
  const value =
    tag.match(/w:ascii="([^"]+)"/)?.[1] ??
    tag.match(/w:hAnsi="([^"]+)"/)?.[1] ??
    tag.match(/w:cs="([^"]+)"/)?.[1];
  return value ? `${value}, sans-serif` : undefined;
}

function docxColor(xml: string): string | undefined {
  const value = xml.match(/<w:color\b[^>]*w:val="([0-9A-Fa-f]{6})"/)?.[1];
  return value ? `#${value}` : undefined;
}

function docxBold(xml: string): boolean | undefined {
  const tag = xml.match(/<w:b\b[^>]*\/>|<w:b\b[^>]*>/)?.[0];
  if (!tag) return undefined;
  return !/w:val="(?:0|false)"/.test(tag);
}

function docxAlignment(
  xml: string,
): NonNullable<SourceBlock["style"]>["alignment"] {
  const value = xml.match(/<w:jc\b[^>]*w:val="([^"]+)"/)?.[1];
  if (value === "center") return "center";
  if (value === "right") return "right";
  if (value === "both" || value === "distribute") return "justified";
  return value === "left" ? "left" : undefined;
}

function firstStyle(blocks: SourceBlock[]): SourceBlock["style"] | undefined {
  return blocks.find((block) => block.style)?.style;
}

function applyTokenStyle(
  token: DocumentTemplateV2["tokens"][string] | undefined,
  style: SourceBlock["style"] | undefined,
): void {
  if (!token || !style) return;
  if (style.fontFamily) token.fontFamily = style.fontFamily;
  if (style.fontSizePt) token.fontSize = `${style.fontSizePt}pt`;
  if (style.color) token.color = style.color;
}

function readZipTextEntries(buffer: Buffer): Record<string, string> {
  const centralDirectoryEntries =
    readZipTextEntriesFromCentralDirectory(buffer);
  if (Object.keys(centralDirectoryEntries).length)
    return centralDirectoryEntries;

  const entries: Record<string, string> = {};
  let offset = 0;
  while (offset + 30 < buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const compression = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const name = buffer.toString("utf8", nameStart, nameStart + fileNameLength);
    const dataEnd = dataStart + compressedSize;
    if (
      compressedSize > 0 &&
      dataEnd <= buffer.length &&
      name.endsWith(".xml")
    ) {
      const compressed = buffer.subarray(dataStart, dataEnd);
      try {
        const data =
          compression === 8
            ? inflateRawSync(compressed)
            : compression === 0
              ? compressed
              : null;
        if (data) entries[name] = data.toString("utf8");
      } catch {
        // Skip malformed ZIP entries.
      }
    }
    offset = Math.max(dataEnd, dataStart + 1);
  }
  return entries;
}

function readZipTextEntriesFromCentralDirectory(
  buffer: Buffer,
): Record<string, string> {
  const entries: Record<string, string> = {};
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) return entries;

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;
  const end = Math.min(
    buffer.length,
    centralDirectoryOffset + centralDirectorySize,
  );

  while (offset + 46 <= end && buffer.readUInt32LE(offset) === 0x02014b50) {
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const nameEnd = nameStart + fileNameLength;
    const name = buffer.toString("utf8", nameStart, nameEnd);

    if (name.endsWith(".xml")) {
      const data = readZipEntryData(
        buffer,
        localHeaderOffset,
        compressedSize,
        compression,
      );
      if (data) entries[name] = data.toString("utf8");
    }

    offset = nameEnd + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minOffset = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readZipEntryData(
  buffer: Buffer,
  localHeaderOffset: number,
  compressedSize: number,
  compression: number,
): Buffer | null {
  if (
    localHeaderOffset < 0 ||
    localHeaderOffset + 30 > buffer.length ||
    buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50
  ) {
    return null;
  }
  const fileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + fileNameLength + extraLength;
  const dataEnd = dataStart + compressedSize;
  if (compressedSize <= 0 || dataEnd > buffer.length) return null;

  const compressed = buffer.subarray(dataStart, dataEnd);
  try {
    if (compression === 8) return inflateRawSync(compressed);
    if (compression === 0) return compressed;
  } catch {
    return null;
  }
  return null;
}

function expandLatexCustomMacros(source: string) {
  const macros: Array<{ name: string; argCount: number; body: string }> = [];
  let expanded = source.replace(
    /\\(?:re)?newcommand\{\\([A-Za-z@]+)\}(?:\[(\d+)])?\{((?:[^{}]|\{[^{}]*\})*)}/g,
    (_match, name: string, count: string | undefined, body: string) => {
      macros.push({ name, argCount: Number(count ?? 0), body });
      return "";
    },
  );
  expanded = expanded.replace(
    /\\def\\([A-Za-z@]+)((?:#\d+)*)\{((?:[^{}]|\{[^{}]*\})*)}/g,
    (_match, name: string, args: string, body: string) => {
      const argCount = (args.match(/#\d+/g) ?? []).length;
      macros.push({ name, argCount, body });
      return "";
    },
  );

  for (const macro of macros) {
    const argsPattern = Array.from(
      { length: macro.argCount },
      () => String.raw`\{([^{}]*)\}`,
    ).join("");
    const invocation = new RegExp(
      String.raw`\\${escapeRegExp(macro.name)}${argsPattern}`,
      "g",
    );
    expanded = expanded.replace(invocation, (...parts: string[]) => {
      const args = parts.slice(1, 1 + macro.argCount);
      return args.reduce(
        (body, arg, index) =>
          body.replace(new RegExp(`#${index + 1}`, "g"), arg),
        macro.body,
      );
    });
  }

  return expanded;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function groupPositionedItems(
  items: Array<{
    y0: number;
    y1: number;
    x0: number;
    x1: number;
    text: string;
  }>,
) {
  const lines: Array<{ y: number; items: typeof items }> = [];
  for (const item of items) {
    const height = Math.max(item.y1 - item.y0, 8);
    const line = lines.find(
      (candidate) => Math.abs(candidate.y - item.y0) < height * 0.6,
    );
    if (line) line.items.push(item);
    else lines.push({ y: item.y0, items: [item] });
  }
  return lines
    .map((line) => ({ ...line, items: line.items.sort((a, b) => a.x0 - b.x0) }))
    .sort((a, b) => a.y - b.y);
}

function splitPositionedLine(
  items: Array<{
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    text: string;
  }>,
) {
  const result: (typeof items)[] = [];
  let current: typeof items = [];
  let lastRight = -Infinity;
  for (const item of items) {
    if (current.length && item.x0 - lastRight > 90) {
      result.push(current);
      current = [];
    }
    current.push(item);
    lastRight = item.x1;
  }
  if (current.length) result.push(current);
  return result;
}

function joinPositionedText(
  items: Array<{ x0: number; x1: number; text: string }>,
) {
  let out = "";
  let lastRight = -Infinity;
  let lastWidth = 0;
  for (const item of items) {
    const gap = item.x0 - lastRight;
    const width = Math.max(1, item.x1 - item.x0);
    const wordGap = Math.max(
      3.2,
      Math.min(8, Math.max(lastWidth, width) * 0.65),
    );
    if (out) out += gap > 25 ? " | " : gap >= wordGap ? " " : "";
    out += item.text;
    lastRight = item.x1;
    lastWidth = width;
  }
  return out.trim();
}

function normalizePositionedText(text: string): string {
  let normalized = text
    .replace(/(?:\b[A-Za-z0-9]\s+){2,}[A-Za-z0-9]\b/g, (match) =>
      match.replace(/\s+/g, ""),
    )
    .replace(/\s*([.@/])\s*/g, "$1")
    .replace(/linkedin\.com\/i\s+n\//gi, "linkedin.com/in/")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/,([A-Z])/g, ", $1")
    .replace(/(\d{2})to([A-Z])/g, "$1 to $2")
    .replace(/\s*\|\s*/g, " | ");
  if (/\d{4}|-[A-Z]/.test(normalized)) {
    normalized = normalized.replace(/\s*-\s*/g, " - ");
  }
  return repairPdfWordFragments(normalized)
    .replace(/\bType Script\b/g, "TypeScript")
    .replace(/\bNode\.j s\b/g, "Node.js")
    .replace(/\bPostgre SQL\b/g, "PostgreSQL")
    .replace(/\bGraph QL\b/g, "GraphQL")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function repairPdfWordFragments(text: string): string {
  let normalized = text;
  for (let i = 0; i < 3; i += 1) {
    normalized = normalized
      .replace(/\b([A-Za-z]{4,})\s+([a-z])(?=\s+[A-Z]\b|(\s+-)|\s*$)/g, "$1$2")
      .replace(/\b([B-HJ-Z])\s+([a-z]{3,})\b/g, "$1$2")
      .replace(/\b([A-Z])\s+([A-Z])\b/g, "$1$2");
  }
  return normalized;
}

function bboxFor(
  items: Array<{ x0: number; x1: number; y0: number; y1: number }>,
) {
  const x0 = Math.min(...items.map((item) => item.x0));
  const y0 = Math.min(...items.map((item) => item.y0));
  const x1 = Math.max(...items.map((item) => item.x1));
  const y1 = Math.max(...items.map((item) => item.y1));
  return { xPt: x0, yPt: y0, widthPt: x1 - x0, heightPt: y1 - y0 };
}

function unionBox(boxes: Array<NonNullable<SourceBlock["bbox"]>>) {
  const minX = Math.min(...boxes.map((box) => box.xPt));
  const minY = Math.min(...boxes.map((box) => box.yPt));
  const maxX = Math.max(...boxes.map((box) => box.xPt + box.widthPt));
  const maxY = Math.max(...boxes.map((box) => box.yPt + box.heightPt));
  return { xPt: minX, yPt: minY, widthPt: maxX - minX, heightPt: maxY - minY };
}

function ptToIn(value: number) {
  return `${Math.round((Math.max(18, Math.min(90, value)) / 72) * 1000) / 1000}in`;
}
