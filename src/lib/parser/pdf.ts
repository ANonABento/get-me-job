import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const dataBuffer = fs.readFileSync(absolutePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".txt":
      return fs.readFileSync(filePath, "utf-8");
    case ".docx": {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
      const buffer = fs.readFileSync(absolutePath);
      return extractTextFromDocx(buffer);
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
