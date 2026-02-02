import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "general";
  suggestedAnswer?: string;
  difficulty?: "entry" | "mid" | "senior" | "executive";
}

type DifficultyLevel = "entry" | "mid" | "senior" | "executive";

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  entry: "Entry-level questions focusing on basic skills, learning ability, and enthusiasm. Avoid complex technical deep-dives.",
  mid: "Mid-level questions testing practical experience, problem-solving, and technical competence. Include specific scenario-based questions.",
  senior: "Senior-level questions probing leadership, architecture decisions, mentoring, and cross-functional impact. Expect detailed examples.",
  executive: "Executive-level questions about strategy, vision, organizational transformation, and stakeholder management. Focus on business impact.",
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { jobId, difficulty = "mid" } = await request.json() as {
      jobId: string;
      difficulty?: DifficultyLevel;
    };

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile();
    const llmConfig = getLLMConfig();

    let questions: InterviewQuestion[];

    if (llmConfig) {
      const client = new LLMClient(llmConfig);

      const profileContext = profile
        ? `
Candidate Background:
- Name: ${profile.contact?.name}
- Experience: ${profile.experiences.map((e) => `${e.title} at ${e.company}`).join(", ")}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}
`
        : "";

      const difficultyContext = DIFFICULTY_DESCRIPTIONS[difficulty as DifficultyLevel] || DIFFICULTY_DESCRIPTIONS.mid;

      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `Generate 5 interview questions for this job. Mix behavioral, technical, and situational questions.

Job: ${job.title} at ${job.company}
Description: ${job.description}
Key Skills: ${job.keywords.join(", ")}
${profileContext}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyContext}

Return ONLY a JSON array (no markdown):
[
  {
    "question": "Tell me about a time when...",
    "category": "behavioral",
    "suggestedAnswer": "Structure using STAR method...",
    "difficulty": "${difficulty}"
  }
]

Categories: behavioral, technical, situational, general
Include suggestedAnswer with tips appropriate for the ${difficulty} level.
Make sure questions match the ${difficulty} difficulty level.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      try {
        questions = parseJSONFromLLM<InterviewQuestion[]>(response);
      } catch (parseError) {
        console.error("Failed to parse LLM response:", parseError);
        // Fall back to default questions if parsing fails
        questions = getDefaultQuestions(job);
      }
    } else {
      questions = getDefaultQuestions(job, difficulty as DifficultyLevel);
    }

    return NextResponse.json({ questions, difficulty });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}

function getDefaultQuestions(
  job: { title: string; company: string; keywords: string[] },
  difficulty: DifficultyLevel = "mid"
): InterviewQuestion[] {
  const baseQuestions: Record<DifficultyLevel, InterviewQuestion[]> = {
    entry: [
      {
        question: `Why are you interested in starting your career as a ${job.title} at ${job.company}?`,
        category: "general",
        suggestedAnswer: "Show enthusiasm, research the company, and express eagerness to learn.",
        difficulty: "entry",
      },
      {
        question: "Tell me about a project you worked on during school or in your personal time.",
        category: "behavioral",
        suggestedAnswer: "Describe what you built, what you learned, and any challenges you overcame.",
        difficulty: "entry",
      },
      {
        question: "How do you approach learning a new skill or technology?",
        category: "situational",
        suggestedAnswer: "Show your learning process and give a concrete example.",
        difficulty: "entry",
      },
      {
        question: `What do you know about ${job.keywords.slice(0, 3).join(", ")}?`,
        category: "technical",
        suggestedAnswer: "Demonstrate basic understanding and eagerness to learn more.",
        difficulty: "entry",
      },
      {
        question: "Describe a time when you worked effectively as part of a team.",
        category: "behavioral",
        suggestedAnswer: "Use STAR method, focus on collaboration and communication.",
        difficulty: "entry",
      },
    ],
    mid: [
      {
        question: `Why are you interested in the ${job.title} position at ${job.company}?`,
        category: "general",
        suggestedAnswer: "Research the company, connect your experience to the role.",
        difficulty: "mid",
      },
      {
        question: "Describe a challenging project you led and how you handled obstacles.",
        category: "behavioral",
        suggestedAnswer: "Use STAR method, emphasize problem-solving and outcomes.",
        difficulty: "mid",
      },
      {
        question: "How do you prioritize tasks when you have multiple deadlines?",
        category: "situational",
        suggestedAnswer: "Describe your prioritization framework with specific examples.",
        difficulty: "mid",
      },
      {
        question: `Explain your experience with ${job.keywords.slice(0, 3).join(", ")}.`,
        category: "technical",
        suggestedAnswer: "Give specific examples of projects and measurable outcomes.",
        difficulty: "mid",
      },
      {
        question: "Tell me about a time you disagreed with a teammate and how you resolved it.",
        category: "behavioral",
        suggestedAnswer: "Focus on communication, compromise, and professional outcome.",
        difficulty: "mid",
      },
    ],
    senior: [
      {
        question: "How would you approach building the technical strategy for a team working on our product?",
        category: "technical",
        suggestedAnswer: "Discuss architecture decisions, trade-offs, and team alignment.",
        difficulty: "senior",
      },
      {
        question: "Describe a time when you had to influence a decision without having direct authority.",
        category: "behavioral",
        suggestedAnswer: "Show leadership, stakeholder management, and persuasion skills.",
        difficulty: "senior",
      },
      {
        question: "How do you mentor junior team members while maintaining your own productivity?",
        category: "situational",
        suggestedAnswer: "Balance teaching with delegation, discuss specific mentoring approaches.",
        difficulty: "senior",
      },
      {
        question: "Tell me about a system you designed that had to scale significantly. What would you do differently?",
        category: "technical",
        suggestedAnswer: "Discuss architectural decisions, trade-offs, and lessons learned.",
        difficulty: "senior",
      },
      {
        question: "How do you handle technical debt while delivering new features?",
        category: "situational",
        suggestedAnswer: "Discuss prioritization, ROI of refactoring, and stakeholder communication.",
        difficulty: "senior",
      },
    ],
    executive: [
      {
        question: "How would you transform the engineering culture at ${job.company} to drive innovation?",
        category: "situational",
        suggestedAnswer: "Discuss vision, change management, and measuring cultural impact.",
        difficulty: "executive",
      },
      {
        question: "Describe a time when you had to make a significant strategic pivot. How did you gain buy-in?",
        category: "behavioral",
        suggestedAnswer: "Focus on data-driven decision making and stakeholder alignment.",
        difficulty: "executive",
      },
      {
        question: "How do you balance short-term business goals with long-term technical investments?",
        category: "situational",
        suggestedAnswer: "Discuss frameworks for prioritization and communicating with the board.",
        difficulty: "executive",
      },
      {
        question: "How would you build and scale the engineering organization for 3x growth?",
        category: "technical",
        suggestedAnswer: "Discuss hiring, team structure, processes, and maintaining culture.",
        difficulty: "executive",
      },
      {
        question: "Tell me about a failure in your leadership and what you learned from it.",
        category: "behavioral",
        suggestedAnswer: "Show vulnerability, accountability, and concrete lessons applied.",
        difficulty: "executive",
      },
    ],
  };

  return baseQuestions[difficulty] || baseQuestions.mid;
}
