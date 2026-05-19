import fs from "fs/promises";
import os from "os";
import path from "path";
import { inflateRawSync } from "zlib";
import { detectSections } from "@/lib/parser/section-detector";
import { extractTextFromFile } from "@/lib/parser/pdf";
import {
  analyzeTemplateWithLLM,
  type AnalyzedTemplate,
} from "@/lib/resume/template-analyzer";
import type { LLMClient } from "@/lib/llm/client";
import {
  mergeAnalyzedAndSignals,
  type ImportedTemplate,
  type TemplateStyleSignals,
} from "./template-schema";

export interface ExtractTemplateOptions {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  llmClient?: LLMClient | null;
}

export interface ExtractTemplateResult {
  template: ImportedTemplate;
  warnings: string[];
  confidence: "high" | "medium" | "low";
  sectionsFound: string[];
}

export type TemplateSourceType = "pdf" | "docx" | "tex";

const DEFAULT_ANALYZED_TEMPLATE: AnalyzedTemplate = {
  styles: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: "11pt",
    headerSize: "20pt",
    sectionHeaderSize: "12pt",
    lineHeight: "1.4",
    accentColor: "#333333",
    layout: "single-column",
    headerStyle: "left",
    bulletStyle: "disc",
    sectionDivider: "line",
  },
  charsPerLine: 80,
  margins: {
    top: "0.5in",
    bottom: "0.5in",
    left: "0.75in",
    right: "0.75in",
  },
  sectionGap: "16px",
};

export function getTemplateSourceType(
  filename: string,
  mimeType?: string,
): TemplateSourceType | null {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() ?? "";
  if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) return "pdf";
  if (
    lowerName.endsWith(".docx") ||
    lowerMime.includes("wordprocessingml.document")
  ) {
    return "docx";
  }
  if (
    lowerName.endsWith(".tex") ||
    lowerMime.includes("text/x-tex") ||
    lowerMime.includes("application/x-tex")
  ) {
    return "tex";
  }
  return null;
}

export async function extractTemplateFromFile({
  buffer,
  filename,
  mimeType,
  llmClient = null,
}: ExtractTemplateOptions): Promise<ExtractTemplateResult> {
  const sourceType = getTemplateSourceType(filename, mimeType);
  if (!sourceType) {
    throw new Error("Unsupported template file type");
  }

  const warnings: string[] = [];
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "slothing-template-"),
  );
  const tempFile = path.join(tempDir, `template.${sourceType}`);

  try {
    await fs.writeFile(tempFile, buffer);
    const text = await extractTemplateText(buffer, tempFile, sourceType);

    if (text.length < 25) {
      warnings.push(
        "We could not extract much text from this file, so the template uses default resume styling.",
      );
    }

    const analyzed =
      text.length >= 25
        ? await analyzeTemplateWithLLM(text, llmClient)
        : DEFAULT_ANALYZED_TEMPLATE;
    const sections = text.length >= 25 ? detectSections(text) : [];

    if (sections.length === 0) {
      warnings.push(
        "We couldn't detect distinct resume sections. You can still save the template and tune it in the editor.",
      );
    }

    const signals =
      sourceType === "docx"
        ? extractDocxStyleSignals(buffer)
        : sourceType === "tex"
          ? extractLatexStyleSignals(buffer.toString("utf8"))
          : extractPdfStyleSignals(buffer);
    const detectedSections = sections.map((section) => ({
      type: section.type,
      label: section.type,
    }));
    const template = mergeAnalyzedAndSignals(analyzed, signals, {
      detectedSections,
      source: { filename, type: sourceType },
    });
    warnings.push(...buildDefaultWarnings(template, signals));
    const confidence = getImportConfidence(text, sections.length, signals);

    return {
      template,
      warnings,
      confidence,
      sectionsFound: detectedSections.map((section) => section.label),
    };
  } finally {
    await fs.rm(tempDir, { force: true, recursive: true });
  }
}

async function extractTemplateText(
  buffer: Buffer,
  tempFile: string,
  sourceType: TemplateSourceType,
): Promise<string> {
  if (sourceType === "tex") {
    return latexToText(buffer.toString("utf8")).trim();
  }
  if (sourceType === "pdf") {
    const positionedText = await extractPdfTextFromPositions(buffer);
    if (positionedText.length >= 25) return positionedText;
  }
  const extractedText = (await extractTextFromFile(tempFile)).trim();
  if (sourceType === "docx" && extractedText.length < 25) {
    return extractDocxTextFromXml(buffer);
  }
  return extractedText;
}

async function extractPdfTextFromPositions(buffer: Buffer): Promise<string> {
  try {
    const { extractPdfPositions } = await import("@/lib/parse/pdf-positions");
    const positioned = await extractPdfPositions(buffer, {
      includeJunk: false,
    });
    const pages = positioned.pageDimensions.map((page) => page.page);
    const text = pages
      .map((page) => {
        const items = positioned.items.filter((item) => item.page === page);
        const lines: Array<{ y: number; text: string[] }> = [];
        for (const item of items) {
          const line = lines.find(
            (candidate) =>
              Math.abs(candidate.y - item.y0) < Math.max(4, item.y1 - item.y0),
          );
          if (line) {
            line.text.push(item.text);
          } else {
            lines.push({ y: item.y0, text: [item.text] });
          }
        }
        return lines.map((line) => joinPositionedText(line.text)).join("\n");
      })
      .join("\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    return text;
  } catch {
    return "";
  }
}

function joinPositionedText(items: string[]): string {
  return items.join("").replace(/\s+/g, " ").trim();
}

function latexToText(source: string): string {
  return source
    .replace(/%.*$/gm, "")
    .replace(/\\(section|subsection|subsubsection)\*?\{([^}]*)\}/g, "\n$2\n")
    .replace(/\\item(?:\[[^\]]+])?\s*/g, "\n- ")
    .replace(/\\(textbf|textit|emph|underline|href|url)\*?\{([^}]*)\}/g, "$2")
    .replace(
      /\\begin\{(center|flushleft|flushright|itemize|enumerate)\}/g,
      "\n",
    )
    .replace(/\\end\{(center|flushleft|flushright|itemize|enumerate)\}/g, "\n")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*])?(?:\{[^}]*\})?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/~/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function extractDocxStyleSignals(buffer: Buffer): TemplateStyleSignals {
  const entries = readZipTextEntries(buffer);
  const documentXml = entries["word/document.xml"] ?? buffer.toString("utf8");
  const stylesXml = entries["word/styles.xml"] ?? "";
  const numberingXml = entries["word/numbering.xml"] ?? "";
  const xml = `${stylesXml}\n${documentXml}\n${numberingXml}`;
  const margins = extractDocxMargins(documentXml);
  const pageSize = extractDocxPageSize(documentXml);
  const font = extractDocxFont(xml);
  const accentColor = extractDocxAccentColor(xml);
  const sizes = extractDocxSizes(xml);
  const fallback = inferDocxFallbackSignals(documentXml);

  return {
    pageSize: pageSize ?? fallback.pageSize,
    margins: margins ?? fallback.margins,
    styles: {
      ...fallback.styles,
      ...(font ? { fontFamily: font } : {}),
      ...(accentColor ? { accentColor } : {}),
      ...sizes,
      ...extractDocxLayoutSignals(documentXml),
      ...extractDocxBulletSignals(numberingXml),
      ...extractDocxSectionSignals(xml),
    },
  };
}

function extractDocxTextFromXml(buffer: Buffer): string {
  const documentXml = readZipTextEntries(buffer)["word/document.xml"];
  if (!documentXml) return "";
  return documentXml
    .replace(/<w:tab\/>/g, " | ")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferDocxFallbackSignals(documentXml: string): TemplateStyleSignals {
  if (!/<w:document\b|<document\b/.test(documentXml)) return {};
  return {
    pageSize: "letter",
    margins: {
      top: "1in",
      right: "1in",
      bottom: "1in",
      left: "1in",
    },
    styles: {
      fontFamily: "Aptos, Calibri, Arial, sans-serif",
      fontSize: "11pt",
      headerSize: "20pt",
      sectionHeaderSize: "12pt",
      lineHeight: "1.35",
      layout: "single-column",
      headerStyle: "left",
      bulletStyle: "disc",
      sectionDivider: "line",
    },
  };
}

function extractPdfStyleSignals(buffer: Buffer): TemplateStyleSignals {
  const raw = buffer.toString("latin1");
  return {
    pageSize: extractPdfPageSize(raw),
    styles: {
      ...extractPdfFontSignals(raw),
      ...extractPdfColorSignals(raw),
      ...extractPdfSizeSignals(raw),
    },
  };
}

function extractDocxMargins(
  xml: string,
): TemplateStyleSignals["margins"] | undefined {
  const marginMatch = xml.match(/<w:pgMar\b[^>]*>/);
  if (!marginMatch) return undefined;
  const tag = marginMatch[0];
  const top = readTwipsAttribute(tag, "top");
  const bottom = readTwipsAttribute(tag, "bottom");
  const left = readTwipsAttribute(tag, "left");
  const right = readTwipsAttribute(tag, "right");

  return {
    ...(top ? { top } : {}),
    ...(bottom ? { bottom } : {}),
    ...(left ? { left } : {}),
    ...(right ? { right } : {}),
  };
}

function extractDocxPageSize(xml: string): string | undefined {
  const sizeMatch = xml.match(/<w:pgSz\b[^>]*>/);
  if (!sizeMatch) return undefined;
  const width = readNumberAttribute(sizeMatch[0], "w");
  const height = readNumberAttribute(sizeMatch[0], "h");
  if (!width || !height) return undefined;

  const min = Math.min(width, height);
  const max = Math.max(width, height);
  if (Math.abs(min - 12240) < 120 && Math.abs(max - 15840) < 120) {
    return "letter";
  }
  if (Math.abs(min - 11906) < 120 && Math.abs(max - 16838) < 120) {
    return "a4";
  }
  return `${width}x${height}twip`;
}

function extractDocxFont(xml: string): string | undefined {
  const fontMatch = xml.match(/w:(?:ascii|hAnsi)="([^"]+)"/);
  return fontMatch?.[1] ? `"${fontMatch[1]}", Arial, sans-serif` : undefined;
}

function extractDocxAccentColor(xml: string): string | undefined {
  const colorMatch =
    xml.match(/<w:color\b[^>]*w:val="([0-9A-Fa-f]{6})"/) ??
    xml.match(/w:color="([0-9A-Fa-f]{6})"/);
  return colorMatch?.[1] ? `#${colorMatch[1]}` : undefined;
}

function extractDocxSizes(
  xml: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const values = Array.from(xml.matchAll(/w:sz(?:Cs)? w:val="(\d+)"/g))
    .map((match) => Number(match[1]) / 2)
    .filter((value) => value >= 6 && value <= 40)
    .sort((a, b) => a - b);
  if (values.length === 0) return {};

  const body = values[Math.floor(values.length / 2)];
  const largest = values[values.length - 1];
  const section =
    values.find((value) => value > body) ?? Math.min(body + 1, 14);
  return {
    fontSize: `${body}pt`,
    headerSize: `${largest}pt`,
    sectionHeaderSize: `${section}pt`,
  };
}

function extractDocxLayoutSignals(
  xml: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const cols = xml.match(/<w:cols\b[^>]*w:num="(\d+)"/);
  const headerStyle = /<w:jc\b[^>]*w:val="center"/.test(xml.slice(0, 4000))
    ? "centered"
    : undefined;
  return {
    ...(cols?.[1] && Number(cols[1]) >= 2 ? { layout: "two-column" } : {}),
    ...(headerStyle ? { headerStyle } : {}),
  };
}

function extractDocxBulletSignals(
  numberingXml: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const bulletGlyph = numberingXml.match(
    /<w:lvlText\b[^>]*w:val="([^"]+)"/,
  )?.[1];
  if (!bulletGlyph) return {};
  if (/[-–—]/.test(bulletGlyph)) return { bulletStyle: "dash" };
  if (/[>→▸]/.test(bulletGlyph)) return { bulletStyle: "arrow" };
  if (/^$/.test(bulletGlyph)) return { bulletStyle: "none" };
  return { bulletStyle: "disc" };
}

function extractDocxSectionSignals(
  xml: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  return {
    ...(/<w:pBdr\b|<w:bottom\b/.test(xml) ? { sectionDivider: "line" } : {}),
    ...(/w:b="1"|<w:b\/>/.test(xml) ? { sectionHeaderSize: "12pt" } : {}),
  };
}

function extractLatexStyleSignals(source: string): TemplateStyleSignals {
  const clean = source.replace(/%.*$/gm, "");
  const documentOptions =
    clean.match(/\\documentclass(?:\[([^\]]+)])?\{([^}]+)\}/)?.[1] ?? "";
  const pageSize = extractLatexPageSize(clean, documentOptions);
  const margins = extractLatexMargins(clean);
  const fontSize = documentOptions.match(/\b(10|11|12)pt\b/)?.[0];
  const font = extractLatexFont(clean);
  const accentColor = extractLatexAccentColor(clean);

  return {
    pageSize,
    margins,
    styles: {
      ...(font ? { fontFamily: font } : {}),
      ...(fontSize ? { fontSize } : {}),
      ...extractLatexSizeSignals(clean, fontSize),
      ...(accentColor ? { accentColor } : {}),
      ...extractLatexLayoutSignals(clean),
      ...extractLatexBulletSignals(clean),
      ...extractLatexSectionSignals(clean),
    },
  };
}

function extractLatexPageSize(
  source: string,
  documentOptions: string,
): string | undefined {
  if (/\ba4paper\b/i.test(documentOptions) || /\ba4paper\b/i.test(source)) {
    return "a4";
  }
  if (
    /\bletterpaper\b/i.test(documentOptions) ||
    /\bletterpaper\b/i.test(source)
  ) {
    return "letter";
  }
  return undefined;
}

function extractLatexMargins(
  source: string,
): TemplateStyleSignals["margins"] | undefined {
  const options = [
    ...Array.from(
      source.matchAll(/\\usepackage\[([^\]]+)]\{geometry\}/g),
      (match) => match[1],
    ),
    ...Array.from(
      source.matchAll(/\\geometry\{([^}]+)\}/g),
      (match) => match[1],
    ),
  ].join(",");
  if (!options) return undefined;

  const margin = readLatexLengthOption(options, "margin");
  return {
    top: readLatexLengthOption(options, "top") ?? margin,
    bottom: readLatexLengthOption(options, "bottom") ?? margin,
    left:
      readLatexLengthOption(options, "left") ??
      readLatexLengthOption(options, "lmargin") ??
      margin,
    right:
      readLatexLengthOption(options, "right") ??
      readLatexLengthOption(options, "rmargin") ??
      margin,
  };
}

function readLatexLengthOption(
  options: string,
  name: string,
): string | undefined {
  const match = options.match(
    new RegExp(`(?:^|,)\\s*${name}\\s*=\\s*([0-9.]+\\s*(?:in|cm|mm|pt))`, "i"),
  );
  return match?.[1]?.replace(/\s+/g, "");
}

function extractLatexFont(source: string): string | undefined {
  const mainFont = source.match(/\\setmainfont\{([^}]+)\}/)?.[1];
  if (mainFont) return `"${mainFont}", Arial, sans-serif`;
  const sansFont = source.match(/\\setsansfont\{([^}]+)\}/)?.[1];
  if (sansFont) return `"${sansFont}", Arial, sans-serif`;
  if (/\\usepackage(?:\[[^\]]+])?\{[^}]*helvet[^}]*\}/i.test(source)) {
    return "Helvetica, Arial, sans-serif";
  }
  if (
    /\\usepackage(?:\[[^\]]+])?\{[^}]*(times|mathptmx|newtxtext)[^}]*\}/i.test(
      source,
    )
  ) {
    return "Times New Roman, Times, serif";
  }
  if (/\\usepackage(?:\[[^\]]+])?\{[^}]*charter[^}]*\}/i.test(source)) {
    return "Charter, Georgia, serif";
  }
  if (
    /\\usepackage(?:\[[^\]]+])?\{[^}]*(lmodern|moderncv)[^}]*\}/i.test(source)
  ) {
    return "Latin Modern, Computer Modern, serif";
  }
  return undefined;
}

function extractLatexSizeSignals(
  source: string,
  fontSize?: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const headerSize = /\\Huge\b/.test(source)
    ? "24pt"
    : /\\huge\b/.test(source)
      ? "22pt"
      : /\\LARGE\b/.test(source)
        ? "20pt"
        : undefined;
  const sectionHeaderSize =
    /\\titleformat\{\\section\}\{[^}]*(\\Large|\\large)/.test(source)
      ? "14pt"
      : /\\titleformat\{\\section\}\{[^}]*(\\normalsize)/.test(source)
        ? fontSize
        : undefined;
  return {
    ...(headerSize ? { headerSize } : {}),
    ...(sectionHeaderSize ? { sectionHeaderSize } : {}),
    ...(/\\linespread\{([0-9.]+)\}/.test(source)
      ? { lineHeight: source.match(/\\linespread\{([0-9.]+)\}/)![1] }
      : {}),
  };
}

function extractLatexAccentColor(source: string): string | undefined {
  const htmlColor = source.match(
    /\\definecolor\{[^}]+\}\{HTML\}\{([0-9A-Fa-f]{6})\}/,
  )?.[1];
  if (htmlColor) return `#${htmlColor}`;

  const rgb = source.match(
    /\\definecolor\{[^}]+\}\{rgb\}\{([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\}/,
  );
  if (rgb) {
    const [, r, g, b] = rgb;
    return rgbToHex(Number(r), Number(g), Number(b));
  }
  return undefined;
}

function extractLatexLayoutSignals(
  source: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  return {
    ...(/\\begin\{(?:multicols|paracol)\}\{2\}|\\twocolumn\b|\\begin\{minipage\}/.test(
      source,
    )
      ? { layout: "two-column" }
      : {}),
    ...(/\\begin\{center\}|\\centering\b/.test(source.slice(0, 3000))
      ? { headerStyle: "centered" }
      : /\\begin\{flushleft\}|\\raggedright\b/.test(source.slice(0, 3000))
        ? { headerStyle: "left" }
        : {}),
  };
}

function extractLatexBulletSignals(
  source: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const label =
    source.match(/\\begin\{itemize\}\[label=([^\]]+)]/)?.[1] ??
    source.match(/\\renewcommand\{\\labelitemi\}\{([^}]+)\}/)?.[1];
  if (!label) return {};
  if (/--|-|\\textendash|\\textemdash/.test(label))
    return { bulletStyle: "dash" };
  if (/\\rightarrow|\\triangleright|>|→|▸/.test(label)) {
    return { bulletStyle: "arrow" };
  }
  if (/none|\\relax/.test(label)) return { bulletStyle: "none" };
  return { bulletStyle: "disc" };
}

function extractLatexSectionSignals(
  source: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  return {
    ...(/\\titlerule|\\hrule|\\rule\{/.test(source)
      ? { sectionDivider: "line" }
      : /\\titlespacing\*?\{\\section\}\{[^}]*\}\{[^}]*\}\{0/.test(source)
        ? { sectionDivider: "space" }
        : {}),
  };
}

function extractPdfPageSize(raw: string): string | undefined {
  const mediaBox = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)/);
  if (!mediaBox) return undefined;
  const width = Number(mediaBox[1]);
  const height = Number(mediaBox[2]);
  const min = Math.min(width, height);
  const max = Math.max(width, height);
  if (Math.abs(min - 612) < 8 && Math.abs(max - 792) < 8) return "letter";
  if (Math.abs(min - 595) < 8 && Math.abs(max - 842) < 8) return "a4";
  return `${Math.round(width)}x${Math.round(height)}pt`;
}

function extractPdfFontSignals(
  raw: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const fontName = raw.match(
    /\/(?:BaseFont|FontName)\s*\/([A-Za-z0-9,+-]+)/,
  )?.[1];
  if (!fontName) return {};
  const normalized = fontName.replace(/^[A-Z]{6}\+/, "").replace(/-/g, " ");
  return { fontFamily: `${normalized}, Arial, sans-serif` };
}

function extractPdfColorSignals(
  raw: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const color = raw.match(/([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+(?:rg|RG)\b/);
  if (!color) return {};
  return {
    accentColor: rgbToHex(Number(color[1]), Number(color[2]), Number(color[3])),
  };
}

function extractPdfSizeSignals(
  raw: string,
): Partial<NonNullable<TemplateStyleSignals["styles"]>> {
  const sizes = Array.from(raw.matchAll(/\s([0-9]{1,2}(?:\.[0-9]+)?)\s+Tf\b/g))
    .map((match) => Number(match[1]))
    .filter((value) => value >= 6 && value <= 40)
    .sort((a, b) => a - b);
  if (sizes.length === 0) return {};
  const body = sizes[Math.floor(sizes.length / 2)];
  const largest = sizes[sizes.length - 1];
  return {
    fontSize: `${body}pt`,
    headerSize: `${largest}pt`,
    sectionHeaderSize: `${Math.max(body + 1, Math.min(largest, 14))}pt`,
  };
}

function readZipTextEntries(buffer: Buffer): Record<string, string> {
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
        // Ignore malformed ZIP entries and keep any entries already recovered.
      }
    }
    offset = Math.max(dataEnd, dataStart + 1);
  }
  return entries;
}

function rgbToHex(r: number, g: number, b: number): string {
  const channel = (value: number) => {
    const normalized = value <= 1 ? value * 255 : value;
    return Math.max(0, Math.min(255, Math.round(normalized)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function buildDefaultWarnings(
  template: ImportedTemplate,
  signals: TemplateStyleSignals,
): string[] {
  const defaultsUsed: string[] = [];
  if (
    !signals.styles?.fontFamily &&
    template.styles.fontFamily === DEFAULT_ANALYZED_TEMPLATE.styles.fontFamily
  ) {
    defaultsUsed.push("font family");
  }
  if (
    !signals.styles?.fontSize &&
    template.styles.fontSize === DEFAULT_ANALYZED_TEMPLATE.styles.fontSize
  ) {
    defaultsUsed.push("body font size");
  }
  if (
    !signals.styles?.headerSize &&
    template.styles.headerSize === DEFAULT_ANALYZED_TEMPLATE.styles.headerSize
  ) {
    defaultsUsed.push("header size");
  }
  if (
    !signals.styles?.sectionHeaderSize &&
    template.styles.sectionHeaderSize ===
      DEFAULT_ANALYZED_TEMPLATE.styles.sectionHeaderSize
  ) {
    defaultsUsed.push("section header size");
  }
  if (
    !signals.styles?.accentColor &&
    template.styles.accentColor === DEFAULT_ANALYZED_TEMPLATE.styles.accentColor
  ) {
    defaultsUsed.push("accent color");
  }
  if (
    !signals.styles?.lineHeight &&
    template.styles.lineHeight === DEFAULT_ANALYZED_TEMPLATE.styles.lineHeight
  ) {
    defaultsUsed.push("line height");
  }
  if (
    !signals.styles?.layout &&
    template.styles.layout === DEFAULT_ANALYZED_TEMPLATE.styles.layout
  ) {
    defaultsUsed.push("layout");
  }
  if (
    !signals.styles?.headerStyle &&
    template.styles.headerStyle === DEFAULT_ANALYZED_TEMPLATE.styles.headerStyle
  ) {
    defaultsUsed.push("header alignment");
  }
  if (
    !signals.styles?.bulletStyle &&
    template.styles.bulletStyle === DEFAULT_ANALYZED_TEMPLATE.styles.bulletStyle
  ) {
    defaultsUsed.push("bullet style");
  }
  if (
    !signals.styles?.sectionDivider &&
    template.styles.sectionDivider ===
      DEFAULT_ANALYZED_TEMPLATE.styles.sectionDivider
  ) {
    defaultsUsed.push("section divider");
  }
  if (!signals.margins) {
    defaultsUsed.push("page margins");
  }
  if (!signals.pageSize) {
    defaultsUsed.push("page size");
  }
  if (defaultsUsed.length === 0) return [];
  return [
    `Some optional style details were not explicit in the file, so common defaults were used for ${formatList(defaultsUsed)}.`,
  ];
}

function getImportConfidence(
  text: string,
  sectionCount: number,
  signals: TemplateStyleSignals,
): "high" | "medium" | "low" {
  const signalCount =
    Object.keys(signals.styles ?? {}).length +
    Object.keys(signals.margins ?? {}).filter(
      (key) =>
        signals.margins?.[
          key as keyof NonNullable<TemplateStyleSignals["margins"]>
        ],
    ).length +
    (signals.pageSize ? 1 : 0);
  if (text.length >= 100 && signalCount >= 6) return "high";
  if (text.length >= 50 && (signalCount >= 3 || sectionCount >= 1))
    return "medium";
  return "low";
}

function formatList(values: string[]): string {
  if (values.length <= 1) return values.join("");
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function readNumberAttribute(tag: string, name: string): number | null {
  const match = tag.match(new RegExp(`w:${name}="(\\d+)"`));
  return match?.[1] ? Number(match[1]) : null;
}

function readTwipsAttribute(tag: string, name: string): string | null {
  const value = readNumberAttribute(tag, name);
  if (!value) return null;
  return `${Number(value / 1440)
    .toFixed(2)
    .replace(/\.?0+$/, "")}in`;
}
