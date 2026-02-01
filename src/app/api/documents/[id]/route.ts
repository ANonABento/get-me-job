import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get document path before deleting
    const doc = db.prepare("SELECT path FROM documents WHERE id = ?").get(params.id) as { path: string } | undefined;

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from database
    db.prepare("DELETE FROM documents WHERE id = ?").run(params.id);

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
