import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile, clearProfile } from "@/lib/db";

export async function GET() {
  try {
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
    const data = await request.json();
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
