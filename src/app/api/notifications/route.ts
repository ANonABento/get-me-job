import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  deleteReadNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/lib/db/notifications";
import { notificationActionSchema } from "@/features/notifications/schemas";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const countOnly = searchParams.get("countOnly") === "true";

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    if (countOnly) {
      const count = getUnreadNotificationCount();
      return NextResponse.json({ count });
    }

    const notifications = getNotifications({ unreadOnly, limit });
    const unreadCount = getUnreadNotificationCount();

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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    switch (action) {
      case "markAllRead":
        markAllNotificationsRead();
        return NextResponse.json({ success: true, action: "markedAllRead" });

      case "deleteRead":
        deleteReadNotifications();
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
