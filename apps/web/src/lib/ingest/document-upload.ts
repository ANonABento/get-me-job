import crypto from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  PATHS,
  documentTypeSchema,
  validateFileMagicBytes,
} from "@/lib/constants";
import {
  DuplicateDocumentError,
  getDocumentByFileHash,
  saveDocument,
} from "@/lib/db";
import { nowIso } from "@/lib/format/time";
import { sanitizeFilename } from "@/lib/upload/filename";
import { generateId } from "@/lib/utils";
import type { Document, DocumentType } from "@/types";

type DocumentUploadErrorCode =
  | "missing_file"
  | "file_too_large"
  | "invalid_mime_type"
  | "invalid_magic_bytes"
  | "unsupported_document_type"
  | "upload_failed";

export class DocumentUploadError extends Error {
  readonly code: DocumentUploadErrorCode;
  readonly status: number;
  readonly publicMessage: string;

  constructor(
    code: DocumentUploadErrorCode,
    publicMessage: string,
    status = 400,
    cause?: unknown,
  ) {
    super(publicMessage);
    this.name = "DocumentUploadError";
    this.code = code;
    this.status = status;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}

export interface PersistDocumentUploadInput {
  file: File;
  userId: string;
  documentType: DocumentType;
}

export interface PersistDocumentUploadResult {
  document: Document;
  duplicate: boolean;
}

export interface ValidatedUploadFile {
  buffer: Buffer;
  fileHash: string;
}

export function parseDocumentUploadType(
  value: FormDataEntryValue | null,
): DocumentType {
  if (typeof value !== "string" || value.trim() === "") return "other";
  const parsed = documentTypeSchema.safeParse(value);
  if (!parsed.success) {
    throw new DocumentUploadError(
      "unsupported_document_type",
      "Unsupported document type",
    );
  }
  return parsed.data;
}

function validateUploadFile(file: File | null): asserts file is File {
  if (!file) {
    throw new DocumentUploadError("missing_file", "No file provided");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    throw new DocumentUploadError(
      "file_too_large",
      `File too large. Maximum size is ${maxMB}MB`,
    );
  }

  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new DocumentUploadError(
      "invalid_mime_type",
      "Invalid file type. Allowed types: PDF, DOCX, and TXT",
    );
  }
}

export async function readValidatedUploadFile(
  file: File | null,
): Promise<ValidatedUploadFile> {
  validateUploadFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateFileMagicBytes(buffer, file.type)) {
    throw new DocumentUploadError(
      "invalid_magic_bytes",
      "File content does not match its type. Please upload a valid document.",
    );
  }

  return {
    buffer,
    fileHash: crypto.createHash("sha256").update(buffer).digest("hex"),
  };
}

export async function persistDocumentUpload({
  file,
  userId,
  documentType,
}: PersistDocumentUploadInput): Promise<PersistDocumentUploadResult> {
  let writtenFilePath: string | undefined;

  try {
    const { buffer, fileHash } = await readValidatedUploadFile(file);
    const existing = getDocumentByFileHash(fileHash, userId);
    if (existing) {
      return { document: existing, duplicate: true };
    }

    await mkdir(PATHS.UPLOADS, { recursive: true });
    const id = generateId();
    const safeFilename = sanitizeFilename(file.name);
    const filePath = path.join(
      PATHS.UPLOADS,
      `${id}${path.extname(file.name)}`,
    );
    await writeFile(filePath, buffer);
    writtenFilePath = filePath;

    const document: Document = {
      id,
      filename: safeFilename,
      type: documentType,
      mimeType: file.type,
      size: file.size,
      path: filePath,
      fileHash,
      uploadedAt: nowIso(),
    };

    try {
      saveDocument(document, userId);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) {
        await unlink(filePath).catch(() => undefined);
        writtenFilePath = undefined;
        const winner = getDocumentByFileHash(fileHash, userId);
        if (winner) return { document: winner, duplicate: true };
      }
      throw error;
    }

    return { document, duplicate: false };
  } catch (error) {
    if (writtenFilePath) await unlink(writtenFilePath).catch(() => undefined);
    if (error instanceof DocumentUploadError) throw error;
    throw new DocumentUploadError(
      "upload_failed",
      "Failed to upload document",
      500,
      error,
    );
  }
}
