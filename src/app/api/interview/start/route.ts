import { NextRequest, NextResponse } from "next/server";
import {
  startInterviewSchema,
  type InterviewDifficulty,
} from "@/features/interview/schemas";
import {
  generateInterviewQuestionsForJob,
  InterviewJobNotFoundError,
} from "@/features/interview/server/questions";
import { requireAuth, isAuthError, getCurrentUserId } from "@/lib/auth";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import { validationErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  // Rate limit LLM operations - 10 per minute per user
  const userId = await getCurrentUserId();
  const identifier = getClientIdentifier(request, userId || undefined);
  const rateLimitResult = rateLimiters.llm(identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait before generating more questions.",
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = startInterviewSchema.safeParse(rawData);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { jobId, difficulty } = parseResult.data;
    const questions = await generateInterviewQuestionsForJob(
      jobId,
      difficulty as InterviewDifficulty
    );

    return NextResponse.json({ questions, difficulty });
  } catch (error) {
    if (error instanceof InterviewJobNotFoundError) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    console.error("Start interview error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
