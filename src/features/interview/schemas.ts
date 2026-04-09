import { z } from "zod";

export const INTERVIEW_DIFFICULTIES = [
  "entry",
  "mid",
  "senior",
  "executive",
] as const;

export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

export const interviewDifficultySchema = z.enum(INTERVIEW_DIFFICULTIES);

export const DIFFICULTY_DESCRIPTIONS: Record<InterviewDifficulty, string> = {
  entry: "Entry-level questions focusing on basic skills, learning ability, and enthusiasm. Avoid complex technical deep-dives.",
  mid: "Mid-level questions testing practical experience, problem-solving, and technical competence. Include specific scenario-based questions.",
  senior: "Senior-level questions probing leadership, architecture decisions, mentoring, and cross-functional impact. Expect detailed examples.",
  executive: "Executive-level questions about strategy, vision, organizational transformation, and stakeholder management. Focus on business impact.",
};

export const startInterviewSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  difficulty: interviewDifficultySchema.optional().default("mid"),
});

export const interviewAnswerSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  questionIndex: z.number().int().min(0),
  answer: z.string().min(1, "Answer is required").max(10000),
});

export type InterviewAnswerInput = z.infer<typeof interviewAnswerSchema>;

export const SESSION_MODES = ["text", "voice"] as const;

export type SessionMode = (typeof SESSION_MODES)[number];

export const sessionModeSchema = z.enum(SESSION_MODES);

export const SESSION_QUESTION_CATEGORIES = [
  "behavioral",
  "technical",
  "situational",
  "general",
] as const;

export type SessionQuestionCategory = (typeof SESSION_QUESTION_CATEGORIES)[number];

export const sessionQuestionCategorySchema = z.enum(SESSION_QUESTION_CATEGORIES);

export const sessionQuestionSchema = z.object({
  question: z.string().min(1),
  category: sessionQuestionCategorySchema,
  suggestedAnswer: z.string().optional(),
  difficulty: interviewDifficultySchema.optional(),
});

export const createInterviewSessionSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  questions: z.array(sessionQuestionSchema).min(1, "At least one question is required"),
  mode: sessionModeSchema.optional(),
});

export type CreateInterviewSessionInput = z.infer<typeof createInterviewSessionSchema>;
