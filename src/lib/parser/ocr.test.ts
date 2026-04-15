import { describe, it, expect, vi, beforeEach } from "vitest";
import { needsOCRFallback, extractTextWithOCR } from "./ocr";

// Mock tesseract.js
vi.mock("tesseract.js", () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({
      data: { text: "Mocked OCR text from page" },
    }),
  },
}));

// Mock pdf-to-img
vi.mock("pdf-to-img", () => ({
  pdf: vi.fn().mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("page1-image");
      yield Buffer.from("page2-image");
      yield Buffer.from("page3-image");
      yield Buffer.from("page4-image");
      yield Buffer.from("page5-image");
    },
  }),
}));

describe("needsOCRFallback", () => {
  it("returns true for empty string", () => {
    expect(needsOCRFallback("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(needsOCRFallback("   \n\t  ")).toBe(true);
  });

  it("returns true for text shorter than 50 chars", () => {
    expect(needsOCRFallback("Short text")).toBe(true);
  });

  it("returns true for text with exactly 49 chars after trim", () => {
    const text = "a".repeat(49);
    expect(needsOCRFallback(text)).toBe(true);
  });

  it("returns false for text with exactly 50 chars", () => {
    const text = "a".repeat(50);
    expect(needsOCRFallback(text)).toBe(false);
  });

  it("returns false for long text", () => {
    const text =
      "This is a proper resume with enough text content to be considered valid extracted text from a PDF document.";
    expect(needsOCRFallback(text)).toBe(false);
  });

  it("trims whitespace before checking length", () => {
    const text = "   " + "a".repeat(40) + "   ";
    expect(needsOCRFallback(text)).toBe(true);
  });
});

describe("extractTextWithOCR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts text from PDF pages using OCR", async () => {
    const result = await extractTextWithOCR(Buffer.from("fake-pdf"));

    expect(result).toContain("Mocked OCR text from page");
  });

  it("limits to 3 pages by default", async () => {
    const Tesseract = (await import("tesseract.js")).default;

    await extractTextWithOCR(Buffer.from("fake-pdf"));

    expect(Tesseract.recognize).toHaveBeenCalledTimes(3);
  });

  it("respects custom maxPages parameter", async () => {
    const Tesseract = (await import("tesseract.js")).default;

    await extractTextWithOCR(Buffer.from("fake-pdf"), 2);

    expect(Tesseract.recognize).toHaveBeenCalledTimes(2);
  });

  it("joins page texts with double newline", async () => {
    const result = await extractTextWithOCR(Buffer.from("fake-pdf"));

    const pages = result.split("\n\n");
    expect(pages).toHaveLength(3);
    pages.forEach((page) => {
      expect(page).toBe("Mocked OCR text from page");
    });
  });

  it("passes English language to Tesseract", async () => {
    const Tesseract = (await import("tesseract.js")).default;

    await extractTextWithOCR(Buffer.from("fake-pdf"));

    expect(Tesseract.recognize).toHaveBeenCalledWith(
      expect.anything(),
      "eng"
    );
  });
});
