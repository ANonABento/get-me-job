/**
 * @route GET /api/profile
 * @route PUT /api/profile
 * @route DELETE /api/profile
 * @description GET: Fetch profile. PUT: Update profile. DELETE: Clear profile data.
 * @auth Required
 * @request { name?: string; email?: string; ... } (PUT only)
 * @response ProfileResponse / ProfileUpdateResponse / ProfileDeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile, clearProfile } from "@/lib/db";
import { updateProfileSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const profile = getProfile(authResult.userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = updateProfileSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    updateProfile(parseResult.data, authResult.userId);
    const profile = getProfile(authResult.userId);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    clearProfile(authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear profile error:", error);
    return NextResponse.json(
      { error: "Failed to clear profile" },
      { status: 500 }
    );
  }
}
