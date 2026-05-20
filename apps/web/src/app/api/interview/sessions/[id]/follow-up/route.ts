/**
 * @route POST /api/interview/sessions/[id]/follow-up
 * @description Save a follow-up answer for an interview session and return feedback
 * @auth Required
 * @request { questionIndex: number, followUpQuestion: string, answer: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { addInterviewFollowUp, getInterviewSession } from "@/lib/db/interviews";
import {
  gateAiFeature,
  isAiGateResponse,
  type AiGatePass,
} from "@/lib/billing/ai-gate";
import { requireAuth, isAuthError } from "@/lib/auth";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: AiGatePass | null = null;

  try {
    const { questionIndex, followUpQuestion, answer } = await request.json();

    if (
      questionIndex === undefined ||
      !followUpQuestion?.trim() ||
      !answer?.trim()
    ) {
      return NextResponse.json(
        { error: "questionIndex, followUpQuestion, and answer are required" },
        { status: 400 },
      );
    }

    const session = getInterviewSession(params.id, authResult.userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const originalQuestion = session.questions[questionIndex];
    const originalAnswer = session.answers.find(
      (candidate) => candidate.questionIndex === questionIndex,
    );

    if (!originalQuestion || !originalAnswer) {
      return NextResponse.json(
        { error: "Invalid answered question index" },
        { status: 400 },
      );
    }

    let feedback = "";
    const gate = gateAiFeature(
      authResult.userId,
      "interview_turn",
      `${params.id}:follow-up:${questionIndex}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    try {
      const client = new LLMClient(gate.llmConfig);
      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `Provide brief, constructive feedback for this interview follow-up answer.

Original question:
${originalQuestion.question}

Original answer:
${originalAnswer.answer}

Follow-up question:
${followUpQuestion}

Candidate's follow-up answer:
${answer}

Return JSON:
{
  "feedback": "Your constructive feedback here (2-3 sentences max)"
}`,
          },
        ],
        temperature: 0.5,
        maxTokens: 300,
      });

      const parsed = parseJSONFromLLM<{ feedback: string }>(response);
      feedback = parsed.feedback || "";
    } catch (llmError) {
      aiGate?.refund();
      console.error("LLM follow-up feedback error:", llmError);
      feedback =
        "Good follow-up. Add one concrete detail or measurable result to make this answer easier for an interviewer to evaluate.";
    }

    const followUp = addInterviewFollowUp(
      params.id,
      questionIndex,
      followUpQuestion,
      answer,
      feedback,
      authResult.userId,
    );

    return NextResponse.json({ followUp, feedback });
  } catch (error) {
    aiGate?.refund();
    console.error("Add follow-up error:", error);
    return NextResponse.json(
      { error: "Failed to add follow-up" },
      { status: 500 },
    );
  }
}
