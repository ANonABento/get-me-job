import { pgTable, text, timestamp, integer, real, boolean, index, uniqueIndex, customType } from 'drizzle-orm/pg-core';

export const DEFAULT_USER_ID = 'default';
export const DEFAULT_PROFILE_ID = DEFAULT_USER_ID;

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

// Settings table (global, no userId)
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Documents table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  filename: text('filename').notNull(),
  type: text('type').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  extractedText: text('extracted_text'),
  parsedData: text('parsed_data'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Profile table
export const profile = pgTable('profile', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  contactJson: text('contact_json'),
  summary: text('summary'),
  rawText: text('raw_text'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Experiences table
export const experiences = pgTable('experiences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id').notNull(),
  company: text('company').notNull(),
  title: text('title').notNull(),
  location: text('location'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  current: boolean('current').default(false),
  description: text('description'),
  highlightsJson: text('highlights_json'),
  skillsJson: text('skills_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Education table
export const education = pgTable('education', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id').notNull(),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  field: text('field'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  gpa: text('gpa'),
  highlightsJson: text('highlights_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Skills table
export const skills = pgTable('skills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id').notNull(),
  name: text('name').notNull(),
  category: text('category').default('other'),
  proficiency: text('proficiency'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url'),
  technologiesJson: text('technologies_json'),
  highlightsJson: text('highlights_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Certifications table
export const certifications = pgTable('certifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  profileId: text('profile_id').notNull(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  issueDate: text('issue_date'),
  expiryDate: text('expiry_date'),
  credentialId: text('credential_id'),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  type: text('type'),
  remote: boolean('remote').default(false),
  salary: text('salary'),
  description: text('description').notNull(),
  requirementsJson: text('requirements_json'),
  responsibilitiesJson: text('responsibilities_json'),
  keywordsJson: text('keywords_json'),
  url: text('url'),
  status: text('status').default('saved'),
  appliedAt: text('applied_at'),
  deadline: text('deadline'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Generated resumes table
export const generatedResumes = pgTable('generated_resumes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: text('job_id').notNull(),
  profileId: text('profile_id').notNull(),
  contentJson: text('content_json').notNull(),
  pdfPath: text('pdf_path'),
  matchScore: real('match_score'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Interview sessions table
export const interviewSessions = pgTable('interview_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: text('job_id').notNull(),
  profileId: text('profile_id').notNull(),
  mode: text('mode').default('text'),
  questionsJson: text('questions_json').notNull(),
  status: text('status').default('in_progress'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Interview answers table
export const interviewAnswers = pgTable('interview_answers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull(),
  questionIndex: integer('question_index').notNull(),
  answer: text('answer').notNull(),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reminders table
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: text('job_id').notNull(),
  type: text('type').default('follow_up'),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date').notNull(),
  completed: boolean('completed').default(false),
  dismissed: boolean('dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message'),
  link: text('link'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Company research cache table
export const companyResearch = pgTable('company_research', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  companyName: text('company_name').notNull(),
  summary: text('summary'),
  keyFactsJson: text('key_facts_json'),
  interviewQuestionsJson: text('interview_questions_json'),
  cultureNotes: text('culture_notes'),
  recentNews: text('recent_news'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('idx_company_research_user_company').on(table.userId, table.companyName),
]);

// Cover letters table
export const coverLetters = pgTable('cover_letters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  jobId: text('job_id').notNull(),
  profileId: text('profile_id').notNull(),
  content: text('content').notNull(),
  highlightsJson: text('highlights_json'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// LLM Settings table (per-user)
export const llmSettings = pgTable('llm_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  provider: text('provider').default('openai'),
  model: text('model'),
  apiKey: text('api_key'),
  baseUrl: text('base_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email drafts table
export const emailDrafts = pgTable('email_drafts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  type: text('type').notNull(),
  jobId: text('job_id'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  contextJson: text('context_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Analytics snapshots table for historical tracking
export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  snapshotDate: text('snapshot_date').notNull(),
  totalJobs: integer('total_jobs').default(0),
  jobsSaved: integer('jobs_saved').default(0),
  jobsApplied: integer('jobs_applied').default(0),
  jobsInterviewing: integer('jobs_interviewing').default(0),
  jobsOffered: integer('jobs_offered').default(0),
  jobsRejected: integer('jobs_rejected').default(0),
  totalInterviews: integer('total_interviews').default(0),
  interviewsCompleted: integer('interviews_completed').default(0),
  totalDocuments: integer('total_documents').default(0),
  totalResumes: integer('total_resumes').default(0),
  profileCompleteness: integer('profile_completeness').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('idx_analytics_snapshots_user_date').on(table.userId, table.snapshotDate),
]);

// Job status history table
export const jobStatusHistory = pgTable('job_status_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  jobId: text('job_id').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  changedAt: timestamp('changed_at').defaultNow(),
  notes: text('notes'),
}, (table) => [
  index('idx_job_status_history_user_job').on(table.userId, table.jobId, table.changedAt),
]);

// Salary offers table
export const salaryOffers = pgTable('salary_offers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  jobId: text('job_id'),
  company: text('company').notNull(),
  role: text('role').notNull(),
  baseSalary: real('base_salary').notNull(),
  signingBonus: real('signing_bonus'),
  annualBonus: real('annual_bonus'),
  equityValue: real('equity_value'),
  vestingYears: integer('vesting_years'),
  location: text('location'),
  status: text('status').default('pending'),
  notes: text('notes'),
  negotiationOutcome: text('negotiation_outcome'),
  finalBaseSalary: real('final_base_salary'),
  finalTotalComp: real('final_total_comp'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ATS scan history table
export const atsScanHistory = pgTable('ats_scan_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  jobId: text('job_id'),
  overallScore: integer('overall_score').notNull(),
  letterGrade: text('letter_grade').notNull(),
  formattingScore: integer('formatting_score').notNull(),
  structureScore: integer('structure_score').notNull(),
  contentScore: integer('content_score').notNull(),
  keywordsScore: integer('keywords_score').notNull(),
  issueCount: integer('issue_count').notNull().default(0),
  fixCount: integer('fix_count').notNull().default(0),
  reportJson: text('report_json').notNull(),
  scannedAt: timestamp('scanned_at').defaultNow(),
}, (table) => [
  index('idx_ats_scan_history_user').on(table.userId),
  index('idx_ats_scan_history_date').on(table.scannedAt),
]);

// Custom resume templates table
export const customTemplates = pgTable('custom_templates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  name: text('name').notNull(),
  sourceDocumentId: text('source_document_id'),
  analyzedStyles: text('analyzed_styles').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_custom_templates_user_created').on(table.userId, table.createdAt),
]);

// Profile bank table for aggregated resume data
export const profileBank = pgTable('profile_bank', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  category: text('category').notNull(),
  content: text('content').notNull(),
  sourceDocumentId: text('source_document_id'),
  confidenceScore: real('confidence_score').default(0.8),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_profile_bank_user').on(table.userId),
  index('idx_profile_bank_category').on(table.userId, table.category),
]);

// Profile versions table for version history with rollback
export const profileVersions = pgTable('profile_versions', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().default(DEFAULT_PROFILE_ID),
  version: integer('version').notNull(),
  snapshotJson: text('snapshot_json').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_profile_versions_profile').on(table.profileId, table.version),
]);

// Knowledge bank chunks table
export const chunks = pgTable('chunks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  content: text('content').notNull(),
  sectionType: text('section_type').notNull(),
  sourceFile: text('source_file'),
  metadata: text('metadata'),
  confidenceScore: real('confidence_score').default(0.8),
  supersededBy: text('superseded_by'),
  hash: text('hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_chunks_user').on(table.userId),
  index('idx_chunks_user_section').on(table.userId, table.sectionType),
  uniqueIndex('idx_chunks_user_hash').on(table.userId, table.hash),
]);

// Tailored resume knowledge chunks with optional embeddings
export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  documentId: text('document_id').notNull(),
  sectionType: text('section_type').notNull(),
  content: text('content').notNull(),
  contentHash: text('content_hash').notNull(),
  embedding: bytea('embedding'),
  metadataJson: text('metadata_json').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_knowledge_chunks_user').on(table.userId),
  index('idx_knowledge_chunks_document').on(table.documentId),
  uniqueIndex('idx_knowledge_chunks_user_hash').on(table.userId, table.contentHash),
  index('idx_knowledge_chunks_section').on(table.userId, table.sectionType),
]);

// Extension session tokens for API authentication
export const extensionSessions = pgTable('extension_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  token: text('token').notNull().unique(),
  deviceInfo: text('device_info'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  lastUsedAt: timestamp('last_used_at'),
}, (table) => [
  index('idx_extension_sessions_token').on(table.token),
  index('idx_extension_sessions_user').on(table.userId),
]);

// Learned answers from job applications
export const learnedAnswers = pgTable('learned_answers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  question: text('question').notNull(),
  questionNormalized: text('question_normalized').notNull(),
  answer: text('answer').notNull(),
  sourceUrl: text('source_url'),
  sourceCompany: text('source_company'),
  timesUsed: integer('times_used').default(1),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_learned_answers_normalized').on(table.questionNormalized),
  index('idx_learned_answers_user').on(table.userId),
]);

// Custom field mappings for specific sites
export const fieldMappings = pgTable('field_mappings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  sitePattern: text('site_pattern').notNull(),
  fieldSelector: text('field_selector').notNull(),
  fieldType: text('field_type').notNull(),
  customValue: text('custom_value'),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Resume A/B tracking table
export const resumeAbTracking = pgTable('resume_ab_tracking', {
  id: text('id').primaryKey(),
  resumeId: text('resume_id').notNull(),
  jobId: text('job_id').notNull(),
  userId: text('user_id').notNull().default(DEFAULT_USER_ID),
  outcome: text('outcome').notNull().default('applied'),
  sentAt: timestamp('sent_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  notes: text('notes'),
}, (table) => [
  index('idx_resume_ab_tracking_resume').on(table.resumeId),
  index('idx_resume_ab_tracking_job').on(table.jobId),
  index('idx_resume_ab_tracking_user').on(table.userId),
]);

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
