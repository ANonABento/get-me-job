const OCR_TEXT_THRESHOLD = 50;
const OCR_MAX_PAGES = 3;

/**
 * Returns true if the extracted text is too short to be a real resume,
 * indicating the PDF is likely scanned/image-based and needs OCR.
 */
export function needsOCRFallback(text: string): boolean {
  return text.trim().length < OCR_TEXT_THRESHOLD;
}

/**
 * Extracts text from a PDF buffer using Tesseract OCR.
 * Converts each page to an image and runs OCR, limited to the first 3 pages.
 */
export async function extractTextWithOCR(
  pdfBuffer: Buffer,
  maxPages: number = OCR_MAX_PAGES
): Promise<string> {
  const { pdf: pdfToImages } = await import("pdf-to-img");

  const pages: string[] = [];
  const Tesseract = (await import("tesseract.js")).default;

  for await (const image of await pdfToImages(pdfBuffer, { scale: 2 })) {
    if (pages.length >= maxPages) break;

    const {
      data: { text },
    } = await Tesseract.recognize(image, "eng");
    pages.push(text);
  }

  return pages.join("\n\n");
}
