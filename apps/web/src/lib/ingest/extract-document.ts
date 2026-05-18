import { extractTextFromDocx } from "@/lib/parser/pdf";
import { buildPdfSourceMap } from "./pdf-source-map";
import type {
  DocumentSourceMap,
  SourceBbox,
  SourceLine,
  SourceMapPage,
  SourceToken,
} from "./types";

export const PDF_SOURCE_MAP_EXTRACTOR_VERSION = "pdf-source-map-v1";
export const DOCX_SOURCE_MAP_EXTRACTOR_VERSION = "docx-source-map-v1";
export const TEXT_SOURCE_MAP_EXTRACTOR_VERSION = "text-source-map-v1";

export interface ExtractDocumentSourceMapInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface ExtractDocumentSourceMapResult {
  sourceMap: DocumentSourceMap;
  extractorVersion: string;
  links: [];
  ocrUsed: boolean;
}

function isPdf(
  input: Pick<ExtractDocumentSourceMapInput, "filename" | "mimeType">,
) {
  return (
    input.mimeType === "application/pdf" ||
    input.filename.toLowerCase().endsWith(".pdf")
  );
}

function isDocx(
  input: Pick<ExtractDocumentSourceMapInput, "filename" | "mimeType">,
) {
  return (
    input.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    input.filename.toLowerCase().endsWith(".docx")
  );
}

function isText(
  input: Pick<ExtractDocumentSourceMapInput, "filename" | "mimeType">,
) {
  return (
    input.mimeType === "text/plain" ||
    input.filename.toLowerCase().endsWith(".txt")
  );
}

function sourceBboxForTextLine(page: number, lineIndex: number): SourceBbox {
  const y0 = lineIndex * 16;
  return { page, x0: 0, y0, x1: 612, y1: y0 + 14 };
}

function textSourceMap(rawText: string): DocumentSourceMap {
  const normalizedRawText = rawText.replace(/\r\n?/g, "\n");
  const lines: SourceLine[] = normalizedRawText
    .split("\n")
    .map((text, index) => {
      const id = `p1-l${String(index + 1).padStart(3, "0")}`;
      const bbox = sourceBboxForTextLine(1, index);
      const token: SourceToken = {
        id: `${id}-t001`,
        page: 1,
        lineId: id,
        text,
        bbox,
      };
      return {
        id,
        page: 1,
        text,
        tokenIds: [token.id],
        tokens: [token],
        bbox,
      };
    })
    .filter((line) => line.text.trim());

  const page: SourceMapPage = {
    page: 1,
    width: 612,
    height: Math.max(792, lines.length * 16),
    lineIds: lines.map((line) => line.id),
  };

  return {
    pages: [page],
    lines,
    rawText: lines.map((line) => line.text).join("\n"),
  };
}

export async function extractDocumentSourceMap(
  input: ExtractDocumentSourceMapInput,
): Promise<ExtractDocumentSourceMapResult> {
  if (isPdf(input)) {
    return {
      sourceMap: await buildPdfSourceMap(input.buffer),
      extractorVersion: PDF_SOURCE_MAP_EXTRACTOR_VERSION,
      links: [],
      ocrUsed: false,
    };
  }

  if (isDocx(input)) {
    return {
      sourceMap: textSourceMap(await extractTextFromDocx(input.buffer)),
      extractorVersion: DOCX_SOURCE_MAP_EXTRACTOR_VERSION,
      links: [],
      ocrUsed: false,
    };
  }

  if (isText(input)) {
    return {
      sourceMap: textSourceMap(input.buffer.toString("utf8")),
      extractorVersion: TEXT_SOURCE_MAP_EXTRACTOR_VERSION,
      links: [],
      ocrUsed: false,
    };
  }

  throw new Error(
    `Unsupported document type for extraction: ${input.mimeType}`,
  );
}
