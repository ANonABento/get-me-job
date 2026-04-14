import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import { needsOCRFallback, extractTextWithOCR } from "./ocr";

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const dataBuffer = fs.readFileSync(absolutePath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  // If pdf-parse returned insufficient text, try OCR
  if (needsOCRFallback(text)) {
    const ocrText = await extractTextWithOCR(dataBuffer);
    if (ocrText.trim().length > text.trim().length) {
      return ocrText;
    }
  }

  return text;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".txt":
      return fs.readFileSync(filePath, "utf-8");
    case ".docx":
      // For now, we'll handle DOCX as unsupported and suggest PDF
      throw new Error(
        "DOCX parsing not yet implemented. Please convert to PDF."
      );
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
