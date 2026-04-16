/**
 * @route GET /api/google/calendar/events
 * @route POST /api/google/calendar/events
 * @description List upcoming calendar events or create a new event
 * @auth Required
 * @request { title: string, description?: string, startDate: string, endDate: string, location?: string, reminders?: object }
 * @response GoogleCalendarEventsResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  listUpcomingEvents,
  createCalendarEvent,
  findInterviewEvents,
  type CalendarEventInput,
} from "@/lib/google/calendar";
import { isGoogleConnected } from "@/lib/google/client";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || undefined;
    const maxResults = parseInt(searchParams.get("maxResults") || "50");
    const daysAhead = parseInt(searchParams.get("daysAhead") || "30");
    const type = searchParams.get("type"); // 'all' or 'interviews'

    let events;

    if (type === "interviews") {
      const company = searchParams.get("company") || undefined;
      events = await findInterviewEvents({ company, daysAhead });
    } else {
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + daysAhead);

      events = await listUpcomingEvents({
        query,
        maxResults,
        timeMax,
      });
    }

    return NextResponse.json({
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to list calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "Google account not connected" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const { title, description, startDate, endDate, location, reminders } =
      body as {
        title: string;
        description?: string;
        startDate: string;
        endDate?: string;
        location?: string;
        reminders?: { method: "email" | "popup"; minutes: number }[];
      };

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, startDate" },
        { status: 400 }
      );
    }

    const eventInput: CalendarEventInput = {
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      reminders,
    };

    const result = await createCalendarEvent(eventInput);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      eventLink: result.eventLink,
    });
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
