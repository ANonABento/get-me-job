# Phase 2: Calendar Sync

> Two-way sync between Get Me Job and Google Calendar

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 2 |
| **Priority** | High |
| **Effort** | Medium (4-6 days) |
| **Dependencies** | Phase 1 (OAuth Foundation) |
| **Blocks** | None |

---

## Goals

1. Push interviews, deadlines, and reminders to Google Calendar
2. Pull events from Google Calendar to detect existing interviews
3. Provide user preferences for sync behavior
4. Handle conflicts and duplicates gracefully
5. Support selective sync (interviews only, deadlines only, etc.)

---

## Features

### 2.1 Push to Google Calendar

| Event Type | When to Push | Calendar Event Details |
|------------|--------------|----------------------|
| Interview | Job status → "interviewing" | Title: "Interview: {role} at {company}" |
| Deadline | Job has deadline date | Title: "Application Deadline: {company}" |
| Reminder | Reminder created | Title: "{reminder title}" |
| Follow-up | Follow-up reminder due | Title: "Follow up: {company}" |

### 2.2 Pull from Google Calendar

| Detection | Pattern | Action |
|-----------|---------|--------|
| Interview events | Title contains "interview" + company name | Suggest linking to job |
| Meeting with recruiter | Attendee from company domain | Suggest creating job entry |

### 2.3 Smart Features

- **Travel time blocks**: Add buffer before in-person interviews
- **Prep reminders**: 1 day before, 1 hour before notifications
- **Debrief slots**: Auto-add 15min after interviews for notes
- **Conflict detection**: Warn when scheduling overlaps

---

## Tasks

### 2.1 Calendar Operations Library

**File:** `src/lib/google/calendar.ts`

```typescript
import { google, calendar_v3 } from 'googleapis';
import { createCalendarClient } from './client';
import type { Job, Reminder } from '@/lib/db/types';

export interface CalendarEventInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  attendees?: string[];
  reminders?: { method: 'email' | 'popup'; minutes: number }[];
}

export interface SyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  event: CalendarEventInput,
  calendarId = 'primary'
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();

    const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000); // Default 1 hour

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: event.attendees?.map(email => ({ email })),
        reminders: event.reminders ? {
          useDefault: false,
          overrides: event.reminders.map(r => ({
            method: r.method,
            minutes: r.minutes,
          })),
        } : { useDefault: true },
      },
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  event: Partial<CalendarEventInput>,
  calendarId = 'primary'
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();

    const updateBody: calendar_v3.Schema$Event = {};
    if (event.title) updateBody.summary = event.title;
    if (event.description) updateBody.description = event.description;
    if (event.location) updateBody.location = event.location;
    if (event.startDate) {
      updateBody.start = {
        dateTime: event.startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
    if (event.endDate) {
      updateBody.end = {
        dateTime: event.endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    };
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId = 'primary'
): Promise<SyncResult> {
  try {
    const calendar = await createCalendarClient();

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List upcoming events (for detecting existing interviews)
 */
export async function listUpcomingEvents(
  options: {
    maxResults?: number;
    query?: string;
    timeMin?: Date;
    timeMax?: Date;
  } = {}
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = await createCalendarClient();

  const response = await calendar.events.list({
    calendarId: 'primary',
    maxResults: options.maxResults || 50,
    q: options.query,
    timeMin: (options.timeMin || new Date()).toISOString(),
    timeMax: options.timeMax?.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

/**
 * Get user's calendar list
 */
export async function getCalendarList(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
  const calendar = await createCalendarClient();

  const response = await calendar.calendarList.list();
  return response.data.items || [];
}

/**
 * Create interview event from job
 */
export function createInterviewEvent(job: Job, interviewDate: Date): CalendarEventInput {
  return {
    title: `Interview: ${job.title} at ${job.company}`,
    description: `Job interview for ${job.title} position at ${job.company}.\n\nJob URL: ${job.url || 'N/A'}\n\nNotes: ${job.notes || 'None'}`,
    startDate: interviewDate,
    location: job.location || undefined,
    reminders: [
      { method: 'popup', minutes: 60 },      // 1 hour before
      { method: 'popup', minutes: 1440 },    // 1 day before
      { method: 'email', minutes: 1440 },    // Email 1 day before
    ],
  };
}

/**
 * Create deadline event from job
 */
export function createDeadlineEvent(job: Job): CalendarEventInput | null {
  if (!job.deadline) return null;

  return {
    title: `Application Deadline: ${job.title} at ${job.company}`,
    description: `Deadline to apply for ${job.title} position at ${job.company}.\n\nJob URL: ${job.url || 'N/A'}`,
    startDate: new Date(job.deadline),
    reminders: [
      { method: 'popup', minutes: 1440 },    // 1 day before
      { method: 'popup', minutes: 10080 },   // 1 week before
    ],
  };
}

/**
 * Create reminder event
 */
export function createReminderEvent(reminder: Reminder, jobTitle?: string): CalendarEventInput {
  return {
    title: reminder.title,
    description: reminder.description || (jobTitle ? `Related to: ${jobTitle}` : undefined),
    startDate: new Date(reminder.dueDate),
    reminders: [
      { method: 'popup', minutes: 30 },
    ],
  };
}
```

### 2.2 API Routes

**File:** `src/app/api/google/calendar/events/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { listUpcomingEvents, getCalendarList } from '@/lib/google/calendar';
import { isGoogleConnected } from '@/lib/google/client';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    const events = await listUpcomingEvents({ query, maxResults });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to list calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/calendar/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { getJobs } from '@/lib/db/jobs';
import { getReminders } from '@/lib/db/reminders';
import {
  createCalendarEvent,
  createInterviewEvent,
  createDeadlineEvent,
  createReminderEvent,
} from '@/lib/google/calendar';
import { isGoogleConnected } from '@/lib/google/client';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const connected = await isGoogleConnected();
  if (!connected) {
    return NextResponse.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const { syncType } = await request.json();
    const results: { type: string; title: string; success: boolean; error?: string }[] = [];

    const jobs = getJobs();
    const reminders = getReminders();

    // Sync interviews
    if (syncType === 'all' || syncType === 'interviews') {
      const interviewingJobs = jobs.filter(j => j.status === 'interviewing');
      for (const job of interviewingJobs) {
        if (job.appliedAt) {
          const event = createInterviewEvent(job, new Date(job.appliedAt));
          const result = await createCalendarEvent(event);
          results.push({
            type: 'interview',
            title: event.title,
            success: result.success,
            error: result.error,
          });
        }
      }
    }

    // Sync deadlines
    if (syncType === 'all' || syncType === 'deadlines') {
      const jobsWithDeadlines = jobs.filter(j => j.deadline);
      for (const job of jobsWithDeadlines) {
        const event = createDeadlineEvent(job);
        if (event) {
          const result = await createCalendarEvent(event);
          results.push({
            type: 'deadline',
            title: event.title,
            success: result.success,
            error: result.error,
          });
        }
      }
    }

    // Sync reminders
    if (syncType === 'all' || syncType === 'reminders') {
      const activeReminders = reminders.filter(r => !r.completed);
      for (const reminder of activeReminders) {
        const job = jobs.find(j => j.id === reminder.jobId);
        const event = createReminderEvent(reminder, job?.title);
        const result = await createCalendarEvent(event);
        results.push({
          type: 'reminder',
          title: event.title,
          success: result.success,
          error: result.error,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failCount === 0,
      synced: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}
```

### 2.3 UI Components

**File:** `src/components/google/CalendarSyncButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
}

export function CalendarSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync(syncType: 'all' | 'interviews' | 'deadlines' | 'reminders') {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={syncing}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            Sync to Google Calendar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSync('all')}>
            Sync All Events
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSync('interviews')}>
            Sync Interviews Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSync('deadlines')}>
            Sync Deadlines Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSync('reminders')}>
            Sync Reminders Only
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {result && (
        <span className="text-sm text-muted-foreground">
          {result.success ? (
            <span className="text-green-600">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              Synced {result.synced} events
            </span>
          ) : (
            <span className="text-yellow-600">
              Synced {result.synced}, {result.failed} failed
            </span>
          )}
        </span>
      )}
    </div>
  );
}
```

### 2.4 Calendar Page Integration

Update the calendar page to show Google Calendar events alongside app events.

---

## Database Additions

```sql
-- Track which events have been synced to Google
ALTER TABLE jobs ADD COLUMN google_event_id TEXT;
ALTER TABLE reminders ADD COLUMN google_event_id TEXT;

-- Calendar sync preferences
CREATE TABLE calendar_sync_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  sync_interviews BOOLEAN DEFAULT TRUE,
  sync_deadlines BOOLEAN DEFAULT TRUE,
  sync_reminders BOOLEAN DEFAULT FALSE,
  calendar_id TEXT DEFAULT 'primary',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing

### Manual Testing Checklist

- [ ] Can sync single interview to Google Calendar
- [ ] Can sync all interviews at once
- [ ] Can sync deadlines
- [ ] Can sync reminders
- [ ] Events appear correctly in Google Calendar
- [ ] Event reminders work
- [ ] Can delete synced events
- [ ] Handles rate limits gracefully

### Unit Tests

- [ ] `createInterviewEvent` generates correct format
- [ ] `createDeadlineEvent` handles missing deadline
- [ ] `createReminderEvent` formats correctly
- [ ] Error handling for API failures

---

## Acceptance Criteria

1. [ ] User can sync interviews to Google Calendar
2. [ ] User can sync deadlines to Google Calendar
3. [ ] User can sync reminders to Google Calendar
4. [ ] Events include proper reminders (1 day, 1 hour before)
5. [ ] Sync status is displayed in UI
6. [ ] Failed syncs show error messages
7. [ ] User can choose which calendar to sync to

---

## Future Enhancements

- [ ] Automatic sync when job status changes
- [ ] Two-way sync (detect changes in Google Calendar)
- [ ] Travel time blocks for in-person interviews
- [ ] Debrief slots after interviews
- [ ] Conflict detection

---

*Status: Not Started*
*Created: March 2026*
