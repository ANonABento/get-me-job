import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractTextFromPDF, extractTextFromFile } from "./pdf";

// Mock dependencies
vi.mock("pdf-parse", () => ({
  default: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock("./ocr", () => ({
  needsOCRFallback: vi.fn(),
  extractTextWithOCR: vi.fn(),
}));

import pdf from "pdf-parse";
import fs from "fs";
import { needsOCRFallback, extractTextWithOCR } from "./ocr";

const mockPdf = vi.mocked(pdf);
const mockReadFileSync = vi.mocked(fs.readFileSync);
const mockNeedsOCR = vi.mocked(needsOCRFallback);
const mockExtractOCR = vi.mocked(extractTextWithOCR);

describe("extractTextFromPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFileSync.mockReturnValue(Buffer.from("fake-pdf-data"));
  });

  it("should extract text using pdf-parse for text-based PDFs", async () => {
    const longText = "John Doe\nSoftware Engineer with 5 years experience in building web applications";
    mockPdf.mockResolvedValueOnce({ text: longText, numpages: 1, info: {}, metadata: null, version: "1.0" } as never);
    mockNeedsOCR.mockReturnValueOnce(false);

    const result = await extractTextFromPDF("/path/to/resume.pdf");

    expect(result).toBe(longText);
    expect(mockExtractOCR).not.toHaveBeenCalled();
  });

  it("should fall back to OCR when pdf-parse returns insufficient text", async () => {
    const shortText = "   ";
    const ocrText = "John Doe\nSoftware Engineer with rich experience in multiple technologies";

    mockPdf.mockResolvedValueOnce({ text: shortText, numpages: 1, info: {}, metadata: null, version: "1.0" } as never);
    mockNeedsOCR.mockReturnValueOnce(true);
    mockExtractOCR.mockResolvedValueOnce(ocrText);

    const result = await extractTextFromPDF("/path/to/scanned.pdf");

    expect(result).toBe(ocrText);
    expect(mockExtractOCR).toHaveBeenCalled();
  });

  it("should keep pdf-parse text if OCR produces less text", async () => {
    const pdfText = "Some short but present text";
    const ocrText = "less";

    mockPdf.mockResolvedValueOnce({ text: pdfText, numpages: 1, info: {}, metadata: null, version: "1.0" } as never);
    mockNeedsOCR.mockReturnValueOnce(true);
    mockExtractOCR.mockResolvedValueOnce(ocrText);

    const result = await extractTextFromPDF("/path/to/resume.pdf");

    expect(result).toBe(pdfText);
  });

  it("should skip OCR when pdf-parse returns sufficient text", async () => {
    const fullText = "A".repeat(100);
    mockPdf.mockResolvedValueOnce({ text: fullText, numpages: 1, info: {}, metadata: null, version: "1.0" } as never);
    mockNeedsOCR.mockReturnValueOnce(false);

    await extractTextFromPDF("/path/to/text-pdf.pdf");

    expect(mockExtractOCR).not.toHaveBeenCalled();
  });
});

describe("extractTextFromFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFileSync.mockReturnValue(Buffer.from("data"));
  });

  it("should handle .txt files directly", async () => {
    mockReadFileSync.mockReturnValue("plain text content" as never);

    const result = await extractTextFromFile("/path/to/file.txt");

    expect(result).toBe("plain text content");
  });

  it("should throw for .docx files", async () => {
    await expect(extractTextFromFile("/path/to/file.docx")).rejects.toThrow(
      "DOCX parsing not yet implemented"
    );
  });

  it("should throw for unsupported file types", async () => {
    await expect(extractTextFromFile("/path/to/file.xyz")).rejects.toThrow(
      "Unsupported file type: .xyz"
    );
  });

  it("should route .pdf files through extractTextFromPDF", async () => {
    const text = "PDF content that is long enough to pass OCR check easily for testing";
    mockPdf.mockResolvedValueOnce({ text, numpages: 1, info: {}, metadata: null, version: "1.0" } as never);
    mockNeedsOCR.mockReturnValueOnce(false);

    const result = await extractTextFromFile("/path/to/resume.pdf");

    expect(result).toBe(text);
  });
});
