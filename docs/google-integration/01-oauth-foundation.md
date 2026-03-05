# Phase 1: OAuth Foundation

> Google OAuth setup via Clerk with token management

---

## Overview

| Field | Value |
|-------|-------|
| **Phase** | 1 |
| **Priority** | High |
| **Effort** | Medium (3-5 days) |
| **Dependencies** | Clerk auth (already installed) |
| **Blocks** | All other Google integration phases |

---

## Goals

1. Enable Google OAuth sign-in/connection via Clerk
2. Request and store appropriate scopes
3. Create utility to retrieve Google access tokens
4. Build UI for connecting/disconnecting Google account
5. Handle token refresh transparently

---

## Tasks

### 1.1 Clerk Dashboard Configuration

- [ ] Enable Google OAuth provider in Clerk Dashboard
- [ ] Configure OAuth scopes:
  - `openid`, `email`, `profile` (default)
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/drive.readonly`
- [ ] Set up Google Cloud Console OAuth consent screen
- [ ] Add redirect URIs for local and production

### 1.2 Google Cloud Console Setup

- [ ] Create Google Cloud project (or use existing)
- [ ] Enable APIs:
  - Google Calendar API
  - Google Drive API
  - Gmail API (for later phases)
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Configure authorized redirect URIs
- [ ] Add test users (for development)

### 1.3 Token Retrieval Utility

**File:** `src/lib/google/client.ts`

```typescript
import { auth, clerkClient } from '@clerk/nextjs/server';
import { google } from 'googleapis';

export interface GoogleTokenResult {
  token: string;
  expiresAt?: number;
}

/**
 * Get the current user's Google OAuth access token via Clerk
 */
export async function getGoogleAccessToken(): Promise<GoogleTokenResult | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, 'oauth_google');

    if (!tokens.data || tokens.data.length === 0) {
      return null;
    }

    return {
      token: tokens.data[0].token,
      expiresAt: tokens.data[0].expiresAt,
    };
  } catch (error) {
    console.error('Failed to get Google token:', error);
    return null;
  }
}

/**
 * Check if user has connected Google account
 */
export async function isGoogleConnected(): Promise<boolean> {
  const token = await getGoogleAccessToken();
  return token !== null;
}

/**
 * Create an authenticated Google API client
 */
export async function createGoogleClient() {
  const tokenResult = await getGoogleAccessToken();
  if (!tokenResult) {
    throw new Error('Google account not connected');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokenResult.token });

  return oauth2Client;
}

/**
 * Create Google Calendar client
 */
export async function createCalendarClient() {
  const auth = await createGoogleClient();
  return google.calendar({ version: 'v3', auth });
}

/**
 * Create Google Drive client
 */
export async function createDriveClient() {
  const auth = await createGoogleClient();
  return google.drive({ version: 'v3', auth });
}
```

### 1.4 Connection Status API

**File:** `src/app/api/google/auth/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { isGoogleConnected, getGoogleAccessToken } from '@/lib/google/client';

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const connected = await isGoogleConnected();

    return NextResponse.json({
      connected,
      provider: 'google',
    });
  } catch (error) {
    console.error('Google auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to check Google connection' },
      { status: 500 }
    );
  }
}
```

### 1.5 UI Components

**File:** `src/components/google/GoogleConnectButton.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Chrome, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function GoogleConnectButton() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch('/api/google/auth');
      const data = await res.json();
      setConnected(data.connected);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  function handleConnect() {
    // Opens Clerk's user profile where they can connect Google
    openUserProfile();
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="text-green-600">
          <CheckCircle className="mr-2 h-4 w-4" />
          Google Connected
        </Button>
        <Button variant="ghost" size="sm" onClick={handleConnect}>
          Manage
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect}>
      <Chrome className="mr-2 h-4 w-4" />
      Connect Google Account
    </Button>
  );
}
```

### 1.6 Settings Page Integration

**File:** Update `src/app/(app)/settings/page.tsx`

Add a new section for Google integration:

```typescript
// Add to settings page
<Card>
  <CardHeader>
    <CardTitle>Google Integration</CardTitle>
    <CardDescription>
      Connect your Google account to sync calendars, store documents in Drive,
      and auto-import jobs from Gmail.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <GoogleConnectButton />

    {/* Show connected features */}
    {connected && (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">Connected features:</p>
        <ul className="text-sm space-y-1">
          <li>• Google Calendar sync</li>
          <li>• Google Drive backup</li>
          <li>• Gmail job import</li>
        </ul>
      </div>
    )}
  </CardContent>
</Card>
```

### 1.7 Constants & Types

**File:** `src/lib/google/types.ts`

```typescript
export const GOOGLE_SCOPES = {
  // Core
  OPENID: 'openid',
  EMAIL: 'email',
  PROFILE: 'profile',

  // Calendar
  CALENDAR: 'https://www.googleapis.com/auth/calendar',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',

  // Drive
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',

  // Gmail
  GMAIL_READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_SEND: 'https://www.googleapis.com/auth/gmail.send',
  GMAIL_LABELS: 'https://www.googleapis.com/auth/gmail.labels',

  // Contacts & Tasks
  CONTACTS_READONLY: 'https://www.googleapis.com/auth/contacts.readonly',
  TASKS: 'https://www.googleapis.com/auth/tasks',
} as const;

export type GoogleScope = typeof GOOGLE_SCOPES[keyof typeof GOOGLE_SCOPES];

export interface GoogleConnectionStatus {
  connected: boolean;
  provider: 'google';
  scopes?: GoogleScope[];
  email?: string;
}
```

---

## Dependencies to Install

```bash
npm install googleapis @googleapis/calendar @googleapis/drive
```

---

## Testing

### Manual Testing Checklist

- [ ] Can connect Google account via Clerk
- [ ] Token is retrieved successfully
- [ ] Connection status shows correctly in UI
- [ ] Can disconnect and reconnect
- [ ] Token refresh works (wait for expiry)

### Unit Tests

```typescript
// src/lib/google/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { isGoogleConnected } from './client';

describe('Google Client', () => {
  it('should return false when no token available', async () => {
    vi.mock('@clerk/nextjs/server', () => ({
      auth: vi.fn().mockResolvedValue({ userId: null }),
    }));

    const connected = await isGoogleConnected();
    expect(connected).toBe(false);
  });
});
```

---

## Acceptance Criteria

1. [ ] User can connect Google account from Settings page
2. [ ] Connection status is displayed correctly
3. [ ] Access token can be retrieved programmatically
4. [ ] Token refresh is handled by Clerk automatically
5. [ ] User can disconnect Google account
6. [ ] Error states are handled gracefully

---

## Rollback Plan

If issues arise:
1. Disable Google OAuth provider in Clerk Dashboard
2. Remove Google-specific UI components
3. Google features gracefully degrade (show "not connected")

---

## Notes

- Clerk handles token storage and refresh automatically
- No need to store tokens in our database
- Scopes can be incrementally requested as features are added
- Test with personal Gmail before production deployment

---

*Status: Not Started*
*Created: March 2026*
