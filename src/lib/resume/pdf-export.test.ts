import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock playwright — vi.mock is hoisted, so use vi.fn() inline
vi.mock("playwright", () => {
  const mockPdf = vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4 mock"));
  const mockSetContent = vi.fn().mockResolvedValue(undefined);
  const mockPage = {
    setContent: mockSetContent,
    pdf: mockPdf,
  };
  const mockClose = vi.fn().mockResolvedValue(undefined);
  const mockBrowser = {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: mockClose,
  };

  return {
    chromium: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
    __mockPage: mockPage,
    __mockBrowser: mockBrowser,
  };
});

import { chromium } from "playwright";
import {
  generatePDF,
  injectPrintButton,
  PRINT_STYLES,
} from "./pdf-export";

// Access mock internals for assertions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { __mockPage, __mockBrowser } = await import("playwright") as any;

describe("generatePDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup default resolved values after clearAllMocks
    __mockPage.pdf.mockResolvedValue(Buffer.from("%PDF-1.4 mock"));
    __mockPage.setContent.mockResolvedValue(undefined);
    __mockBrowser.newPage.mockResolvedValue(__mockPage);
    __mockBrowser.close.mockResolvedValue(undefined);
    (chromium.launch as ReturnType<typeof vi.fn>).mockResolvedValue(__mockBrowser);
  });

  it("returns a Buffer containing PDF data", async () => {
    const result = await generatePDF("<html><body>Hello</body></html>");

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  it("sets page content with networkidle wait", async () => {
    const html = "<html><body>Test</body></html>";
    await generatePDF(html);

    expect(__mockPage.setContent).toHaveBeenCalledWith(html, {
      waitUntil: "networkidle",
    });
  });

  it("uses Letter format and 0.5in margins by default", async () => {
    await generatePDF("<html><body>Test</body></html>");

    expect(__mockPage.pdf).toHaveBeenCalledWith({
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

    expect(__mockPage.pdf).toHaveBeenCalledWith({
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
    __mockPage.pdf.mockRejectedValueOnce(new Error("PDF generation failed"));

    await expect(
      generatePDF("<html><body>Test</body></html>")
    ).rejects.toThrow("PDF generation failed");

    expect(__mockBrowser.close).toHaveBeenCalled();
  });

  it("closes the browser after successful generation", async () => {
    await generatePDF("<html><body>Test</body></html>");

    expect(__mockBrowser.close).toHaveBeenCalled();
  });
});

describe("injectPrintButton", () => {
  it("inserts a print button after <body> tag", () => {
    const html = "<html><body><p>Content</p></body></html>";
    const result = injectPrintButton(html);

    expect(result).toContain('onclick="window.print()"');
    expect(result).toContain("Download PDF");
    expect(result).toContain("<p>Content</p>");
  });

  it("preserves original content", () => {
    const html = "<html><body><h1>My Resume</h1></body></html>";
    const result = injectPrintButton(html);

    expect(result).toContain("<h1>My Resume</h1>");
  });
});

describe("PRINT_STYLES", () => {
  it("includes letter size page setting", () => {
    expect(PRINT_STYLES).toContain("size: letter");
  });

  it("includes 0.5in margin", () => {
    expect(PRINT_STYLES).toContain("margin: 0.5in");
  });

  it("hides no-print elements", () => {
    expect(PRINT_STYLES).toContain(".no-print");
    expect(PRINT_STYLES).toContain("display: none");
  });
});
