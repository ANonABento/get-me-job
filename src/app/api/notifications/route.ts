/**
 * @route GET /api/notifications
 * @route POST /api/notifications
 * @description GET: List notifications. POST: Mark all read or delete read notifications.
 * @auth Required
 * @request { action: "mark_all_read" | "delete_read" }
 * @response NotificationsResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  deleteReadNotifications,
} from "@/lib/db/notifications";
import { notificationActionSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const countOnly = searchParams.get("countOnly") === "true";

    if (countOnly) {
      const count = getUnreadNotificationCount(authResult.userId);
      return NextResponse.json({ count });
    }

    const notifications = getNotifications({ unreadOnly, limit, userId: authResult.userId });
    const unreadCount = getUnreadNotificationCount(authResult.userId);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = notificationActionSchema.safeParse(rawData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid action. Use 'markAllRead' or 'deleteRead'" },
        { status: 400 }
      );
    }

    const { action } = parseResult.data;

    switch (action) {
      case "markAllRead":
        markAllNotificationsRead(authResult.userId);
        return NextResponse.json({ success: true, action: "markedAllRead" });

      case "deleteRead":
        deleteReadNotifications(authResult.userId);
        return NextResponse.json({ success: true, action: "deletedRead" });
    }
  } catch (error) {
    console.error("Notification action error:", error);
    return NextResponse.json(
      { error: "Failed to perform notification action" },
      { status: 500 }
    );
  }
}
