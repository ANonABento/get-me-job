# API Reference

All routes live under `/api/`. Every authenticated route requires a valid session established by the auth middleware (`requireAuth`). Responses are JSON unless noted otherwise.

## Authentication

The app uses session-based auth via `requireAuth()`. Unauthenticated requests receive `401 Unauthorized`.

Extension routes use a separate token-based mechanism via the `X-Extension-Token` header (see [Browser Extension](#browser-extension)).

---

## Common Error Shape

```json
{ "error": "Human-readable message" }
```

Validation failures include a field-level breakdown:

```json
{
  "error": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

**Status codes used across all routes:**

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `404` | Resource not found |
| `429` | Rate limited (LLM endpoints) |
| `500` | Internal server error |

---

## Profile

### `GET /api/profile`

Fetch the current user's full profile.

**Response:**
```json
{
  "profile": {
    "id": "default",
    "contact": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-0100",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/janedoe",
      "github": "https://github.com/janedoe",
      "website": "https://janedoe.dev"
    },
    "summary": "Full-stack engineer with 5 years experience...",
    "experiences": [],
    "education": [],
    "skills": [],
    "projects": [],
    "certifications": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-06-01T00:00:00.000Z"
  }
}
```

---

### `PUT /api/profile`

Replace profile fields. All fields are optional — only supplied fields are updated.

**Schema** (`updateProfileSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `contact` | object | See `contactInfoSchema` below |
| `summary` | string | Max 5000 chars |
| `experiences` | Experience[] | Full replace |
| `education` | Education[] | Full replace |
| `skills` | Skill[] | Full replace |
| `projects` | Project[] | Full replace |
| `certifications` | Certification[] | Full replace |
| `rawText` | string | Raw resume text |

**`contactInfoSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Required, max 200 |
| `email` | string | Optional, valid email or `""` |
| `phone` | string | Optional, max 50 |
| `location` | string | Optional, max 200 |
| `linkedin` | string | Optional, valid URL or `""` |
| `github` | string | Optional, valid URL or `""` |
| `website` | string | Optional, valid URL or `""` |

**`experienceSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Required |
| `company` | string | Min 1, max 200 |
| `title` | string | Min 1, max 200 |
| `location` | string | Optional, max 200 |
| `startDate` | string | Required |
| `endDate` | string | Optional |
| `current` | boolean | Required |
| `description` | string | Max 5000 |
| `highlights` | string[] | |
| `skills` | string[] | |

**`educationSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Required |
| `institution` | string | Min 1, max 200 |
| `degree` | string | Min 1, max 200 |
| `field` | string | Max 200 |
| `startDate` | string | Optional |
| `endDate` | string | Optional |
| `gpa` | string | Optional, max 20 |
| `highlights` | string[] | |

**`skillSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Required |
| `name` | string | Min 1, max 100 |
| `category` | enum | `technical` \| `soft` \| `language` \| `tool` \| `other` |
| `proficiency` | enum | Optional: `beginner` \| `intermediate` \| `advanced` \| `expert` |

**`projectSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Required |
| `name` | string | Min 1, max 200 |
| `description` | string | Max 2000 |
| `url` | string | Optional, valid URL or `""` |
| `technologies` | string[] | |
| `highlights` | string[] | |

**`certificationSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Required |
| `name` | string | Min 1, max 200 |
| `issuer` | string | Min 1, max 200 |
| `date` | string | Optional |
| `url` | string | Optional, valid URL or `""` |

**Response:**
```json
{ "success": true, "profile": { "...updated profile..." } }
```

---

### `DELETE /api/profile`

Clear all profile data for the current user.

**Response:**
```json
{ "success": true }
```

---

### `GET /api/profile/versions`

List saved profile versions.

---

### `GET /api/profile/versions/[id]`

Fetch a specific profile version snapshot.

---

### `POST /api/profile/versions/[id]/restore`

Restore a profile version.

---

### `GET /api/profile/bank`

List knowledge bank entries grouped by category.

---

### `GET /api/profile/bank/search`

Search knowledge bank entries.

**Query params:** `q` (search query)

---

## Knowledge Bank

### `GET /api/bank`

List bank entries with optional filters.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `q` | string | Full-text search |
| `type` | string | Filter by entry type |
| `category` | string | Filter by category |

---

### `POST /api/bank`

Create a new bank entry.

**Request body:**
```json
{
  "category": "experience",
  "content": { "...structured content..." }
}
```

---

### `PATCH /api/bank/[id]`
### `PUT /api/bank/[id]`

Update a bank entry.

**Request body:**
```json
{
  "content": { "...updated content..." },
  "confidenceScore": 0.95
}
```

---

### `DELETE /api/bank/[id]`

Delete a bank entry.

---

### `GET /api/bank/documents`

List source documents linked to bank entries.

---

### `DELETE /api/bank/documents`

Delete multiple source documents.

**Request body:**
```json
{ "documentIds": ["doc-1", "doc-2"] }
```

---

### `DELETE /api/bank/documents/[id]`

Delete a single source document and its linked chunks.

**Response:**
```json
{ "success": true, "chunksDeleted": 4 }
```

---

## Jobs

### `GET /api/jobs`

List all jobs for the current user.

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-abc123",
      "title": "Software Engineer",
      "company": "Acme Corp",
      "location": "Remote",
      "type": "full-time",
      "remote": true,
      "salary": "$120k - $150k",
      "status": "applied",
      "url": "https://example.com/job",
      "deadline": "2024-07-01",
      "keywords": ["React", "TypeScript"],
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/jobs`

Create a new job. Keywords are extracted from the description via LLM (falls back to regex pattern matching if no LLM is configured).

**Schema** (`createJobSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required, min 1, max 200 |
| `company` | string | Required, min 1, max 200 |
| `description` | string | Required, min 10, max 50 000 |
| `location` | string | Optional, max 200 |
| `type` | enum | Optional: `full-time` \| `part-time` \| `contract` \| `internship` |
| `remote` | boolean | Optional |
| `salary` | string | Optional, max 100 |
| `requirements` | string[] | Optional |
| `responsibilities` | string[] | Optional |
| `keywords` | string[] | Optional (auto-extracted if omitted) |
| `url` | string | Optional, valid URL or `""` |
| `status` | enum | Optional, default `saved`. See [Job Statuses](#job-statuses) |
| `deadline` | string | Optional |
| `notes` | string | Optional, max 5000 |

**Example request:**
```json
{
  "title": "Frontend Engineer",
  "company": "Acme Corp",
  "description": "We are looking for a React developer...",
  "type": "full-time",
  "remote": true,
  "url": "https://acme.com/careers/frontend"
}
```

**Response:**
```json
{ "job": { "id": "job-abc123", "...all job fields..." } }
```

---

### `GET /api/jobs/[id]`

Fetch a single job by ID.

**Response:**
```json
{ "job": { "id": "job-abc123", "...all job fields..." } }
```

---

### `PUT /api/jobs/[id]`
### `PATCH /api/jobs/[id]`

Update a job. All fields from `createJobSchema` are optional, plus:

| Field | Type | Notes |
|-------|------|-------|
| `appliedAt` | string | ISO timestamp |

Status changes to `applied`, `interviewing`, `offered`, or `rejected` are tracked for analytics.

**Response:**
```json
{ "job": { "...updated job..." } }
```

---

### `DELETE /api/jobs/[id]`

Delete a job.

**Response:**
```json
{ "success": true }
```

---

### `GET /api/jobs/[id]/resumes`

List generated resumes for a job.

---

### `POST /api/jobs/[id]/generate`

Generate a tailored resume for this job.

**Request body:**
```json
{
  "template": "modern",
  "emphasis": ["leadership", "technical"]
}
```

---

### `POST /api/jobs/[id]/analyze`

Analyze how well the current profile matches this job.

**Response:**
```json
{
  "match": {
    "overallScore": 85,
    "skillMatches": ["React", "TypeScript"],
    "skillGaps": ["GraphQL"],
    "experienceMatch": true,
    "suggestions": ["Add a GraphQL project"]
  }
}
```

---

### `GET /api/jobs/[id]/cover-letter`

Fetch the saved cover letter for this job.

---

### `POST /api/jobs/[id]/cover-letter/save`

Save a cover letter draft for this job.

---

### `GET /api/jobs/[id]/cover-letter/stream`

Stream a cover letter generation response (SSE).

---

### `GET /api/jobs/[id]/cover-letter/history`

List cover letter revision history for this job.

---

### `GET /api/jobs/templates`

List available resume templates.

---

#### Job Statuses

| Value | Label |
|-------|-------|
| `pending` | Pending |
| `saved` | Saved |
| `applied` | Applied |
| `interviewing` | Interviewing |
| `offered` | Offered |
| `rejected` | Rejected |
| `withdrawn` | Withdrawn |
| `dismissed` | Dismissed |

---

## Opportunities

Opportunities are a higher-level view over jobs, used by the browser extension and the Kanban-style pipeline UI. Internally they map 1-to-1 to job records.

### `GET /api/opportunities`

List opportunities with optional status filter.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `status` | string | Comma-separated statuses to include |

**Response:**
```json
{
  "opportunities": [
    {
      "id": "job-abc123",
      "title": "Frontend Engineer",
      "company": "Acme Corp",
      "status": "pending",
      "sourceUrl": "https://acme.com/careers/frontend"
    }
  ]
}
```

---

### `POST /api/opportunities`

Create a new opportunity. Returns `201 Created`.

**Schema** (`createOpportunitySchema`):

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required |
| `company` | string | Required |
| `summary` | string | Job description |
| `city` | string | Optional |
| `province` | string | Optional |
| `country` | string | Optional |
| `remoteType` | enum | `remote` \| `hybrid` \| `onsite` |
| `jobType` | enum | `full-time` \| `part-time` \| `contract` \| `internship` \| `co-op` |
| `salaryMin` | number | Optional |
| `salaryMax` | number | Optional |
| `requiredSkills` | string[] | Optional |
| `techStack` | string[] | Optional |
| `responsibilities` | string[] | Optional |
| `sourceUrl` | string | Optional |
| `status` | enum | Default `pending` |
| `tags` | string[] | Default `[]`, each max 80 chars |
| `notes` | string | Optional |
| `deadline` | string | Optional |

**Response:**
```json
{ "opportunity": { "...opportunity fields..." } }
```

---

### `GET /api/opportunities/[id]`

Fetch a single opportunity.

---

### `PATCH /api/opportunities/[id]`

Update an opportunity (partial update).

---

### `DELETE /api/opportunities/[id]`

Delete an opportunity.

**Response:**
```json
{ "success": true }
```

---

### `GET /api/opportunities/[id]/status`
### `POST /api/opportunities/[id]/status`

Get or update the pipeline status of an opportunity.

**POST request body** (`opportunityStatusChangeSchema`):
```json
{ "status": "applied" }
```

---

### `GET /api/opportunities/[id]/link`
### `POST /api/opportunities/[id]/link`

Link or view documents (resumes, cover letters) attached to an opportunity.

---

### `POST /api/opportunities/scrape`

Scrape a job posting URL and parse it into an opportunity.

---

### `POST /api/opportunities/from-extension`

Import scraped opportunities from the Columbus browser extension. Requires `X-Extension-Token` header. Scraped opportunities default to `status: "pending"`.

**Request body (single):**
```json
{
  "title": "Frontend Engineer",
  "company": "Acme",
  "url": "https://example.com/job",
  "description": "Full job description..."
}
```

**Request body (batch):**
```json
{
  "jobs": [
    { "title": "Frontend Engineer", "company": "Acme", "url": "https://example.com/a" }
  ]
}
```

`"opportunities"` is also accepted instead of `"jobs"`.

**Response:**
```json
{
  "imported": 1,
  "opportunityIds": ["job-abc123"],
  "pendingCount": 5
}
```

**Errors:**
- `401` — extension token missing, invalid, or expired.
- `400` — required field (`title`, `company`) missing.

---

## Cover Letter

### `POST /api/cover-letter/generate`

Generate, revise, or rewrite a cover letter using your knowledge bank. Rate limited.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `jobDescription` | string | Required, min 20 chars |
| `jobTitle` | string | Optional |
| `company` | string | Optional |
| `action` | enum | `generate` \| `revise` \| `rewrite` — default `generate` |
| `currentContent` | string | Required for `revise` and `rewrite` |
| `instruction` | string | Required for `revise` and `rewrite` |
| `selectedText` | string | Required for `rewrite` (the passage to rewrite) |
| `selectedBankEntryIds` | string[] | Optional — limits bank entries used |
| `opportunityId` | string | Optional — auto-saves and links the letter |

**Example — generate:**
```json
{
  "jobDescription": "We are looking for a React engineer...",
  "jobTitle": "Frontend Engineer",
  "company": "Acme Corp",
  "action": "generate"
}
```

**Example — revise:**
```json
{
  "jobDescription": "We are looking for a React engineer...",
  "action": "revise",
  "currentContent": "Dear Hiring Manager...",
  "instruction": "Make it more concise and remove the third paragraph"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Dear Hiring Manager, I am excited to apply...",
  "savedCoverLetter": { "id": "cl-xyz789" }
}
```

`savedCoverLetter` is only present when `opportunityId` is supplied.

---

## Document Studio / Builder

### `POST /api/builder`

Generate a resume HTML preview from selected knowledge bank entries.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `entryIds` | string[] | Optional — bank entry IDs to include |
| `templateId` | string | Optional — resume template |
| `contact` | object | Optional — override contact info |
| `document` | object | Optional — full editable document state |

**Response:**
```json
{
  "html": "<div class=\"resume\">...</div>",
  "resume": { "...structured resume object..." }
}
```

---

### `POST /api/tailor`

Analyze a job description and generate a tailored resume from the knowledge bank.

---

### `POST /api/tailor/autofix`

Rewrite highlighted resume gaps identified by the tailor analysis.

---

## Documents

### `GET /api/documents`

List uploaded documents.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `type` | string | Optional — filter by document type |

**Response:**
```json
{
  "documents": [
    {
      "id": "doc-abc123",
      "filename": "resume.pdf",
      "type": "resume",
      "mimeType": "application/pdf",
      "size": 204800,
      "uploadedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### `DELETE /api/documents/[id]`

Delete a document.

**Response:**
```json
{ "success": true }
```

---

### `POST /api/documents/assistant`

AI assistant for editing a document. Rate limited.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `action` | string | Required — e.g. `improve`, `rewrite`, `shorten` |
| `selectedText` | string | Required — text to act on |
| `documentContent` | string | Required — full document context |
| `jobDescription` | string | Optional — for job-tailored edits |

**Response:**
```json
{ "success": true, "content": "Improved text..." }
```

---

### `POST /api/parse`

Parse an uploaded resume file and extract profile data.

---

## Interview

### `POST /api/interview/start`

Generate interview questions for a job. Rate limited (10 req/min/user).

**Schema** (`startInterviewSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `jobId` | string | Required |
| `difficulty` | enum | `entry` \| `mid` \| `senior` \| `executive` — default `mid` |

**Example:**
```json
{ "jobId": "job-abc123", "difficulty": "senior" }
```

**Response:**
```json
{
  "questions": [
    {
      "question": "Describe a time you led a cross-functional project.",
      "category": "behavioral",
      "suggestedAnswer": "Use the STAR method..."
    }
  ],
  "difficulty": "senior"
}
```

---

### `GET /api/interview/sessions`

List interview sessions.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `jobId` | string | Optional — filter by job |

---

### `POST /api/interview/sessions`

Create a new interview session.

**Schema** (`createInterviewSessionSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `jobId` | string | Required |
| `questions` | Question[] | Required, min 1 item |
| `mode` | enum | Optional: `text` \| `voice` |

Each `Question`:

| Field | Type | Notes |
|-------|------|-------|
| `question` | string | Required |
| `category` | enum | `behavioral` \| `technical` \| `situational` \| `general` |
| `suggestedAnswer` | string | Optional |
| `difficulty` | enum | Optional: `entry` \| `mid` \| `senior` \| `executive` |

---

### `GET /api/interview/sessions/[id]`

Fetch a session.

---

### `PATCH /api/interview/sessions/[id]`

Update a session (e.g. mark complete).

---

### `POST /api/interview/sessions/[id]/answer`

Submit an answer to a question and receive AI feedback.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `jobId` | string | Required |
| `questionIndex` | number | Required, ≥ 0 |
| `answer` | string | Required, max 10 000 chars |

**Response:**
```json
{
  "answer": "My answer...",
  "feedback": "Good use of STAR. Consider quantifying the impact.",
  "isComplete": false
}
```

---

### `POST /api/interview/answer`

Submit a standalone interview answer (not tied to a session).

---

### `POST /api/interview/prep-guide`

Generate a tailored interview preparation guide for a job.

---

### `POST /api/interview/followup`

Generate a follow-up question based on a previous answer.

---

## Analytics

### `GET /api/analytics`

Overview stats for the current user. Also saves a daily snapshot for trend tracking.

**Response:**
```json
{
  "overview": {
    "profileCompleteness": 80,
    "totalJobs": 15,
    "totalDocuments": 3,
    "totalInterviews": 4,
    "totalResumesGenerated": 7
  },
  "jobs": {
    "byStatus": { "saved": 5, "applied": 6, "interviewing": 2, "offered": 1, "rejected": 1 },
    "total": 15,
    "applied": 6,
    "interviewing": 2,
    "offered": 1,
    "rejected": 1
  },
  "interviews": {
    "total": 4,
    "completed": 3,
    "inProgress": 1
  },
  "skills": {
    "total": 12,
    "gaps": ["graphql", "kubernetes"],
    "byCategory": { "technical": 8, "soft": 4 }
  },
  "recent": {
    "jobs": [
      { "id": "job-abc123", "title": "Frontend Engineer", "company": "Acme", "status": "applied", "createdAt": "2024-06-01T00:00:00.000Z" }
    ]
  }
}
```

---

### `GET /api/analytics/trends`

Time-series application activity data.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `range` | enum | `7d` \| `14d` \| `30d` \| `90d` — default `30d` |

**Response:** Time-series arrays, week-over-week deltas, and snapshot history.

---

### `GET /api/analytics/success`

Success-rate metrics (interview conversion, offer rate, etc.).

---

### `GET /api/analytics/export`

Export analytics data as a file.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `format` | enum | `csv` \| `json` |
| `range` | enum | `7d` \| `30d` \| `90d` \| `1y` \| `all` |

**Response:** File download (`text/csv` or `application/json`).

---

## Reminders

### `GET /api/reminders`

List reminders with filters.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `jobId` | string | Optional — filter by job |
| `includeCompleted` | boolean | Default `false` |
| `includeDismissed` | boolean | Default `false` |
| `filter` | enum | `upcoming` \| `overdue` \| `counts` |
| `days` | number | Used with `filter=upcoming`, default `7` |

When `filter=counts` the response is a counts object instead of a list.

**Response (list):**
```json
{
  "reminders": [
    {
      "id": "rem-abc",
      "jobId": "job-abc123",
      "type": "follow_up",
      "title": "Follow up with recruiter",
      "dueDate": "2024-07-01",
      "completed": false
    }
  ]
}
```

---

### `POST /api/reminders`

Create a reminder.

**Schema** (`createReminderSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `jobId` | string | Required |
| `type` | enum | `follow_up` \| `deadline` \| `interview` \| `custom` — default `custom` |
| `title` | string | Required, max 200 |
| `description` | string | Optional, max 2000 |
| `dueDate` | string | Required, ISO date string |

**Example:**
```json
{
  "jobId": "job-abc123",
  "type": "follow_up",
  "title": "Email recruiter",
  "dueDate": "2024-07-01"
}
```

**Response:**
```json
{ "success": true, "reminder": { "id": "rem-abc", "...all fields..." } }
```

---

### `GET /api/reminders/[id]`

Fetch a single reminder.

---

### `PATCH /api/reminders/[id]`

Update a reminder (e.g. mark completed or reschedule).

---

### `DELETE /api/reminders/[id]`

Delete a reminder.

---

## Email

### `GET /api/email/drafts`

List saved email drafts.

---

### `POST /api/email/drafts`

Save a new draft.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | Template type |
| `jobId` | string | Optional |
| `subject` | string | Required |
| `body` | string | Required |
| `context` | any | Optional metadata |

---

### `GET /api/email/drafts/[id]`

Fetch a draft.

---

### `PUT /api/email/drafts/[id]`

Update a draft.

**Request body:**
```json
{
  "subject": "Updated subject",
  "body": "Updated body"
}
```

---

### `DELETE /api/email/drafts/[id]`

Delete a draft.

---

### `POST /api/email/generate`

Generate an email from a template. Uses LLM if `useLLM` is `true`.

**Schema** (`generateEmailSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `type` | enum | `follow_up` \| `thank_you` \| `networking` \| `status_inquiry` \| `negotiation` |
| `jobId` | string | Optional |
| `interviewerName` | string | Optional, max 200 |
| `interviewDate` | string | Optional |
| `daysAfter` | number | Optional, 1–365 |
| `targetCompany` | string | Optional, max 200 |
| `connectionName` | string | Optional, max 200 |
| `customNote` | string | Optional, max 2000 |
| `useLLM` | boolean | Default `true` |

**Example:**
```json
{
  "type": "thank_you",
  "jobId": "job-abc123",
  "interviewerName": "Alice Smith",
  "interviewDate": "2024-07-10",
  "useLLM": true
}
```

**Response:**
```json
{
  "success": true,
  "email": {
    "subject": "Thank you for the interview",
    "body": "Dear Alice, Thank you for taking the time...",
    "placeholders": ["[YOUR_NAME]"]
  },
  "usedLLM": true
}
```

---

## Settings

### `GET /api/settings`

Fetch current LLM and feature settings.

**Response:**
```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "sk-...",
    "baseUrl": ""
  },
  "opportunityReview": {
    "enabled": true
  }
}
```

---

### `PUT /api/settings`

Update settings.

**Schema** (`updateSettingsSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `llm` | object | Optional — see `llmConfigSchema` |
| `opportunityReview.enabled` | boolean | Optional |

**`llmConfigSchema`:**

| Field | Type | Notes |
|-------|------|-------|
| `provider` | enum | `openai` \| `anthropic` \| `ollama` \| `openrouter` |
| `model` | string | Required |
| `apiKey` | string | Optional |
| `baseUrl` | string | Optional, valid URL or `""` |

**Response:**
```json
{ "success": true }
```

---

### `POST /api/settings`

Test an LLM connection without saving.

**Request body:**
```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "sk-..."
  }
}
```

**Response:**
```json
{ "success": true, "message": "Connection successful!" }
```

---

## ATS

### `POST /api/ats/analyze`

Analyze resume ATS compatibility against a job.

**Request body:**
```json
{ "jobId": "job-abc123" }
```

---

### `GET /api/ats/scan`

List ATS scan history.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `limit` | number | 1–100, default 20 |

---

### `POST /api/ats/scan`

Run an ATS scan and receive a report with suggested fixes.

**Request body:**
```json
{ "jobId": "job-abc123" }
```

---

## Backup & Export

### `GET /api/backup`

Export a full backup as JSON. Includes profile, jobs, documents, interview sessions, generated resumes, and LLM config.

**Response:** JSON body matching `backupDataSchema`.

---

### `POST /api/backup`

Restore data from a backup file.

**Schema** (`backupDataSchema`):

| Field | Type | Notes |
|-------|------|-------|
| `version` | string | Required |
| `exportedAt` | string | Optional |
| `data.profile` | object | Optional |
| `data.jobs` | Job[] | Optional |
| `data.documents` | Document[] | Optional |
| `data.interviewSessions` | Session[] | Optional |
| `data.generatedResumes` | Resume[] | Optional |
| `data.llmConfig` | object | Optional |
| `stats` | object | Optional |

**Response:**
```json
{
  "success": true,
  "message": "Data restored successfully",
  "results": {
    "profile": "restored",
    "jobs": 12,
    "documents": 3
  }
}
```

---

### `GET /api/export`

Full data export (v2.0 format, includes cover letters and bank entries).

---

### `GET /api/export/jobs`

Export jobs.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `format` | enum | `csv` \| `json` |

---

### `GET /api/export/profile`

Export profile data.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `format` | string | `json` |

---

## Calendar

### `GET /api/calendar/export`

Export calendar events as an ICS file.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `type` | enum | `interviews` \| `deadlines` \| `reminders` \| `all` |

**Response:** `text/calendar` file.

---

### `GET /api/calendar/feed-url`

Get a webcal subscription URL.

**Query params:** `type` (event type)

**Response:**
```json
{
  "feedUrl": "https://app.example.com/api/calendar/feed?token=abc&type=all",
  "webcalUrl": "webcal://app.example.com/api/calendar/feed?token=abc&type=all",
  "type": "all"
}
```

---

### `GET /api/calendar/feed`

Public calendar feed endpoint (no session auth — uses `token` query param).

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `token` | string | Required |
| `type` | string | Event type |

**Response:** `text/calendar` ICS feed.

---

## Notifications

### `GET /api/notifications`

List notifications.

**Query params:**

| Param | Type | Notes |
|-------|------|-------|
| `limit` | number | Default 20 |
| `countOnly` | boolean | Return only `{ "unreadCount": 3 }` |

---

### `POST /api/notifications`

Batch operations on notifications.

**Request body:**
```json
{ "action": "markAllRead" }
```

---

### `GET /api/notifications/[id]`

Fetch a single notification.

---

### `PATCH /api/notifications/[id]`

Mark a notification as read.

---

### `DELETE /api/notifications/[id]`

Delete a notification.

---

## Resume

### `GET /api/resume/export`

Export a generated resume.

---

### `POST /api/resume/generate`

Generate a resume (standalone, not tied to a specific job).

---

### `GET /api/resume/stats`

Resume statistics (views, downloads, etc.).

---

### `POST /api/resume/track`

Track a resume send event.

---

### `POST /api/resumes/compare`

Compare two generated resumes side-by-side.

---

## Insights & Recommendations

### `GET /api/insights`

AI-generated insights based on job search activity.

---

### `POST /api/recommendations`

Get personalized job or skill recommendations.

---

### `POST /api/research/company`

Research a company using AI.

**Request body:**
```json
{ "company": "Acme Corp", "jobId": "job-abc123" }
```

---

## Learning

### `GET /api/learning/paths`

Get suggested learning paths based on skill gaps.

---

## Salary

### `POST /api/salary/calculate`

Calculate a market salary range or compare offers.

**Request body (range):**
```json
{
  "action": "range",
  "role": "Software Engineer",
  "location": "San Francisco",
  "yearsExperience": 5
}
```

**Response:**
```json
{
  "range": {
    "min": 130000,
    "median": 165000,
    "max": 220000
  }
}
```

**Request body (compare):**
```json
{
  "action": "compare",
  "offers": [
    { "id": "offer-1", "company": "Company A", "baseSalary": 150000, "signingBonus": 20000, "equityValue": 100000 }
  ]
}
```

---

### `POST /api/salary/negotiate`

Generate a salary negotiation script.

**Request body:**
```json
{
  "company": "Tech Corp",
  "role": "Software Engineer",
  "currentOffer": 150000,
  "targetSalary": 175000,
  "marketMedian": 165000,
  "marketMax": 220000
}
```

---

### `GET /api/salary/offers`

List saved salary offers.

---

### `GET /api/salary/offers/[id]`

Fetch a single salary offer.

---

## Import

### `POST /api/import`

Generic import endpoint.

---

### `POST /api/import/job`

Import a single job from structured data.

**Schema** (`importJobSchema`): same fields as `createJobSchema` except `description` min is 1 char.

---

### `POST /api/import/jobs`

Bulk-import jobs from an array.

**Request body:**
```json
{
  "jobs": [
    { "title": "Engineer", "company": "Acme", "description": "..." }
  ]
}
```

---

### `POST /api/import/csv`

Import jobs from a CSV file upload.

---

## Browser Extension

Extension routes authenticate via `X-Extension-Token` instead of session cookies.

### `POST /api/extension/auth`

Issue a new extension token for the authenticated user.

**Request body:**
```json
{ "deviceInfo": "Chrome 125 / macOS" }
```

**Response:**
```json
{ "token": "ext-tok-abc123", "expiresAt": "2024-08-01T00:00:00.000Z" }
```

---

### `DELETE /api/extension/auth`

Revoke an extension token.

**Header:** `X-Extension-Token: ext-tok-abc123`

**Response:**
```json
{ "success": true }
```

---

### `GET /api/extension/auth/verify`

Verify an extension token.

**Header:** `X-Extension-Token: ext-tok-abc123`

**Response:**
```json
{ "valid": true, "userId": "user-xyz", "expiresAt": "2024-08-01T00:00:00.000Z" }
```

---

### `GET /api/extension/jobs`

Fetch the job list for the extension UI.

**Auth:** `X-Extension-Token`

---

### `GET /api/extension/profile`

Fetch the profile for the extension UI.

**Auth:** `X-Extension-Token`

---

### `GET /api/extension/learned-answers`
### `POST /api/extension/learned-answers`

List or create learned autofill answers.

---

### `GET /api/extension/learned-answers/search`

Search learned answers.

---

### `GET /api/extension/learned-answers/[id]`
### `PUT /api/extension/learned-answers/[id]`
### `DELETE /api/extension/learned-answers/[id]`

Manage a specific learned answer.

---

## Google Integration

All Google routes require the user to have completed the OAuth flow at `GET /api/google/auth`.

### `GET /api/google/auth`

Start the Google OAuth flow.

---

### `GET /api/google/calendar/events`

Fetch Google Calendar events.

---

### `POST /api/google/calendar/sync`

Sync job deadlines and interview events to Google Calendar.

---

### `GET /api/google/contacts`

Import contacts from Google Contacts.

---

### `POST /api/google/docs/create`

Export a resume or cover letter to a new Google Doc.

---

### `POST /api/google/drive/import`

Import a file from Google Drive into the document store.

---

### `GET /api/google/drive/list`

List accessible Google Drive files.

---

### `POST /api/google/drive/upload`

Upload a file to Google Drive.

---

### `POST /api/google/gmail/scan`

Scan Gmail for job-related email threads.

---

### `POST /api/google/gmail/send`

Send an email via Gmail.

---

### `POST /api/google/sheets/export`

Export job tracker data to a Google Sheets spreadsheet.

---

### `POST /api/google/tasks/sync`

Sync reminders to Google Tasks.
