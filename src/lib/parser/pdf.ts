import fs from "fs";
import path from "path";
import { needsOCRFallback, extractTextWithOCR } from "./ocr";

function toAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function decodePdfLiteralString(value: string): string {
  return value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(parseInt(octal, 8))
    );
}

function extractPdfTextFallback(dataBuffer: Buffer): string {
  const raw = dataBuffer.toString("latin1");
  const textRuns: string[] = [];
  const literalPattern = /\((?:\\.|[^\\)])*\)/g;

  for (const match of raw.matchAll(/(\((?:\\.|[^\\)])*\)\s*Tj)/g)) {
    const literal = match[0].match(literalPattern)?.[0];
    if (literal) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  for (const match of raw.matchAll(/\[(.*?)\]\s*TJ/gs)) {
    const chunk = match[1];
    for (const literal of chunk.match(literalPattern) ?? []) {
      textRuns.push(decodePdfLiteralString(literal.slice(1, -1)));
    }
  }

  return textRuns
    .map((text) => text.trim())
    .filter(Boolean)
    .join("\n");
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const pdf = (await import("pdf-parse")).default;
  const dataBuffer = fs.readFileSync(toAbsolutePath(filePath));
  const fallbackText = extractPdfTextFallback(dataBuffer);

  try {
    const data = await pdf(dataBuffer);

    if (!needsOCRFallback(data.text)) {
      return data.text;
    }
  } catch {
    if (fallbackText) {
      return fallbackText;
    }

    return extractTextWithOCR(dataBuffer);
  }

  if (fallbackText) {
    return fallbackText;
  }

  return extractTextWithOCR(dataBuffer);
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".txt":
      return fs.readFileSync(toAbsolutePath(filePath), "utf-8");
    case ".docx": {
      const buffer = fs.readFileSync(toAbsolutePath(filePath));
      return extractTextFromDocx(buffer);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
