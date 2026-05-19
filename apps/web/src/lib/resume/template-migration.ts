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
  documentTemplateV3Schema,
  type BorderSet,
  type BoxEdges,
  type DocumentTemplateV3,
  type TemplateNodeV3,
  type TemplateTable,
  type TemplateTableCell,
  type TemplateTableRow,
} from "@/lib/resume/template-v3";
import {
  extractTemplateFromFile,
  getTemplateSourceType,
  type TemplateSourceType,
} from "@/lib/templates/import";
import {
  assessVisualTemplateFidelity,
  assessTemplateMigrationFidelity,
  type TemplateMigrationFidelityLike,
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
  margins?: BoxEdges;
}

export interface SourceInlineRun {
  text: string;
  href?: string;
  style?: SourceBlock["style"];
}

export interface SourceCellBlock {
  id: string;
  type: "paragraph" | "heading" | "list-item" | "link";
  text: string;
  href?: string;
  listMarker?: "disc" | "decimal" | "dash" | "none";
  style?: SourceBlock["style"];
  runs: SourceInlineRun[];
}

export interface SourceTableMetadata {
  id: string;
  widthPt?: number;
  alignment?: "left" | "center" | "right";
  columns?: Array<number | undefined>;
  padding?: BoxEdges;
  borders?: BorderSet;
  fill?: { color: string };
}

export interface SourceTableRowMetadata {
  heightPt?: number;
  borders?: BorderSet;
  fill?: { color: string };
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
    italic?: boolean;
    color?: string;
    lineHeight?: string;
    alignment?: "left" | "center" | "right" | "justified";
    styleId?: string;
  };
  cells?: string[];
  tableMetadata?: SourceTableMetadata;
  rowMetadata?: SourceTableRowMetadata;
  cellMetadata?: Array<{
    text: string;
    widthPt?: number;
    gridSpan?: number;
    verticalMerge?: "restart" | "continue";
    alignment?: "left" | "center" | "right" | "justified";
    padding?: BoxEdges;
    borders?: BorderSet;
    fill?: { color: string };
    verticalAlign?: "top" | "middle" | "bottom";
    blocks?: SourceCellBlock[];
    nestedTables?: SourceBlock[][];
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
  templateV3: DocumentTemplateV3;
  fidelity: TemplateMigrationFidelityLike;
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
  const templateV3 = createDocumentTemplateV3FromSourceIR(
    generateId(),
    filename.replace(/\.[^.]+$/, "").slice(0, 100) || "Visual template",
    source,
  );
  const fidelity = assessVisualTemplateFidelity(source, templateV3);

  return {
    id: generateId(),
    userId,
    status: "reviewing",
    sourceFilename: filename,
    sourceType,
    source,
    resume,
    template,
    templateV3,
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
  const { blocks: inferredBlocks, inferredTableCount } =
    inferPdfTableRows(blocks);
  return {
    sourceType: "pdf",
    filename,
    pages: pages.length ? pages : [pdfPage(buffer.toString("latin1"))],
    blocks: inferredBlocks,
    rawText: inferredBlocks.map((block) => block.text).join("\n"),
    diagnostics: [
      "PDF text positions were used to infer line spacing, margins, and column layout.",
      inferredTableCount
        ? "PDF table rows were inferred from aligned text geometry."
        : "",
    ].filter(Boolean),
  };
}

export function inferPdfTableRows(blocks: SourceBlock[]): {
  blocks: SourceBlock[];
  inferredTableCount: number;
} {
  const output: SourceBlock[] = [];
  let inferredTableCount = 0;
  const pages = new Map<string, SourceBlock[]>();
  for (const block of blocks) {
    pages.set(block.pageId, [...(pages.get(block.pageId) ?? []), block]);
  }

  for (const pageBlocks of pages.values()) {
    const lines = groupSourceBlocksByY(pageBlocks);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!isPdfTableLine(line)) {
        output.push(...line);
        continue;
      }

      const run = [line];
      let cursor = index + 1;
      while (
        cursor < lines.length &&
        isPdfTableLine(lines[cursor]) &&
        pdfTableLinesAlign(line, lines[cursor]) &&
        pdfLineGap(lines[cursor - 1], lines[cursor]) <= 32
      ) {
        run.push(lines[cursor]);
        cursor += 1;
      }

      if (run.length < 2) {
        output.push(...line);
        continue;
      }

      inferredTableCount += 1;
      const tableId = `pdf-table-${inferredTableCount}`;
      for (const [rowIndex, row] of run.entries()) {
        output.push(pdfLineToTableRow(row, tableId, rowIndex));
      }
      index = cursor - 1;
    }
  }

  return { blocks: renumberSourceBlocks(output), inferredTableCount };
}

function groupSourceBlocksByY(blocks: SourceBlock[]): SourceBlock[][] {
  const lines: SourceBlock[][] = [];
  for (const block of blocks) {
    if (!block.bbox) {
      lines.push([block]);
      continue;
    }
    const line = lines.find((candidate) => {
      const first = candidate[0]?.bbox;
      if (!first) return false;
      const height = Math.max(first.heightPt, block.bbox!.heightPt, 8);
      return Math.abs(first.yPt - block.bbox!.yPt) < height * 0.6;
    });
    if (line) line.push(block);
    else lines.push([block]);
  }
  return lines
    .map((line) =>
      [...line].sort((a, b) => (a.bbox?.xPt ?? 0) - (b.bbox?.xPt ?? 0)),
    )
    .sort((a, b) => (a[0]?.bbox?.yPt ?? 0) - (b[0]?.bbox?.yPt ?? 0));
}

function isPdfTableLine(line: SourceBlock[]): boolean {
  return line.length >= 2 && line.every((block) => block.bbox);
}

function pdfTableLinesAlign(
  reference: SourceBlock[],
  candidate: SourceBlock[],
): boolean {
  if (reference.length !== candidate.length) return false;
  return reference.every((block, index) => {
    const left = block.bbox?.xPt;
    const nextLeft = candidate[index]?.bbox?.xPt;
    return (
      left !== undefined &&
      nextLeft !== undefined &&
      Math.abs(left - nextLeft) <= 14
    );
  });
}

function pdfLineGap(previous: SourceBlock[], next: SourceBlock[]): number {
  const previousBox = unionBlockBoxes(previous);
  const nextBox = unionBlockBoxes(next);
  if (!previousBox || !nextBox) return Infinity;
  return nextBox.yPt - (previousBox.yPt + previousBox.heightPt);
}

function pdfLineToTableRow(
  line: SourceBlock[],
  tableId: string,
  rowIndex: number,
): SourceBlock {
  const cells = line.map((block) => block.text);
  const bbox = unionBlockBoxes(line);
  return {
    id: `${tableId}-row-${rowIndex + 1}`,
    pageId: line[0]?.pageId ?? "page-1",
    type: "table-row",
    text: cells.join(" | "),
    cells,
    bbox,
    tableMetadata: {
      id: tableId,
      columns: line.map((block) => block.bbox?.widthPt).filter(Boolean),
    },
    cellMetadata: line.map((block) => ({
      text: block.text,
      widthPt: block.bbox?.widthPt,
      alignment: inferPdfCellAlignment(block, line),
      blocks: [
        {
          id: `${block.id}:cell-text`,
          type: block.type === "heading" ? "heading" : "paragraph",
          text: block.text,
          style: block.style,
          runs: [{ text: block.text, style: block.style }],
        },
      ],
    })),
  };
}

function inferPdfCellAlignment(
  block: SourceBlock,
  row: SourceBlock[],
): "left" | "right" | undefined {
  const index = row.indexOf(block);
  if (index < 1 || !block.bbox) return "left";
  const rightEdges = row
    .map((candidate) =>
      candidate.bbox ? candidate.bbox.xPt + candidate.bbox.widthPt : null,
    )
    .filter((edge): edge is number => edge !== null);
  const maxRight = Math.max(...rightEdges);
  const right = block.bbox.xPt + block.bbox.widthPt;
  return Math.abs(maxRight - right) < 16 ? "right" : "left";
}

function unionBlockBoxes(blocks: SourceBlock[]) {
  const boxes = blocks
    .map((block) => block.bbox)
    .filter((box): box is NonNullable<SourceBlock["bbox"]> => Boolean(box));
  return boxes.length ? unionBox(boxes) : undefined;
}

function renumberSourceBlocks(blocks: SourceBlock[]): SourceBlock[] {
  return blocks.map((block, index) => ({ ...block, id: `block-${index + 1}` }));
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
  const numbering = parseDocxNumbering(entries["word/numbering.xml"] ?? "");
  const relationships = parseDocxRelationships(
    entries["word/_rels/document.xml.rels"] ?? "",
  );
  const page = docxPage(xml);
  const blocks: SourceBlock[] = [];
  let blockIndex = 0;
  let tableIndex = 0;
  const nextBlockId = () => `block-${++blockIndex}`;
  const nextTableId = () => `table-${++tableIndex}`;
  for (const child of extractDocxBodyChildren(xml)) {
    const tagName = child.tag;
    const childXml = child.xml;
    if (tagName === "tbl") {
      blocks.push(
        ...parseDocxTableRows(
          childXml,
          nextTableId(),
          page.id,
          styles,
          numbering,
          relationships,
          nextBlockId,
          nextTableId,
        ),
      );
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
      id: nextBlockId(),
      pageId: page.id,
      type:
        isHeadingText(text) || /heading|title/i.test(styleId ?? "")
          ? "heading"
          : docxListMarker(childXml, numbering)
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

function parseDocxTableRows(
  tableXml: string,
  tableId: string,
  pageId: string,
  styles: Record<string, NonNullable<SourceBlock["style"]>>,
  numbering: DocxNumberingMap,
  relationships: Record<string, string>,
  nextBlockId: () => string,
  nextTableId: () => string,
): SourceBlock[] {
  const gridWidths = docxDirectGridWidths(tableXml);
  const tableMetadata = docxTableMetadata(tableId, tableXml, gridWidths);
  const rows: SourceBlock[] = [];
  for (const rowXml of extractDirectDocxElements(tableXml, "tr")) {
    let gridIndex = 0;
    const rowMetadata = docxTableRowMetadata(rowXml);
    const cellMetadata = extractDirectDocxElements(rowXml, "tc")
      .map((cellXml) => {
        const metadata = docxCellMetadata(cellXml, styles, relationships, {
          pageId,
          numbering,
          nextBlockId,
          nextTableId,
        });
        const span = Math.max(1, metadata.gridSpan ?? 1);
        const gridWidth = gridWidths
          .slice(gridIndex, gridIndex + span)
          .reduce((sum, value) => sum + value, 0);
        const width = metadata.widthPt ?? (gridWidth || undefined);
        gridIndex += span;
        return { ...metadata, widthPt: width };
      })
      .filter((cell) => cell.text || cell.nestedTables?.length);
    if (cellMetadata.length) {
      rows.push({
        id: nextBlockId(),
        pageId,
        type: "table-row",
        text: cellMetadata.map((cell) => cell.text).join(" | "),
        cells: cellMetadata.map((cell) => cell.text),
        tableMetadata,
        rowMetadata,
        cellMetadata,
      });
    }
  }
  return rows;
}

function extractDocxBodyChildren(
  documentXml: string,
): Array<{ tag: "p" | "tbl"; xml: string }> {
  const body = documentXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1];
  const xml = body ?? documentXml;
  const children: Array<{ tag: "p" | "tbl"; xml: string }> = [];
  let cursor = 0;
  while (cursor < xml.length) {
    const next = xml.slice(cursor).match(/<w:(p|tbl)\b/);
    if (!next) break;
    const start = cursor + (next.index ?? 0);
    const tag = next[1] as "p" | "tbl";
    const end = balancedDocxElementEnd(xml, start, tag);
    if (end === -1) break;
    children.push({ tag, xml: xml.slice(start, end) });
    cursor = end;
  }
  return children;
}

function extractDirectDocxElements(xml: string, tag: string): string[] {
  const inner = docxElementInnerXml(xml) ?? xml;
  const elements: string[] = [];
  let cursor = 0;
  while (cursor < inner.length) {
    const next = inner.slice(cursor).match(new RegExp(`<w:(${tag}|tbl)\\b`));
    if (!next) break;
    const start = cursor + next.index!;
    const foundTag = next[1];
    const end = balancedDocxElementEnd(inner, start, foundTag);
    if (end === -1) break;
    if (foundTag === tag) {
      elements.push(inner.slice(start, end));
    }
    cursor = end;
  }
  return elements;
}

function docxElementInnerXml(xml: string): string | null {
  const openEnd = xml.indexOf(">");
  const closeStart = xml.lastIndexOf("</w:");
  if (openEnd === -1 || closeStart === -1 || closeStart <= openEnd) {
    return null;
  }
  return xml.slice(openEnd + 1, closeStart);
}

function balancedDocxElementEnd(
  xml: string,
  start: number,
  tag: string,
): number {
  const tagPattern = new RegExp(`<\\/?w:${tag}\\b[^>]*>`, "g");
  tagPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(xml)) !== null) {
    const token = match[0];
    const closing = token.startsWith("</");
    const selfClosing = /\/>$/.test(token);
    if (closing) {
      depth -= 1;
      if (depth === 0) return tagPattern.lastIndex;
    } else if (!selfClosing) {
      depth += 1;
    }
  }
  return -1;
}

function docxDirectGridWidths(tableXml: string): number[] {
  const inner = docxElementInnerXml(tableXml) ?? tableXml;
  const nestedTableStart = inner.search(/<w:tr\b/);
  const tableHeaderXml =
    nestedTableStart >= 0 ? inner.slice(0, nestedTableStart) : inner;
  return Array.from(
    tableHeaderXml.matchAll(/<w:gridCol\b[^>]*w:w="([0-9.]+)"/g),
  ).map((match) => Number(match[1]) / 20);
}

export function applySourceStyleHints(
  template: DocumentTemplateV2,
  source: SourceDocumentIR,
): void {
  const hasPdfGeometry =
    source.sourceType === "pdf" && source.blocks.some((block) => block.bbox);
  const bodyStyle = representativeStyle(
    source.blocks.filter(
      (block) =>
        (block.type === "paragraph" || block.type === "list-item") &&
        block.slotHint !== "contact.name",
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
  let latexTableIndex = 0;
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
      /\\begin\{tabularx\}\{((?:[^{}]|\{[^{}]*})*)}\{((?:[^{}]|\{[^{}]*})*)}([\s\S]*?)\\end\{tabularx}/g,
      (_match, width: string, spec: string, body: string) =>
        latexTabularToLineIR(`latex-table-${++latexTableIndex}`, spec, body, {
          widthPt: latexLengthToPt(width),
        }),
    )
    .replace(
      /\\begin\{(?:tabular|longtable|array)\}\{((?:[^{}]|\{[^{}]*})*)}([\s\S]*?)\\end\{(?:tabular|longtable|array)}/g,
      (_match, spec: string, body: string) =>
        latexTabularToLineIR(`latex-table-${++latexTableIndex}`, spec, body),
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
        const payload = parseLatexTableRowPayload(line);
        const cells =
          payload?.cells ??
          line.replace(/^__TABLE_ROW__\s*/, "").split(/\s+\|\s+/);
        return {
          id: `block-${index + 1}`,
          pageId: page.id,
          type: "table-row",
          text: cells.join(" | "),
          cells,
          tableMetadata: payload?.tableMetadata,
          rowMetadata: payload?.rowMetadata,
          cellMetadata: cells.map((cell, cellIndex) => ({
            text: cell,
            widthPt: payload?.widths[cellIndex] ?? undefined,
            gridSpan: payload?.colSpans[cellIndex] ?? undefined,
            alignment: payload?.alignments[cellIndex] ?? undefined,
            borders: payload?.cellBorders[cellIndex] ?? undefined,
            fill: payload?.cellFills[cellIndex] ?? undefined,
          })),
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

interface LatexTableRowPayload {
  tableMetadata: SourceTableMetadata;
  rowMetadata?: SourceTableRowMetadata;
  cells: string[];
  widths: Array<number | null | undefined>;
  colSpans: Array<number | null | undefined>;
  alignments: Array<"left" | "center" | "right" | null | undefined>;
  cellBorders: Array<BorderSet | null | undefined>;
  cellFills: Array<{ color: string } | null | undefined>;
}

function latexTabularToLineIR(
  tableId: string,
  spec: string,
  body: string,
  options: { widthPt?: number } = {},
): string {
  const columns = parseLatexColumnSpec(spec);
  const rows: string[] = [];
  let pendingTopRule = false;
  for (const segment of body.split(/\\\\/)) {
    let row = segment.trim();
    if (!row) continue;
    const rowFill = latexRowFill(row);
    row = row.replace(/\\rowcolor(?:\[[^\]]+])?\{[^}]+}/g, "").trim();
    if (/\\(?:hline|toprule|midrule|bottomrule)\b/.test(row)) {
      pendingTopRule = true;
      row = row.replace(/\\(?:hline|toprule|midrule|bottomrule)\b/g, "").trim();
    }
    row = row.replace(/\\cline\{[^}]+}/g, "").trim();
    if (!row) continue;
    const parsedCells = parseLatexTableCells(row, columns);
    const cells = parsedCells.map((cell) => cell.text);
    const payload: LatexTableRowPayload = {
      tableMetadata: {
        id: tableId,
        widthPt: options.widthPt,
        columns: columns.some((column) => column.widthPt)
          ? columns.map((column) => column.widthPt)
          : undefined,
      },
      rowMetadata: pendingTopRule
        ? { borders: { top: latexRuleBorder() }, fill: rowFill }
        : rowFill
          ? { fill: rowFill }
          : undefined,
      cells,
      widths: parsedCells.map((cell) => cell.widthPt),
      colSpans: parsedCells.map((cell) => cell.colSpan),
      alignments: parsedCells.map((cell) => cell.alignment),
      cellBorders: parsedCells.map((cell) => cell.borders),
      cellFills: parsedCells.map((cell) => cell.fill),
    };
    rows.push(
      `\n__TABLE_ROW__ ${encodeURIComponent(JSON.stringify(payload))}\n`,
    );
    pendingTopRule = false;
  }
  return rows.join("");
}

function parseLatexTableRowPayload(line: string): LatexTableRowPayload | null {
  const encoded = line.replace(/^__TABLE_ROW__\s*/, "").trim();
  if (!encoded.startsWith("%7B")) return null;
  try {
    return JSON.parse(decodeURIComponent(encoded)) as LatexTableRowPayload;
  } catch {
    return null;
  }
}

function parseLatexTableCells(
  row: string,
  columns: ReturnType<typeof parseLatexColumnSpec>,
): Array<{
  text: string;
  widthPt?: number;
  colSpan?: number;
  alignment?: "left" | "center" | "right";
  borders?: BorderSet;
  fill?: { color: string };
}> {
  const cells = splitLatexTableCells(row);
  let columnIndex = 0;
  return cells.map((rawCell) => {
    const multicolumn = parseLatexMulticolumn(rawCell);
    if (multicolumn) {
      const specColumns = parseLatexColumnSpec(multicolumn.spec);
      const span = Math.max(1, multicolumn.colSpan);
      const startColumn = columns[columnIndex];
      const endColumn = columns[columnIndex + span];
      const explicitColumn = specColumns[0];
      const widthPt = columns
        .slice(columnIndex, columnIndex + span)
        .reduce<number | undefined>((sum, column) => {
          if (!column.widthPt) return sum;
          return (sum ?? 0) + column.widthPt;
        }, undefined);
      const cell = {
        text: cleanLatexCell(multicolumn.content),
        widthPt,
        colSpan: span > 1 ? span : undefined,
        alignment: explicitColumn?.alignment ?? startColumn?.alignment,
        fill: latexCellFill(multicolumn.content),
        borders: latexCellBorders(
          {
            alignment: explicitColumn?.alignment ?? startColumn?.alignment,
            widthPt,
            leftRule:
              explicitColumn?.leftRule ?? startColumn?.leftRule ?? false,
            rightRule:
              explicitColumn?.rightRule ??
              columns[columnIndex + span - 1]?.rightRule ??
              false,
          },
          endColumn,
        ),
      };
      columnIndex += span;
      return cell;
    }

    const column = columns[columnIndex];
    const cell = {
      text: cleanLatexCell(rawCell),
      widthPt: column?.widthPt,
      alignment: column?.alignment,
      fill: latexCellFill(rawCell),
      borders: latexCellBorders(column, columns[columnIndex + 1]),
    };
    columnIndex += 1;
    return cell;
  });
}

function splitLatexTableCells(row: string): string[] {
  const cells: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") depth = Math.max(0, depth - 1);
    if (char === "&" && depth === 0) {
      cells.push(row.slice(start, index));
      start = index + 1;
    }
  }
  cells.push(row.slice(start));
  return cells;
}

function parseLatexMulticolumn(
  cell: string,
): { colSpan: number; spec: string; content: string } | null {
  const trimmed = cell.trim();
  if (!trimmed.startsWith("\\multicolumn")) return null;
  let cursor = "\\multicolumn".length;
  const colSpan = readLatexBracedValue(trimmed, cursor);
  if (!colSpan) return null;
  cursor = colSpan.endIndex + 1;
  const spec = readLatexBracedValue(trimmed, cursor);
  if (!spec) return null;
  cursor = spec.endIndex + 1;
  const content = readLatexBracedValue(trimmed, cursor);
  if (!content) return null;
  const span = Number(colSpan.value.trim());
  return Number.isFinite(span)
    ? { colSpan: span, spec: spec.value, content: content.value }
    : null;
}

function parseLatexColumnSpec(spec: string): Array<{
  alignment?: "left" | "center" | "right";
  widthPt?: number;
  leftRule: boolean;
  rightRule: boolean;
}> {
  const columns: Array<{
    alignment?: "left" | "center" | "right";
    widthPt?: number;
    leftRule: boolean;
    rightRule: boolean;
  }> = [];
  let pendingRule = false;
  for (let index = 0; index < spec.length; index += 1) {
    const char = spec[index];
    if (char === "|") {
      pendingRule = true;
      if (columns.length) columns[columns.length - 1].rightRule = true;
      continue;
    }
    const alignment =
      char === "l" ||
      char === "p" ||
      char === "m" ||
      char === "b" ||
      char === "X"
        ? "left"
        : char === "c"
          ? "center"
          : char === "r"
            ? "right"
            : undefined;
    if (!alignment) continue;
    let widthPt: number | undefined;
    if (
      (char === "p" || char === "m" || char === "b") &&
      spec[index + 1] === "{"
    ) {
      const width = readLatexBracedValue(spec, index + 1);
      widthPt = width ? latexLengthToPt(width.value) : undefined;
      if (width) index = width.endIndex;
    }
    columns.push({
      alignment,
      widthPt,
      leftRule: pendingRule,
      rightRule: false,
    });
    pendingRule = false;
  }
  if (pendingRule && columns.length)
    columns[columns.length - 1].rightRule = true;
  return columns;
}

function readLatexBracedValue(
  value: string,
  openBraceIndex: number,
): { value: string; endIndex: number } | null {
  let depth = 0;
  for (let index = openBraceIndex; index < value.length; index += 1) {
    const char = value[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          value: value.slice(openBraceIndex + 1, index),
          endIndex: index,
        };
      }
    }
  }
  return null;
}

function latexLengthToPt(value: string): number | undefined {
  const match = value.trim().match(/^([0-9.]+)\s*(pt|in|cm|mm)$/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  const unit = match[2].toLowerCase();
  const points =
    unit === "in"
      ? amount * 72
      : unit === "cm"
        ? amount * 28.3465
        : unit === "mm"
          ? amount * 2.83465
          : amount;
  return Math.round(points * 100) / 100;
}

function latexLengthToCssPt(value: string | undefined): string | undefined {
  const points = value ? latexLengthToPt(value) : undefined;
  return points === undefined ? undefined : `${points}pt`;
}

function latexCellBorders(
  column: ReturnType<typeof parseLatexColumnSpec>[number] | undefined,
  nextColumn: ReturnType<typeof parseLatexColumnSpec>[number] | undefined,
): BorderSet | undefined {
  const borders: BorderSet = {};
  if (column?.leftRule) borders.left = latexRuleBorder();
  if (column?.rightRule || nextColumn?.leftRule)
    borders.right = latexRuleBorder();
  return Object.keys(borders).length ? borders : undefined;
}

function latexRuleBorder(): BorderSet["top"] {
  return { widthPt: 0.4, color: "#000000", style: "solid" };
}

function latexRowFill(row: string): { color: string } | undefined {
  const match = row.match(/\\rowcolor(?:\[[^\]]+])?\{([^}]+)}/);
  return latexColorFill(match?.[1]);
}

function latexCellFill(cell: string): { color: string } | undefined {
  const match = cell.match(/\\cellcolor(?:\[[^\]]+])?\{([^}]+)}/);
  return latexColorFill(match?.[1]);
}

function latexColorFill(
  value: string | undefined,
): { color: string } | undefined {
  const color = latexColorToHex(value);
  return color ? { color } : undefined;
}

function latexColorToHex(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(normalized)) return `#${normalized.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toUpperCase()}`;
  }
  const named: Record<string, string> = {
    black: "#000000",
    blue: "#0000FF",
    cyan: "#00FFFF",
    gray: "#808080",
    green: "#008000",
    grey: "#808080",
    lime: "#00FF00",
    magenta: "#FF00FF",
    orange: "#FFA500",
    purple: "#800080",
    red: "#FF0000",
    teal: "#008080",
    violet: "#EE82EE",
    white: "#FFFFFF",
    yellow: "#FFFF00",
  };
  return named[normalized];
}

function cleanLatexCell(cell: string): string {
  return cell
    .replace(/\\cellcolor(?:\[[^\]]+])?\{[^}]+}/g, "")
    .replace(/\\(?:textbf|textit|emph|underline)\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*])?(?:\{[^}]*\})?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  let experienceHighlightStarted = false;
  let educationEntryStarted = false;
  let projectEntryStarted = false;
  let projectHighlightStarted = false;

  for (const [index, block] of source.blocks.entries()) {
    const normalized = normalizeSectionName(block.text);
    if (SECTION_NAMES.has(normalized)) {
      section = normalized;
      experienceEntryStarted = false;
      experienceHighlightStarted = false;
      educationEntryStarted = false;
      projectEntryStarted = false;
      projectHighlightStarted = false;
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
      if (
        block.type === "list-item" ||
        isBulletLikeText(block.text) ||
        (experienceHighlightStarted && isIndentedContinuation(block))
      ) {
        block.slotHint = "experiences[].highlights[]";
        experienceHighlightStarted = true;
      } else if (
        !experienceEntryStarted ||
        looksLikeExperienceHeader(block.text)
      ) {
        block.slotHint = "experiences[].title";
        experienceEntryStarted = true;
        experienceHighlightStarted = false;
      } else if (hasDateRange(block.text)) {
        block.slotHint = "experiences[].dates";
        experienceHighlightStarted = false;
      } else {
        block.slotHint = "experiences[].company";
        experienceHighlightStarted = false;
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
      if (
        block.type === "list-item" ||
        isBulletLikeText(block.text) ||
        (projectHighlightStarted && isIndentedContinuation(block))
      ) {
        block.slotHint = "projects[].highlights[]";
        projectHighlightStarted = true;
      } else if (
        !projectEntryStarted ||
        (projectHighlightStarted && !isIndentedContinuation(block))
      ) {
        block.slotHint = "projects[].name";
        projectEntryStarted = true;
        projectHighlightStarted = false;
      } else {
        block.slotHint = "projects[].description";
        projectHighlightStarted = false;
      }
    }
  }
}

function isBulletLikeText(text: string): boolean {
  return /^\s*(?:[-*•●])\s*/.test(text);
}

function isIndentedContinuation(block: SourceBlock): boolean {
  return (block.bbox?.xPt ?? 0) > 45;
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
      if (span === 1 && width && Number.isFinite(width)) {
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

function normalizeTableColumns(
  columns: Array<number | undefined>,
  tableWidthPt?: number,
): Array<number | undefined> {
  if (!tableWidthPt || columns.length < 2) return columns;
  const total = sumDefinedNumbers(columns);
  if (total <= tableWidthPt * 1.2) return columns;

  for (
    let prefixLength = 1;
    prefixLength <= columns.length / 2;
    prefixLength += 1
  ) {
    if (columns.length % prefixLength !== 0) continue;
    const prefix = columns.slice(0, prefixLength);
    const prefixTotal = sumDefinedNumbers(prefix);
    if (
      Math.abs(prefixTotal - tableWidthPt) > Math.max(1, tableWidthPt * 0.03)
    ) {
      continue;
    }
    let repeats = true;
    for (let index = prefixLength; index < columns.length; index += 1) {
      const expected = prefix[index % prefixLength] ?? 0;
      const actual = columns[index] ?? 0;
      if (Math.abs(expected - actual) > 0.5) {
        repeats = false;
        break;
      }
    }
    if (repeats) return prefix;
  }

  return columns;
}

function sumDefinedNumbers(values: Array<number | undefined>): number {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
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

export function createDocumentTemplateV3FromSourceIR(
  id: string,
  name: string,
  source: SourceDocumentIR,
): DocumentTemplateV3 {
  const page = source.pages[0] ?? {
    id: "page-1",
    number: 1,
    widthPt: 612,
    heightPt: 792,
  };
  const hasPdfGeometry =
    source.sourceType === "pdf" && source.blocks.some((block) => block.bbox);
  const bodyStyle = representativeStyle(
    source.blocks.filter(
      (block) =>
        (block.type === "paragraph" || block.type === "list-item") &&
        block.slotHint !== "contact.name",
    ),
  );
  const headingStyle = firstStyle(
    source.blocks.filter((block) => block.type === "heading"),
  );
  const nameStyle = source.blocks[0]?.style ?? headingStyle ?? bodyStyle;
  const slots = buildTemplateV3Slots(source);
  const nodes = buildTemplateV3Nodes(source, slots);
  const repeatGroups = buildTemplateV3RepeatGroups(nodes);

  return documentTemplateV3Schema.parse({
    schemaVersion: 3,
    id,
    name,
    description: `Visual template imported from ${source.filename}`,
    source: { filename: source.filename, type: source.sourceType },
    page: {
      size:
        page.widthPt &&
        page.widthPt < 600 &&
        page.heightPt &&
        page.heightPt > 800
          ? "a4"
          : "letter",
      widthPt: page.widthPt ?? 612,
      heightPt: page.heightPt ?? 792,
      margins:
        page.margins ??
        (hasPdfGeometry
          ? {
              top: "0pt",
              right: "0pt",
              bottom: "0pt",
              left: "0pt",
            }
          : {
              top: "0.5in",
              right: "0.5in",
              bottom: "0.5in",
              left: "0.5in",
            }),
    },
    tokens: {
      name: tokenFromSourceStyle(nameStyle, {
        fontFamily: "Arial, sans-serif",
        fontSize: "20pt",
        lineHeight: "1.1",
        fontWeight: "700",
      }),
      heading: tokenFromSourceStyle(headingStyle, {
        fontFamily: "Arial, sans-serif",
        fontSize: "11pt",
        lineHeight: "1.2",
        fontWeight: "700",
        textTransform: "uppercase",
      }),
      body: tokenFromSourceStyle(bodyStyle, {
        fontFamily: "Arial, sans-serif",
        fontSize: "10pt",
        lineHeight: "1.35",
      }),
      meta: tokenFromSourceStyle(bodyStyle, {
        fontFamily: "Arial, sans-serif",
        fontSize: "9pt",
        lineHeight: "1.3",
        color: "#555555",
      }),
    },
    regions: [
      {
        id: "region-page-frame",
        role: "page-frame",
        flow: hasPdfGeometry
          ? "absolute"
          : nodes.some((node) => node.kind === "table")
            ? "table"
            : "block",
        box: hasPdfGeometry
          ? { widthPt: page.widthPt ?? 612, heightPt: page.heightPt ?? 792 }
          : undefined,
        nodes,
      },
    ],
    slots,
    repeatGroups,
    diagnostics: source.diagnostics.map((message, index) => ({
      id: `diagnostic-${index + 1}`,
      severity: "info",
      message,
      sourceRefs: [],
    })),
  });
}

function buildTemplateV3Nodes(
  source: SourceDocumentIR,
  slots: DocumentTemplateV3["slots"],
): DocumentTemplateV3["regions"][number]["nodes"] {
  const nodes: DocumentTemplateV3["regions"][number]["nodes"] = [];
  let section = "";
  for (let index = 0; index < source.blocks.length; index += 1) {
    const block = source.blocks[index];
    if (block.type === "table-row" && block.cellMetadata?.length) {
      const tableId = block.tableMetadata?.id ?? "";
      const rows: SourceBlock[] = [];
      while (index < source.blocks.length) {
        const row = source.blocks[index];
        if (row.type !== "table-row" || !row.cellMetadata?.length) break;
        const rowTableId = row.tableMetadata?.id ?? "";
        if (rows.length && rowTableId !== tableId) break;
        rows.push(row);
        index += 1;
      }
      nodes.push(buildTemplateV3Table(rows, slots, section));
      const sectionRows = rows.map(sectionNameFromRow).filter(Boolean);
      const lastSection = sectionRows[sectionRows.length - 1];
      if (lastSection) section = lastSection;
      index -= 1;
      continue;
    }

    const nextSection = sectionNameFromRow(block);
    if (nextSection) section = nextSection;
    nodes.push(buildTemplateV3Block(block, slots));
  }

  return nodes;
}

function buildTemplateV3Block(
  block: SourceBlock,
  slots: DocumentTemplateV3["slots"],
): DocumentTemplateV3["regions"][number]["nodes"][number] {
  const slot = slots.find((candidate) =>
    candidate.sourceRefs.some((ref) => ref.sourceId === block.id),
  );
  if (slot) {
    return {
      kind: "slot",
      id: `node-${slot.id}-${block.id}`,
      slotId: slot.id,
      slotOccurrence: slot.sourceRefs.findIndex(
        (ref) => ref.sourceId === block.id,
      ),
      box: boxFromSourceBlock(block),
      token: tokenForSlotPath(slot.path),
      style: typographyOverrideFromSourceStyle(block.style),
      textAlign: block.style?.alignment,
      fallback: block.text,
      sourceRef: sourceRefForBlock(block),
    };
  }
  if (block.type === "heading") {
    return {
      kind: "section",
      id: `section-${block.id}`,
      title: block.text,
      box: boxFromSourceBlock(block),
      token: "heading",
      style: typographyOverrideFromSourceStyle(block.style),
      sourceRef: sourceRefForBlock(block),
    };
  }
  return {
    kind: "text",
    id: `text-${block.id}`,
    text: block.text,
    box: boxFromSourceBlock(block),
    token: block.type === "list-item" ? "body" : "body",
    style: typographyOverrideFromSourceStyle(block.style),
    textAlign: block.style?.alignment,
    sourceRef: sourceRefForBlock(block),
  };
}

function buildTemplateV3Table(
  rows: SourceBlock[],
  slots: DocumentTemplateV3["slots"],
  initialSection = "",
): TemplateTable {
  const tableMetadata = rows[0]?.tableMetadata;
  const columns = normalizeTableColumns(
    tableMetadata?.columns?.length
      ? tableMetadata.columns
      : inferTableColumnWidths(rows),
    tableMetadata?.widthPt,
  ).map((widthPt) => (widthPt ? { widthPt } : {}));
  const verticalMergeLayout = analyzeVerticalMerges(rows);
  let section = initialSection;
  const tableRows: TemplateTableRow[] = rows.map((row, rowIndex) => {
    const nextSection = sectionNameFromRow(row);
    if (nextSection) section = nextSection;
    return {
      kind: "row",
      id: `row-${row.id}`,
      role: rowRole(row),
      heightPt: row.rowMetadata?.heightPt,
      borders: row.rowMetadata?.borders,
      fill: row.rowMetadata?.fill,
      cells: (row.cellMetadata ?? []).flatMap<TemplateTableCell>(
        (cell, cellIndex) => {
          const mergeKey = verticalMergeCellKey(rowIndex, cellIndex);
          if (verticalMergeLayout.skipContinuationKeys.has(mergeKey)) {
            return [];
          }
          const slotPath = inferCellSlotHint(
            row,
            cellIndex,
            cell.text,
            rowIndex,
            section,
          );
          const slot = slotPath
            ? slots.find((candidate) =>
                candidate.sourceRefs.some(
                  (ref) =>
                    ref.sourceId === `${row.id}:cell-${cellIndex + 1}` &&
                    candidate.path === slotPath,
                ),
              )
            : null;
          const nodes = templateCellNodes(row, cell, cellIndex, slot, slots);
          return {
            kind: "cell",
            id: `cell-${row.id}-${cellIndex + 1}`,
            colSpan: cell.gridSpan,
            rowSpan: verticalMergeLayout.rowSpans.get(mergeKey),
            widthPt: cell.widthPt,
            padding: cell.padding,
            borders: cell.borders,
            fill: cell.fill,
            verticalAlign: cell.verticalAlign,
            textAlign: cell.alignment,
            sourceRef: {
              sourceId: `${row.id}:cell-${cellIndex + 1}`,
              text: cell.text,
            },
            nodes,
          };
        },
      ),
      sourceRef: sourceRefForBlock(row),
    };
  });

  return {
    kind: "table",
    id: tableMetadata?.id ?? "table-source-1",
    role: "outer-frame",
    box: tableMetadata?.widthPt
      ? { widthPt: tableMetadata.widthPt }
      : undefined,
    alignment: tableMetadata?.alignment,
    columns,
    rows: tableRows,
    borders: tableMetadata?.borders,
    cellDefaults: {
      padding: tableMetadata?.padding ?? {
        top: "2pt",
        right: "3pt",
        bottom: "2pt",
        left: "3pt",
      },
      fill: tableMetadata?.fill,
      verticalAlign: "top",
    },
    sourceRef: { sourceId: tableMetadata?.id ?? "source-table-1" },
  };
}

function analyzeVerticalMerges(rows: SourceBlock[]): {
  rowSpans: Map<string, number>;
  skipContinuationKeys: Set<string>;
} {
  const positionedRows = rows.map(positionTableCells);
  const rowSpans = new Map<string, number>();
  const skipContinuationKeys = new Set<string>();

  for (const [rowIndex, cells] of positionedRows.entries()) {
    for (const positioned of cells) {
      if (positioned.cell.verticalMerge !== "restart") continue;
      let rowSpan = 1;
      for (
        let nextRowIndex = rowIndex + 1;
        nextRowIndex < positionedRows.length;
        nextRowIndex += 1
      ) {
        const continuation = positionedRows[nextRowIndex].find(
          (candidate) =>
            candidate.columnStart === positioned.columnStart &&
            candidate.cell.verticalMerge === "continue",
        );
        if (!continuation) break;
        rowSpan += 1;
        skipContinuationKeys.add(
          verticalMergeCellKey(nextRowIndex, continuation.cellIndex),
        );
      }
      if (rowSpan > 1) {
        rowSpans.set(
          verticalMergeCellKey(rowIndex, positioned.cellIndex),
          rowSpan,
        );
      }
    }
  }

  return { rowSpans, skipContinuationKeys };
}

function positionTableCells(row: SourceBlock): Array<{
  cell: NonNullable<SourceBlock["cellMetadata"]>[number];
  cellIndex: number;
  columnStart: number;
}> {
  const positioned: Array<{
    cell: NonNullable<SourceBlock["cellMetadata"]>[number];
    cellIndex: number;
    columnStart: number;
  }> = [];
  let columnStart = 0;
  for (const [cellIndex, cell] of (row.cellMetadata ?? []).entries()) {
    positioned.push({ cell, cellIndex, columnStart });
    columnStart += Math.max(1, cell.gridSpan ?? 1);
  }
  return positioned;
}

function verticalMergeCellKey(rowIndex: number, cellIndex: number): string {
  return `${rowIndex}:${cellIndex}`;
}

function templateCellNodes(
  row: SourceBlock,
  cell: NonNullable<SourceBlock["cellMetadata"]>[number],
  cellIndex: number,
  slot: DocumentTemplateV3["slots"][number] | null | undefined,
  slots: DocumentTemplateV3["slots"],
): TemplateTableCell["nodes"] {
  const nestedTableNodes = (cell.nestedTables ?? []).map((nestedRows) =>
    buildTemplateV3Table(nestedRows, slots),
  );
  if (slot) {
    if (slot.role === "list") {
      return [
        {
          kind: "list",
          id: `list-${row.id}-${cellIndex + 1}`,
          slotId: slot.id,
          items: listItemsFromCell(cell),
          marker: listMarkerFromCell(cell),
          style: listStyleFromCell(cell),
        },
        ...nestedTableNodes,
      ];
    }
    return [
      {
        kind: "slot",
        id: `node-${slot.id}`,
        slotId: slot.id,
        fallback: cell.text,
      },
      ...nestedTableNodes,
    ];
  }

  if (rowRole(row) === "section-header") {
    return [
      {
        kind: "section",
        id: `text-${row.id}-${cellIndex + 1}`,
        title: cell.text,
        token: "heading",
      },
      ...nestedTableNodes,
    ];
  }

  const blocks = cell.blocks ?? [];
  if (!blocks.length) {
    if (nestedTableNodes.length) return nestedTableNodes;
    return [
      {
        kind: "text",
        id: `text-${row.id}-${cellIndex + 1}`,
        text: cell.text,
        token: "body",
      },
      ...nestedTableNodes,
    ];
  }

  const nodes: TemplateTableCell["nodes"] = [];
  let listItems: string[] = [];
  let listStyle:
    | ReturnType<typeof typographyOverrideFromSourceStyle>
    | undefined;
  let listMarker: "disc" | "decimal" | "dash" | "none" = "disc";
  const flushList = () => {
    if (!listItems.length) return;
    nodes.push({
      kind: "list",
      id: `list-${row.id}-${cellIndex + 1}-${nodes.length + 1}`,
      items: listItems,
      marker: listMarker,
      style: listStyle,
    });
    listItems = [];
    listStyle = undefined;
    listMarker = "disc";
  };

  for (const block of blocks) {
    if (block.type === "list-item") {
      if (!listItems.length) {
        listStyle = typographyOverrideFromSourceStyle(block.style);
        listMarker = block.listMarker ?? "disc";
      }
      listItems.push(block.text);
      continue;
    }
    flushList();
    const richRuns = block.runs.filter((run) => run.text.trim());
    if (richRuns.length > 1 || richRuns.some((run) => run.href)) {
      for (const run of richRuns) {
        nodes.push({
          kind: "text",
          id: `text-${row.id}-${cellIndex + 1}-${nodes.length + 1}`,
          text: run.text,
          token: block.type === "heading" ? "heading" : "body",
          href: run.href,
          textAlign: block.style?.alignment,
          style: typographyOverrideFromSourceStyle(run.style ?? block.style),
          sourceRef: {
            sourceId: `${row.id}:cell-${cellIndex + 1}:${block.id}`,
            text: run.text,
          },
        });
      }
      continue;
    }
    nodes.push({
      kind: "text",
      id: `text-${row.id}-${cellIndex + 1}-${nodes.length + 1}`,
      text: block.text,
      token: block.type === "heading" ? "heading" : "body",
      href: block.href,
      textAlign: block.style?.alignment,
      style: typographyOverrideFromSourceStyle(block.style),
      sourceRef: {
        sourceId: `${row.id}:cell-${cellIndex + 1}:${block.id}`,
        text: block.text,
      },
    });
  }
  flushList();
  nodes.push(...nestedTableNodes);
  return nodes;
}

function listItemsFromCell(
  cell: NonNullable<SourceBlock["cellMetadata"]>[number],
): string[] {
  const listItems =
    cell.blocks
      ?.filter((block) => block.type === "list-item")
      .map((block) => block.text) ?? [];
  return listItems.length ? listItems : [cell.text].filter(Boolean);
}

function listStyleFromCell(
  cell: NonNullable<SourceBlock["cellMetadata"]>[number],
): ReturnType<typeof typographyOverrideFromSourceStyle> {
  const listBlock = cell.blocks?.find((block) => block.type === "list-item");
  return typographyOverrideFromSourceStyle(listBlock?.style);
}

function listMarkerFromCell(
  cell: NonNullable<SourceBlock["cellMetadata"]>[number],
): "disc" | "decimal" | "dash" | "none" {
  const listBlock = cell.blocks?.find((block) => block.type === "list-item");
  return listBlock?.listMarker ?? "disc";
}

function typographyOverrideFromSourceStyle(
  style: SourceBlock["style"] | undefined,
) {
  if (!style) return undefined;
  const fontStyle: "italic" | "normal" | undefined =
    style.italic === undefined ? undefined : style.italic ? "italic" : "normal";
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSizePt ? `${style.fontSizePt}pt` : undefined,
    color: style.color,
    fontWeight:
      style.bold === undefined ? undefined : style.bold ? "700" : "400",
    fontStyle,
    lineHeight: style.lineHeight,
  };
}

function buildTemplateV3Slots(
  source: SourceDocumentIR,
): DocumentTemplateV3["slots"] {
  const refsByPath = new Map<
    ResumeSlotPath,
    Array<{ sourceId: string; text: string }>
  >();
  let tableRowIndex = -1;
  let section = "";
  for (const block of source.blocks) {
    if (block.type === "table-row") tableRowIndex += 1;
    const nextSection = sectionNameFromRow(block);
    if (nextSection) section = nextSection;
    if (block.slotHint) {
      addSlotRef(refsByPath, block.slotHint, block.id, block.text);
    }
    block.cellMetadata?.forEach((cell, index) => {
      const slotHint = inferCellSlotHint(
        block,
        index,
        cell.text,
        tableRowIndex,
        section,
      );
      if (slotHint) {
        addSlotRef(
          refsByPath,
          slotHint,
          `${block.id}:cell-${index + 1}`,
          cell.text,
        );
      }
    });
  }
  if (!refsByPath.has("contact.name")) {
    const firstTableBlock = source.blocks.find(
      (block) =>
        block.type === "table-row" && rowRole(block) !== "section-header",
    );
    const firstTableCellIndex =
      firstTableBlock?.cellMetadata?.findIndex((cell) => {
        const text = cell.text.trim();
        return text && !text.includes("@") && !hasDateRange(text);
      }) ?? -1;
    const firstTableCell = firstTableBlock?.cellMetadata?.[firstTableCellIndex];
    if (firstTableBlock && firstTableCell && firstTableCellIndex >= 0) {
      addSlotRef(
        refsByPath,
        "contact.name",
        `${firstTableBlock.id}:cell-${firstTableCellIndex + 1}`,
        firstTableCell.text,
      );
    }
  }
  return Array.from(refsByPath.entries()).map(([path, refs]) => ({
    id: `slot-${path.replace(/[^a-z0-9]+/gi, "-").replace(/-$/, "")}`,
    path,
    role: path.endsWith("[]")
      ? "list"
      : path.includes("linkedin") || path.includes("github")
        ? "link"
        : "text",
    token: path.startsWith("contact.name") ? "name" : "body",
    sourceRefs: refs,
    fallback: refs[0]?.text,
  }));
}

function addSlotRef(
  refsByPath: Map<ResumeSlotPath, Array<{ sourceId: string; text: string }>>,
  path: ResumeSlotPath,
  sourceId: string,
  text: string,
): void {
  refsByPath.set(path, [...(refsByPath.get(path) ?? []), { sourceId, text }]);
}

function inferCellSlotHint(
  row: SourceBlock,
  cellIndex: number,
  text: string,
  tableRowIndex = -1,
  section = "",
): ResumeSlotPath | undefined {
  const inferred = inferSlotHint(text);
  if (inferred) return inferred;
  const sectionSlot = inferSectionCellSlotHint(row, cellIndex, text, section);
  if (sectionSlot) return sectionSlot;
  if (
    row.type === "table-row" &&
    rowRole(row) !== "section-header" &&
    tableRowIndex === 0 &&
    cellIndex === 0 &&
    !row.cellMetadata?.[cellIndex]?.blocks?.some(
      (block) => block.type === "list-item",
    ) &&
    text.trim() &&
    !text.includes("@") &&
    !hasDateRange(text)
  ) {
    return "contact.name";
  }
  return undefined;
}

function inferSectionCellSlotHint(
  row: SourceBlock,
  cellIndex: number,
  text: string,
  section: string,
): ResumeSlotPath | undefined {
  const normalizedSection = normalizeSectionName(section);
  if (!normalizedSection || SECTION_NAMES.has(normalizeSectionName(text))) {
    return undefined;
  }
  const isListCell = row.cellMetadata?.[cellIndex]?.blocks?.some(
    (block) => block.type === "list-item",
  );
  if (
    normalizedSection === "experience" ||
    normalizedSection === "work experience" ||
    normalizedSection === "professional experience" ||
    normalizedSection === "work history"
  ) {
    if (isListCell) return "experiences[].highlights[]";
    if (hasDateRange(text)) return "experiences[].dates";
    if (cellIndex === 0) return "experiences[].title";
    return "experiences[].company";
  }
  if (
    normalizedSection === "projects" ||
    normalizedSection === "academic projects"
  ) {
    if (isListCell) return "projects[].highlights[]";
    if (cellIndex === 0) return "projects[].name";
    return "projects[].description";
  }
  if (normalizedSection === "education") {
    if (hasDateRange(text)) return "education[].date";
    if (cellIndex === 0) return "education[].institution";
    if (
      /\b(B\.?S\.?|M\.?S\.?|BA|MA|PhD|Bachelor|Master|Doctor|Degree)\b/i.test(
        text,
      )
    ) {
      return "education[].degree";
    }
    return "education[].field";
  }
  return undefined;
}

function buildTemplateV3RepeatGroups(
  nodes: DocumentTemplateV3["regions"][number]["nodes"],
): DocumentTemplateV3["repeatGroups"] {
  const groups: DocumentTemplateV3["repeatGroups"] = [];
  const tables = nodes.filter(
    (node): node is TemplateTable => node.kind === "table",
  );
  for (const [tableIndex, table] of tables.entries()) {
    for (const collection of [
      "experiences",
      "projects",
      "education",
    ] as const) {
      const collectionRows = table.rows.filter((row) =>
        rowUsesCollection(row, collection),
      );
      if (!collectionRows.length) continue;
      const chunks = collectionRowChunks(collectionRows, collection);
      const rows = chunks[0] ?? collectionRows;
      const duplicateRows = new Set(
        chunks
          .slice(1)
          .flat()
          .map((row) => row.id),
      );
      if (duplicateRows.size) {
        table.rows = table.rows.filter((row) => !duplicateRows.has(row.id));
      }
      const id =
        tables.length === 1
          ? `repeat-${collection}`
          : `repeat-${collection}-${tableIndex + 1}`;
      for (const row of rows) row.repeatGroupId = id;
      groups.push({
        id,
        collection,
        nodeIds: rows.map((row) => row.id),
        emptyBehavior: "hide",
        sourceRefs: collectionRows
          .map((row) => row.sourceRef)
          .filter((ref): ref is NonNullable<typeof ref> => Boolean(ref)),
      });
    }
  }
  return groups;
}

function collectionRowChunks(
  rows: TemplateTableRow[],
  collection: "experiences" | "projects" | "education",
): TemplateTableRow[][] {
  const chunks: TemplateTableRow[][] = [];
  let current: TemplateTableRow[] = [];
  for (const row of rows) {
    if (rowStartsCollectionItem(row, collection) && current.length) {
      chunks.push(current);
      current = [];
    }
    current.push(row);
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function rowStartsCollectionItem(
  row: TemplateTableRow,
  collection: "experiences" | "projects" | "education",
): boolean {
  return row.cells.some((cell) =>
    cell.nodes.some((node) =>
      nodeUsesCollectionSlot(node, collection, { includeListSlots: false }),
    ),
  );
}

function rowUsesCollection(
  row: TemplateTableRow,
  collection: "experiences" | "projects" | "education",
): boolean {
  return row.cells.some((cell) =>
    cell.nodes.some((node) =>
      nodeUsesCollectionSlot(node, collection, { includeListSlots: true }),
    ),
  );
}

function nodeUsesCollectionSlot(
  node: TemplateNodeV3,
  collection: "experiences" | "projects" | "education",
  options: { includeListSlots: boolean },
): boolean {
  if (node.kind === "slot" && node.slotId.includes(collection)) return true;
  if (
    options.includeListSlots &&
    node.kind === "list" &&
    node.slotId?.includes(collection)
  ) {
    return true;
  }
  if (node.kind === "table") {
    return node.rows.some((row) => rowUsesCollection(row, collection));
  }
  if (node.kind === "row") return rowUsesCollection(node, collection);
  if (node.kind === "cell") {
    return node.nodes.some((child) =>
      nodeUsesCollectionSlot(child, collection, options),
    );
  }
  return false;
}

function rowRole(row: SourceBlock): TemplateTableRow["role"] {
  const text = row.text.trim();
  if (SECTION_NAMES.has(normalizeSectionName(text))) return "section-header";
  if (hasDateRange(text)) return "item-header";
  if (row.cells?.length === 1) return "compact-row";
  return undefined;
}

function sectionNameFromRow(row: SourceBlock): string {
  if (rowRole(row) !== "section-header") return "";
  return normalizeSectionName(row.cells?.[0] ?? row.text);
}

function sourceRefForBlock(block: SourceBlock) {
  return { sourceId: block.id, text: block.text };
}

function boxFromSourceBlock(block: SourceBlock) {
  return block.bbox
    ? {
        xPt: block.bbox.xPt,
        yPt: block.bbox.yPt,
        widthPt: block.bbox.widthPt,
        heightPt: block.bbox.heightPt,
      }
    : undefined;
}

function tokenForSlotPath(path: ResumeSlotPath): string {
  if (path === "contact.name") return "name";
  if (path.startsWith("contact.")) return "meta";
  if (path.includes(".dates") || path.includes(".date")) return "meta";
  return "body";
}

function tokenFromSourceStyle(
  style: SourceBlock["style"] | undefined,
  fallback: DocumentTemplateV3["tokens"][string],
): DocumentTemplateV3["tokens"][string] {
  return {
    fontFamily: style?.fontFamily ?? fallback.fontFamily,
    fontSize: style?.fontSizePt ? `${style.fontSizePt}pt` : fallback.fontSize,
    lineHeight: fallback.lineHeight,
    color: style?.color ?? fallback.color,
    fontWeight:
      style?.bold === undefined
        ? fallback.fontWeight
        : style.bold
          ? "700"
          : "400",
    textTransform: fallback.textTransform,
    letterSpacing: fallback.letterSpacing,
  };
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
    .replace(/[^\w\s/&-]/g, "")
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
  const marginTag = xml.match(/<w:pgMar\b[^>]*>/)?.[0] ?? "";
  const width = readNumberAttribute(tag, "w");
  const height = readNumberAttribute(tag, "h");
  return {
    id: "page-1",
    number: 1,
    widthPt: width ? width / 20 : 612,
    heightPt: height ? height / 20 : 792,
    margins: docxPageMargins(marginTag),
  };
}

function docxPageMargins(xml: string): BoxEdges | undefined {
  if (!xml) return undefined;
  const edge = (name: string) => {
    const value = readNumberAttribute(xml, name);
    return value === undefined ? undefined : `${roundPt(value / 20)}pt`;
  };
  const top = edge("top");
  const right = edge("right");
  const bottom = edge("bottom");
  const left = edge("left");
  return top && right && bottom && left
    ? { top, right, bottom, left }
    : undefined;
}

function latexPage(source: string): SourcePage {
  const a4 = /\ba4paper\b/i.test(source);
  return {
    id: "page-1",
    number: 1,
    widthPt: a4 ? 595 : 612,
    heightPt: a4 ? 842 : 792,
    margins: latexPageMargins(source),
  };
}

function latexPageMargins(source: string): BoxEdges | undefined {
  const geometryOptions = source.match(
    /\\usepackage\[((?:[^\]]|\][^\\])*)]\{geometry}/,
  )?.[1];
  const geometryCommand = source.match(/\\geometry\{([^}]*)}/)?.[1];
  const options = [geometryOptions, geometryCommand].filter(Boolean).join(",");
  if (!options) return undefined;

  const entries = new Map<string, string>();
  for (const part of options.split(",")) {
    const [rawKey, rawValue] = part.split("=");
    const key = rawKey?.trim().toLowerCase();
    const value = rawValue?.trim();
    if (key && value) entries.set(key, value);
  }
  const uniform = entries.get("margin");
  const horizontal = entries.get("hmargin");
  const vertical = entries.get("vmargin");
  const top = latexLengthToCssPt(
    entries.get("top") ?? entries.get("tmargin") ?? vertical ?? uniform,
  );
  const right = latexLengthToCssPt(
    entries.get("right") ?? entries.get("rmargin") ?? horizontal ?? uniform,
  );
  const bottom = latexLengthToCssPt(
    entries.get("bottom") ?? entries.get("bmargin") ?? vertical ?? uniform,
  );
  const left = latexLengthToCssPt(
    entries.get("left") ?? entries.get("lmargin") ?? horizontal ?? uniform,
  );
  return top && right && bottom && left
    ? { top, right, bottom, left }
    : undefined;
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

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function docxCellMetadata(
  xml: string,
  styles: Record<string, NonNullable<SourceBlock["style"]>>,
  relationships: Record<string, string>,
  context: {
    pageId: string;
    numbering: DocxNumberingMap;
    nextBlockId: () => string;
    nextTableId: () => string;
  },
) {
  const nestedTableXmls = extractDirectDocxElements(xml, "tbl");
  const textXml = removeXmlFragments(xml, nestedTableXmls);
  const widthTwips = readNumberAttribute(
    xml.match(/<w:tcW\b[^>]*>/)?.[0] ?? "",
    "w",
  );
  const gridSpan = readNumberAttribute(
    xml.match(/<w:gridSpan\b[^>]*>/)?.[0] ?? "",
    "val",
  );
  const verticalMerge = docxVerticalMerge(xml);
  const alignment = docxAlignment(xml);
  const borders = docxBorders(
    xml.match(/<w:tcBorders\b[\s\S]*?<\/w:tcBorders>/)?.[0] ?? "",
  );
  const fill = docxFill(xml);
  const padding = docxCellPadding(xml);
  const verticalAlign = docxVerticalAlign(xml);
  const blocks = docxCellBlocks(
    textXml,
    styles,
    relationships,
    context.numbering,
  );
  const nestedTables = nestedTableXmls
    .map((tableXml) =>
      parseDocxTableRows(
        tableXml,
        context.nextTableId(),
        context.pageId,
        styles,
        context.numbering,
        relationships,
        context.nextBlockId,
        context.nextTableId,
      ),
    )
    .filter((rows) => rows.length);
  const nestedText = nestedTables
    .flatMap((rows) => rows.map((row) => row.text))
    .filter(Boolean);
  const textParts = [...blocks.map((block) => block.text), ...nestedText];
  return {
    text: textParts.length ? textParts.join("\n") : xmlText(textXml),
    widthPt: widthTwips ? widthTwips / 20 : undefined,
    gridSpan: gridSpan && gridSpan > 1 ? gridSpan : undefined,
    verticalMerge,
    alignment,
    padding,
    borders,
    fill,
    verticalAlign,
    blocks,
    nestedTables,
  };
}

function removeXmlFragments(xml: string, fragments: string[]): string {
  return fragments.reduce((next, fragment) => next.replace(fragment, ""), xml);
}

function docxCellBlocks(
  xml: string,
  styles: Record<string, NonNullable<SourceBlock["style"]>>,
  relationships: Record<string, string>,
  numbering: DocxNumberingMap,
): SourceCellBlock[] {
  return Array.from(xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g))
    .map<SourceCellBlock | null>((paragraph, index) => {
      const paragraphXml = paragraph[0];
      const text = xmlText(paragraphXml);
      if (!text) return null;
      const styleId = paragraphXml.match(
        /<w:pStyle\b[^>]*w:val="([^"]+)"/,
      )?.[1];
      const style = mergeDocxStyle(
        styles[styleId ?? ""],
        docxParagraphStyle(paragraphXml),
        { styleId },
      );
      const href = firstDocxHyperlink(paragraphXml, relationships);
      const listMarker = docxListMarker(paragraphXml, numbering);
      return {
        id: `cell-block-${index + 1}`,
        type:
          isHeadingText(text) || /heading|title/i.test(styleId ?? "")
            ? "heading"
            : listMarker
              ? "list-item"
              : href
                ? "link"
                : "paragraph",
        text,
        href,
        listMarker,
        style,
        runs: docxInlineRuns(paragraphXml, relationships, style),
      };
    })
    .filter((block): block is SourceCellBlock => Boolean(block));
}

function docxInlineRuns(
  xml: string,
  relationships: Record<string, string>,
  paragraphStyle: SourceBlock["style"],
): SourceInlineRun[] {
  const runs: SourceInlineRun[] = [];
  for (const match of xml.matchAll(
    /<w:hyperlink\b[\s\S]*?<\/w:hyperlink>|<w:r\b[\s\S]*?<\/w:r>/g,
  )) {
    const fragment = match[0];
    const href = fragment.startsWith("<w:hyperlink")
      ? docxHyperlinkTarget(fragment, relationships)
      : undefined;
    const runXmls = fragment.startsWith("<w:hyperlink")
      ? Array.from(fragment.matchAll(/<w:r\b[\s\S]*?<\/w:r>/g)).map(
          (run) => run[0],
        )
      : [fragment];
    for (const runXml of runXmls) {
      const text = xmlText(runXml);
      if (!text) continue;
      runs.push({
        text,
        href,
        style: mergeDocxStyle(paragraphStyle, docxParagraphStyle(runXml)),
      });
    }
  }
  return runs;
}

function firstDocxHyperlink(
  xml: string,
  relationships: Record<string, string>,
): string | undefined {
  const hyperlink = xml.match(/<w:hyperlink\b[\s\S]*?<\/w:hyperlink>/)?.[0];
  return hyperlink ? docxHyperlinkTarget(hyperlink, relationships) : undefined;
}

function docxHyperlinkTarget(
  xml: string,
  relationships: Record<string, string>,
): string | undefined {
  const id = xml.match(/r:id="([^"]+)"/)?.[1];
  return id ? relationships[id] : undefined;
}

type DocxNumberingMap = Map<
  string,
  Map<string, "disc" | "decimal" | "dash" | "none">
>;

function parseDocxNumbering(xml: string): DocxNumberingMap {
  const abstractMarkers = new Map<
    string,
    Map<string, "disc" | "decimal" | "dash" | "none">
  >();
  for (const abstractMatch of xml.matchAll(
    /<w:abstractNum\b[\s\S]*?<\/w:abstractNum>/g,
  )) {
    const abstractXml = abstractMatch[0];
    const abstractId = abstractXml.match(/w:abstractNumId="([^"]+)"/)?.[1];
    if (!abstractId) continue;
    const levels = new Map<string, "disc" | "decimal" | "dash" | "none">();
    for (const levelMatch of abstractXml.matchAll(
      /<w:lvl\b[\s\S]*?<\/w:lvl>/g,
    )) {
      const levelXml = levelMatch[0];
      const ilvl = levelXml.match(/w:ilvl="([^"]+)"/)?.[1] ?? "0";
      const format = levelXml.match(/<w:numFmt\b[^>]*w:val="([^"]+)"/)?.[1];
      levels.set(ilvl, docxNumberFormatMarker(format));
    }
    abstractMarkers.set(abstractId, levels);
  }

  const numbering = new Map<
    string,
    Map<string, "disc" | "decimal" | "dash" | "none">
  >();
  for (const numMatch of xml.matchAll(/<w:num\b[\s\S]*?<\/w:num>/g)) {
    const numXml = numMatch[0];
    const numId = numXml.match(/w:numId="([^"]+)"/)?.[1];
    const abstractId = numXml.match(
      /<w:abstractNumId\b[^>]*w:val="([^"]+)"/,
    )?.[1];
    if (numId && abstractId) {
      numbering.set(numId, abstractMarkers.get(abstractId) ?? new Map());
    }
  }
  return numbering;
}

function docxNumberFormatMarker(
  format: string | undefined,
): "disc" | "decimal" | "dash" | "none" {
  if (format === "decimal") return "decimal";
  if (format === "none") return "none";
  return "disc";
}

function docxListMarker(
  xml: string,
  numbering: DocxNumberingMap,
): "disc" | "decimal" | "dash" | "none" | undefined {
  const numPr = xml.match(/<w:numPr\b[\s\S]*?<\/w:numPr>/)?.[0] ?? "";
  if (!numPr) return undefined;
  const numId = numPr.match(/<w:numId\b[^>]*w:val="([^"]+)"/)?.[1];
  const ilvl = numPr.match(/<w:ilvl\b[^>]*w:val="([^"]+)"/)?.[1] ?? "0";
  return numId ? (numbering.get(numId)?.get(ilvl) ?? "disc") : "disc";
}

function parseDocxRelationships(xml: string): Record<string, string> {
  const relationships: Record<string, string> = {};
  for (const rel of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const tag = rel[0];
    const id = tag.match(/\bId="([^"]+)"/)?.[1];
    const target = tag.match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target) relationships[id] = decodeXmlEntities(target);
  }
  return relationships;
}

function readNumberAttribute(tag: string, name: string): number | undefined {
  const match = tag.match(new RegExp(`w:${name}="([0-9.]+)"`));
  return match ? Number(match[1]) : undefined;
}

function docxTableMetadata(
  id: string,
  xml: string,
  gridWidths: number[],
): SourceTableMetadata {
  const properties = xml.match(/<w:tblPr\b[\s\S]*?<\/w:tblPr>/)?.[0] ?? "";
  const widthTwips = readNumberAttribute(
    properties.match(/<w:tblW\b[^>]*>/)?.[0] ?? "",
    "w",
  );
  return {
    id,
    widthPt: widthTwips ? widthTwips / 20 : undefined,
    alignment: docxTableAlignment(properties),
    columns: gridWidths.length ? gridWidths : undefined,
    padding: docxTableCellPadding(properties),
    borders: docxBorders(
      properties.match(/<w:tblBorders\b[\s\S]*?<\/w:tblBorders>/)?.[0] ?? "",
    ),
    fill: docxFill(properties),
  };
}

function docxTableRowMetadata(xml: string): SourceTableRowMetadata | undefined {
  const properties = xml.match(/<w:trPr\b[\s\S]*?<\/w:trPr>/)?.[0] ?? "";
  if (!properties) return undefined;
  const heightTwips = readNumberAttribute(
    properties.match(/<w:trHeight\b[^>]*>/)?.[0] ?? "",
    "val",
  );
  const metadata: SourceTableRowMetadata = {
    heightPt: heightTwips ? heightTwips / 20 : undefined,
    borders: docxBorders(
      properties.match(/<w:trBorders\b[\s\S]*?<\/w:trBorders>/)?.[0] ?? "",
    ),
    fill: docxFill(properties),
  };
  return metadata.heightPt || metadata.borders || metadata.fill
    ? metadata
    : undefined;
}

function docxTableAlignment(
  xml: string,
): SourceTableMetadata["alignment"] | undefined {
  const value = xml.match(/<w:jc\b[^>]*w:val="([^"]+)"/)?.[1];
  if (value === "center") return "center";
  if (value === "right" || value === "end") return "right";
  if (value === "left" || value === "start") return "left";
  return undefined;
}

function docxTableCellPadding(xml: string): BoxEdges | undefined {
  const marginXml = xml.match(/<w:tblCellMar\b[\s\S]*?<\/w:tblCellMar>/)?.[0];
  return marginXml ? docxMarginEdges(marginXml) : undefined;
}

function docxCellPadding(xml: string): BoxEdges | undefined {
  const marginXml = xml.match(/<w:tcMar\b[\s\S]*?<\/w:tcMar>/)?.[0] ?? "";
  return marginXml ? docxMarginEdges(marginXml) : undefined;
}

function docxMarginEdges(xml: string): BoxEdges {
  const edge = (name: string) => {
    const tag = xml.match(new RegExp(`<w:${name}\\b[^>]*>`))?.[0] ?? "";
    const value = readNumberAttribute(tag, "w");
    return value ? `${roundPt(value / 20)}pt` : "0pt";
  };
  return {
    top: edge("top"),
    right: edge("right"),
    bottom: edge("bottom"),
    left: edge("left"),
  };
}

function docxFill(xml: string): { color: string } | undefined {
  const value = xml.match(/<w:shd\b[^>]*w:fill="([0-9A-Fa-f]{6})"/)?.[1];
  return value ? { color: `#${value}` } : undefined;
}

function docxVerticalAlign(
  xml: string,
): "top" | "middle" | "bottom" | undefined {
  const value = xml.match(/<w:vAlign\b[^>]*w:val="([^"]+)"/)?.[1];
  if (value === "center") return "middle";
  if (value === "bottom") return "bottom";
  return value === "top" ? "top" : undefined;
}

function docxVerticalMerge(xml: string): "restart" | "continue" | undefined {
  const tag = xml.match(/<w:vMerge\b[^>]*(?:\/>|><\/w:vMerge>)/)?.[0] ?? "";
  if (!tag) return undefined;
  const value = tag.match(/w:val="([^"]+)"/)?.[1];
  return value === "restart" ? "restart" : "continue";
}

function docxBorders(xml: string): BorderSet | undefined {
  if (!xml) return undefined;
  const sides = {
    top: docxBorderSide(xml, "top"),
    right: docxBorderSide(xml, "right"),
    bottom: docxBorderSide(xml, "bottom"),
    left: docxBorderSide(xml, "left"),
    insideH: docxBorderSide(xml, "insideH"),
    insideV: docxBorderSide(xml, "insideV"),
  };
  return Object.values(sides).some(Boolean) ? sides : undefined;
}

function docxBorderSide(
  xml: string,
  side: keyof BorderSet,
): BorderSet[keyof BorderSet] {
  const tag = xml.match(new RegExp(`<w:${side}\\b[^>]*>`))?.[0] ?? "";
  if (!tag) return undefined;
  const val = tag.match(/w:val="([^"]+)"/)?.[1] ?? "single";
  const size = readNumberAttribute(tag, "sz");
  const color = tag.match(/w:color="([0-9A-Fa-f]{6})"/)?.[1];
  return {
    widthPt: size ? size / 8 : 0.5,
    color: color ? `#${color}` : "#000000",
    style:
      val === "dashed"
        ? "dashed"
        : val === "dotted"
          ? "dotted"
          : val === "double"
            ? "double"
            : val === "nil" || val === "none"
              ? "none"
              : "solid",
  };
}

function roundPt(value: number): number {
  return Math.round(value * 100) / 100;
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
    italic: docxItalic(rPr),
    fontSizePt: docxFontSizePt(rPr),
    fontFamily: docxFontFamily(rPr),
    color: docxColor(rPr),
    lineHeight: docxLineHeight(xml),
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

function docxItalic(xml: string): boolean | undefined {
  const tag = xml.match(/<w:i\b[^>]*\/>|<w:i\b[^>]*>/)?.[0];
  if (!tag) return undefined;
  return !/w:val="(?:0|false)"/.test(tag);
}

function docxLineHeight(xml: string): string | undefined {
  const tag = xml.match(/<w:spacing\b[^>]*>/)?.[0] ?? "";
  const line = readNumberAttribute(tag, "line");
  if (!line) return undefined;
  const lineRule = tag.match(/w:lineRule="([^"]+)"/)?.[1];
  if (!lineRule || lineRule === "auto") {
    return `${Math.round((line / 240) * 100) / 100}`;
  }
  return `${Math.round((line / 20) * 100) / 100}pt`;
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

function representativeStyle(
  blocks: SourceBlock[],
): SourceBlock["style"] | undefined {
  const sizes = blocks
    .map((block) => block.style?.fontSizePt)
    .filter((size): size is number => typeof size === "number" && size > 0)
    .sort((a, b) => a - b);
  const fontSizePt = sizes.length
    ? sizes[Math.floor((sizes.length - 1) / 2)]
    : undefined;
  const base = blocks.find(
    (block) =>
      block.style &&
      (fontSizePt === undefined || block.style.fontSizePt === fontSizePt),
  )?.style;
  return base
    ? {
        ...base,
        fontSizePt,
      }
    : undefined;
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
      (name.endsWith(".xml") || name.endsWith(".rels"))
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

    if (name.endsWith(".xml") || name.endsWith(".rels")) {
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
