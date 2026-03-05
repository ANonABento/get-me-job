import { describe, it, expect } from "vitest";
import {
  generateICSEvent,
  generateICSCalendar,
  generateGoogleCalendarURL,
  generateOutlookCalendarURL,
  type CalendarEvent,
} from "./ics-generator";

describe("ICS Generator", () => {
  const sampleEvent: CalendarEvent = {
    id: "event-1",
    title: "Interview at Tech Corp",
    description: "Phone screen with hiring manager",
    startDate: new Date("2024-03-15T14:00:00Z"),
    endDate: new Date("2024-03-15T15:00:00Z"),
    location: "Virtual - Zoom",
    type: "interview",
    url: "https://zoom.us/meeting123",
  };

  describe("generateICSEvent", () => {
    it("should generate valid ICS format with all fields", () => {
      const ics = generateICSEvent(sampleEvent);

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("END:VEVENT");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("PRODID:-//Get Me Job Assistant//EN");
    });

    it("should include event title", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("SUMMARY:Interview at Tech Corp");
    });

    it("should include description", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("DESCRIPTION:Phone screen with hiring manager");
    });

    it("should include location", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("LOCATION:Virtual - Zoom");
    });

    it("should include URL", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("URL:https://zoom.us/meeting123");
    });

    it("should include category based on type", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("CATEGORIES:INTERVIEW");
    });

    it("should include 30-minute alarm", () => {
      const ics = generateICSEvent(sampleEvent);
      expect(ics).toContain("BEGIN:VALARM");
      expect(ics).toContain("ACTION:DISPLAY");
      expect(ics).toContain("TRIGGER:-PT30M");
      expect(ics).toContain("END:VALARM");
    });

    it("should default to 1-hour duration when endDate is not provided", () => {
      const eventWithoutEnd: CalendarEvent = {
        id: "event-2",
        title: "Quick Meeting",
        startDate: new Date("2024-03-15T14:00:00Z"),
        type: "reminder",
      };

      const ics = generateICSEvent(eventWithoutEnd);
      expect(ics).toContain("DTSTART:");
      expect(ics).toContain("DTEND:");
    });

    it("should escape special characters in text", () => {
      const eventWithSpecialChars: CalendarEvent = {
        id: "event-3",
        title: "Meeting; with, special\\chars",
        description: "Line 1\nLine 2",
        startDate: new Date("2024-03-15T14:00:00Z"),
        type: "interview",
      };

      const ics = generateICSEvent(eventWithSpecialChars);
      expect(ics).toContain("\\;");
      expect(ics).toContain("\\,");
      expect(ics).toContain("\\n");
    });

    it("should handle different event types", () => {
      const deadlineEvent: CalendarEvent = {
        id: "event-4",
        title: "Application Deadline",
        startDate: new Date("2024-03-20T23:59:00Z"),
        type: "deadline",
      };

      const ics = generateICSEvent(deadlineEvent);
      expect(ics).toContain("CATEGORIES:DEADLINE");
    });
  });

  describe("generateICSCalendar", () => {
    it("should generate calendar with multiple events", () => {
      const events: CalendarEvent[] = [
        sampleEvent,
        {
          id: "event-2",
          title: "Follow-up Call",
          startDate: new Date("2024-03-16T10:00:00Z"),
          type: "follow_up",
        },
      ];

      const ics = generateICSCalendar(events);

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).toContain("X-WR-CALNAME:Get Me Job Search");

      // Should have 2 events
      const eventMatches = ics.match(/BEGIN:VEVENT/g);
      expect(eventMatches).toHaveLength(2);
    });

    it("should handle empty events array", () => {
      const ics = generateICSCalendar([]);

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).not.toContain("BEGIN:VEVENT");
    });
  });

  describe("generateGoogleCalendarURL", () => {
    it("should generate valid Google Calendar URL", () => {
      const url = generateGoogleCalendarURL(sampleEvent);

      expect(url).toContain("https://calendar.google.com/calendar/render");
      expect(url).toContain("action=TEMPLATE");
      expect(url).toContain("text=Interview+at+Tech+Corp");
    });

    it("should include dates parameter", () => {
      const url = generateGoogleCalendarURL(sampleEvent);
      expect(url).toContain("dates=");
    });

    it("should include description when provided", () => {
      const url = generateGoogleCalendarURL(sampleEvent);
      expect(url).toContain("details=");
    });

    it("should include location when provided", () => {
      const url = generateGoogleCalendarURL(sampleEvent);
      expect(url).toContain("location=");
    });

    it("should handle events without optional fields", () => {
      const minimalEvent: CalendarEvent = {
        id: "event-5",
        title: "Simple Event",
        startDate: new Date("2024-03-15T14:00:00Z"),
        type: "reminder",
      };

      const url = generateGoogleCalendarURL(minimalEvent);
      expect(url).toContain("text=Simple+Event");
      expect(url).not.toContain("details=");
      expect(url).not.toContain("location=");
    });
  });

  describe("generateOutlookCalendarURL", () => {
    it("should generate valid Outlook Calendar URL", () => {
      const url = generateOutlookCalendarURL(sampleEvent);

      expect(url).toContain("https://outlook.live.com/calendar");
      expect(url).toContain("rru=addevent");
      expect(url).toContain("subject=Interview+at+Tech+Corp");
    });

    it("should include start and end dates", () => {
      const url = generateOutlookCalendarURL(sampleEvent);
      expect(url).toContain("startdt=");
      expect(url).toContain("enddt=");
    });

    it("should include body when description provided", () => {
      const url = generateOutlookCalendarURL(sampleEvent);
      expect(url).toContain("body=");
    });

    it("should include location when provided", () => {
      const url = generateOutlookCalendarURL(sampleEvent);
      expect(url).toContain("location=");
    });
  });
});
