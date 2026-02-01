import { NextRequest, NextResponse } from "next/server";
import {
  getReminders,
  createReminder,
  getUpcomingReminders,
  getOverdueReminders,
  getReminderCounts,
  type ReminderType,
} from "@/lib/db/reminders";

export async function GET(request: NextRequest) {
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
        reminders = getUpcomingReminders(days);
        break;
      case "overdue":
        reminders = getOverdueReminders();
        break;
      case "counts":
        const counts = getReminderCounts();
        return NextResponse.json(counts);
      default:
        reminders = getReminders({ jobId, includeCompleted, includeDismissed });
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
  try {
    const body = await request.json();
    const { jobId, type, title, description, dueDate } = body;

    if (!jobId || !title || !dueDate) {
      return NextResponse.json(
        { error: "jobId, title, and dueDate are required" },
        { status: 400 }
      );
    }

    const reminder = createReminder({
      jobId,
      type: (type as ReminderType) || "custom",
      title,
      description,
      dueDate,
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
