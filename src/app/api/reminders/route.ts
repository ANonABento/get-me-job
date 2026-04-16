/**
 * @route GET /api/reminders
 * @route POST /api/reminders
 * @description GET: List reminders with filters. POST: Create a new reminder.
 * @auth Required
 * @request { jobId: string, type: string, title: string, description?: string, dueDate: string } (POST)
 * @response RemindersResponse | ReminderCreateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getReminders,
  createReminder,
  getUpcomingReminders,
  getOverdueReminders,
  getReminderCounts,
} from "@/lib/db/reminders";
import { createReminderSchema, type ReminderType } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;
    const includeCompleted = searchParams.get("includeCompleted") === "true";
    const includeDismissed = searchParams.get("includeDismissed") === "true";
    const filter = searchParams.get("filter");

    let reminders;

    switch (filter) {
      case "upcoming":
        const days = parseInt(searchParams.get("days") || "7", 10);
        reminders = getUpcomingReminders(days, authResult.userId);
        break;
      case "overdue":
        reminders = getOverdueReminders(authResult.userId);
        break;
      case "counts":
        const counts = getReminderCounts(authResult.userId);
        return NextResponse.json(counts);
      default:
        reminders = getReminders({
          jobId,
          includeCompleted,
          includeDismissed,
          userId: authResult.userId,
        });
    }

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
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
    const parseResult = createReminderSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { jobId, type, title, description, dueDate } = parseResult.data;

    const reminder = createReminder({
      jobId,
      type: type as ReminderType,
      title,
      description,
      dueDate,
    }, authResult.userId);

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
