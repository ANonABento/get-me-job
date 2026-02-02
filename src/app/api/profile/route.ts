import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProfile, updateProfile, clearProfile } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    const profile = getProfile();
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    // TODO: Switch to Drizzle queries with userId once Neon is configured
    updateProfile(data);
    const profile = getProfile();
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    clearProfile();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear profile error:", error);
    return NextResponse.json(
      { error: "Failed to clear profile" },
      { status: 500 }
    );
  }
}
