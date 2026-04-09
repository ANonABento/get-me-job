import {
  DIFFICULTY_DESCRIPTIONS,
  type InterviewDifficulty,
} from "@/features/interview/schemas";
import type {
  InterviewJobSummary,
  InterviewQuestion,
} from "@/features/interview/types";
import { getLLMConfig, getProfile } from "@/lib/db";
import { getJob } from "@/lib/db/jobs";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { getDefaultInterviewQuestions } from "./defaults";

export class InterviewJobNotFoundError extends Error {
  constructor(jobId: string) {
    super(`Interview job not found: ${jobId}`);
    this.name = "InterviewJobNotFoundError";
  }
}

export async function generateInterviewQuestionsForJob(
  jobId: string,
  difficulty: InterviewDifficulty
): Promise<InterviewQuestion[]> {
  const job = getJob(jobId);
  if (!job) {
    throw new InterviewJobNotFoundError(jobId);
  }

  const profile = getProfile();
  const llmConfig = getLLMConfig();

  if (!llmConfig) {
    return getDefaultInterviewQuestions(job, difficulty);
  }

  const client = new LLMClient(llmConfig);
  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Generate 5 interview questions for this job. Mix behavioral, technical, and situational questions.

Job: ${job.title} at ${job.company}
Description: ${job.description}
Key Skills: ${job.keywords.join(", ")}
${buildProfileContext()}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${DIFFICULTY_DESCRIPTIONS[difficulty]}

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
    return parseJSONFromLLM<InterviewQuestion[]>(response);
  } catch (error) {
    console.error("Failed to parse interview question response:", error);
    return getDefaultInterviewQuestions(job, difficulty);
  }

  function buildProfileContext() {
    if (!profile) {
      return "";
    }

    return `
Candidate Background:
- Name: ${profile.contact?.name}
- Experience: ${profile.experiences.map((experience) => `${experience.title} at ${experience.company}`).join(", ")}
- Skills: ${profile.skills.map((skill) => skill.name).join(", ")}
`;
  }
}
