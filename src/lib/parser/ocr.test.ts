import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  needsOCRFallback,
  extractTextFromImages,
  extractTextWithOCR,
  pdfToImages,
  OCR_FALLBACK_THRESHOLD,
  OCR_MAX_PAGES,
} from "./ocr";

const { mockRecognize, mockTerminate, mockPdfToPng } = vi.hoisted(() => ({
  mockRecognize: vi.fn(),
  mockTerminate: vi.fn(),
  mockPdfToPng: vi.fn(),
}));

// Mock tesseract.js
vi.mock("tesseract.js", () => ({
  default: {
    createWorker: vi.fn().mockResolvedValue({
      recognize: mockRecognize,
      terminate: mockTerminate,
    }),
  },
}));

// Mock pdf-to-png-converter
vi.mock("pdf-to-png-converter", () => ({
  pdfToPng: mockPdfToPng,
}));

describe("needsOCRFallback", () => {
  it("should return true for empty string", () => {
    expect(needsOCRFallback("")).toBe(true);
  });

  it("should return true for whitespace-only string", () => {
    expect(needsOCRFallback("   \n\t  ")).toBe(true);
  });

  it("should return true for short text below threshold", () => {
    const shortText = "a".repeat(OCR_FALLBACK_THRESHOLD - 1);
    expect(needsOCRFallback(shortText)).toBe(true);
  });

  it("should return false for text at threshold", () => {
    const text = "a".repeat(OCR_FALLBACK_THRESHOLD);
    expect(needsOCRFallback(text)).toBe(false);
  });

  it("should return false for long text", () => {
    const longText = "John Doe\nSoftware Engineer\nExperience: 5 years of building web applications with React and Node.js";
    expect(needsOCRFallback(longText)).toBe(false);
  });

  it("should trim before checking length", () => {
    const paddedShort = "  short  ";
    expect(needsOCRFallback(paddedShort)).toBe(true);
  });
});

describe("extractTextFromImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty string for no images", async () => {
    const result = await extractTextFromImages([]);
    expect(result).toBe("");
  });

  it("should extract text from a single image", async () => {
    mockRecognize.mockResolvedValueOnce({
      data: { text: "John Doe\nSoftware Engineer" },
    });

    const buffer = Buffer.from("fake-image");
    const result = await extractTextFromImages([buffer]);

    expect(result).toBe("John Doe\nSoftware Engineer");
    expect(mockRecognize).toHaveBeenCalledWith(buffer);
    expect(mockTerminate).toHaveBeenCalled();
  });

  it("should extract text from multiple images and join with double newline", async () => {
    mockRecognize
      .mockResolvedValueOnce({ data: { text: "Page 1 content" } })
      .mockResolvedValueOnce({ data: { text: "Page 2 content" } });

    const buffers = [Buffer.from("img1"), Buffer.from("img2")];
    const result = await extractTextFromImages(buffers);

    expect(result).toBe("Page 1 content\n\nPage 2 content");
    expect(mockRecognize).toHaveBeenCalledTimes(2);
  });

  it("should skip empty OCR results", async () => {
    mockRecognize
      .mockResolvedValueOnce({ data: { text: "Page 1 content" } })
      .mockResolvedValueOnce({ data: { text: "   " } })
      .mockResolvedValueOnce({ data: { text: "Page 3 content" } });

    const buffers = [Buffer.from("img1"), Buffer.from("img2"), Buffer.from("img3")];
    const result = await extractTextFromImages(buffers);

    expect(result).toBe("Page 1 content\n\nPage 3 content");
  });

  it("should terminate worker even if recognition fails", async () => {
    mockRecognize.mockRejectedValueOnce(new Error("OCR failed"));

    const buffer = Buffer.from("bad-image");
    await expect(extractTextFromImages([buffer])).rejects.toThrow("OCR failed");
    expect(mockTerminate).toHaveBeenCalled();
  });
});

describe("pdfToImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert PDF buffer to image buffers", async () => {
    const imgBuf1 = Buffer.from("png-data-1");
    const imgBuf2 = Buffer.from("png-data-2");

    mockPdfToPng.mockResolvedValueOnce([
      { pageNumber: 1, name: "p1.png", content: imgBuf1, path: "", width: 100, height: 100, rotation: 0 },
      { pageNumber: 2, name: "p2.png", content: imgBuf2, path: "", width: 100, height: 100, rotation: 0 },
    ]);

    const pdfBuffer = Buffer.from("fake-pdf");
    const result = await pdfToImages(pdfBuffer);

    expect(result).toEqual([imgBuf1, imgBuf2]);
    expect(mockPdfToPng).toHaveBeenCalledWith(pdfBuffer, {
      pagesToProcess: [1, 2, 3],
      viewportScale: 2,
      returnPageContent: true,
    });
  });

  it("should only request up to OCR_MAX_PAGES pages", async () => {
    mockPdfToPng.mockResolvedValueOnce([]);

    await pdfToImages(Buffer.from("pdf"));

    const call = mockPdfToPng.mock.calls[0];
    expect(call[1]?.pagesToProcess).toHaveLength(OCR_MAX_PAGES);
  });

  it("should filter out pages without content", async () => {
    mockPdfToPng.mockResolvedValueOnce([
      { pageNumber: 1, name: "p1.png", content: Buffer.from("data"), path: "", width: 100, height: 100, rotation: 0 },
      { pageNumber: 2, name: "p2.png", content: undefined, path: "", width: 100, height: 100, rotation: 0 },
    ]);

    const result = await pdfToImages(Buffer.from("pdf"));
    expect(result).toHaveLength(1);
  });
});

describe("extractTextWithOCR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert PDF to images then run OCR", async () => {
    const imgBuf = Buffer.from("png-data");
    mockPdfToPng.mockResolvedValueOnce([
      { pageNumber: 1, name: "p1.png", content: imgBuf, path: "", width: 100, height: 100, rotation: 0 },
    ]);

    mockRecognize.mockResolvedValueOnce({
      data: { text: "OCR extracted resume text here" },
    });

    const result = await extractTextWithOCR(Buffer.from("scanned-pdf"));

    expect(result).toBe("OCR extracted resume text here");
    expect(mockPdfToPng).toHaveBeenCalled();
    expect(mockRecognize).toHaveBeenCalledWith(imgBuf);
  });
});
