import { z } from "zod";
import path from "path";

// =============================================================================
// File System Paths
// =============================================================================

/**
 * Application paths - centralized to avoid hardcoded paths throughout the codebase
 */
export const PATHS = {
  /** SQLite database file location */
  DATABASE: path.join(process.cwd(), "data", "get-me-job.db"),
  /** Upload directory for user files */
  UPLOADS: path.join(process.cwd(), "uploads"),
  /** Generated resumes output directory */
  RESUMES_OUTPUT: path.join(process.cwd(), "public", "resumes"),
  /** Public directory root */
  PUBLIC: path.join(process.cwd(), "public"),
} as const;

// Job application statuses
export const JOB_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const jobStatusSchema = z.enum(JOB_STATUSES);

// Job types
export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const jobTypeSchema = z.enum(JOB_TYPES);

// Skill categories
export const SKILL_CATEGORIES = [
  "technical",
  "soft",
  "language",
  "tool",
  "other",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const skillCategorySchema = z.enum(SKILL_CATEGORIES);

// Proficiency levels
export const PROFICIENCY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const proficiencySchema = z.enum(PROFICIENCY_LEVELS);

// Interview question categories
export const INTERVIEW_CATEGORIES = [
  "behavioral",
  "technical",
  "situational",
  "general",
  "company",
] as const;

export type InterviewCategory = (typeof INTERVIEW_CATEGORIES)[number];

export const interviewCategorySchema = z.enum(INTERVIEW_CATEGORIES);

// Document types
export const DOCUMENT_TYPES = [
  "resume",
  "cover_letter",
  "portfolio",
  "certificate",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

// LLM providers
export const LLM_PROVIDERS = [
  "openai",
  "anthropic",
  "ollama",
  "openrouter",
] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number];

export const llmProviderSchema = z.enum(LLM_PROVIDERS);

// Theme options
export const THEMES = ["light", "dark", "system"] as const;

export type Theme = (typeof THEMES)[number];

export const themeSchema = z.enum(THEMES);

// Email template types
export const EMAIL_TEMPLATE_TYPES = [
  "follow_up",
  "thank_you",
  "networking",
  "status_inquiry",
  "negotiation",
] as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

export const emailTemplateTypeSchema = z.enum(EMAIL_TEMPLATE_TYPES);

// Storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: "get_me_job_onboarding_completed",
  THEME: "get_me_job_theme",
} as const;

// API validation schemas
export const createJobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  company: z.string().min(1, "Company is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(50000),
  location: z.string().max(200).optional(),
  type: jobTypeSchema.optional(),
  remote: z.boolean().optional(),
  salary: z.string().max(100).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  status: jobStatusSchema.optional().default("saved"),
  deadline: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial().extend({
  appliedAt: z.string().optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// LLM configuration
export const DEFAULT_LLM_TIMEOUT_MS = 60000; // 60 seconds

export const llmConfigSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  model: z.string().min(1, "Model is required"),
});

export type LLMConfigInput = z.infer<typeof llmConfigSchema>;

export const updateSettingsSchema = z.object({
  llm: llmConfigSchema.optional(),
});

// Interview difficulty levels
export const INTERVIEW_DIFFICULTIES = [
  "entry",
  "mid",
  "senior",
  "executive",
] as const;

export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

export const interviewDifficultySchema = z.enum(INTERVIEW_DIFFICULTIES);

export const startInterviewSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  difficulty: interviewDifficultySchema.optional().default("mid"),
});

// File upload limits
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
] as const;

// Magic bytes for file type validation
export const FILE_SIGNATURES: Record<string, number[]> = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  // text/plain has no magic bytes - validated by content
};

// Profile validation schemas
export const contactInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(5000),
  highlights: z.array(z.string()),
  skills: z.array(z.string()),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(200),
  field: z.string().max(200),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().max(20).optional(),
  highlights: z.array(z.string()),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  category: skillCategorySchema,
  proficiency: proficiencySchema.optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  url: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()),
  highlights: z.array(z.string()),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export const updateProfileSchema = z.object({
  contact: contactInfoSchema.optional(),
  summary: z.string().max(5000).optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  rawText: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =============================================================================
// LLM Configuration Constants
// =============================================================================

export const LLM_ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  ollama: "http://localhost:11434",
} as const;

export const DEFAULT_MODELS: Record<string, string[]> = {
  ollama: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"],
  openrouter: ["meta-llama/llama-3.2-3b-instruct:free", "google/gemma-2-9b-it:free"],
};

export const DEFAULT_MODEL_BY_PROVIDER: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  ollama: "llama3.2",
  openrouter: "meta-llama/llama-3.2-3b-instruct:free",
};

// =============================================================================
// Tech Keywords for Job Parsing
// =============================================================================

export const TECH_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
  "react", "vue", "angular", "node", "express", "django", "flask",
  "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
  "sql", "postgresql", "mysql", "mongodb", "redis",
  "git", "ci/cd", "jenkins", "github actions",
  "agile", "scrum", "jira", "confluence",
  "rest", "graphql", "api", "microservices",
  "machine learning", "ai", "data science", "analytics",
] as const;

// =============================================================================
// Interview Difficulty Descriptions
// =============================================================================

export const DIFFICULTY_DESCRIPTIONS: Record<InterviewDifficulty, string> = {
  entry: "Entry-level questions focusing on basic skills, learning ability, and enthusiasm. Avoid complex technical deep-dives.",
  mid: "Mid-level questions testing practical experience, problem-solving, and technical competence. Include specific scenario-based questions.",
  senior: "Senior-level questions probing leadership, architecture decisions, mentoring, and cross-functional impact. Expect detailed examples.",
  executive: "Executive-level questions about strategy, vision, organizational transformation, and stakeholder management. Focus on business impact.",
};

// =============================================================================
// Additional API Validation Schemas
// =============================================================================

// Reminder types
export const REMINDER_TYPES = [
  "follow_up",
  "deadline",
  "interview",
  "custom",
] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];

export const reminderTypeSchema = z.enum(REMINDER_TYPES);

// Reminder schema
export const createReminderSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  type: reminderTypeSchema.optional().default("custom"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;

// Notification action schema
export const NOTIFICATION_ACTIONS = ["markAllRead", "deleteRead"] as const;

export type NotificationAction = (typeof NOTIFICATION_ACTIONS)[number];

export const notificationActionSchema = z.object({
  action: z.enum(NOTIFICATION_ACTIONS),
});

// Interview answer schema
export const interviewAnswerSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  questionIndex: z.number().int().min(0),
  answer: z.string().min(1, "Answer is required").max(10000),
});

export type InterviewAnswerInput = z.infer<typeof interviewAnswerSchema>;

// Interview session schema
// Note: Database uses "text" | "voice" for session modes
export const SESSION_MODES = ["text", "voice"] as const;

export type SessionMode = (typeof SESSION_MODES)[number];

export const sessionModeSchema = z.enum(SESSION_MODES);

// Session question categories (narrower than INTERVIEW_CATEGORIES - excludes "company")
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

// Parse document schema
export const parseDocumentSchema = z.object({
  filename: z.string().optional(),
  documentId: z.string().optional(),
}).refine(
  (data) => data.filename || data.documentId,
  { message: "Either filename or documentId is required" }
);

export type ParseDocumentInput = z.infer<typeof parseDocumentSchema>;

// Email generation schema
export const generateEmailSchema = z.object({
  type: emailTemplateTypeSchema,
  jobId: z.string().optional(),
  interviewerName: z.string().max(200).optional(),
  interviewDate: z.string().optional(),
  daysAfter: z.number().int().min(1).max(365).optional(),
  targetCompany: z.string().max(200).optional(),
  connectionName: z.string().max(200).optional(),
  customNote: z.string().max(2000).optional(),
  useLLM: z.boolean().optional().default(true),
});

export type GenerateEmailInput = z.infer<typeof generateEmailSchema>;

// Resume comparison schema
export const compareResumesSchema = z.object({
  beforeId: z.string().min(1, "Before resume ID is required"),
  afterId: z.string().min(1, "After resume ID is required"),
});

export type CompareResumesInput = z.infer<typeof compareResumesSchema>;

// Resume A/B tracking schemas
export const trackResumeSentSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  notes: z.string().max(500).optional(),
});

export type TrackResumeSentInput = z.infer<typeof trackResumeSentSchema>;

export const updateTrackingOutcomeSchema = z.object({
  id: z.string().min(1, "Tracking entry ID is required"),
  outcome: z.enum(["applied", "screening", "interviewing", "offered", "rejected", "withdrawn"]),
});

export type UpdateTrackingOutcomeInput = z.infer<typeof updateTrackingOutcomeSchema>;

// Import job schema (single job)
export const importJobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  company: z.string().min(1, "Company is required").max(200),
  description: z.string().min(1, "Description is required").max(50000),
  location: z.string().max(200).optional(),
  type: jobTypeSchema.optional(),
  remote: z.boolean().optional(),
  salary: z.string().max(100).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  status: jobStatusSchema.optional(),
  notes: z.string().max(5000).optional(),
});

export type ImportJobInput = z.infer<typeof importJobSchema>;

// Import jobs schema (bulk)
export const importJobsArraySchema = z.array(importJobSchema);

// Backup profile schema (flexible for import compatibility)
const backupContactSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
}).passthrough();

const backupExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string(),
  highlights: z.array(z.string()),
  skills: z.array(z.string()),
}).passthrough();

const backupEducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()),
}).passthrough();

const backupSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  proficiency: z.string().optional(),
}).passthrough();

const backupProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
  technologies: z.array(z.string()),
  highlights: z.array(z.string()),
}).passthrough();

const backupCertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  url: z.string().optional(),
}).passthrough();

const backupProfileSchema = z.object({
  id: z.string().optional(),
  contact: backupContactSchema.optional(),
  summary: z.string().optional(),
  experiences: z.array(backupExperienceSchema).optional(),
  education: z.array(backupEducationSchema).optional(),
  skills: z.array(backupSkillSchema).optional(),
  projects: z.array(backupProjectSchema).optional(),
  certifications: z.array(backupCertificationSchema).optional(),
  rawText: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough();

// Backup job schema
const backupJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  type: z.string().optional(),
  remote: z.boolean().optional(),
  salary: z.string().optional(),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().optional(),
  status: z.string().optional(),
  appliedAt: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
}).passthrough();

// Backup document schema
const backupDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  type: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  path: z.string().optional(),
  extractedText: z.string().optional(),
  uploadedAt: z.string().optional(),
}).passthrough();

// Backup interview session schema
const backupInterviewSessionSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    category: z.string().optional(),
    suggestedAnswer: z.string().optional(),
    userAnswer: z.string().optional(),
    feedback: z.string().optional(),
  }).passthrough()),
  mode: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
}).passthrough();

// Backup generated resume schema
const backupGeneratedResumeSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  template: z.string().optional(),
  content: z.string().optional(),
  createdAt: z.string().optional(),
}).passthrough();

// Backup LLM config schema
const backupLLMConfigSchema = z.object({
  provider: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string(),
}).passthrough();

// Backup data schema
export const backupDataSchema = z.object({
  version: z.string().min(1, "Version is required"),
  exportedAt: z.string().optional(),
  data: z.object({
    profile: backupProfileSchema.optional(),
    jobs: z.array(backupJobSchema).optional(),
    documents: z.array(backupDocumentSchema).optional(),
    interviewSessions: z.array(backupInterviewSessionSchema).optional(),
    generatedResumes: z.array(backupGeneratedResumeSchema).optional(),
    llmConfig: backupLLMConfigSchema.optional(),
  }),
  stats: z.object({
    totalJobs: z.number().optional(),
    totalDocuments: z.number().optional(),
    totalInterviews: z.number().optional(),
    totalResumes: z.number().optional(),
  }).optional(),
});

export type BackupDataInput = z.infer<typeof backupDataSchema>;

/**
 * Check if buffer starts with expected magic bytes for the given MIME type
 */
export function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType];

  // text/plain doesn't have magic bytes, check if content is valid UTF-8
  if (mimeType === "text/plain") {
    try {
      const text = buffer.toString("utf8");
      // Check for common binary patterns that indicate non-text
      return !text.includes("\x00"); // Null bytes indicate binary
    } catch {
      return false;
    }
  }

  if (!signature) return true; // Unknown type, skip validation

  if (buffer.length < signature.length) return false;

  return signature.every((byte, i) => buffer[i] === byte);
}
