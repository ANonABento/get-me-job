import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";

function toAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(toAbsolutePath(filePath));
  const data = await pdf(dataBuffer);
  return data.text;
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(toAbsolutePath(filePath));
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".txt":
      return fs.readFileSync(filePath, "utf-8");
    case ".docx":
      return extractTextFromDocx(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
