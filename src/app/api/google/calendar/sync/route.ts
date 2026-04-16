/**
 * @route POST /api/google/calendar/sync
 * @description Sync jobs and reminders to Google Calendar
 * @auth Required
 * @request { syncType?: "all" | "jobs" | "reminders" }
 * @response GoogleCalendarSyncResponse from @/types/api
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getJobs } from "@/lib/db/jobs";
import { getReminders } from "@/lib/db/reminders";
import {
  createCalendarEvent,
  createInterviewEventInput,
  createDeadlineEventInput,
  createReminderEventInput,
  type SyncResult,
} from "@/lib/google/calendar";
import { isGoogleConnected } from "@/lib/google/client";

type SyncType = "all" | "interviews" | "deadlines" | "reminders";

interface SyncResultItem {
  type: "interview" | "deadline" | "reminder";
  title: string;
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
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
    const syncType = (body.syncType || "all") as SyncType;

    const results: SyncResultItem[] = [];
    const jobs = getJobs(authResult.userId);
    const reminders = getReminders({ userId: authResult.userId });

    // Sync interviews (jobs in "interviewing" status)
    if (syncType === "all" || syncType === "interviews") {
      const interviewingJobs = jobs.filter((j) => j.status === "interviewing");

      for (const job of interviewingJobs) {
        // Use appliedAt as a proxy for interview date, or current date
        const interviewDate = job.appliedAt
          ? new Date(job.appliedAt)
          : new Date();

        const eventInput = createInterviewEventInput(job, interviewDate);
        const result = await createCalendarEvent(eventInput);

        results.push({
          type: "interview",
          title: eventInput.title,
          success: result.success,
          eventId: result.eventId,
          eventLink: result.eventLink,
          error: result.error,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Sync deadlines
    if (syncType === "all" || syncType === "deadlines") {
      const jobsWithDeadlines = jobs.filter((j) => j.deadline);

      for (const job of jobsWithDeadlines) {
        const eventInput = createDeadlineEventInput(job);

        if (eventInput) {
          const result = await createCalendarEvent(eventInput);

          results.push({
            type: "deadline",
            title: eventInput.title,
            success: result.success,
            eventId: result.eventId,
            eventLink: result.eventLink,
            error: result.error,
          });

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    // Sync reminders
    if (syncType === "all" || syncType === "reminders") {
      const activeReminders = reminders.filter((r) => !r.completed);

      for (const reminder of activeReminders) {
        const job = jobs.find((j) => j.id === reminder.jobId);
        const jobInfo = job
          ? { title: job.title, company: job.company }
          : undefined;

        const eventInput = createReminderEventInput(reminder, jobInfo);
        const result = await createCalendarEvent(eventInput);

        results.push({
          type: "reminder",
          title: eventInput.title,
          success: result.success,
          eventId: result.eventId,
          eventLink: result.eventLink,
          error: result.error,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failCount === 0,
      synced: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}
