/**
 * @route GET /api/profile/versions/[id]
 * @description Fetch a specific profile version by ID
 * @auth Required
 * @response ProfileVersionResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getProfileVersion } from "@/lib/db/profile-versions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { id } = await params;
    const version = getProfileVersion(id);

    if (!version || version.profileId !== authResult.userId) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    const { snapshotJson, ...versionMeta } = version;
    return NextResponse.json({
      version: {
        ...versionMeta,
        snapshot: JSON.parse(snapshotJson),
      },
    });
  } catch (error) {
    console.error("Get profile version error:", error);
    return NextResponse.json(
      { error: "Failed to get profile version" },
      { status: 500 }
    );
  }
}
