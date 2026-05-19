import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  buildPdfSourceMap: vi.fn(),
  extractTextWithOCR: vi.fn(),
  extractTextFromDocx: vi.fn(),
}));

vi.mock("./pdf-source-map", () => ({
  buildPdfSourceMap: mocks.buildPdfSourceMap,
}));

vi.mock("@/lib/parser/ocr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/parser/ocr")>();
  return {
    ...actual,
    extractTextWithOCR: mocks.extractTextWithOCR,
  };
});

vi.mock("@/lib/parser/pdf", () => ({
  extractTextFromDocx: mocks.extractTextFromDocx,
}));

import {
  extractDocumentSourceMap,
  PDF_OCR_SOURCE_MAP_EXTRACTOR_VERSION,
  PDF_SOURCE_MAP_EXTRACTOR_VERSION,
  TEXT_SOURCE_MAP_EXTRACTOR_VERSION,
} from "./extract-document";

describe("extractDocumentSourceMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses pdf source-map extraction when the PDF has enough text", async () => {
    const sourceMap = {
      pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001"] }],
      lines: [
        {
          id: "p1-l001",
          page: 1,
          text: "This resume has enough extracted text to avoid OCR fallback.",
          tokenIds: [],
          tokens: [],
          bbox: { page: 1, x0: 0, y0: 0, x1: 100, y1: 12 },
        },
      ],
      rawText: "This resume has enough extracted text to avoid OCR fallback.",
    };
    mocks.buildPdfSourceMap.mockResolvedValue(sourceMap);

    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("%PDF"),
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });

    expect(result).toEqual({
      sourceMap,
      extractorVersion: PDF_SOURCE_MAP_EXTRACTOR_VERSION,
      links: [],
      ocrUsed: false,
    });
    expect(mocks.extractTextWithOCR).not.toHaveBeenCalled();
  });

  it("falls back to OCR source text when PDF geometry text is too short", async () => {
    mocks.buildPdfSourceMap.mockResolvedValue({
      pages: [{ page: 1, width: 612, height: 792, lineIds: [] }],
      lines: [],
      rawText: "",
    });
    mocks.extractTextWithOCR.mockResolvedValue("Jake Ryan\nEngineer at Acme");

    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("%PDF"),
      filename: "scanned.pdf",
      mimeType: "application/pdf",
    });

    expect(mocks.extractTextWithOCR).toHaveBeenCalledWith(Buffer.from("%PDF"));
    expect(result.extractorVersion).toBe(PDF_OCR_SOURCE_MAP_EXTRACTOR_VERSION);
    expect(result.ocrUsed).toBe(true);
    expect(result.sourceMap.rawText).toBe("Jake Ryan\nEngineer at Acme");
    expect(result.sourceMap.lines.map((line) => line.text)).toEqual([
      "Jake Ryan",
      "Engineer at Acme",
    ]);
    expect(result.sourceMap.lines[0]).toMatchObject({
      id: "p1-l001",
      page: 1,
    });
  });

  it("builds source maps for plain text without OCR", async () => {
    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("Jake Ryan\r\nEngineer"),
      filename: "resume.txt",
      mimeType: "text/plain",
    });

    expect(result.extractorVersion).toBe(TEXT_SOURCE_MAP_EXTRACTOR_VERSION);
    expect(result.ocrUsed).toBe(false);
    expect(result.sourceMap.rawText).toBe("Jake Ryan\nEngineer");
  });
});
