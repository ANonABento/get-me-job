/**
 * @route GET /api/interview/sessions/[id]
 * @description Fetch a single interview session by ID
 * @auth Required
 * @response InterviewSessionResponse from @/types/api
 *
 * @route PATCH /api/interview/sessions/[id]
 * @description Update an interview session (e.g., mark as complete)
 * @auth Required
 * @request { status?: string, score?: number }
 * @response InterviewSessionResponse from @/types/api
 *
 * @route DELETE /api/interview/sessions/[id]
 * @description Delete an interview session
 * @auth Required
 * @response InterviewSessionResponse from @/types/api
 */
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
    const session = getInterviewSession(params.id, authResult.userId);

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
      completeInterviewSession(params.id, authResult.userId);
    }

    const session = getInterviewSession(params.id, authResult.userId);

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
    deleteInterviewSession(params.id, authResult.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Failed to delete interview session" },
      { status: 500 }
    );
  }
}
