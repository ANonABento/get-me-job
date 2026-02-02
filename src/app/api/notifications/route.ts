import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  deleteReadNotifications,
} from "@/lib/db/notifications";

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

    const { action } = await request.json();

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    switch (action) {
      case "markAllRead":
        markAllNotificationsRead();
        return NextResponse.json({ success: true, action: "markedAllRead" });

      case "deleteRead":
        deleteReadNotifications();
        return NextResponse.json({ success: true, action: "deletedRead" });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Notification action error:", error);
    return NextResponse.json(
      { error: "Failed to perform notification action" },
      { status: 500 }
    );
  }
}
