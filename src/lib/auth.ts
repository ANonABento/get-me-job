import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export interface AuthResult {
  userId: string;
}

export interface AuthError {
  error: string;
  status: number;
}

const LOCAL_DEV_USER = 'default';
const isClerkConfigured = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

/**
 * Get the current user ID from Clerk auth
 * Returns the userId if authenticated, null if not
 * Falls back to local dev user when Clerk is not configured
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isClerkConfigured) return LOCAL_DEV_USER;
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication for an API route
 * Returns the userId if authenticated, or an error response if not
 * Falls back to local dev user when Clerk is not configured
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  if (!isClerkConfigured) return { userId: LOCAL_DEV_USER };

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { userId };
}

/**
 * Type guard to check if the result is an error response
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
