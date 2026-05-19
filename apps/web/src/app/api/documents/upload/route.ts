/**
 * @route POST /api/documents/upload
 * @description Persist a document for parser-v2 ingestion without parsing or bank side effects
 * @auth Required
 */
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  DuplicateDocumentError,
  getDocumentByFileHash,
  saveDocument,
} from "@/lib/db";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  PATHS,
  documentTypeSchema,
  validateFileMagicBytes,
} from "@/lib/constants";
import { nowIso } from "@/lib/format/time";
import { sanitizeFilename } from "@/lib/upload/filename";
import { generateId } from "@/lib/utils";
import type { Document, DocumentType } from "@/types";

export const dynamic = "force-dynamic";

function nextUrls(documentId: string) {
  return {
    extractUrl: `/api/documents/${encodeURIComponent(documentId)}/extract`,
    parseRunsUrl: `/api/documents/${encodeURIComponent(documentId)}/parse-runs`,
    sourceMapUrl: `/api/documents/${encodeURIComponent(documentId)}/source-map`,
  };
}

function documentResponse(document: Document, duplicate = false) {
  return NextResponse.json({
    document,
    duplicate,
    next: nextUrls(document.id),
  });
}

function parseDocumentType(value: FormDataEntryValue | null): DocumentType {
  if (typeof value !== "string" || value.trim() === "") return "other";
  const parsed = documentTypeSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Unsupported document type");
  }
  return parsed.data;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let writtenFilePath: string | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let documentType: DocumentType;
    try {
      documentType = parseDocumentType(
        formData.get("type") ?? formData.get("documentType"),
      );
    } catch {
      return NextResponse.json(
        { error: "Unsupported document type" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: PDF, DOCX, and TXT" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateFileMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        {
          error:
            "File content does not match its type. Please upload a valid document.",
        },
        { status: 400 },
      );
    }

    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = getDocumentByFileHash(fileHash, authResult.userId);
    if (existing) {
      return documentResponse(existing, true);
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
      saveDocument(document, authResult.userId);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) {
        await unlink(filePath).catch(() => undefined);
        writtenFilePath = undefined;
        const winner = getDocumentByFileHash(fileHash, authResult.userId);
        if (winner) return documentResponse(winner, true);
      }
      throw error;
    }

    return NextResponse.json(
      {
        document,
        duplicate: false,
        next: nextUrls(document.id),
      },
      { status: 201 },
    );
  } catch (error) {
    if (writtenFilePath) await unlink(writtenFilePath).catch(() => undefined);
    console.error("Parser-v2 document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}
