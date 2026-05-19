import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  extractPdfPositions: vi.fn(),
  extractTextWithOCR: vi.fn(),
  extractTextFromDocx: vi.fn(),
}));

vi.mock("@/lib/parse/pdf-positions", () => ({
  extractPdfPositions: mocks.extractPdfPositions,
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
    mocks.extractPdfPositions.mockResolvedValue({
      items: [
        {
          text: "This resume has enough extracted text to avoid OCR fallback.",
          page: 1,
          x0: 72,
          y0: 48,
          x1: 400,
          y1: 60,
        },
      ],
      links: [],
      pageDimensions: [{ page: 1, width: 612, height: 792 }],
    });

    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("%PDF"),
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });

    expect(result.extractorVersion).toBe(PDF_SOURCE_MAP_EXTRACTOR_VERSION);
    expect(result.ocrUsed).toBe(false);
    expect(mocks.extractTextWithOCR).not.toHaveBeenCalled();
  });

  it("falls back to OCR source text when PDF geometry text is too short", async () => {
    mocks.extractPdfPositions.mockResolvedValue({
      items: [],
      links: [],
      pageDimensions: [{ page: 1, width: 612, height: 792 }],
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

  it("preserves PDF link annotations on parser-v2 artifacts", async () => {
    mocks.extractPdfPositions.mockResolvedValue({
      items: [
        {
          text: "Kevin Jiang Portfolio with enough surrounding text to skip OCR fallback path entirely.",
          page: 1,
          x0: 72,
          y0: 48,
          x1: 400,
          y1: 60,
        },
      ],
      links: [
        {
          url: "https://example.com/portfolio",
          page: 1,
          x0: 72,
          y0: 48,
          x1: 180,
          y1: 60,
        },
      ],
      pageDimensions: [{ page: 1, width: 612, height: 792 }],
    });

    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("%PDF"),
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });

    expect(result.sourceMap.links).toEqual([
      {
        url: "https://example.com/portfolio",
        page: 1,
        bbox: [1, 72, 48, 180, 60],
      },
    ]);
    expect(result.links).toEqual([
      {
        url: "https://example.com/portfolio",
        page: 1,
        bbox: [1, 72, 48, 180, 60],
      },
    ]);
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
