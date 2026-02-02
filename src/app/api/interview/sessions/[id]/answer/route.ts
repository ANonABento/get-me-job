import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSession,
  addInterviewAnswer,
  completeInterviewSession,
} from "@/lib/db/interviews";
import { getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";

// POST - Add an answer to the session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { questionIndex, answer } = await request.json();

    if (questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: "questionIndex and answer are required" },
        { status: 400 }
      );
    }

    const session = getInterviewSession(params.id);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const question = session.questions[questionIndex];

    if (!question) {
      return NextResponse.json(
        { error: "Invalid question index" },
        { status: 400 }
      );
    }

    // Generate feedback using LLM if available
    let feedback = "";
    const llmConfig = getLLMConfig();

    if (llmConfig) {
      try {
        const client = new LLMClient(llmConfig);
        const response = await client.complete({
          messages: [
            {
              role: "user",
              content: `Provide brief, constructive feedback for this interview answer.

Question: ${question.question}
Category: ${question.category}

Candidate's Answer:
${answer}

Provide feedback in JSON format:
{
  "feedback": "Your constructive feedback here (2-3 sentences max)"
}

Be encouraging but also point out areas for improvement.`,
            },
          ],
          temperature: 0.5,
          maxTokens: 300,
        });

        const parsed = parseJSONFromLLM<{ feedback: string }>(response);
        feedback = parsed.feedback || "";
      } catch (llmError) {
        console.error("LLM feedback error:", llmError);
        feedback = "Good effort! Consider using the STAR method (Situation, Task, Action, Result) to structure your answers for behavioral questions.";
      }
    } else {
      feedback = "Answer recorded. To get AI-powered feedback, configure an LLM provider in Settings.";
    }

    // Save the answer
    const savedAnswer = addInterviewAnswer(params.id, questionIndex, answer, feedback);

    // Check if interview is complete
    const isComplete = questionIndex >= session.questions.length - 1;
    if (isComplete) {
      completeInterviewSession(params.id);
    }

    return NextResponse.json({
      answer: savedAnswer,
      feedback,
      isComplete,
    });
  } catch (error) {
    console.error("Add answer error:", error);
    return NextResponse.json(
      { error: "Failed to add answer" },
      { status: 500 }
    );
  }
}
