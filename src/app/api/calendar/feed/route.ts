import { NextRequest } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import { getReminders } from "@/lib/db/reminders";
import { getInterviewSessions } from "@/lib/db/interviews";
import { generateICSCalendar, type CalendarEvent } from "@/lib/calendar/ics-generator";

// For a production app, this would be a unique user token stored in the database
// For now, we use a simple static token since there's no real auth
const FEED_TOKEN = "columbus-feed-2024";

type EventType = "interviews" | "deadlines" | "reminders" | "all";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const type = (searchParams.get("type") || "all") as EventType;

    // Validate token (in production, this would validate against user's stored token)
    if (token !== FEED_TOKEN) {
      return new Response(JSON.stringify({ error: "Invalid feed token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const events: CalendarEvent[] = [];
    const jobs = getJobs();
    const reminders = getReminders();

    // Get interview events from jobs in interviewing status
    if (type === "interviews" || type === "all") {
      // Include jobs in interviewing status
      const interviewingJobs = jobs.filter((j) => j.status === "interviewing");
      for (const job of interviewingJobs) {
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

      // Also include interview practice sessions
      try {
        const sessions = getInterviewSessions();
        for (const session of sessions) {
          if (session.startedAt) {
            const job = jobs.find((j) => j.id === session.jobId);
            events.push({
              id: `interview-session-${session.id}`,
              title: `Interview Prep: ${job?.title || "Job"} at ${job?.company || "Company"}`,
              description: `${session.mode} interview practice session.\nQuestions: ${session.questions.length}\nStatus: ${session.completedAt ? "Completed" : "In Progress"}`,
              startDate: new Date(session.startedAt),
              type: "interview",
              location: job?.location,
            });
          }
        }
      } catch {
        // Interview sessions may not exist, skip
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

    // Return as a live calendar feed (no Content-Disposition for subscription)
    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Calendar feed error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate calendar feed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Utility to generate feed URL for the user
export function getCalendarFeedUrl(baseUrl: string, type: EventType = "all"): string {
  const url = new URL("/api/calendar/feed", baseUrl);
  url.searchParams.set("token", FEED_TOKEN);
  url.searchParams.set("type", type);
  return url.toString();
}

// Generate webcal:// URL (for calendar app subscription)
export function getWebcalUrl(baseUrl: string, type: EventType = "all"): string {
  const httpUrl = getCalendarFeedUrl(baseUrl, type);
  return httpUrl.replace(/^https?:\/\//, "webcal://");
}
