import { NextRequest, NextResponse } from "next/server";
import { createInterviewSessionSchema } from "@/features/interview/schemas";
import {
  getInterviewSessions,
  createInterviewSession,
} from "@/lib/db/interviews";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - List all interview sessions
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;

    const sessions = getInterviewSessions(jobId);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get interview sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new interview session
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = createInterviewSessionSchema.safeParse(rawData);
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

    const { jobId, questions, mode } = parseResult.data;

    const session = createInterviewSession(jobId, questions, mode);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }
}
