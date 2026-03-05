# Phase 4: Gmail Integration

> Auto-import jobs from recruiter emails and send follow-ups

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 4 |
| **Priority** | Medium |
| **Effort** | Large (6-8 days) |
| **Dependencies** | Phase 1 (OAuth Foundation) |
| **Blocks** | None |

---

## Goals

1. Scan inbox for job-related emails (recruiter outreach, interview confirmations)
2. Parse email content to extract job details
3. Auto-create job entries from emails
4. Detect interview invitations and create calendar events
5. Send follow-up and thank-you emails directly from the app
6. Track email conversations per job

---

## Features

### 4.1 Email Detection Patterns

| Pattern | Indicators | Action |
|---------|-----------|--------|
| **Recruiter Outreach** | From: @linkedin.com, @indeed.com, recruiting@ | Suggest creating job entry |
| **Interview Invitation** | Subject contains "interview", "schedule" | Parse date/time, create event |
| **Application Confirmation** | Subject contains "application received" | Link to existing job, update status |
| **Rejection** | Subject contains "unfortunately", "other candidates" | Update job status to "rejected" |
| **Offer** | Subject contains "offer", "congratulations" | Update job status to "offer" |

### 4.2 Email Actions

| Action | Description |
|--------|-------------|
| **Import Job** | Create job entry from recruiter email |
| **Link to Job** | Associate email thread with existing job |
| **Create Interview** | Extract date/time and create calendar event |
| **Send Follow-up** | Generate and send follow-up email |
| **Send Thank You** | Generate and send post-interview thank you |

### 4.3 Smart Features

- **Auto-labeling**: Create "Job Search" label in Gmail
- **Thread tracking**: Link entire conversation to job
- **Response detection**: Notify when company replies
- **Follow-up reminders**: "No response in 7 days" alerts

---

## Tasks

### 4.1 Gmail Operations Library

**File:** `src/lib/google/gmail.ts`

```typescript
import { google, gmail_v1 } from 'googleapis';
import { createGoogleClient } from './client';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  body?: string;
  labels: string[];
}

export interface ParsedJobEmail {
  type: 'recruiter_outreach' | 'interview_invite' | 'application_received' | 'rejection' | 'offer' | 'unknown';
  company?: string;
  role?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  interviewDate?: Date;
  location?: string;
  confidence: number; // 0-1 confidence score
}

/**
 * Create Gmail client
 */
async function createGmailClient() {
  const auth = await createGoogleClient();
  return google.gmail({ version: 'v1', auth });
}

/**
 * List messages matching a query
 */
export async function listMessages(
  query: string,
  maxResults = 20
): Promise<GmailMessage[]> {
  const gmail = await createGmailClient();

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  if (!response.data.messages) {
    return [];
  }

  const messages: GmailMessage[] = [];
  for (const msg of response.data.messages) {
    const full = await getMessage(msg.id!);
    if (full) messages.push(full);
  }

  return messages;
}

/**
 * Get full message details
 */
export async function getMessage(messageId: string): Promise<GmailMessage | null> {
  const gmail = await createGmailClient();

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = response.data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

  const body = extractBody(response.data.payload);

  return {
    id: response.data.id!,
    threadId: response.data.threadId!,
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: new Date(getHeader('Date')),
    snippet: response.data.snippet || '',
    body,
    labels: response.data.labelIds || [],
  };
}

/**
 * Extract body from message payload
 */
function extractBody(payload?: gmail_v1.Schema$MessagePart): string {
  if (!payload) return '';

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        // Strip HTML tags for plain text
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }

  return '';
}

/**
 * Search for job-related emails
 */
export async function searchJobEmails(
  options: {
    since?: Date;
    maxResults?: number;
  } = {}
): Promise<GmailMessage[]> {
  const queries = [
    // Recruiter outreach
    'from:linkedin.com subject:job OR subject:opportunity OR subject:position',
    'from:indeed.com subject:job OR subject:apply',
    'subject:recruiter OR subject:recruiting',
    // Interview invitations
    'subject:interview schedule OR subject:interview invitation',
    // Application responses
    'subject:application received OR subject:application submitted',
    'subject:thank you for applying',
  ];

  let combinedQuery = `(${queries.join(' OR ')})`;

  if (options.since) {
    const dateStr = options.since.toISOString().split('T')[0].replace(/-/g, '/');
    combinedQuery += ` after:${dateStr}`;
  }

  return listMessages(combinedQuery, options.maxResults || 50);
}

/**
 * Parse email to extract job information
 */
export function parseJobEmail(message: GmailMessage): ParsedJobEmail {
  const subject = message.subject.toLowerCase();
  const body = (message.body || message.snippet).toLowerCase();
  const from = message.from.toLowerCase();

  let type: ParsedJobEmail['type'] = 'unknown';
  let confidence = 0.5;

  // Detect email type
  if (subject.includes('interview') && (subject.includes('schedule') || subject.includes('invitation'))) {
    type = 'interview_invite';
    confidence = 0.9;
  } else if (subject.includes('unfortunately') || subject.includes('other candidates') || subject.includes('not moving forward')) {
    type = 'rejection';
    confidence = 0.85;
  } else if (subject.includes('offer') || subject.includes('congratulations')) {
    type = 'offer';
    confidence = 0.8;
  } else if (subject.includes('application received') || subject.includes('thank you for applying')) {
    type = 'application_received';
    confidence = 0.8;
  } else if (from.includes('linkedin') || from.includes('indeed') || from.includes('recruiter') || from.includes('talent')) {
    type = 'recruiter_outreach';
    confidence = 0.7;
  }

  // Extract company name (basic heuristic)
  const companyPatterns = [
    /at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is|\s+has|\s+would|\.|,)/,
    /from\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+and|\s+regarding|\.|,)/,
    /([A-Z][A-Za-z0-9\s&]+?)\s+(?:is looking|is hiring|has an opening)/,
  ];

  let company: string | undefined;
  for (const pattern of companyPatterns) {
    const match = message.body?.match(pattern) || message.snippet.match(pattern);
    if (match) {
      company = match[1].trim();
      break;
    }
  }

  // Extract role (basic heuristic)
  const rolePatterns = [
    /(?:position|role|job)(?:\s+of|\s+as|:)?\s*([A-Za-z\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Scientist))/i,
    /(Senior|Junior|Lead|Staff|Principal)?\s*(Software|Frontend|Backend|Full Stack|Data|Product|UX|UI)?\s*(Engineer|Developer|Manager|Designer|Analyst|Scientist)/i,
  ];

  let role: string | undefined;
  for (const pattern of rolePatterns) {
    const match = message.body?.match(pattern) || message.subject.match(pattern);
    if (match) {
      role = match[0].trim();
      break;
    }
  }

  // Extract recruiter info from "From" header
  const fromMatch = message.from.match(/^(.+?)\s*<(.+?)>$/);
  const recruiterName = fromMatch?.[1]?.replace(/"/g, '').trim();
  const recruiterEmail = fromMatch?.[2] || message.from;

  // Try to extract interview date
  let interviewDate: Date | undefined;
  const datePatterns = [
    /(\w+day),?\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
  ];

  for (const pattern of datePatterns) {
    const match = message.body?.match(pattern);
    if (match) {
      try {
        interviewDate = new Date(match[0]);
        if (isNaN(interviewDate.getTime())) {
          interviewDate = undefined;
        }
      } catch {
        // Invalid date, skip
      }
      break;
    }
  }

  return {
    type,
    company,
    role,
    recruiterName,
    recruiterEmail,
    interviewDate,
    confidence,
  };
}

/**
 * Send an email
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options: {
    replyTo?: string;
    threadId?: string;
  } = {}
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const gmail = await createGmailClient();

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      options.replyTo ? `In-Reply-To: ${options.replyTo}` : '',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].filter(Boolean).join('\r\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: options.threadId,
      },
    });

    return {
      success: true,
      messageId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create or get "Job Search" label
 */
export async function getOrCreateJobSearchLabel(): Promise<string | null> {
  try {
    const gmail = await createGmailClient();

    // Check if label exists
    const labels = await gmail.users.labels.list({ userId: 'me' });
    const existing = labels.data.labels?.find(l => l.name === 'Job Search');
    if (existing?.id) return existing.id;

    // Create label
    const created = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: 'Job Search',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });

    return created.data.id || null;
  } catch (error) {
    console.error('Failed to create label:', error);
    return null;
  }
}

/**
 * Add label to message
 */
export async function addLabelToMessage(messageId: string, labelId: string): Promise<boolean> {
  try {
    const gmail = await createGmailClient();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to add label:', error);
    return false;
  }
}
```

### 4.2 API Routes

**File:** `src/app/api/google/gmail/scan/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { searchJobEmails, parseJobEmail } from '@/lib/google/gmail';
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
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const messages = await searchJobEmails({ since, maxResults: 50 });

    const parsed = messages.map(msg => ({
      ...msg,
      parsed: parseJobEmail(msg),
    }));

    // Sort by confidence
    parsed.sort((a, b) => b.parsed.confidence - a.parsed.confidence);

    return NextResponse.json({
      count: parsed.length,
      emails: parsed,
    });
  } catch (error) {
    console.error('Gmail scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan emails' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/gmail/send/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { sendEmail } from '@/lib/google/gmail';
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
    const { to, subject, body, replyTo, threadId } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, subject, body, { replyTo, threadId });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Gmail send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

### 4.3 UI Components

**File:** `src/components/google/GmailImportModal.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, Plus, Building, Briefcase } from 'lucide-react';

interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  date: Date;
  snippet: string;
  parsed: {
    type: string;
    company?: string;
    role?: string;
    confidence: number;
  };
}

interface GmailImportModalProps {
  onImport: (email: ParsedEmail) => void;
}

export function GmailImportModal({ onImport }: GmailImportModalProps) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      scanEmails();
    }
  }, [open]);

  async function scanEmails() {
    setLoading(true);
    try {
      const res = await fetch('/api/google/gmail/scan?days=30');
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Failed to scan emails:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleImport(email: ParsedEmail) {
    onImport(email);
    setOpen(false);
  }

  const typeColors: Record<string, string> = {
    recruiter_outreach: 'bg-blue-100 text-blue-800',
    interview_invite: 'bg-green-100 text-green-800',
    application_received: 'bg-gray-100 text-gray-800',
    rejection: 'bg-red-100 text-red-800',
    offer: 'bg-yellow-100 text-yellow-800',
    unknown: 'bg-gray-100 text-gray-600',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Import from Gmail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Jobs from Gmail</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Scanning emails...</span>
          </div>
        ) : emails.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No job-related emails found in the last 30 days
          </p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {emails.map(email => (
              <div
                key={email.id}
                className="border rounded-lg p-4 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeColors[email.parsed.type]}>
                        {email.parsed.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(email.parsed.confidence * 100)}% confident
                      </span>
                    </div>
                    <p className="font-medium truncate">{email.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      From: {email.from}
                    </p>
                    {(email.parsed.company || email.parsed.role) && (
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {email.parsed.company && (
                          <span className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {email.parsed.company}
                          </span>
                        )}
                        {email.parsed.role && (
                          <span className="flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {email.parsed.role}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleImport(email)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Database Additions

```sql
-- Track imported Gmail messages
CREATE TABLE gmail_imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  thread_id TEXT,
  job_id TEXT REFERENCES jobs(id),
  import_type TEXT, -- 'recruiter_outreach', 'interview_invite', etc.
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Link email threads to jobs
ALTER TABLE jobs ADD COLUMN gmail_thread_id TEXT;
```

---

## Security Considerations

1. **Gmail scope is sensitive** - Request only when user explicitly enables
2. **Email content** - Never store full email content, only metadata
3. **Send permissions** - Clearly show what will be sent before sending
4. **Rate limits** - Gmail API has quota limits, handle gracefully

---

## Testing

### Manual Testing Checklist

- [ ] Can scan inbox for job emails
- [ ] Correctly identifies email types
- [ ] Can import job from email
- [ ] Can send follow-up email
- [ ] Labels are created/applied
- [ ] Thread linking works

---

## Acceptance Criteria

1. [ ] Scan finds recruiter outreach emails
2. [ ] Scan finds interview invitations
3. [ ] Can create job entry from email
4. [ ] Can send follow-up from app
5. [ ] Email threads linked to jobs
6. [ ] "Job Search" label auto-created

---

*Status: Not Started*
*Created: March 2026*
