/**
 * Google Calendar Operations
 *
 * Push interviews, deadlines, and reminders to Google Calendar.
 * Pull events to detect existing interviews.
 */

import { calendar_v3 } from "googleapis";
import { createCalendarClient } from "./client";
import type { JobDescription } from "@/types";
import type { Reminder } from "@/lib/db/reminders";

export interface CalendarEventInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  attendees?: string[];
  reminders?: { method: "email" | "popup"; minutes: number }[];
}

export interface SyncResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  link?: string;
}

/**
 * Get the user's timezone
 */
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  event: CalendarEventInput,
  calendarId = "primary",
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();
    const timezone = getUserTimezone();

    // Default to 1 hour duration if no end date
    const endDate =
      event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);

    const eventBody: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: timezone,
      },
    };

    if (event.attendees && event.attendees.length > 0) {
      eventBody.attendees = event.attendees.map((email) => ({ email }));
    }

    if (event.reminders && event.reminders.length > 0) {
      eventBody.reminders = {
        useDefault: false,
        overrides: event.reminders.map((r) => ({
          method: r.method,
          minutes: r.minutes,
        })),
      };
    } else {
      eventBody.reminders = { useDefault: true };
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventBody,
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  event: Partial<CalendarEventInput>,
  calendarId = "primary",
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();
    const timezone = getUserTimezone();

    const updateBody: calendar_v3.Schema$Event = {};

    if (event.title) updateBody.summary = event.title;
    if (event.description) updateBody.description = event.description;
    if (event.location) updateBody.location = event.location;

    if (event.startDate) {
      updateBody.start = {
        dateTime: event.startDate.toISOString(),
        timeZone: timezone,
      };
    }

    if (event.endDate) {
      updateBody.end = {
        dateTime: event.endDate.toISOString(),
        timeZone: timezone,
      };
    }

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updateBody,
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      eventLink: response.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId = "primary",
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * List upcoming events
 */
export async function listUpcomingEvents(
  options: {
    maxResults?: number;
    query?: string;
    timeMin?: Date;
    timeMax?: Date;
  } = {},
): Promise<GoogleCalendarEvent[]> {
  const calendar = await createCalendarClient();

  const response = await calendar.events.list({
    calendarId: "primary",
    maxResults: options.maxResults || 50,
    q: options.query,
    timeMin: (options.timeMin || new Date()).toISOString(),
    timeMax: options.timeMax?.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return (response.data.items || []).map((event) => ({
    id: event.id!,
    title: event.summary || "Untitled",
    description: event.description || undefined,
    startDate: new Date(
      event.start?.dateTime || event.start?.date || Date.now(),
    ),
    endDate: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
    location: event.location || undefined,
    link: event.htmlLink || undefined,
  }));
}

/**
 * Get user's calendar list
 */
export async function getCalendarList(): Promise<
  { id: string; name: string; primary: boolean }[]
> {
  const calendar = await createCalendarClient();

  const response = await calendar.calendarList.list();

  return (response.data.items || []).map((cal) => ({
    id: cal.id!,
    name: cal.summary || "Untitled",
    primary: cal.primary || false,
  }));
}

/**
 * Create interview event from job
 */
export function createInterviewEventInput(
  job: Pick<JobDescription, "title" | "company" | "location" | "url" | "notes">,
  interviewDate: Date,
): CalendarEventInput {
  const descriptionParts = [
    `Job interview for ${job.title} position at ${job.company}.`,
    "",
  ];

  if (job.url) {
    descriptionParts.push(`Job posting: ${job.url}`);
  }

  if (job.notes) {
    descriptionParts.push("", "Notes:", job.notes);
  }

  descriptionParts.push("", "---", "Created by Slothing");

  return {
    title: `Interview: ${job.title} at ${job.company}`,
    description: descriptionParts.join("\n"),
    startDate: interviewDate,
    location: job.location || undefined,
    reminders: [
      { method: "popup", minutes: 60 }, // 1 hour before
      { method: "popup", minutes: 1440 }, // 1 day before
      { method: "email", minutes: 1440 }, // Email 1 day before
    ],
  };
}

/**
 * Create deadline event from job
 */
export function createDeadlineEventInput(
  job: Pick<JobDescription, "title" | "company" | "deadline" | "url">,
): CalendarEventInput | null {
  if (!job.deadline) return null;

  const deadlineDate = new Date(job.deadline);

  return {
    title: `Application Deadline: ${job.title} at ${job.company}`,
    description: [
      `Deadline to apply for ${job.title} position at ${job.company}.`,
      "",
      job.url ? `Apply here: ${job.url}` : "",
      "",
      "---",
      "Created by Slothing",
    ]
      .filter(Boolean)
      .join("\n"),
    startDate: deadlineDate,
    // Make it an all-day event feel by setting end 1 hour later
    endDate: new Date(deadlineDate.getTime() + 60 * 60 * 1000),
    reminders: [
      { method: "popup", minutes: 1440 }, // 1 day before
      { method: "popup", minutes: 10080 }, // 1 week before
    ],
  };
}

/**
 * Create reminder event
 */
export function createReminderEventInput(
  reminder: Reminder,
  jobInfo?: { title: string; company: string },
): CalendarEventInput {
  const descriptionParts = [reminder.description || ""];

  if (jobInfo) {
    descriptionParts.push(
      "",
      `Related to: ${jobInfo.title} at ${jobInfo.company}`,
    );
  }

  descriptionParts.push("", "---", "Created by Slothing");

  return {
    title: reminder.title,
    description: descriptionParts.join("\n"),
    startDate: new Date(reminder.dueDate),
    reminders: [{ method: "popup", minutes: 30 }],
  };
}

/**
 * Search for interview-related events
 */
export async function findInterviewEvents(
  options: { company?: string; daysAhead?: number } = {},
): Promise<GoogleCalendarEvent[]> {
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + (options.daysAhead || 30));

  const query = options.company ? `interview ${options.company}` : "interview";

  return listUpcomingEvents({
    query,
    timeMax,
    maxResults: 20,
  });
}

/**
 * Batch sync multiple events
 */
export async function batchSyncEvents(
  events: CalendarEventInput[],
): Promise<{
  total: number;
  success: number;
  failed: number;
  results: SyncResult[];
}> {
  const results: SyncResult[] = [];

  for (const event of events) {
    const result = await createCalendarEvent(event);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    total: events.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}
