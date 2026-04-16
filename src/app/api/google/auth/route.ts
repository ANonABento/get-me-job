/**
 * @route GET /api/google/auth
 * @description Check Google connection status
 * @auth Required
 * @response GoogleAuthStatusResponse from @/types/api
 */

import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getGoogleConnectionStatus } from "@/lib/google/client";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const status = await getGoogleConnectionStatus();

    return NextResponse.json(status);
  } catch (error) {
    console.error("Google auth check error:", error);
    return NextResponse.json(
      { error: "Failed to check Google connection", connected: false },
      { status: 500 }
    );
  }
}
