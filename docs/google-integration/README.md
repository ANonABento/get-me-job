# Google Integration Overview

> Comprehensive Google Workspace integration for Get Me Job

**Status: Complete** - All 6 phases implemented and integrated into UI.

---

## Quick Start

1. **Connect Google Account**
   - Go to Settings → Google Integrations
   - Click "Connect Google Account"
   - Grant requested permissions

2. **Use Features**
   - **Calendar**: Settings page → Enable calendar sync
   - **Drive**: Upload page → "From Drive" button
   - **Gmail**: Jobs page → "Gmail" button to import
   - **Docs**: Interview page → "Save to Docs" after session
   - **Sheets**: Analytics page → "Sheets" export button
   - **Contacts/Tasks**: Automatic via API integrations

---

## Summary

This integration connects Get Me Job with Google Workspace services to streamline the job search process. Users can sync calendars, store documents in Drive, auto-import jobs from Gmail, and more.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Get Me Job App                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Settings   │    │   Calendar   │    │  Documents   │      │
│  │     Page     │    │     Page     │    │     Page     │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes                            │   │
│  │  /api/google/auth    /api/google/calendar   /api/google/drive │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  src/lib/google/                         │   │
│  │   client.ts │ calendar.ts │ drive.ts │ gmail.ts │ types.ts │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Clerk OAuth                              │
│              (Manages Google tokens & refresh)                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Google Workspace APIs                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Calendar │ │  Drive   │ │  Gmail   │ │   Docs   │ │ Sheets │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

| Phase | Feature | Status | Ticket |
|-------|---------|--------|--------|
| 1 | OAuth Foundation | ✅ Complete | [01-oauth-foundation.md](./01-oauth-foundation.md) |
| 2 | Calendar Sync | ✅ Complete | [02-calendar-sync.md](./02-calendar-sync.md) |
| 3 | Drive Integration | ✅ Complete | [03-drive-integration.md](./03-drive-integration.md) |
| 4 | Gmail Integration | ✅ Complete | [04-gmail-integration.md](./04-gmail-integration.md) |
| 5 | Docs & Sheets | ✅ Complete | [05-docs-sheets.md](./05-docs-sheets.md) |
| 6 | Contacts & Tasks | ✅ Complete | [06-contacts-tasks.md](./06-contacts-tasks.md) |

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| OAuth | Clerk Social Connection | Token management, refresh |
| API Client | `googleapis` npm | Official Google API client |
| Calendar | `@googleapis/calendar` | Calendar operations |
| Drive | `@googleapis/drive` | File storage |
| Gmail | `@googleapis/gmail` | Email operations |

---

## Required Scopes

```typescript
// Core scopes (Phase 1)
const CORE_SCOPES = [
  'openid',
  'email',
  'profile',
];

// Calendar scopes (Phase 2)
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Drive scopes (Phase 3)
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

// Gmail scopes (Phase 4)
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
];

// Contacts & Tasks (Phase 6)
const CONTACTS_SCOPES = [
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/tasks',
];
```

---

## File Structure

```
src/
├── lib/
│   └── google/
│       ├── client.ts         # OAuth client factory
│       ├── calendar.ts       # Calendar operations
│       ├── drive.ts          # Drive operations
│       ├── gmail.ts          # Gmail operations
│       ├── docs.ts           # Docs operations
│       ├── sheets.ts         # Sheets operations
│       ├── contacts.ts       # Contacts operations
│       ├── tasks.ts          # Tasks operations
│       └── types.ts          # Shared types
├── app/
│   └── api/
│       └── google/
│           ├── auth/
│           │   └── route.ts      # Connection status
│           ├── calendar/
│           │   ├── events/route.ts
│           │   └── sync/route.ts
│           ├── drive/
│           │   ├── upload/route.ts
│           │   ├── list/route.ts
│           │   └── import/route.ts
│           └── gmail/
│               ├── scan/route.ts
│               └── send/route.ts
└── components/
    └── google/
        ├── GoogleConnectButton.tsx
        ├── CalendarSyncToggle.tsx
        ├── DriveFilePicker.tsx
        └── GmailImportModal.tsx
```

---

## Database Schema Additions

```sql
-- User Google connection status
ALTER TABLE users ADD COLUMN google_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN google_scopes TEXT[]; -- Granted scopes

-- Calendar sync preferences
CREATE TABLE google_calendar_sync (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  enabled BOOLEAN DEFAULT FALSE,
  sync_interviews BOOLEAN DEFAULT TRUE,
  sync_deadlines BOOLEAN DEFAULT TRUE,
  sync_reminders BOOLEAN DEFAULT FALSE,
  google_calendar_id TEXT, -- Which calendar to sync to
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Drive folder mapping
CREATE TABLE google_drive_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  folder_id TEXT NOT NULL, -- Google Drive folder ID
  folder_name TEXT DEFAULT 'Get Me Job',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gmail import tracking
CREATE TABLE gmail_imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  message_id TEXT NOT NULL, -- Gmail message ID
  job_id TEXT REFERENCES jobs(id),
  import_type TEXT, -- 'recruiter_email', 'interview_invite', etc.
  imported_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security Considerations

1. **Token Storage**: Clerk handles OAuth tokens securely
2. **Scope Minimization**: Request only needed scopes per feature
3. **User Consent**: Clear UI explaining what access is requested
4. **Revocation**: Allow users to disconnect Google at any time
5. **Data Isolation**: Each user's Google data is isolated by userId

---

## Error Handling

```typescript
// Standard Google API error handling
export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public reason?: string
  ) {
    super(message);
    this.name = 'GoogleAPIError';
  }
}

// Common error codes
const GOOGLE_ERRORS = {
  401: 'Token expired or invalid - re-authentication required',
  403: 'Insufficient permissions - additional scopes needed',
  404: 'Resource not found',
  429: 'Rate limit exceeded - retry after delay',
  500: 'Google API error - retry later',
};
```

---

## Testing Strategy

1. **Unit Tests**: Mock Google API responses
2. **Integration Tests**: Use Google API sandbox/test accounts
3. **E2E Tests**: Full OAuth flow with test credentials

---

## References

- [Google Workspace CLI](https://github.com/googleworkspace/cli)
- [Clerk Google OAuth](https://clerk.com/blog/using-clerk-sso-access-google-calendar)
- [googleapis npm](https://www.npmjs.com/package/googleapis)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Drive API](https://developers.google.com/drive/api)
- [Gmail API](https://developers.google.com/gmail/api)

---

*Created: March 2026*
