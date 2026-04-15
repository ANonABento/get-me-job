import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getProfileVersion } from "@/lib/db/profile-versions";
import { updateProfile } from "@/lib/db/queries";

export async function POST(
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

    const snapshot = JSON.parse(version.snapshotJson);

    // updateProfile auto-snapshots current state before overwriting
    updateProfile(snapshot, authResult.userId);

    return NextResponse.json({ success: true, message: "Profile restored to selected version" });
  } catch (error) {
    console.error("Restore profile version error:", error);
    return NextResponse.json(
      { error: "Failed to restore profile version" },
      { status: 500 }
    );
  }
}
