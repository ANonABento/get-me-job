/**
 * @route GET /api/calendar/feed-url
 * @description Generate calendar feed URLs for external calendar subscriptions
 * @auth Required
 * @response CalendarFeedUrlResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getCalendarFeedUrl,
  getWebcalUrl,
  type EventType,
} from "@/lib/calendar/feed-url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const type = (request.nextUrl.searchParams.get("type") || "all") as EventType;
    const baseUrl = request.nextUrl.origin;

    return NextResponse.json({
      feedUrl: getCalendarFeedUrl(baseUrl, authResult.userId, type),
      webcalUrl: getWebcalUrl(baseUrl, authResult.userId, type),
      type,
    });
  } catch (error) {
    console.error("Calendar feed URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar feed URL" },
      { status: 500 }
    );
  }
}
