/**
 * @route GET /api/interview/sessions
 * @description List all interview sessions
 * @auth Required
 * @response InterviewSessionsResponse from @/types/api
 *
 * @route POST /api/interview/sessions
 * @description Create a new interview session
 * @auth Required
 * @request { jobId: string, type: string, difficulty: string, questions: object[] }
 * @response InterviewSessionResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSessions,
  createInterviewSession,
  getInterviewContextPack,
} from "@/lib/db/interviews";
import { getJob } from "@/lib/db/jobs";
import { createInterviewSessionSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { safeTrackActivity } from "@/lib/streak/track";

export const dynamic = "force-dynamic";

// GET - List all interview sessions
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;

    const sessions = getInterviewSessions(jobId, authResult.userId);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get interview sessions" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    const { jobId, contextPackId, questions, mode, category } =
      parseResult.data;

    const job = jobId ? getJob(jobId, authResult.userId) : null;
    if (jobId && !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (contextPackId) {
      const contextPack = getInterviewContextPack(
        contextPackId,
        authResult.userId,
      );
      if (!contextPack) {
        return NextResponse.json(
          { error: "Context pack not found" },
          { status: 404 },
        );
      }
    }

    const session = createInterviewSession(
      jobId,
      questions,
      mode,
      authResult.userId,
      category,
      contextPackId,
    );
    const { unlocked } = await safeTrackActivity(
      authResult.userId,
      "interview_started",
    );

    return NextResponse.json({ session, unlocked });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 },
    );
  }
}
