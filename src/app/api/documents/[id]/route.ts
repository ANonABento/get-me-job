/**
 * @route DELETE /api/documents/[id]
 * @description Delete a document and its associated file from disk
 * @auth Required
 * @response DocumentDeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    // Get document path before deleting
    const doc = db
      .prepare("SELECT path FROM documents WHERE id = ? AND user_id = ?")
      .get(params.id, authResult.userId) as { path: string } | undefined;

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from database
    db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(params.id, authResult.userId);

    // Try to delete file (don't fail if file doesn't exist)
    try {
      await unlink(doc.path);
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
