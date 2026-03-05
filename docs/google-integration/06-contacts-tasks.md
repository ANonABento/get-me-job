# Phase 6: Google Contacts & Tasks Integration

> Sync networking contacts and reminders with Google

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 6 |
| **Priority** | Low |
| **Effort** | Small (2-3 days) |
| **Dependencies** | Phase 1 (OAuth Foundation) |
| **Blocks** | None |

---

## Goals

1. Import contacts from Google for networking tracking
2. Export recruiter contacts to Google Contacts
3. Sync reminders to Google Tasks
4. Create follow-up tasks automatically

---

## Features

### 6.1 Google Contacts

| Feature | Description |
|---------|-------------|
| **Import Contacts** | Pull contacts for networking features |
| **Save Recruiter** | Add recruiter to Google Contacts |
| **Contact Notes** | Sync job-related notes to contact |
| **Label/Group** | Create "Job Search" contact group |

### 6.2 Google Tasks

| Feature | Description |
|---------|-------------|
| **Sync Reminders** | Push app reminders to Google Tasks |
| **Follow-up Tasks** | Auto-create "Send thank you" tasks |
| **Deadline Tasks** | Application deadlines as tasks |
| **Two-way Sync** | Mark complete in either place |

---

## Tasks

### 6.1 Contacts Operations Library

**File:** `src/lib/google/contacts.ts`

```typescript
import { google, people_v1 } from 'googleapis';
import { createGoogleClient } from './client';

export interface GoogleContact {
  resourceName: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
}

/**
 * Create People API client (for Contacts)
 */
async function createPeopleClient() {
  const auth = await createGoogleClient();
  return google.people({ version: 'v1', auth });
}

/**
 * List contacts
 */
export async function listContacts(
  pageSize = 100,
  query?: string
): Promise<GoogleContact[]> {
  try {
    const people = await createPeopleClient();

    const response = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize,
      personFields: 'names,emailAddresses,phoneNumbers,organizations,biographies',
    });

    const contacts: GoogleContact[] = [];
    for (const person of response.data.connections || []) {
      const contact: GoogleContact = {
        resourceName: person.resourceName!,
        name: person.names?.[0]?.displayName || 'Unknown',
        email: person.emailAddresses?.[0]?.value,
        phone: person.phoneNumbers?.[0]?.value,
        company: person.organizations?.[0]?.name,
        title: person.organizations?.[0]?.title,
        notes: person.biographies?.[0]?.value,
      };

      // Filter by query if provided
      if (query) {
        const searchStr = `${contact.name} ${contact.email} ${contact.company}`.toLowerCase();
        if (!searchStr.includes(query.toLowerCase())) {
          continue;
        }
      }

      contacts.push(contact);
    }

    return contacts;
  } catch (error) {
    console.error('Failed to list contacts:', error);
    return [];
  }
}

/**
 * Create a new contact
 */
export async function createContact(contact: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
}): Promise<string | null> {
  try {
    const people = await createPeopleClient();

    const response = await people.people.createContact({
      requestBody: {
        names: [{ givenName: contact.name }],
        emailAddresses: contact.email ? [{ value: contact.email }] : undefined,
        phoneNumbers: contact.phone ? [{ value: contact.phone }] : undefined,
        organizations: contact.company ? [{
          name: contact.company,
          title: contact.title,
        }] : undefined,
        biographies: contact.notes ? [{ value: contact.notes }] : undefined,
      },
    });

    return response.data.resourceName || null;
  } catch (error) {
    console.error('Failed to create contact:', error);
    return null;
  }
}

/**
 * Update contact notes
 */
export async function updateContactNotes(
  resourceName: string,
  notes: string
): Promise<boolean> {
  try {
    const people = await createPeopleClient();

    // Get current etag
    const current = await people.people.get({
      resourceName,
      personFields: 'biographies',
    });

    await people.people.updateContact({
      resourceName,
      updatePersonFields: 'biographies',
      requestBody: {
        etag: current.data.etag,
        biographies: [{ value: notes }],
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to update contact:', error);
    return false;
  }
}

/**
 * Search contacts by company
 */
export async function searchContactsByCompany(company: string): Promise<GoogleContact[]> {
  const allContacts = await listContacts(500);
  return allContacts.filter(c =>
    c.company?.toLowerCase().includes(company.toLowerCase())
  );
}

/**
 * Create recruiter contact from job email
 */
export async function createRecruiterContact(
  name: string,
  email: string,
  company: string,
  jobTitle?: string
): Promise<string | null> {
  return createContact({
    name,
    email,
    company,
    title: 'Recruiter',
    notes: jobTitle ? `Recruiting for: ${jobTitle}` : 'Met during job search',
  });
}
```

### 6.2 Tasks Operations Library

**File:** `src/lib/google/tasks.ts`

```typescript
import { google, tasks_v1 } from 'googleapis';
import { createGoogleClient } from './client';
import type { Reminder } from '@/lib/db/types';

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

const JOB_SEARCH_TASK_LIST = 'Job Search';

/**
 * Create Tasks API client
 */
async function createTasksClient() {
  const auth = await createGoogleClient();
  return google.tasks({ version: 'v1', auth });
}

/**
 * Get or create "Job Search" task list
 */
export async function getOrCreateJobSearchTaskList(): Promise<string | null> {
  try {
    const tasks = await createTasksClient();

    // Check for existing list
    const lists = await tasks.tasklists.list();
    const existing = lists.data.items?.find(l => l.title === JOB_SEARCH_TASK_LIST);
    if (existing?.id) return existing.id;

    // Create new list
    const created = await tasks.tasklists.insert({
      requestBody: { title: JOB_SEARCH_TASK_LIST },
    });

    return created.data.id || null;
  } catch (error) {
    console.error('Failed to get/create task list:', error);
    return null;
  }
}

/**
 * List tasks from Job Search list
 */
export async function listJobSearchTasks(): Promise<GoogleTask[]> {
  try {
    const tasks = await createTasksClient();
    const listId = await getOrCreateJobSearchTaskList();
    if (!listId) return [];

    const response = await tasks.tasks.list({
      tasklist: listId,
      showCompleted: true,
      maxResults: 100,
    });

    return (response.data.items || []).map(task => ({
      id: task.id!,
      title: task.title || '',
      notes: task.notes,
      due: task.due,
      status: task.status as 'needsAction' | 'completed',
    }));
  } catch (error) {
    console.error('Failed to list tasks:', error);
    return [];
  }
}

/**
 * Create a task
 */
export async function createTask(task: {
  title: string;
  notes?: string;
  due?: Date;
}): Promise<string | null> {
  try {
    const tasks = await createTasksClient();
    const listId = await getOrCreateJobSearchTaskList();
    if (!listId) return null;

    const response = await tasks.tasks.insert({
      tasklist: listId,
      requestBody: {
        title: task.title,
        notes: task.notes,
        due: task.due?.toISOString(),
      },
    });

    return response.data.id || null;
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string): Promise<boolean> {
  try {
    const tasks = await createTasksClient();
    const listId = await getOrCreateJobSearchTaskList();
    if (!listId) return false;

    await tasks.tasks.patch({
      tasklist: listId,
      task: taskId,
      requestBody: { status: 'completed' },
    });

    return true;
  } catch (error) {
    console.error('Failed to complete task:', error);
    return false;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const tasks = await createTasksClient();
    const listId = await getOrCreateJobSearchTaskList();
    if (!listId) return false;

    await tasks.tasks.delete({
      tasklist: listId,
      task: taskId,
    });

    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
}

/**
 * Sync app reminder to Google Tasks
 */
export async function syncReminderToTasks(
  reminder: Reminder,
  jobTitle?: string
): Promise<string | null> {
  const notes = jobTitle
    ? `${reminder.description || ''}\n\nRelated to: ${jobTitle}`
    : reminder.description;

  return createTask({
    title: reminder.title,
    notes: notes || undefined,
    due: new Date(reminder.dueDate),
  });
}

/**
 * Create follow-up task after interview
 */
export async function createFollowUpTask(
  company: string,
  role: string,
  interviewDate: Date
): Promise<string | null> {
  // Task due 24 hours after interview
  const dueDate = new Date(interviewDate);
  dueDate.setDate(dueDate.getDate() + 1);

  return createTask({
    title: `Send thank you email to ${company}`,
    notes: `Follow up after your ${role} interview at ${company}.\n\nInterview date: ${interviewDate.toLocaleDateString()}`,
    due: dueDate,
  });
}

/**
 * Create application deadline task
 */
export async function createDeadlineTask(
  company: string,
  role: string,
  deadline: Date
): Promise<string | null> {
  return createTask({
    title: `Apply to ${role} at ${company}`,
    notes: `Application deadline: ${deadline.toLocaleDateString()}`,
    due: deadline,
  });
}
```

### 6.3 API Routes

**File:** `src/app/api/google/tasks/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { syncReminderToTasks, createFollowUpTask } from '@/lib/google/tasks';
import { getReminders } from '@/lib/db/reminders';
import { getJobs } from '@/lib/db/jobs';
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

    const results: { title: string; success: boolean }[] = [];
    const jobs = getJobs();
    const reminders = getReminders();

    if (syncType === 'all' || syncType === 'reminders') {
      const activeReminders = reminders.filter(r => !r.completed);
      for (const reminder of activeReminders) {
        const job = jobs.find(j => j.id === reminder.jobId);
        const taskId = await syncReminderToTasks(reminder, job?.title);
        results.push({
          title: reminder.title,
          success: taskId !== null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Tasks sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync tasks' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/contacts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { listContacts, createRecruiterContact, searchContactsByCompany } from '@/lib/google/contacts';
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
    const company = searchParams.get('company');
    const query = searchParams.get('query');

    let contacts;
    if (company) {
      contacts = await searchContactsByCompany(company);
    } else {
      contacts = await listContacts(100, query || undefined);
    }

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Contacts list error:', error);
    return NextResponse.json(
      { error: 'Failed to list contacts' },
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
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  try {
    const { name, email, company, jobTitle } = await request.json();

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, company' },
        { status: 400 }
      );
    }

    const resourceName = await createRecruiterContact(name, email, company, jobTitle);

    if (!resourceName) {
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, resourceName });
  } catch (error) {
    console.error('Contact create error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
```

---

## Database Additions

```sql
-- Track synced tasks
ALTER TABLE reminders ADD COLUMN google_task_id TEXT;

-- Track contacts linked to jobs
CREATE TABLE job_contacts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id),
  google_contact_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT, -- 'recruiter', 'hiring_manager', 'interviewer'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI Integration Points

### Reminders Page
- "Sync to Google Tasks" button
- Task sync status indicator

### Job Detail Page
- "Contacts at {Company}" section
- "Add to Google Contacts" button for recruiters

### After Interview
- Auto-create follow-up task option

---

## Testing

### Manual Testing Checklist

- [ ] Can list Google contacts
- [ ] Can search contacts by company
- [ ] Can create recruiter contact
- [ ] Can sync reminders to Tasks
- [ ] Can complete task in Google Tasks
- [ ] Task list "Job Search" created

---

## Acceptance Criteria

1. [ ] Reminders sync to Google Tasks
2. [ ] Follow-up tasks auto-created
3. [ ] Recruiter contacts saved to Google
4. [ ] Company contact search works
5. [ ] Two-way task completion sync

---

*Status: Not Started*
*Created: March 2026*
