import { z } from "zod";

export const DOCUMENT_TYPES = [
  "resume",
  "cover_letter",
  "portfolio",
  "certificate",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

export const parseDocumentSchema = z
  .object({
    filename: z.string().optional(),
    documentId: z.string().optional(),
  })
  .refine(
    (data) => data.filename || data.documentId,
    { message: "Either filename or documentId is required" }
  );

export type ParseDocumentInput = z.infer<typeof parseDocumentSchema>;
