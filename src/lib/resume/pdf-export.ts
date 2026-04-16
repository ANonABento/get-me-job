// Server-side PDF generation using Playwright headless Chromium
// Playwright is lazily imported to avoid loading ~200MB+ chromium binary at module level

export interface ServerPDFOptions {
  format?: "Letter" | "A4";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

const DEFAULT_MARGIN = {
  top: "0.5in",
  right: "0.5in",
  bottom: "0.5in",
  left: "0.5in",
};

/**
 * Generate a PDF buffer from HTML using Playwright's headless Chromium.
 * Intended for server-side use only.
 */
export async function generatePDF(
  html: string,
  options: ServerPDFOptions = {}
): Promise<Buffer> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: options.format ?? "Letter",
      margin: { ...DEFAULT_MARGIN, ...options.margin },
      printBackground: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
