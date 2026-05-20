import {
  DIFFICULTY_DESCRIPTIONS,
  type InterviewDifficulty,
  type SessionQuestionCategory,
} from "@/lib/constants";
import type { JobDescription, Profile } from "@/types";
import type { InterviewContextPack } from "@/types/interview";

export const SESSION_CATEGORY_VALUES: SessionQuestionCategory[] = [
  "behavioral",
  "technical",
  "situational",
  "cultural-fit",
  "general",
];

export function buildJobInterviewQuestionsPrompt({
  job,
  profile,
  difficulty,
  questionCount,
}: {
  job: JobDescription;
  profile?: Profile | null;
  difficulty: InterviewDifficulty;
  questionCount: number;
}): string {
  const profileContext = profile
    ? `
Candidate Background:
- Name: ${profile.contact?.name}
- Experience: ${profile.experiences.map((e) => `${e.title} at ${e.company}`).join(", ")}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}
`
    : "";

  const difficultyContext =
    DIFFICULTY_DESCRIPTIONS[difficulty] || DIFFICULTY_DESCRIPTIONS.mid;

  return `Generate ${questionCount} interview questions for this job. Mix behavioral, technical, situational, and cultural-fit questions.

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

Categories: ${SESSION_CATEGORY_VALUES.join(", ")}
Every question must have the best primary category. Avoid "general" for the first question unless no other category fits.
Include suggestedAnswer with tips appropriate for the ${difficulty} level.
Make sure questions match the ${difficulty} difficulty level.`;
}

export function buildGenericInterviewQuestionsPrompt({
  category,
  difficulty,
  questionCount,
}: {
  category: SessionQuestionCategory;
  difficulty: InterviewDifficulty;
  questionCount: number;
}): string {
  const difficultyContext =
    DIFFICULTY_DESCRIPTIONS[difficulty] || DIFFICULTY_DESCRIPTIONS.mid;

  return `You are an interviewer for a ${category} interview at ${difficulty} level.

Generate ${questionCount} questions covering common ${category} interview topics. Do not reference any specific role or company.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyContext}

Return ONLY a JSON array (no markdown):
[
  {
    "question": "Tell me about a time when...",
    "category": "${category}",
    "suggestedAnswer": "Structure using STAR method...",
    "difficulty": "${difficulty}"
  }
]

Categories: ${SESSION_CATEGORY_VALUES.join(", ")}
Every question must have the best primary category and include suggestedAnswer.`;
}

export function buildContextPackInterviewQuestionsPrompt({
  contextPack,
  difficulty,
  questionCount,
}: {
  contextPack: InterviewContextPack;
  difficulty: InterviewDifficulty;
  questionCount: number;
}): string {
  const difficultyContext =
    DIFFICULTY_DESCRIPTIONS[difficulty] || DIFFICULTY_DESCRIPTIONS.mid;

  return `You are a rigorous interviewer using a candidate-specific context pack.

Generate ${questionCount} grounded interview questions. Every question must test the candidate's ability to explain, defend, or prove details from the provided material. Prefer concrete follow-ups about decisions, trade-offs, ownership, metrics, failure modes, and implementation details.

Context Pack: ${contextPack.title}
Mode: ${contextPack.mode}
Sources: ${contextPack.summary.sourceLabels.join(", ") || "custom context"}
Detected Stack: ${contextPack.summary.detectedStack.join(", ") || "unknown"}
Skills: ${contextPack.summary.skills.join(", ") || "unknown"}
Claims:
${contextPack.summary.claims.map((claim) => `- ${claim}`).join("\n") || "- none extracted"}
Weak Spots:
${contextPack.summary.weakSpots.map((spot) => `- ${spot}`).join("\n") || "- none detected"}
Question Angles:
${contextPack.summary.questionAngles.map((angle) => `- ${angle}`).join("\n") || "- ownership"}

Source Excerpt:
${contextPack.rawContextExcerpt || "No excerpt available."}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyContext}

Return ONLY a JSON array (no markdown):
[
  {
    "question": "Walk me through the architecture decision behind...",
    "category": "technical",
    "suggestedAnswer": "Answer with the exact context, trade-off, and result...",
    "difficulty": "${difficulty}",
    "sourceRefs": ${JSON.stringify(contextPack.sources.slice(0, 2))},
    "interviewMode": "${contextPack.mode}",
    "probeType": "architecture"
  }
]

Categories: ${SESSION_CATEGORY_VALUES.join(", ")}
Use sourceRefs only from the provided sources. probeType should be a short label such as "architecture", "ownership", "debugging", "metrics", "fundamentals", "tradeoff", or "role-fit".`;
}

export function buildInterviewAnswerFeedbackPrompt({
  job,
  category,
  answer,
}: {
  job?: JobDescription | null;
  category?: SessionQuestionCategory;
  answer: string;
}): string {
  return `You are an interview coach. Provide brief, constructive feedback on this interview answer.

${job ? `Job: ${job.title} at ${job.company}` : `Practice Category: ${category || "general"}`}

Candidate's Answer:
${answer}

Provide 2-3 sentences of feedback focusing on:
- What was good about the answer
- One specific improvement suggestion

Be encouraging but honest.`;
}
