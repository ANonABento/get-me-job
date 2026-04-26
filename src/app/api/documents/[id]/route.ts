/**
 * @route DELETE /api/documents/[id]
 * @description Delete a document and its associated file from disk
 * @auth Required
 * @response DocumentDeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { requireAuth, isAuthError } from "@/lib/auth";
import { deleteDocument } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const path = deleteDocument(params.id, authResult.userId);
    if (!path) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Try to delete file (don't fail if file doesn't exist)
    try {
      await unlink(path);
    } catch {
      // File may not exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
