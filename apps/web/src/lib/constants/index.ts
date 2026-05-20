export { PATHS } from "./paths";

export {
  PLAN_TIERS,
  planTierSchema,
  DEFAULT_PLAN_TIER,
  FREE_TIER_TAILOR_MONTHLY_LIMIT,
  PRO_TIER_TAILOR_MONTHLY_LIMIT,
  STUDENT_TIER_TAILOR_MONTHLY_LIMIT,
  PLAN_TIER_LABELS,
} from "./plans";
export type { PlanTier } from "./plans";

export {
  THEMES,
  themeSchema,
  STORAGE_KEYS,
  LOCAL_STORAGE_KEY_PATTERNS,
  isSlothingLocalStorageKey,
} from "./storage";
export type { Theme } from "./storage";

export {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  jobStatusSchema,
  TRACKED_JOB_STATUSES,
  TRACKED_JOB_STATUS_LABELS,
  isTrackedJobStatus,
  getTrackedJobStatus,
  JOB_TYPES,
  JOB_TYPE_LABELS,
  jobTypeSchema,
  TECH_KEYWORDS,
} from "./jobs";
export type { JobStatus, TrackedJobStatus, JobType } from "./jobs";

// F2.2 consolidation: schemas live in `@/lib/validation/jobs`; re-exported
// here so existing `import … from "@/lib/constants"` call-sites keep
// compiling without churn.
export {
  createJobSchema,
  updateJobSchema,
  importJobSchema,
  importJobsArraySchema,
} from "@/lib/validation/jobs";
export type {
  CreateJobInput,
  UpdateJobInput,
  ImportJobInput,
} from "@/lib/validation/jobs";

export {
  SKILL_CATEGORIES,
  skillCategorySchema,
  PROFICIENCY_LEVELS,
  proficiencySchema,
  contactInfoSchema,
  experienceSchema,
  educationSchema,
  skillSchema,
  projectSchema,
  certificationSchema,
  updateProfileSchema,
} from "./profile";
export type {
  SkillCategory,
  ProficiencyLevel,
  UpdateProfileInput,
} from "./profile";

export {
  INTERVIEW_CATEGORIES,
  interviewCategorySchema,
  INTERVIEW_DIFFICULTIES,
  interviewDifficultySchema,
  DIFFICULTY_DESCRIPTIONS,
  startInterviewSchema,
  interviewAnswerSchema,
  SESSION_MODES,
  sessionModeSchema,
  SESSION_QUESTION_CATEGORIES,
  INTERVIEW_QUESTION_COUNTS,
  INTERVIEW_TIMER_DEFAULTS_MS,
  INTERVIEW_TIMER_EXTENSION_MS,
  INTERVIEW_CONTEXT_MODES,
  sessionQuestionCategorySchema,
  sessionQuestionSchema,
  createInterviewSessionSchema,
  interviewContextModeSchema,
  interviewContextSourceSchema,
  createInterviewContextPackSchema,
} from "./interview";
export type {
  InterviewCategory,
  InterviewDifficulty,
  InterviewAnswerInput,
  SessionMode,
  SessionQuestionCategory,
  CreateInterviewSessionInput,
  CreateInterviewContextPackInput,
} from "./interview";

export {
  DOCUMENT_TYPES,
  documentTypeSchema,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  FILE_SIGNATURES,
  validateFileMagicBytes,
  parseDocumentSchema,
} from "./documents";
export type { DocumentType, ParseDocumentInput } from "./documents";

export {
  LLM_PROVIDERS,
  llmProviderSchema,
  DEFAULT_LLM_TIMEOUT_MS,
  llmConfigSchema,
  updateSettingsSchema,
  LLM_ENDPOINTS,
  DEFAULT_MODELS,
  DEFAULT_MODEL_BY_PROVIDER,
} from "./llm";
export type { LLMProvider, LLMConfigInput } from "./llm";

export {
  EMAIL_TEMPLATE_TYPES,
  emailTemplateTypeSchema,
  createEmailSendSchema,
  generateEmailSchema,
} from "./email";
export type {
  CreateEmailSendInput,
  EmailTemplateType,
  GenerateEmailInput,
} from "./email";

export {
  REMINDER_TYPES,
  reminderTypeSchema,
  createReminderSchema,
} from "./reminders";
export type { ReminderType, CreateReminderInput } from "./reminders";

export {
  NOTIFICATION_ACTIONS,
  notificationActionSchema,
} from "./notifications";
export type { NotificationAction } from "./notifications";

export {
  compareResumesSchema,
  trackResumeSentSchema,
  updateTrackingOutcomeSchema,
} from "./resume-tracking";
export type {
  CompareResumesInput,
  TrackResumeSentInput,
  UpdateTrackingOutcomeInput,
} from "./resume-tracking";

export { backupDataSchema, fullExportDataSchema } from "./backup";
export type { BackupDataInput, FullExportDataInput } from "./backup";
