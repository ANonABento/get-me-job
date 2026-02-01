// ICS (iCalendar) file generator for calendar integration

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  type: "interview" | "deadline" | "follow_up" | "reminder";
  url?: string;
}

function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@columbus`;
}

export function generateICSEvent(event: CalendarEvent): string {
  const uid = generateUID();
  const dtstart = formatICSDate(event.startDate);
  const dtend = event.endDate
    ? formatICSDate(event.endDate)
    : formatICSDate(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // Default 1 hour

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Columbus Job Assistant//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  // Add category based on type
  const categories: Record<string, string> = {
    interview: "INTERVIEW",
    deadline: "DEADLINE",
    follow_up: "FOLLOW-UP",
    reminder: "REMINDER",
  };
  lines.push(`CATEGORIES:${categories[event.type] || "JOB SEARCH"}`);

  // Add alarm (reminder) 30 minutes before
  lines.push("BEGIN:VALARM");
  lines.push("ACTION:DISPLAY");
  lines.push(`DESCRIPTION:${escapeICSText(event.title)}`);
  lines.push("TRIGGER:-PT30M");
  lines.push("END:VALARM");

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

export function generateICSCalendar(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Columbus Job Assistant//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Columbus Job Search",
  ];

  for (const event of events) {
    const uid = generateUID();
    const dtstart = formatICSDate(event.startDate);
    const dtend = event.endDate
      ? formatICSDate(event.endDate)
      : formatICSDate(new Date(event.startDate.getTime() + 60 * 60 * 1000));

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeICSText(event.location)}`);
    }

    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    const categories: Record<string, string> = {
      interview: "INTERVIEW",
      deadline: "DEADLINE",
      follow_up: "FOLLOW-UP",
      reminder: "REMINDER",
    };
    lines.push(`CATEGORIES:${categories[event.type] || "JOB SEARCH"}`);

    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:${escapeICSText(event.title)}`);
    lines.push("TRIGGER:-PT30M");
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarURL(event: CalendarEvent): string {
  const startDate = event.startDate
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z/, "Z");
  const endDate = (event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000))
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z/, "Z");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDate}/${endDate}`,
  });

  if (event.description) {
    params.set("details", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Web calendar URL
 */
export function generateOutlookCalendarURL(event: CalendarEvent): string {
  const startDate = event.startDate.toISOString();
  const endDate = (
    event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)
  ).toISOString();

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: startDate,
    enddt: endDate,
  });

  if (event.description) {
    params.set("body", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
