import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export interface AuthResult {
  userId: string;
}

export interface AuthError {
  error: string;
  status: number;
}

/**
 * Get the current user ID from Clerk auth
 * Returns the userId if authenticated, null if not
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication for an API route
 * Returns the userId if authenticated, or an error response if not
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
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
