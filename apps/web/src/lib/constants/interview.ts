import { z } from "zod";
import { BANK_CATEGORIES } from "@/types";

// Interview difficulty levels
export const INTERVIEW_DIFFICULTIES = [
  "entry",
  "mid",
  "senior",
  "executive",
] as const;

export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

export const interviewDifficultySchema = z.enum(INTERVIEW_DIFFICULTIES);

export const DIFFICULTY_DESCRIPTIONS: Record<InterviewDifficulty, string> = {
  entry:
    "Entry-level questions focusing on basic skills, learning ability, and enthusiasm. Avoid complex technical deep-dives.",
  mid: "Mid-level questions testing practical experience, problem-solving, and technical competence. Include specific scenario-based questions.",
  senior:
    "Senior-level questions probing leadership, architecture decisions, mentoring, and cross-functional impact. Expect detailed examples.",
  executive:
    "Executive-level questions about strategy, vision, organizational transformation, and stakeholder management. Focus on business impact.",
};

// F2.4 consolidation: the canonical interview-category set is
// `SESSION_QUESTION_CATEGORIES` (which includes `cultural-fit`). The
// legacy `INTERVIEW_CATEGORIES` enum had `company` instead of
// `cultural-fit`, but `company` was never wired to any UI/API surface
// (a separate `prep-guide.ts` literal union owns the prep-guide flow's
// `company` category). `INTERVIEW_CATEGORIES`, `InterviewCategory`, and
// `interviewCategorySchema` are now aliases preserved for the barrel
// re-exports + `lib/constants.test.ts`.
export const SESSION_QUESTION_CATEGORIES = [
  "behavioral",
  "technical",
  "situational",
  "general",
  "cultural-fit",
] as const;

export type SessionQuestionCategory =
  (typeof SESSION_QUESTION_CATEGORIES)[number];

export const sessionQuestionCategorySchema = z.enum(
  SESSION_QUESTION_CATEGORIES,
);

export const INTERVIEW_CATEGORIES = SESSION_QUESTION_CATEGORIES;
export type InterviewCategory = SessionQuestionCategory;
export const interviewCategorySchema = sessionQuestionCategorySchema;

export const startInterviewSchema = z
  .object({
    jobId: z.string().min(1, "Job ID is required").nullable(),
    contextPackId: z.string().min(1).optional(),
    mode: z.enum(["text", "voice", "generic-text"]).optional().default("text"),
    difficulty: interviewDifficultySchema.optional().default("mid"),
    category: sessionQuestionCategorySchema.optional(),
    questionCount: z.number().int().min(3).max(15).optional().default(5),
  })
  .refine(
    (data) => data.jobId !== null || !!data.category || !!data.contextPackId,
    {
      path: ["category"],
      message: "Category is required for quick practice",
    },
  );

// Interview answer schema
export const interviewAnswerSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").nullable(),
  questionIndex: z.number().int().min(0),
  answer: z.string().min(1, "Answer is required").max(10000),
  category: sessionQuestionCategorySchema.optional(),
});

export type InterviewAnswerInput = z.infer<typeof interviewAnswerSchema>;

// Interview session schema
// Note: Database uses "text" | "voice" for session modes
export const SESSION_MODES = ["text", "voice", "generic-text"] as const;

export type SessionMode = (typeof SESSION_MODES)[number];

export const sessionModeSchema = z.enum(SESSION_MODES);

export const INTERVIEW_CONTEXT_MODES = [
  "role",
  "project-defense",
  "skill-grill",
  "experience-deep-dive",
  "resume-claim",
  "document-based",
  "mixed-context",
] as const;

export const interviewContextModeSchema = z.enum(INTERVIEW_CONTEXT_MODES);

export const INTERVIEW_CONTEXT_SOURCE_TYPES = [
  "opportunity",
  "document",
  "bank",
  "profile-experience",
  "profile-project",
  "profile-skill",
  "company-research",
  "custom-text",
  "custom-url",
] as const;

export const sessionQuestionSchema = z.object({
  question: z.string().min(1),
  category: sessionQuestionCategorySchema,
  suggestedAnswer: z.string().optional(),
  difficulty: interviewDifficultySchema.optional(),
  sourceRefs: z
    .array(
      z.object({
        type: z.enum(INTERVIEW_CONTEXT_SOURCE_TYPES),
        id: z.string().optional(),
        category: z.enum(BANK_CATEGORIES).optional(),
        label: z.string().optional(),
        url: z.string().optional(),
        text: z.string().optional(),
      }),
    )
    .optional(),
  interviewMode: interviewContextModeSchema.optional(),
  probeType: z.string().optional(),
});

export const createInterviewSessionSchema = z
  .object({
    jobId: z.string().min(1, "Job ID is required").nullable(),
    contextPackId: z.string().min(1).optional(),
    category: sessionQuestionCategorySchema.optional(),
    questions: z
      .array(sessionQuestionSchema)
      .min(1, "At least one question is required"),
    mode: sessionModeSchema.optional(),
  })
  .refine(
    (data) => data.jobId !== null || !!data.category || !!data.contextPackId,
    {
      path: ["category"],
      message: "Category is required for quick practice",
    },
  );

export type CreateInterviewSessionInput = z.infer<
  typeof createInterviewSessionSchema
>;

export const INTERVIEW_QUESTION_COUNTS = [5, 10, 15] as const;

export const INTERVIEW_TIMER_DEFAULTS_MS: Record<
  SessionQuestionCategory,
  number
> = {
  behavioral: 90_000,
  technical: 120_000,
  situational: 150_000,
  general: 90_000,
  "cultural-fit": 90_000,
};

export const INTERVIEW_TIMER_EXTENSION_MS = 30_000;

export const interviewContextSourceSchema = z.object({
  type: z.enum(INTERVIEW_CONTEXT_SOURCE_TYPES),
  id: z.string().optional(),
  category: z.enum(BANK_CATEGORIES).optional(),
  label: z.string().max(160).optional(),
  url: z.string().url().optional(),
  text: z.string().max(12000).optional(),
});

export const createInterviewContextPackSchema = z.object({
  mode: interviewContextModeSchema,
  sources: z.array(interviewContextSourceSchema).min(1),
  customInput: z.string().max(12000).optional(),
  questionCount: z.number().int().min(3).max(15).optional().default(5),
  difficulty: interviewDifficultySchema.optional().default("mid"),
  deepDiveEnabled: z.boolean().optional().default(false),
});

export type CreateInterviewContextPackInput = z.infer<
  typeof createInterviewContextPackSchema
>;
