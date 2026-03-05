# Phase 5: Google Docs & Sheets Integration

> Create resumes in Docs, track data in Sheets

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 5 |
| **Priority** | Low |
| **Effort** | Small (2-3 days) |
| **Dependencies** | Phase 3 (Drive Integration) |
| **Blocks** | None |

---

## Goals

1. Export resumes directly to Google Docs format
2. Create interview prep notes in Docs
3. Export job tracker to Google Sheets
4. Create salary comparison spreadsheets
5. Generate application tracking sheets

---

## Features

### 5.1 Google Docs

| Feature | Description |
|---------|-------------|
| **Resume as Doc** | Export tailored resume as editable Google Doc |
| **Cover Letter as Doc** | Export cover letter as editable Doc |
| **Interview Notes** | Create shared doc for interview prep |
| **Company Research** | Save research as formatted Doc |

### 5.2 Google Sheets

| Feature | Description |
|---------|-------------|
| **Job Tracker Export** | Full pipeline export to Sheets |
| **Salary Tracker** | Compare offers with formulas |
| **Application Log** | Detailed tracking spreadsheet |
| **Analytics Export** | Charts and metrics in Sheets |

---

## Tasks

### 5.1 Docs Operations Library

**File:** `src/lib/google/docs.ts`

```typescript
import { google, docs_v1 } from 'googleapis';
import { createGoogleClient } from './client';
import { getOrCreateSubfolder } from './drive';

/**
 * Create Google Docs client
 */
async function createDocsClient() {
  const auth = await createGoogleClient();
  return google.docs({ version: 'v1', auth });
}

/**
 * Create a new Google Doc
 */
export async function createDoc(
  title: string,
  content?: string,
  folderId?: string
): Promise<{ docId: string; docUrl: string } | null> {
  try {
    const auth = await createGoogleClient();
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });

    // Create empty doc in Drive
    const file = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
        parents: folderId ? [folderId] : undefined,
      },
      fields: 'id, webViewLink',
    });

    const docId = file.data.id!;
    const docUrl = file.data.webViewLink!;

    // Add content if provided
    if (content) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    return { docId, docUrl };
  } catch (error) {
    console.error('Failed to create doc:', error);
    return null;
  }
}

/**
 * Create interview prep notes document
 */
export async function createInterviewPrepDoc(
  jobTitle: string,
  company: string,
  questions: { question: string; suggestedAnswer?: string }[]
): Promise<{ docId: string; docUrl: string } | null> {
  const folderId = await getOrCreateSubfolder('Company Research');

  const content = `Interview Prep: ${jobTitle} at ${company}
${'='.repeat(50)}

ABOUT THE COMPANY
-----------------
[Research notes about ${company}]


QUESTIONS TO PREPARE
--------------------
${questions.map((q, i) => `
${i + 1}. ${q.question}

   Suggested approach:
   ${q.suggestedAnswer || '[Your notes]'}

   Your answer:
   [Write your answer here]

`).join('\n')}

QUESTIONS TO ASK
----------------
1. [Your question]
2. [Your question]
3. [Your question]


POST-INTERVIEW NOTES
--------------------
Date:
Interviewer(s):
Overall impression:
Follow-up items:
`;

  return createDoc(`Interview Prep - ${company} - ${jobTitle}`, content, folderId);
}

/**
 * Export resume content to a Google Doc
 */
export async function exportResumeToDoc(
  title: string,
  resumeContent: string
): Promise<{ docId: string; docUrl: string } | null> {
  const folderId = await getOrCreateSubfolder('Resumes');
  return createDoc(title, resumeContent, folderId);
}

/**
 * Export cover letter to a Google Doc
 */
export async function exportCoverLetterToDoc(
  company: string,
  role: string,
  coverLetterContent: string
): Promise<{ docId: string; docUrl: string } | null> {
  const folderId = await getOrCreateSubfolder('Cover Letters');
  return createDoc(`Cover Letter - ${company} - ${role}`, coverLetterContent, folderId);
}
```

### 5.2 Sheets Operations Library

**File:** `src/lib/google/sheets.ts`

```typescript
import { google, sheets_v4 } from 'googleapis';
import { createGoogleClient } from './client';
import { getOrCreateRootFolder } from './drive';
import type { Job } from '@/lib/db/types';

/**
 * Create Google Sheets client
 */
async function createSheetsClient() {
  const auth = await createGoogleClient();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Create a new spreadsheet
 */
export async function createSpreadsheet(
  title: string,
  sheetTitles: string[] = ['Sheet1']
): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  try {
    const auth = await createGoogleClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: sheetTitles.map(sheetTitle => ({
          properties: { title: sheetTitle },
        })),
      },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    const spreadsheetUrl = response.data.spreadsheetUrl!;

    // Move to Get Me Job folder
    const folderId = await getOrCreateRootFolder();
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: 'id, parents',
    });

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error('Failed to create spreadsheet:', error);
    return null;
  }
}

/**
 * Append data to a sheet
 */
export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<boolean> {
  try {
    const sheets = await createSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error('Failed to append to sheet:', error);
    return false;
  }
}

/**
 * Update sheet values
 */
export async function updateSheet(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<boolean> {
  try {
    const sheets = await createSheetsClient();

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error('Failed to update sheet:', error);
    return false;
  }
}

/**
 * Export job tracker to a new spreadsheet
 */
export async function exportJobTrackerToSheet(
  jobs: Job[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  const result = await createSpreadsheet('Job Tracker Export', ['All Jobs', 'By Status', 'Timeline']);

  if (!result) return null;

  const { spreadsheetId } = result;

  // Headers
  const headers = [
    'Company', 'Title', 'Status', 'Location', 'Salary Range',
    'Applied Date', 'Deadline', 'URL', 'Notes', 'Match Score'
  ];

  // Job data
  const jobRows = jobs.map(job => [
    job.company,
    job.title,
    job.status,
    job.location || '',
    job.salaryRange || '',
    job.appliedAt || '',
    job.deadline || '',
    job.url || '',
    job.notes || '',
    job.matchScore?.toString() || '',
  ]);

  // Write to sheet
  await updateSheet(spreadsheetId, 'All Jobs!A1', [headers, ...jobRows]);

  // Create status summary
  const statusCounts: Record<string, number> = {};
  jobs.forEach(job => {
    statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
  });

  const statusRows = Object.entries(statusCounts).map(([status, count]) => [status, count]);
  await updateSheet(spreadsheetId, 'By Status!A1', [
    ['Status', 'Count'],
    ...statusRows,
  ]);

  return result;
}

/**
 * Create salary comparison spreadsheet
 */
export async function createSalaryComparisonSheet(
  offers: {
    company: string;
    role: string;
    baseSalary: number;
    bonus?: number;
    equity?: number;
    benefits?: string;
  }[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  const result = await createSpreadsheet('Salary Comparison', ['Offers', 'Analysis']);

  if (!result) return null;

  const { spreadsheetId } = result;

  const headers = ['Company', 'Role', 'Base Salary', 'Bonus', 'Equity', 'Total Comp', 'Benefits'];

  const offerRows = offers.map(offer => [
    offer.company,
    offer.role,
    offer.baseSalary,
    offer.bonus || 0,
    offer.equity || 0,
    offer.baseSalary + (offer.bonus || 0) + (offer.equity || 0),
    offer.benefits || '',
  ]);

  await updateSheet(spreadsheetId, 'Offers!A1', [headers, ...offerRows]);

  return result;
}
```

### 5.3 API Routes

**File:** `src/app/api/google/docs/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { createInterviewPrepDoc, exportResumeToDoc, exportCoverLetterToDoc } from '@/lib/google/docs';
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
    const { type, ...data } = await request.json();

    let result;
    switch (type) {
      case 'interview_prep':
        result = await createInterviewPrepDoc(data.jobTitle, data.company, data.questions);
        break;
      case 'resume':
        result = await exportResumeToDoc(data.title, data.content);
        break;
      case 'cover_letter':
        result = await exportCoverLetterToDoc(data.company, data.role, data.content);
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Docs create error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/google/sheets/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { exportJobTrackerToSheet, createSalaryComparisonSheet } from '@/lib/google/sheets';
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
    const { type, data } = await request.json();

    let result;
    switch (type) {
      case 'job_tracker':
        const jobs = getJobs();
        result = await exportJobTrackerToSheet(jobs);
        break;
      case 'salary_comparison':
        result = await createSalaryComparisonSheet(data.offers);
        break;
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Failed to create spreadsheet' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sheets export error:', error);
    return NextResponse.json(
      { error: 'Failed to export to sheets' },
      { status: 500 }
    );
  }
}
```

---

## UI Integration Points

### Interview Prep Page
- "Create Prep Doc" button → Creates Google Doc with questions template

### Resume Generation
- "Export to Google Docs" option alongside PDF

### Analytics Page
- "Export to Sheets" button for job tracker
- "Create Salary Comparison" for offer analysis

### Salary Negotiation
- "Export Offers to Sheets" for detailed comparison

---

## Testing

### Manual Testing Checklist

- [ ] Can create Google Doc with content
- [ ] Interview prep doc has correct format
- [ ] Can export jobs to Sheets
- [ ] Salary comparison sheet has formulas
- [ ] Files appear in correct Drive folders

---

## Acceptance Criteria

1. [ ] Resume exportable to Google Docs
2. [ ] Interview prep doc template works
3. [ ] Job tracker exports to Sheets with headers
4. [ ] Salary comparison has total comp calculation
5. [ ] All files organized in Get Me Job folder

---

*Status: Not Started*
*Created: March 2026*
