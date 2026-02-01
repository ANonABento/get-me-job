import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";

export async function POST(request: NextRequest) {
  try {
    const { jobId, questionIndex, answer, question } = await request.json();

    if (!answer || answer.trim().length < 10) {
      return NextResponse.json({
        feedback: "Your answer was too brief. Try to provide more detail and specific examples.",
      });
    }

    const job = getJob(jobId);
    const llmConfig = getLLMConfig();

    let feedback: string;

    if (llmConfig && job) {
      // Generate personalized feedback with LLM
      const client = new LLMClient(llmConfig);

      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `You are an interview coach. Provide brief, constructive feedback (2-3 sentences) on this interview answer.

JOB: ${job.title} at ${job.company}

ANSWER:
"${answer}"

Evaluate:
1. Relevance to a typical interview question
2. Use of specific examples
3. Clarity and conciseness
4. Professional tone

Provide actionable feedback. Be encouraging but honest. Keep it to 2-3 sentences.`,
          },
        ],
        temperature: 0.5,
        maxTokens: 200,
      });

      feedback = response.trim();
    } else {
      // Basic feedback without LLM
      feedback = generateBasicFeedback(answer);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Interview answer error:", error);
    return NextResponse.json(
      { error: "Failed to process answer", details: String(error) },
      { status: 500 }
    );
  }
}

function generateBasicFeedback(answer: string): string {
  const wordCount = answer.split(/\s+/).length;

  const feedback: string[] = [];

  if (wordCount < 30) {
    feedback.push("Consider providing more detail in your response.");
  } else if (wordCount > 200) {
    feedback.push("Your answer was comprehensive. In a real interview, aim to be slightly more concise.");
  } else {
    feedback.push("Good length for an interview response.");
  }

  // Check for STAR elements
  const hasNumbers = /\d+/.test(answer);
  const hasAction = /(I led|I managed|I created|I developed|I implemented|I achieved)/i.test(answer);

  if (hasNumbers) {
    feedback.push("Great use of specific metrics or numbers.");
  } else {
    feedback.push("Try to include specific numbers or metrics when possible.");
  }

  if (hasAction) {
    feedback.push("Good job highlighting your actions and contributions.");
  }

  return feedback.join(" ");
}
