import { z } from "zod";

// Document types
export const DOCUMENT_TYPES = [
  "resume",
  "cover_letter",
  "reference_letter",
  "portfolio",
  "certificate",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

// File upload limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// Magic bytes for file type validation
export const FILE_SIGNATURES: Record<string, number[]> = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [0x50, 0x4b, 0x03, 0x04], // PK zip header
  // text/plain has no magic bytes - validated by content
};

/**
 * Check if buffer starts with expected magic bytes for the given MIME type
 */
export function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType];

  // text/plain doesn't have magic bytes, check if content is valid UTF-8
  if (mimeType === "text/plain") {
    try {
      const text = buffer.toString("utf8");
      // Check for common binary patterns that indicate non-text
      return !text.includes("\x00"); // Null bytes indicate binary
    } catch {
      return false;
    }
  }

  if (!signature) return true; // Unknown type, skip validation

  if (buffer.length < signature.length) return false;

  return signature.every((byte, i) => buffer[i] === byte);
}

// Parse document schema
export const parseDocumentSchema = z.object({
  filename: z.string().optional(),
  documentId: z.string().optional(),
}).refine(
  (data) => data.filename || data.documentId,
  { message: "Either filename or documentId is required" }
);

export type ParseDocumentInput = z.infer<typeof parseDocumentSchema>;
