/**
 * @route GET /api/calendar/export
 * @description Export calendar events as an ICS file download
 * @auth Required
 * @response ICS file (text/calendar)
 */
import { NextRequest } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import { getReminders } from "@/lib/db/reminders";
import { generateICSCalendar, type CalendarEvent } from "@/lib/calendar/ics-generator";
import { requireAuth, isAuthError } from "@/lib/auth";

type EventType = "interviews" | "deadlines" | "reminders" | "all";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get("type") || "all") as EventType;

    const events: CalendarEvent[] = [];
    const jobs = getJobs(authResult.userId);
    const reminders = getReminders({ userId: authResult.userId });

    // Get jobs that are in interviewing status
    if (type === "interviews" || type === "all") {
      const interviewingJobs = jobs.filter((j) => j.status === "interviewing");
      for (const job of interviewingJobs) {
        // If we have an appliedAt date, assume interview might be scheduled
        if (job.appliedAt) {
          events.push({
            id: `interview-${job.id}`,
            title: `Interview: ${job.title} at ${job.company}`,
            description: `Job interview for ${job.title} position at ${job.company}.\n\n${job.description?.slice(0, 200)}...`,
            startDate: new Date(job.appliedAt),
            type: "interview",
            location: job.location,
            url: job.url,
          });
        }
      }
    }

    // Get jobs with deadlines
    if (type === "deadlines" || type === "all") {
      const jobsWithDeadlines = jobs.filter((j) => j.deadline);
      for (const job of jobsWithDeadlines) {
        events.push({
          id: `deadline-${job.id}`,
          title: `Application Deadline: ${job.title} at ${job.company}`,
          description: `Deadline to apply for ${job.title} position at ${job.company}.`,
          startDate: new Date(job.deadline!),
          type: "deadline",
          url: job.url,
        });
      }
    }

    // Get reminders
    if (type === "reminders" || type === "all") {
      for (const reminder of reminders) {
        if (!reminder.completed) {
          const job = jobs.find((j) => j.id === reminder.jobId);
          events.push({
            id: `reminder-${reminder.id}`,
            title: reminder.title,
            description: reminder.description || (job ? `For: ${job.title} at ${job.company}` : ""),
            startDate: new Date(reminder.dueDate),
            type: reminder.type === "follow_up" ? "follow_up" : "reminder",
          });
        }
      }
    }

    // Sort events by date
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Generate ICS content
    const icsContent = generateICSCalendar(events);

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="taida-${type}-events.ics"`,
      },
    });
  } catch (error) {
    console.error("Calendar export error:", error);
    return new Response(JSON.stringify({ error: "Failed to export calendar" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
