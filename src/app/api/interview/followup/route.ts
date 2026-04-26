/**
 * @route POST /api/interview/followup
 * @description Generate a follow-up interview question based on previous Q&A context
 * @auth Required
 * @request { jobId: string, previousQuestion: string, previousAnswer: string, feedback: string }
 * @response InterviewFollowupResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";

interface FollowUpResponse {
  followUpQuestion: string;
  reason: string;
  suggestedFocus: string[];
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { jobId, originalQuestion, userAnswer, questionCategory } = await request.json();

    if (!originalQuestion || !userAnswer) {
      return NextResponse.json(
        { error: "Original question and user answer are required" },
        { status: 400 }
      );
    }

    const job = jobId ? getJob(jobId, authResult.userId) : null;
    const profile = getProfile(authResult.userId);
    const llmConfig = getLLMConfig(authResult.userId);

    let followUp: FollowUpResponse;

    if (llmConfig) {
      const client = new LLMClient(llmConfig);

      const jobContext = job
        ? `The candidate is interviewing for ${job.title} at ${job.company}.`
        : "This is a general interview practice.";

      const profileContext = profile
        ? `The candidate has experience as ${profile.experiences[0]?.title || "a professional"}.`
        : "";

      const response = await client.complete({
        messages: [
          {
            role: "system",
            content: `You are an expert interview coach conducting a realistic interview simulation.
Your role is to ask insightful follow-up questions that probe deeper into the candidate's answer.
Follow-up questions should:
- Dig deeper into specific claims or examples mentioned
- Ask for clarification on vague statements
- Request specific metrics or outcomes
- Explore the candidate's decision-making process
- Be relevant to the job they're applying for`,
          },
          {
            role: "user",
            content: `${jobContext} ${profileContext}

Original interview question (${questionCategory || "general"}):
"${originalQuestion}"

Candidate's answer:
"${userAnswer}"

Generate a follow-up question that would naturally come next in this interview conversation.

Return a JSON object with:
{
  "followUpQuestion": "Your follow-up question here",
  "reason": "Brief explanation of why this follow-up is valuable",
  "suggestedFocus": ["Key point 1 to address", "Key point 2 to address"]
}`,
          },
        ],
        temperature: 0.7,
        maxTokens: 500,
      });

      try {
        followUp = parseJSONFromLLM<FollowUpResponse>(response);
      } catch {
        // If JSON parsing fails, create a structured response from the text
        followUp = {
          followUpQuestion: response.trim(),
          reason: "Probing deeper into your answer",
          suggestedFocus: ["Provide specific examples", "Include measurable outcomes"],
        };
      }
    } else {
      // Generate follow-up without LLM based on question category
      followUp = generateBasicFollowUp(originalQuestion, userAnswer, questionCategory);
    }

    return NextResponse.json({
      success: true,
      ...followUp,
    });
  } catch (error) {
    console.error("Follow-up question error:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up question" },
      { status: 500 }
    );
  }
}

function generateBasicFollowUp(
  originalQuestion: string,
  userAnswer: string,
  category?: string
): FollowUpResponse {
  const wordCount = userAnswer.split(/\s+/).length;

  // Check for common patterns that need follow-up
  const hasSpecificNumbers = /\d+%|\$\d+|\d+ (people|team|months|years|hours)/i.test(userAnswer);
  const mentionsChallenge = /challenge|difficult|problem|issue|obstacle/i.test(userAnswer);
  const mentionsResult = /result|outcome|achieved|accomplished|impact/i.test(userAnswer);
  const mentionsTeam = /team|collaborate|together|we|group/i.test(userAnswer);

  // Select follow-up based on what's missing or can be explored
  if (wordCount < 30) {
    return {
      followUpQuestion: "Can you walk me through a specific example of what you just mentioned?",
      reason: "The initial answer was brief and would benefit from more detail",
      suggestedFocus: ["Add specific details", "Describe the context"],
    };
  }

  if (!hasSpecificNumbers) {
    return {
      followUpQuestion: "What specific metrics or measurable outcomes can you share from that experience?",
      reason: "Quantifying achievements makes answers more compelling",
      suggestedFocus: ["Include percentages or numbers", "Mention timeframes"],
    };
  }

  if (mentionsChallenge && !mentionsResult) {
    return {
      followUpQuestion: "What was the final outcome of that situation? How did you know you were successful?",
      reason: "Following up on the resolution of challenges",
      suggestedFocus: ["Describe the resolution", "Share the impact"],
    };
  }

  if (mentionsTeam) {
    return {
      followUpQuestion: "What was your specific role in the team effort you described? What decisions did you personally make?",
      reason: "Understanding individual contribution in team contexts",
      suggestedFocus: ["Highlight your specific contributions", "Show leadership or initiative"],
    };
  }

  // Category-specific follow-ups
  if (category === "behavioral") {
    return {
      followUpQuestion: "Looking back, what would you do differently if you faced the same situation today?",
      reason: "Testing self-reflection and growth mindset",
      suggestedFocus: ["Show learning from experience", "Demonstrate adaptability"],
    };
  }

  if (category === "technical") {
    return {
      followUpQuestion: "What alternative approaches did you consider, and why did you choose this one?",
      reason: "Understanding technical decision-making process",
      suggestedFocus: ["Compare trade-offs", "Justify your choices"],
    };
  }

  if (category === "situational") {
    return {
      followUpQuestion: "How would your approach change if you had limited resources or a tighter deadline?",
      reason: "Testing adaptability and prioritization",
      suggestedFocus: ["Show flexibility", "Demonstrate prioritization skills"],
    };
  }

  // Default follow-up
  return {
    followUpQuestion: "That's interesting. Can you tell me more about how you handled the most challenging aspect of that situation?",
    reason: "Exploring depth of experience",
    suggestedFocus: ["Dive deeper into challenges", "Show problem-solving skills"],
  };
}
