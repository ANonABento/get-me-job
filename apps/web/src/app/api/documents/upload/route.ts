/**
 * @route POST /api/documents/upload
 * @description Persist a document for parser-v2 ingestion without parsing or bank side effects
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  DocumentUploadError,
  parseDocumentUploadType,
  persistDocumentUpload,
} from "@/lib/ingest/document-upload";

export const dynamic = "force-dynamic";

function nextUrls(documentId: string) {
  return {
    extractUrl: `/api/documents/${encodeURIComponent(documentId)}/extract`,
    parseRunsUrl: `/api/documents/${encodeURIComponent(documentId)}/parse-runs`,
    sourceMapUrl: `/api/documents/${encodeURIComponent(documentId)}/source-map`,
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = parseDocumentUploadType(
      formData.get("type") ?? formData.get("documentType"),
    );
    const result = await persistDocumentUpload({
      file: file as File,
      userId: authResult.userId,
      documentType,
    });

    return NextResponse.json(
      {
        document: result.document,
        duplicate: result.duplicate,
        next: nextUrls(result.document.id),
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status },
      );
    }
    console.error("Parser-v2 document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}
