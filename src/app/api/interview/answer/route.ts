/**
 * @route POST /api/interview/answer
 * @description Submit an answer to an interview question and receive AI feedback
 * @auth Required
 * @request { jobId: string, question: string, answer: string, difficulty: string }
 * @response InterviewAnswerResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import { interviewAnswerSchema } from "@/lib/constants";
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

    const job = getJob(jobId, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile(authResult.userId);
    const llmConfig = getLLMConfig();

    let feedback = "";

    if (llmConfig) {
      const client = new LLMClient(llmConfig);

      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `You are an interview coach. Provide brief, constructive feedback on this interview answer.

Job: ${job.title} at ${job.company}

Candidate's Answer:
${answer}

Provide 2-3 sentences of feedback focusing on:
- What was good about the answer
- One specific improvement suggestion

Be encouraging but honest.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 300,
      });

      feedback = response.trim();
    } else {
      // Basic feedback without LLM
      const wordCount = answer.split(/\s+/).length;
      if (wordCount < 20) {
        feedback = "Your answer is quite brief. Try to elaborate more with specific examples using the STAR method (Situation, Task, Action, Result).";
      } else if (wordCount > 200) {
        feedback = "Good detail in your answer! Consider being more concise - aim for 1-2 minutes when speaking. Focus on the most impactful points.";
      } else {
        feedback = "Good job! Your answer has a good length. Remember to include specific metrics and outcomes when possible to make your answers more impactful.";
      }
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Answer feedback error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    );
  }
}
