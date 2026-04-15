import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { updateBankEntry, deleteBankEntry } from "@/lib/db/profile-bank";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { content, confidenceScore } = body;

    // Verify entry exists and belongs to user
    const existing = db
      .prepare("SELECT id FROM profile_bank WHERE id = ? AND user_id = ?")
      .get(params.id, authResult.userId) as { id: string } | undefined;

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    updateBankEntry(params.id, content, confidenceScore ?? 0.8);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to update bank entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const deleted = deleteBankEntry(params.id, authResult.userId);
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete bank entry" },
      { status: 500 }
    );
  }
}
