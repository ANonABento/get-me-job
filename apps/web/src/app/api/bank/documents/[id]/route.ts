/**
 * @route DELETE /api/bank/documents/[id]
 * @description Delete source document and cascade delete bank chunks
 * @auth Required
 * @response BankDocumentDeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  deleteSourceDocument,
  getSourceDocumentFiles,
} from "@/lib/db/profile-bank";
import { deleteStoredDocumentFiles } from "@/lib/ingest/document-file-cleanup";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const files = getSourceDocumentFiles([params.id], authResult.userId);
    const chunksDeleted = deleteSourceDocument(params.id, authResult.userId);
    await deleteStoredDocumentFiles(files);
    return NextResponse.json({ success: true, chunksDeleted });
  } catch (error) {
    console.error("Delete source document error:", error);
    return NextResponse.json(
      { error: "Failed to delete source document" },
      { status: 500 },
    );
  }
}
