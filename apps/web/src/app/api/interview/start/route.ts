import { nowEpoch } from "@/lib/format/time";
/**
 * @route POST /api/interview/start
 * @description Generate interview questions for a job (rate-limited)
 * @auth Required
 * @request { jobId: string, difficulty: InterviewDifficulty, questionCount?: number }
 * @response InterviewStartResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile } from "@/lib/db";
import { getInterviewContextPack } from "@/lib/db/interviews";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import {
  startInterviewSchema,
  type InterviewDifficulty,
  type SessionQuestionCategory,
} from "@/lib/constants";
import { requireAuth, isAuthError, getCurrentUserId } from "@/lib/auth";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import { validationErrorResponse, ApiErrors } from "@/lib/api-utils";
import {
  buildContextPackInterviewQuestionsPrompt,
  buildGenericInterviewQuestionsPrompt,
  buildJobInterviewQuestionsPrompt,
  SESSION_CATEGORY_VALUES,
} from "@/lib/interview/prompt-builders";
import type { InterviewContextPack } from "@/types/interview";
import type { LLMConfig } from "@/types";

export const dynamic = "force-dynamic";

interface InterviewQuestion {
  question: string;
  category: SessionQuestionCategory;
  suggestedAnswer?: string;
  difficulty?: InterviewDifficulty;
  sourceRefs?: InterviewContextPack["sources"];
  interviewMode?: InterviewContextPack["mode"];
  probeType?: string;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  // Rate limit LLM operations - 10 per minute per user
  const userId = await getCurrentUserId();
  const identifier = getClientIdentifier(request, userId || undefined);
  const rateLimitResult = rateLimiters.llm(identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded. Please wait before generating more questions.",
        retryAfter: Math.ceil((rateLimitResult.resetAt - nowEpoch()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimitResult.resetAt - nowEpoch()) / 1000),
          ),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = startInterviewSchema.safeParse(rawData);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { jobId, contextPackId, difficulty, category, questionCount } =
      parseResult.data;

    const profile = getProfile(authResult.userId);
    const gate = gateOptionalAiFeature(
      authResult.userId,
      "interview_turn",
      `start:${jobId ?? contextPackId ?? category}`,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    let questions: InterviewQuestion[];
    let usedLLM = false;
    let fallbackReason: "provider_not_configured" | "llm_error" | null =
      gate.llmConfig ? null : "provider_not_configured";

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

      questions = await getContextPackQuestions({
        contextPack,
        difficulty,
        questionCount,
        llmConfig: gate.llmConfig,
      });
      usedLLM = gate.llmConfig !== null;
      return NextResponse.json({
        questions,
        difficulty,
        contextPack,
        usedLLM,
        fallbackUsed: !usedLLM,
        fallbackReason: usedLLM ? null : fallbackReason,
      });
    }

    if (!jobId) {
      questions = await getGenericQuestions({
        category: category as SessionQuestionCategory,
        difficulty,
        questionCount,
        llmConfig: gate.llmConfig,
      });
      usedLLM = gate.llmConfig !== null;
      return NextResponse.json({
        questions,
        difficulty,
        usedLLM,
        fallbackUsed: !usedLLM,
        fallbackReason: usedLLM ? null : fallbackReason,
      });
    }

    const job = getJob(jobId, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (gate.llmConfig) {
      try {
        const client = new LLMClient(gate.llmConfig);

        const response = await client.complete({
          messages: [
            {
              role: "user",
              content: buildJobInterviewQuestionsPrompt({
                job,
                profile,
                difficulty: difficulty as InterviewDifficulty,
                questionCount,
              }),
            },
          ],
          temperature: 0.7,
          maxTokens: 2000,
        });

        questions = normalizeQuestions(
          parseJSONFromLLM<InterviewQuestion[]>(response),
          questionCount,
          difficulty,
        );
        usedLLM = true;
      } catch (llmError) {
        aiGate?.refund();
        fallbackReason = "llm_error";
        console.error("Failed to generate LLM questions:", llmError);
        questions = getDefaultQuestions(job, difficulty, questionCount);
      }
    } else {
      questions = getDefaultQuestions(job, difficulty, questionCount);
    }

    return NextResponse.json({
      questions,
      difficulty,
      usedLLM,
      fallbackUsed: !usedLLM,
      fallbackReason: usedLLM ? null : fallbackReason,
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Start interview error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 },
    );
  }
}

async function getContextPackQuestions({
  contextPack,
  difficulty,
  questionCount,
  llmConfig,
}: {
  contextPack: InterviewContextPack;
  difficulty: InterviewDifficulty;
  questionCount: number;
  llmConfig: LLMConfig | null;
}): Promise<InterviewQuestion[]> {
  if (!llmConfig) {
    return getContextPackDefaultQuestions(
      contextPack,
      difficulty,
      questionCount,
    );
  }

  const client = new LLMClient(llmConfig);
  try {
    const response = await client.complete({
      messages: [
        {
          role: "user",
          content: buildContextPackInterviewQuestionsPrompt({
            contextPack,
            difficulty,
            questionCount,
          }),
        },
      ],
      temperature: 0.65,
      maxTokens: 2400,
    });

    return normalizeQuestions(
      parseJSONFromLLM<InterviewQuestion[]>(response),
      questionCount,
      difficulty,
      contextPack.mode === "skill-grill" ? "technical" : "behavioral",
    ).map((question) => ({
      ...question,
      sourceRefs: question.sourceRefs?.length
        ? question.sourceRefs
        : contextPack.sources.slice(0, 2),
      interviewMode: contextPack.mode,
    }));
  } catch (error) {
    console.error("Failed to generate context interview questions:", error);
    return getContextPackDefaultQuestions(
      contextPack,
      difficulty,
      questionCount,
    );
  }
}

async function getGenericQuestions({
  category,
  difficulty,
  questionCount,
  llmConfig,
}: {
  category: SessionQuestionCategory;
  difficulty: InterviewDifficulty;
  questionCount: number;
  llmConfig: LLMConfig | null;
}): Promise<InterviewQuestion[]> {
  if (!llmConfig) {
    return getGenericDefaultQuestions(category, difficulty, questionCount);
  }
  const client = new LLMClient(llmConfig);
  try {
    const response = await client.complete({
      messages: [
        {
          role: "user",
          content: buildGenericInterviewQuestionsPrompt({
            category,
            difficulty,
            questionCount,
          }),
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return normalizeQuestions(
      parseJSONFromLLM<InterviewQuestion[]>(response),
      questionCount,
      difficulty,
      category,
    );
  } catch (error) {
    console.error("Failed to generate generic interview questions:", error);
    return getGenericDefaultQuestions(category, difficulty, questionCount);
  }
}

function normalizeQuestions(
  questions: InterviewQuestion[],
  questionCount: number,
  difficulty: InterviewDifficulty,
  fallbackCategory: SessionQuestionCategory = "behavioral",
): InterviewQuestion[] {
  const normalized = questions.map((question) => ({
    ...question,
    category: SESSION_CATEGORY_VALUES.includes(question.category)
      ? question.category
      : fallbackCategory,
    difficulty: question.difficulty || difficulty,
  }));

  return repeatToCount(
    normalized.length
      ? normalized
      : [
          {
            question:
              "Tell me about a recent challenge and how you handled it.",
            category: fallbackCategory,
            difficulty,
            suggestedAnswer:
              "Use a specific example, explain your actions, and close with the result.",
          },
        ],
    questionCount,
  );
}

function getDefaultQuestions(
  job: { title: string; company: string; keywords?: string[] },
  difficulty: InterviewDifficulty = "mid",
  questionCount = 5,
): InterviewQuestion[] {
  const keywords = job.keywords ?? [];
  const baseQuestions: Record<InterviewDifficulty, InterviewQuestion[]> = {
    entry: [
      {
        question: `Why are you interested in starting your career as a ${job.title} at ${job.company}?`,
        category: "general",
        suggestedAnswer:
          "Show enthusiasm, research the company, and express eagerness to learn.",
        difficulty: "entry",
      },
      {
        question:
          "Tell me about a project you worked on during school or in your personal time.",
        category: "behavioral",
        suggestedAnswer:
          "Describe what you built, what you learned, and any challenges you overcame.",
        difficulty: "entry",
      },
      {
        question: "How do you approach learning a new skill or technology?",
        category: "situational",
        suggestedAnswer:
          "Show your learning process and give a concrete example.",
        difficulty: "entry",
      },
      {
        question: `What do you know about ${keywords.slice(0, 3).join(", ")}?`,
        category: "technical",
        suggestedAnswer:
          "Demonstrate basic understanding and eagerness to learn more.",
        difficulty: "entry",
      },
      {
        question:
          "Describe a time when you worked effectively as part of a team.",
        category: "behavioral",
        suggestedAnswer:
          "Use STAR method, focus on collaboration and communication.",
        difficulty: "entry",
      },
    ],
    mid: [
      {
        question: `Why are you interested in the ${job.title} position at ${job.company}?`,
        category: "general",
        suggestedAnswer:
          "Research the company, connect your experience to the role.",
        difficulty: "mid",
      },
      {
        question:
          "Describe a challenging project you led and how you handled obstacles.",
        category: "behavioral",
        suggestedAnswer:
          "Use STAR method, emphasize problem-solving and outcomes.",
        difficulty: "mid",
      },
      {
        question:
          "How do you prioritize tasks when you have multiple deadlines?",
        category: "situational",
        suggestedAnswer:
          "Describe your prioritization framework with specific examples.",
        difficulty: "mid",
      },
      {
        question: `Explain your experience with ${keywords.slice(0, 3).join(", ")}.`,
        category: "technical",
        suggestedAnswer:
          "Give specific examples of projects and measurable outcomes.",
        difficulty: "mid",
      },
      {
        question:
          "Tell me about a time you disagreed with a teammate and how you resolved it.",
        category: "behavioral",
        suggestedAnswer:
          "Focus on communication, compromise, and professional outcome.",
        difficulty: "mid",
      },
    ],
    senior: [
      {
        question:
          "How would you approach building the technical strategy for a team working on our product?",
        category: "technical",
        suggestedAnswer:
          "Discuss architecture decisions, trade-offs, and team alignment.",
        difficulty: "senior",
      },
      {
        question:
          "Describe a time when you had to influence a decision without having direct authority.",
        category: "behavioral",
        suggestedAnswer:
          "Show leadership, stakeholder management, and persuasion skills.",
        difficulty: "senior",
      },
      {
        question:
          "How do you mentor junior team members while maintaining your own productivity?",
        category: "situational",
        suggestedAnswer:
          "Balance teaching with delegation, discuss specific mentoring approaches.",
        difficulty: "senior",
      },
      {
        question:
          "Tell me about a system you designed that had to scale significantly. What would you do differently?",
        category: "technical",
        suggestedAnswer:
          "Discuss architectural decisions, trade-offs, and lessons learned.",
        difficulty: "senior",
      },
      {
        question:
          "How do you handle technical debt while delivering new features?",
        category: "situational",
        suggestedAnswer:
          "Discuss prioritization, ROI of refactoring, and stakeholder communication.",
        difficulty: "senior",
      },
    ],
    executive: [
      {
        question:
          "How would you transform the engineering culture at ${job.company} to drive innovation?",
        category: "situational",
        suggestedAnswer:
          "Discuss vision, change management, and measuring cultural impact.",
        difficulty: "executive",
      },
      {
        question:
          "Describe a time when you had to make a significant strategic pivot. How did you gain buy-in?",
        category: "behavioral",
        suggestedAnswer:
          "Focus on data-driven decision making and stakeholder alignment.",
        difficulty: "executive",
      },
      {
        question:
          "How do you balance short-term business goals with long-term technical investments?",
        category: "situational",
        suggestedAnswer:
          "Discuss frameworks for prioritization and communicating with the board.",
        difficulty: "executive",
      },
      {
        question:
          "How would you build and scale the engineering organization for 3x growth?",
        category: "technical",
        suggestedAnswer:
          "Discuss hiring, team structure, processes, and maintaining culture.",
        difficulty: "executive",
      },
      {
        question:
          "Tell me about a failure in your leadership and what you learned from it.",
        category: "behavioral",
        suggestedAnswer:
          "Show vulnerability, accountability, and concrete lessons applied.",
        difficulty: "executive",
      },
    ],
  };

  return repeatToCount(
    baseQuestions[difficulty] || baseQuestions.mid,
    questionCount,
  );
}

function getContextPackDefaultQuestions(
  contextPack: InterviewContextPack,
  difficulty: InterviewDifficulty = "mid",
  questionCount = 5,
): InterviewQuestion[] {
  const stack = contextPack.summary.detectedStack.slice(0, 3).join(", ");
  const primarySource =
    contextPack.summary.sourceLabels[0] || contextPack.title || "this context";
  const claim = contextPack.summary.claims[0] || "the strongest claim here";
  const weakSpot =
    contextPack.summary.weakSpots[0] ||
    "the least obvious implementation detail";
  const sourceRefs = contextPack.sources.slice(0, 2);
  const base: InterviewQuestion[] = [
    {
      question: `Walk me through ${primarySource}. What did you build, what was your role, and what result mattered most?`,
      category: "behavioral",
      suggestedAnswer:
        "Anchor the answer in scope, ownership, concrete work, and measurable outcome.",
      difficulty,
      sourceRefs,
      interviewMode: contextPack.mode,
      probeType: "ownership",
    },
    {
      question: `Defend this claim from your context: "${claim}". What evidence would convince a skeptical interviewer?`,
      category: "situational",
      suggestedAnswer:
        "Give before/after context, specific actions, metrics or observable impact, and what you learned.",
      difficulty,
      sourceRefs,
      interviewMode: contextPack.mode,
      probeType: "evidence",
    },
    {
      question: stack
        ? `If I asked you to explain the ${stack} parts of this work at a systems level, where would you start?`
        : "Explain the technical architecture or workflow behind this work. What were the important moving pieces?",
      category: "technical",
      suggestedAnswer:
        "Describe components, data flow, constraints, alternatives considered, and trade-offs.",
      difficulty,
      sourceRefs,
      interviewMode: contextPack.mode,
      probeType: "architecture",
    },
    {
      question: `The weak spot I see is: ${weakSpot}. How would you answer if an interviewer pushed on that?`,
      category: "situational",
      suggestedAnswer:
        "Acknowledge the gap directly, add missing context, and explain how you would validate or improve it.",
      difficulty,
      sourceRefs,
      interviewMode: contextPack.mode,
      probeType: "weak-spot",
    },
    {
      question:
        "What was the hardest trade-off in this context, and what would you do differently now?",
      category: "behavioral",
      suggestedAnswer:
        "Pick a real constraint, explain the decision, the downside, and the retrospective lesson.",
      difficulty,
      sourceRefs,
      interviewMode: contextPack.mode,
      probeType: "tradeoff",
    },
  ];

  return repeatToCount(base, questionCount);
}

function getGenericDefaultQuestions(
  category: SessionQuestionCategory,
  difficulty: InterviewDifficulty = "mid",
  questionCount = 5,
): InterviewQuestion[] {
  const label = category.replace("-", " ");
  const templates: Record<SessionQuestionCategory, string[]> = {
    behavioral: [
      "Tell me about a time you handled a difficult challenge.",
      "Describe a moment when you had to learn something quickly.",
      "Tell me about a time you received tough feedback.",
      "Describe a project where you had to collaborate across different working styles.",
      "Tell me about a time you improved a process.",
    ],
    technical: [
      "Walk me through a technical decision you made and the trade-offs involved.",
      "How do you debug a production issue with limited information?",
      "Describe a system or feature you built that you are proud of.",
      "How do you evaluate whether a technical solution is maintainable?",
      "Explain a complex technical topic to a non-technical stakeholder.",
    ],
    situational: [
      "What would you do if priorities changed halfway through a project?",
      "How would you handle being blocked by another team?",
      "What would you do if you disagreed with the direction of a project?",
      "How would you recover if you realized you misunderstood a requirement?",
      "What would you do if you had too much work and too little time?",
    ],
    general: [
      "What strengths would you bring to your next role?",
      "What kind of work environment helps you do your best work?",
      "How do you decide what to focus on during a busy week?",
      "What are you hoping to grow in next?",
      "Tell me about the kind of impact you want to have.",
    ],
    "cultural-fit": [
      "What team norms help you collaborate well?",
      "Tell me about a time you contributed to a healthier team culture.",
      "How do you build trust with new teammates?",
      "Describe how you prefer to give and receive feedback.",
      "What values matter most to you in a workplace?",
    ],
  };

  return repeatToCount(
    templates[category].map((question) => ({
      question,
      category,
      difficulty,
      suggestedAnswer: `Use a concrete example, explain your choices, and connect the answer to common ${label} interview signals.`,
    })),
    questionCount,
  );
}

function repeatToCount(
  questions: InterviewQuestion[],
  questionCount: number,
): InterviewQuestion[] {
  const result: InterviewQuestion[] = [];
  while (result.length < questionCount) {
    result.push(...questions);
  }
  return result.slice(0, questionCount);
}
