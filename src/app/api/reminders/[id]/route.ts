/**
 * @route PATCH /api/reminders/[id]
 * @route DELETE /api/reminders/[id]
 * @description PATCH: Update, complete, or dismiss a reminder. DELETE: Remove a reminder.
 * @auth Required
 * @request { action?: "complete" | "dismiss", title?: string, dueDate?: string } (PATCH)
 * @response DeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import {
  updateReminder,
  completeReminder,
  dismissReminder,
  deleteReminder,
} from "@/lib/db/reminders";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = params;
    const body = await request.json();
    const { action, ...updates } = body;

    switch (action) {
      case "complete":
        completeReminder(id, authResult.userId);
        return NextResponse.json({ success: true, action: "completed" });

      case "dismiss":
        dismissReminder(id, authResult.userId);
        return NextResponse.json({ success: true, action: "dismissed" });

      default:
        // Update reminder fields
        updateReminder(id, updates, authResult.userId);
        return NextResponse.json({ success: true, action: "updated" });
    }
  } catch (error) {
    console.error("Update reminder error:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = params;
    deleteReminder(id, authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reminder error:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
