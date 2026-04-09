import { NextRequest, NextResponse } from "next/server";
import {
  generateInterviewFeedbackForJob,
  InterviewJobNotFoundError,
} from "@/features/interview/server/feedback";
import { interviewAnswerSchema } from "@/features/interview/schemas";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = interviewAnswerSchema.safeParse(rawData);
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

    const { jobId, answer } = parseResult.data;
    const feedback = await generateInterviewFeedbackForJob(jobId, answer);

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof InterviewJobNotFoundError) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    console.error("Answer feedback error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    );
  }
}
