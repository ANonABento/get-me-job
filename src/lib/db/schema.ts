import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  customType,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const DEFAULT_USER_ID = "default";
export const DEFAULT_PROFILE_ID = DEFAULT_USER_ID;

const customBlob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "blob";
  },
});

// Settings table (global, no userId)
export const settings = sqliteTable(
  "settings",
  {
    key: text("key").notNull(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    value: text("value").notNull(),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.key, table.userId] })],
);

// Documents table
export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    filename: text("filename").notNull(),
    type: text("type").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    path: text("path").notNull(),
    extractedText: text("extracted_text"),
    parsedData: text("parsed_data"),
    fileHash: text("file_hash"),
    uploadedAt: text("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userFileHashIdx: index("idx_documents_user_file_hash").on(
      table.userId,
      table.fileHash,
    ),
    userFileHashUniq: uniqueIndex("uniq_documents_user_file_hash")
      .on(table.userId, table.fileHash)
      .where(sql`file_hash IS NOT NULL`),
  }),
);

// Profile table
export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID).unique(),
  contactJson: text("contact_json"),
  summary: text("summary"),
  rawText: text("raw_text"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Experiences table
export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  profileId: text("profile_id").notNull(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  current: integer("current", { mode: "boolean" }).default(false),
  description: text("description"),
  highlightsJson: text("highlights_json"),
  skillsJson: text("skills_json"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Education table
export const education = sqliteTable("education", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  profileId: text("profile_id").notNull(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  field: text("field"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  gpa: text("gpa"),
  highlightsJson: text("highlights_json"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Skills table
export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  profileId: text("profile_id").notNull(),
  name: text("name").notNull(),
  category: text("category").default("other"),
  proficiency: text("proficiency"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  profileId: text("profile_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  technologiesJson: text("technologies_json"),
  highlightsJson: text("highlights_json"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Certifications table
export const certifications = sqliteTable("certifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  profileId: text("profile_id").notNull(),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  issueDate: text("issue_date"),
  expiryDate: text("expiry_date"),
  credentialId: text("credential_id"),
  url: text("url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Jobs table
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  type: text("type"),
  remote: integer("remote", { mode: "boolean" }).default(false),
  salary: text("salary"),
  description: text("description").notNull(),
  requirementsJson: text("requirements_json"),
  responsibilitiesJson: text("responsibilities_json"),
  keywordsJson: text("keywords_json"),
  url: text("url"),
  status: text("status").default("saved"),
  appliedAt: text("applied_at"),
  deadline: text("deadline"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Generated resumes table
export const generatedResumes = sqliteTable("generated_resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  jobId: text("job_id").notNull(),
  profileId: text("profile_id").notNull(),
  contentJson: text("content_json").notNull(),
  pdfPath: text("pdf_path"),
  matchScore: real("match_score"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Interview sessions table
export const interviewSessions = sqliteTable("interview_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  jobId: text("job_id").notNull(),
  profileId: text("profile_id").notNull(),
  mode: text("mode").default("text"),
  questionsJson: text("questions_json").notNull(),
  status: text("status").default("in_progress"),
  startedAt: text("started_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
});

// Interview answers table
export const interviewAnswers = sqliteTable("interview_answers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  sessionId: text("session_id").notNull(),
  questionIndex: integer("question_index").notNull(),
  answer: text("answer").notNull(),
  feedback: text("feedback"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Reminders table
export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  jobId: text("job_id").notNull(),
  type: text("type").default("follow_up"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  dismissed: integer("dismissed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Company research cache table
export const companyResearch = sqliteTable(
  "company_research",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    companyName: text("company_name").notNull(),
    summary: text("summary"),
    keyFactsJson: text("key_facts_json"),
    interviewQuestionsJson: text("interview_questions_json"),
    cultureNotes: text("culture_notes"),
    recentNews: text("recent_news"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_company_research_user_company").on(
      table.userId,
      table.companyName,
    ),
  ],
);

// Cover letters table
export const coverLetters = sqliteTable("cover_letters", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  jobId: text("job_id").notNull(),
  profileId: text("profile_id").notNull(),
  content: text("content").notNull(),
  highlightsJson: text("highlights_json"),
  version: integer("version").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// LLM Settings table (per-user)
export const llmSettings = sqliteTable("llm_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID).unique(),
  provider: text("provider").default("openai"),
  model: text("model"),
  apiKey: text("api_key"),
  baseUrl: text("base_url"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Email drafts table
export const emailDrafts = sqliteTable("email_drafts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  type: text("type").notNull(),
  jobId: text("job_id"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  contextJson: text("context_json"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Analytics snapshots table for historical tracking
export const analyticsSnapshots = sqliteTable(
  "analytics_snapshots",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    snapshotDate: text("snapshot_date").notNull(),
    totalJobs: integer("total_jobs").default(0),
    jobsSaved: integer("jobs_saved").default(0),
    jobsApplied: integer("jobs_applied").default(0),
    jobsInterviewing: integer("jobs_interviewing").default(0),
    jobsOffered: integer("jobs_offered").default(0),
    jobsRejected: integer("jobs_rejected").default(0),
    totalInterviews: integer("total_interviews").default(0),
    interviewsCompleted: integer("interviews_completed").default(0),
    totalDocuments: integer("total_documents").default(0),
    totalResumes: integer("total_resumes").default(0),
    profileCompleteness: integer("profile_completeness").default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_analytics_snapshots_user_date").on(
      table.userId,
      table.snapshotDate,
    ),
  ],
);

// Job status history table
export const jobStatusHistory = sqliteTable(
  "job_status_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    jobId: text("job_id").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    changedAt: text("changed_at").default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => [
    index("idx_job_status_history_user_job").on(
      table.userId,
      table.jobId,
      table.changedAt,
    ),
  ],
);

// Salary offers table
export const salaryOffers = sqliteTable("salary_offers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  jobId: text("job_id"),
  company: text("company").notNull(),
  role: text("role").notNull(),
  baseSalary: real("base_salary").notNull(),
  signingBonus: real("signing_bonus"),
  annualBonus: real("annual_bonus"),
  equityValue: real("equity_value"),
  vestingYears: integer("vesting_years"),
  location: text("location"),
  status: text("status").default("pending"),
  notes: text("notes"),
  negotiationOutcome: text("negotiation_outcome"),
  finalBaseSalary: real("final_base_salary"),
  finalTotalComp: real("final_total_comp"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ATS scan history table
export const atsScanHistory = sqliteTable(
  "ats_scan_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    jobId: text("job_id"),
    overallScore: integer("overall_score").notNull(),
    letterGrade: text("letter_grade").notNull(),
    formattingScore: integer("formatting_score").notNull(),
    structureScore: integer("structure_score").notNull(),
    contentScore: integer("content_score").notNull(),
    keywordsScore: integer("keywords_score").notNull(),
    issueCount: integer("issue_count").notNull().default(0),
    fixCount: integer("fix_count").notNull().default(0),
    reportJson: text("report_json").notNull(),
    scannedAt: text("scanned_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_ats_scan_history_user").on(table.userId),
    index("idx_ats_scan_history_date").on(table.scannedAt),
  ],
);

// Custom resume templates table
export const customTemplates = sqliteTable(
  "custom_templates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    name: text("name").notNull(),
    sourceDocumentId: text("source_document_id"),
    analyzedStyles: text("analyzed_styles").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_custom_templates_user_created").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

// Profile bank table for aggregated resume data
export const profileBank = sqliteTable(
  "profile_bank",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    category: text("category").notNull(),
    content: text("content").notNull(),
    sourceDocumentId: text("source_document_id"),
    confidenceScore: real("confidence_score").default(0.8),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_profile_bank_user").on(table.userId),
    index("idx_profile_bank_category").on(table.userId, table.category),
    index("idx_profile_bank_user_source").on(
      table.userId,
      table.sourceDocumentId,
    ),
  ],
);

// Profile versions table for version history with rollback
export const profileVersions = sqliteTable(
  "profile_versions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    profileId: text("profile_id").notNull().default(DEFAULT_PROFILE_ID),
    version: integer("version").notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_profile_versions_profile").on(table.profileId, table.version),
  ],
);

// Knowledge bank chunks table
export const chunks = sqliteTable(
  "chunks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    content: text("content").notNull(),
    sectionType: text("section_type").notNull(),
    sourceFile: text("source_file"),
    metadata: text("metadata"),
    confidenceScore: real("confidence_score").default(0.8),
    supersededBy: text("superseded_by"),
    hash: text("hash").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_chunks_user").on(table.userId),
    index("idx_chunks_user_section").on(table.userId, table.sectionType),
    uniqueIndex("idx_chunks_user_hash").on(table.userId, table.hash),
  ],
);

// Tailored resume knowledge chunks with optional embeddings
export const knowledgeChunks = sqliteTable(
  "knowledge_chunks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    documentId: text("document_id").notNull(),
    sectionType: text("section_type").notNull(),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    embedding: customBlob("embedding"),
    metadataJson: text("metadata_json").default("{}"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_knowledge_chunks_user").on(table.userId),
    index("idx_knowledge_chunks_document").on(table.documentId),
    uniqueIndex("idx_knowledge_chunks_user_hash").on(
      table.userId,
      table.contentHash,
    ),
    index("idx_knowledge_chunks_section").on(table.userId, table.sectionType),
  ],
);

// Extension session tokens for API authentication
export const extensionSessions = sqliteTable(
  "extension_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    token: text("token").notNull().unique(),
    deviceInfo: text("device_info"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text("expires_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [
    index("idx_extension_sessions_token").on(table.token),
    index("idx_extension_sessions_user").on(table.userId),
  ],
);

// Learned answers from job applications
export const learnedAnswers = sqliteTable(
  "learned_answers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    question: text("question").notNull(),
    questionNormalized: text("question_normalized").notNull(),
    answer: text("answer").notNull(),
    sourceUrl: text("source_url"),
    sourceCompany: text("source_company"),
    timesUsed: integer("times_used").default(1),
    lastUsedAt: text("last_used_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_learned_answers_normalized").on(table.questionNormalized),
    index("idx_learned_answers_user").on(table.userId),
  ],
);

// Custom field mappings for specific sites
export const fieldMappings = sqliteTable("field_mappings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  sitePattern: text("site_pattern").notNull(),
  fieldSelector: text("field_selector").notNull(),
  fieldType: text("field_type").notNull(),
  customValue: text("custom_value"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Resume A/B tracking table
export const resumeAbTracking = sqliteTable(
  "resume_ab_tracking",
  {
    id: text("id").primaryKey(),
    resumeId: text("resume_id").notNull(),
    jobId: text("job_id").notNull(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    outcome: text("outcome").notNull().default("applied"),
    sentAt: text("sent_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => [
    index("idx_resume_ab_tracking_resume").on(table.resumeId),
    index("idx_resume_ab_tracking_job").on(table.jobId),
    index("idx_resume_ab_tracking_user").on(table.userId),
  ],
);

export const promptVariants = sqliteTable("prompt_variants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  content: text("content").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const promptVariantResults = sqliteTable(
  "prompt_variant_results",
  {
    id: text("id").primaryKey(),
    promptVariantId: text("prompt_variant_id").notNull(),
    jobId: text("job_id"),
    resumeId: text("resume_id"),
    matchScore: real("match_score"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_prompt_variant_results_variant").on(table.promptVariantId),
  ],
);

// Type exports for use in application code
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert;

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Certification = typeof certifications.$inferSelect;
export type NewCertification = typeof certifications.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export type GeneratedResume = typeof generatedResumes.$inferSelect;
export type NewGeneratedResume = typeof generatedResumes.$inferInsert;

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type NewInterviewSession = typeof interviewSessions.$inferInsert;

export type InterviewAnswer = typeof interviewAnswers.$inferSelect;
export type NewInterviewAnswer = typeof interviewAnswers.$inferInsert;

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type CompanyResearch = typeof companyResearch.$inferSelect;
export type NewCompanyResearch = typeof companyResearch.$inferInsert;

export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;

export type LlmSettings = typeof llmSettings.$inferSelect;
export type NewLlmSettings = typeof llmSettings.$inferInsert;

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type NewEmailDraft = typeof emailDrafts.$inferInsert;

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type NewAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;

export type JobStatusHistory = typeof jobStatusHistory.$inferSelect;
export type NewJobStatusHistory = typeof jobStatusHistory.$inferInsert;

export type SalaryOffer = typeof salaryOffers.$inferSelect;
export type NewSalaryOffer = typeof salaryOffers.$inferInsert;

export type AtsScanHistory = typeof atsScanHistory.$inferSelect;
export type NewAtsScanHistory = typeof atsScanHistory.$inferInsert;

export type CustomTemplate = typeof customTemplates.$inferSelect;
export type NewCustomTemplate = typeof customTemplates.$inferInsert;

export type ProfileBankEntry = typeof profileBank.$inferSelect;
export type NewProfileBankEntry = typeof profileBank.$inferInsert;

export type ProfileVersion = typeof profileVersions.$inferSelect;
export type NewProfileVersion = typeof profileVersions.$inferInsert;

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type NewKnowledgeChunk = typeof knowledgeChunks.$inferInsert;

export type ExtensionSession = typeof extensionSessions.$inferSelect;
export type NewExtensionSession = typeof extensionSessions.$inferInsert;

export type LearnedAnswer = typeof learnedAnswers.$inferSelect;
export type NewLearnedAnswer = typeof learnedAnswers.$inferInsert;

export type FieldMapping = typeof fieldMappings.$inferSelect;
export type NewFieldMapping = typeof fieldMappings.$inferInsert;

export type ResumeAbTracking = typeof resumeAbTracking.$inferSelect;
export type NewResumeAbTracking = typeof resumeAbTracking.$inferInsert;

export type PromptVariant = typeof promptVariants.$inferSelect;
export type NewPromptVariant = typeof promptVariants.$inferInsert;

export type PromptVariantResult = typeof promptVariantResults.$inferSelect;
export type NewPromptVariantResult = typeof promptVariantResults.$inferInsert;
