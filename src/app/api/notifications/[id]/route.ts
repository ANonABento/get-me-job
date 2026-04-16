/**
 * @route PATCH /api/notifications/[id]
 * @route DELETE /api/notifications/[id]
 * @description PATCH: Mark notification as read. DELETE: Remove notification.
 * @auth Required
 * @response DeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import {
  markNotificationRead,
  deleteNotification,
} from "@/lib/db/notifications";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = params;
    const { action } = await request.json();

    switch (action) {
      case "markRead":
        markNotificationRead(id, authResult.userId);
        return NextResponse.json({ success: true, action: "markedRead" });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
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
    deleteNotification(id, authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
