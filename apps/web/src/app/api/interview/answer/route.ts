/**
 * @route POST /api/interview/answer
 * @description Submit an answer to an interview question and receive AI feedback
 * @auth Required
 * @request { jobId: string, question: string, answer: string, difficulty: string }
 * @response InterviewAnswerResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { LLMClient } from "@/lib/llm/client";
import { interviewAnswerSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { buildInterviewAnswerFeedbackPrompt } from "@/lib/interview/prompt-builders";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

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
        { status: 400 },
      );
    }

    const { jobId, answer, category } = parseResult.data;

    const job = jobId ? getJob(jobId, authResult.userId) : null;
    if (jobId && !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const gate = gateOptionalAiFeature(
      authResult.userId,
      "interview_turn",
      `answer:${jobId ?? "general"}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    let feedback = "";
    let usedLLM = false;
    let fallbackReason: "provider_not_configured" | "llm_error" | null =
      gate.llmConfig ? null : "provider_not_configured";

    if (gate.llmConfig) {
      try {
        const client = new LLMClient(gate.llmConfig);

        const response = await client.complete({
          messages: [
            {
              role: "user",
              content: buildInterviewAnswerFeedbackPrompt({
                job,
                category,
                answer,
              }),
            },
          ],
          temperature: 0.7,
          maxTokens: 300,
        });

        feedback = response.trim();
        usedLLM = true;
      } catch (llmError) {
        aiGate?.refund();
        fallbackReason = "llm_error";
        console.error("Interview answer LLM feedback failed:", llmError);
      }
    }

    if (!feedback) {
      // Basic feedback without LLM
      const wordCount = answer.split(/\s+/).length;
      if (wordCount < 20) {
        feedback =
          "Your answer is quite brief. Try to elaborate more with specific examples using the STAR method (Situation, Task, Action, Result).";
      } else if (wordCount > 200) {
        feedback =
          "Good detail in your answer! Consider being more concise - aim for 1-2 minutes when speaking. Focus on the most impactful points.";
      } else {
        feedback =
          "Good job! Your answer has a good length. Remember to include specific metrics and outcomes when possible to make your answers more impactful.";
      }
    }

    return NextResponse.json({
      feedback,
      usedLLM,
      fallbackUsed: !usedLLM,
      fallbackReason: usedLLM ? null : fallbackReason,
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Answer feedback error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
