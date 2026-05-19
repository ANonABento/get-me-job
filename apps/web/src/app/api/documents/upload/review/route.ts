/**
 * @route POST /api/documents/upload/review
 * @description Persist a resume, create parser-v2 source/parse artifacts, and return draft review entries
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { parseSearchParams } from "@/lib/api-utils";
import { requireAuth, isAuthError } from "@/lib/auth";
import { uploadQuerySchema } from "@/lib/schemas";
import { DocumentUploadError } from "@/lib/ingest/document-upload";
import { DocumentParseRunError } from "@/lib/ingest/document-parse-run";
import { createParserV2UploadReview } from "@/lib/ingest/parser-v2-upload-review";

export const dynamic = "force-dynamic";

function nextUrls(documentId: string, parseRunId?: string) {
  const encodedDocumentId = encodeURIComponent(documentId);
  return {
    sourceMapUrl: parseRunId
      ? `/api/documents/${encodedDocumentId}/source-map?parseRunId=${encodeURIComponent(parseRunId)}`
      : `/api/documents/${encodedDocumentId}/source-map`,
    commitUrl: parseRunId
      ? `/api/bank/imports/${encodeURIComponent(parseRunId)}/commit`
      : undefined,
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const query = parseSearchParams(
    request.nextUrl.searchParams,
    uploadQuerySchema,
  );
  if (!query.ok) return query.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const result = await createParserV2UploadReview({
      file: file as File,
      userId: authResult.userId,
      documentTypeValue: formData.get("type") ?? formData.get("documentType"),
      replaceExisting: query.data.force,
    });

    if (result.upload.duplicate) {
      return NextResponse.json(
        {
          error: "Duplicate file upload",
          existing: {
            id: result.upload.document.id,
            filename: result.upload.document.filename,
            uploaded_at: result.upload.document.uploadedAt,
            uploadedAt: result.upload.document.uploadedAt,
            type: result.upload.document.type,
            size: result.upload.document.size,
          },
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        duplicate: false,
        document: result.upload.document,
        artifact: result.artifact,
        parseRun: result.parseRun,
        entries: result.entries,
        sourceText: result.sourceText,
        diagnostic: result.diagnostic,
        replacedDocumentId: result.upload.replacedDocumentId,
        next: nextUrls(result.upload.document.id, result.parseRun?.id),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status },
      );
    }
    if (error instanceof DocumentParseRunError) {
      return NextResponse.json(
        { error: error.publicMessage },
        { status: error.status },
      );
    }
    console.error("Parser-v2 upload review error:", error);
    return NextResponse.json(
      { error: "Failed to prepare upload review" },
      { status: 500 },
    );
  }
}
