import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted runs before vi.mock factory, making these available at hoist time
const { mockPdf, mockSetContent, mockPage, mockClose, mockBrowser } =
  vi.hoisted(() => {
    const mockPdf = vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4 mock"));
    const mockSetContent = vi.fn().mockResolvedValue(undefined);
    const mockPage = { setContent: mockSetContent, pdf: mockPdf };
    const mockClose = vi.fn().mockResolvedValue(undefined);
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: mockClose,
    };
    return { mockPdf, mockSetContent, mockPage, mockClose, mockBrowser };
  });

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  },
}));

import { generatePDF } from "./pdf-export";

describe("generatePDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPdf.mockResolvedValue(Buffer.from("%PDF-1.4 mock"));
    mockSetContent.mockResolvedValue(undefined);
    mockBrowser.newPage.mockResolvedValue(mockPage);
    mockClose.mockResolvedValue(undefined);
  });

  it("returns a Buffer containing PDF data", async () => {
    const result = await generatePDF("<html><body>Hello</body></html>");

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("sets page content with networkidle wait", async () => {
    const html = "<html><body>Test</body></html>";
    await generatePDF(html);

    expect(mockSetContent).toHaveBeenCalledWith(html, {
      waitUntil: "networkidle",
    });
  });

  it("uses Letter format and 0.5in margins by default", async () => {
    await generatePDF("<html><body>Test</body></html>");

    expect(mockPdf).toHaveBeenCalledWith({
      format: "Letter",
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
    });
  });

  it("accepts custom format and margin overrides", async () => {
    await generatePDF("<html><body>Test</body></html>", {
      format: "A4",
      margin: { top: "1in", bottom: "1in" },
    });

    expect(mockPdf).toHaveBeenCalledWith({
      format: "A4",
      margin: {
        top: "1in",
        right: "0.5in",
        bottom: "1in",
        left: "0.5in",
      },
      printBackground: true,
    });
  });

  it("closes the browser even if pdf generation fails", async () => {
    mockPdf.mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(
      generatePDF("<html><body>Test</body></html>")
    ).rejects.toThrow("PDF generation failed");

    expect(mockClose).toHaveBeenCalled();
  });

  it("closes the browser after successful generation", async () => {
    await generatePDF("<html><body>Test</body></html>");

    expect(mockClose).toHaveBeenCalled();
  });

  it("dynamically imports playwright", async () => {
    const playwright = await import("playwright");
    await generatePDF("<html><body>Test</body></html>");

    expect(playwright.chromium.launch).toHaveBeenCalled();
  });
});
