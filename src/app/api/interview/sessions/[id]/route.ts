import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSession,
  deleteInterviewSession,
  completeInterviewSession,
} from "@/lib/db/interviews";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - Get a specific interview session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const session = getInterviewSession(params.id);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Failed to get interview session" },
      { status: 500 }
    );
  }
}

// PATCH - Update session (complete it)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { status } = await request.json();

    if (status === "completed") {
      completeInterviewSession(params.id);
    }

    const session = getInterviewSession(params.id);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update interview session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    deleteInterviewSession(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to delete interview session" },
      { status: 500 }
    );
  }
}
