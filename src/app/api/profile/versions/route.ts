import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { listProfileVersions } from "@/lib/db/profile-versions";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const versions = listProfileVersions(authResult.userId);
    return NextResponse.json({ versions });
  } catch (error) {
    console.error("List profile versions error:", error);
    return NextResponse.json(
      { error: "Failed to list profile versions" },
      { status: 500 }
    );
  }
}
