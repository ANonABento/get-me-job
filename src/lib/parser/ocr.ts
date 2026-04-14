import Tesseract from "tesseract.js";
import { pdfToPng } from "pdf-to-png-converter";

/** Minimum character count from pdf-parse before triggering OCR fallback */
export const OCR_FALLBACK_THRESHOLD = 50;

/** Maximum number of PDF pages to OCR (to avoid processing huge documents) */
export const OCR_MAX_PAGES = 3;

/**
 * Check if extracted text is sufficient or if OCR fallback is needed.
 * Returns true if text is too short/empty after trimming.
 */
export function needsOCRFallback(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length < OCR_FALLBACK_THRESHOLD;
}

/**
 * Convert PDF buffer to page image buffers using pdf-to-png-converter.
 * Only converts up to OCR_MAX_PAGES pages.
 */
export async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pagesToProcess = Array.from(
    { length: OCR_MAX_PAGES },
    (_, i) => i + 1
  );

  const pages = await pdfToPng(pdfBuffer, {
    pagesToProcess,
    viewportScale: 2,
    returnPageContent: true,
  });

  return pages
    .filter((page): page is typeof page & { content: Buffer } =>
      page.content !== undefined
    )
    .map((page) => page.content);
}

/**
 * Extract text from image buffers using Tesseract OCR.
 */
export async function extractTextFromImages(
  imageBuffers: Buffer[]
): Promise<string> {
  if (imageBuffers.length === 0) {
    return "";
  }

  const results: string[] = [];
  const worker = await Tesseract.createWorker("eng");

  try {
    for (const imageBuffer of imageBuffers) {
      const {
        data: { text },
      } = await worker.recognize(imageBuffer);
      if (text.trim()) {
        results.push(text.trim());
      }
    }
  } finally {
    await worker.terminate();
  }

  return results.join("\n\n");
}

/**
 * Extract text from a PDF buffer using OCR.
 * Converts PDF pages to images, then runs Tesseract on each.
 */
export async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  const images = await pdfToImages(pdfBuffer);
  return extractTextFromImages(images);
}
