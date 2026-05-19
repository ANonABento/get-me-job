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
    userUploadedIdx: index("idx_documents_user_uploaded").on(
      table.userId,
      table.uploadedAt,
    ),
    userFileHashIdx: index("idx_documents_user_file_hash").on(
      table.userId,
      table.fileHash,
    ),
    userFileHashUniq: uniqueIndex("uniq_documents_user_file_hash")
      .on(table.userId, table.fileHash)
      .where(sql`file_hash IS NOT NULL`),
  }),
);

export const documentArtifacts = sqliteTable(
  "document_artifacts",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    extractorVersion: text("extractor_version").notNull(),
    status: text("status").notNull(),
    failureReason: text("failure_reason"),
    rawText: text("raw_text").notNull().default(""),
    normalizedText: text("normalized_text").notNull().default(""),
    pagesJson: text("pages_json").notNull().default("[]"),
    linksJson: text("links_json").notNull().default("[]"),
    ocrUsed: integer("ocr_used", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_document_artifacts_document_created").on(
      table.userId,
      table.documentId,
      table.createdAt,
    ),
    index("idx_document_artifacts_user_status").on(table.userId, table.status),
  ],
);

export const documentParseRuns = sqliteTable(
  "document_parse_runs",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull(),
    artifactId: text("artifact_id").notNull(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    mode: text("mode").notNull(),
    parserVersion: text("parser_version").notNull(),
    status: text("status").notNull(),
    failureReason: text("failure_reason"),
    confidence: real("confidence").notNull().default(0),
    warningsJson: text("warnings_json").notNull().default("[]"),
    structuredJson: text("structured_json").notNull().default("{}"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_document_parse_runs_document_created").on(
      table.userId,
      table.documentId,
      table.createdAt,
    ),
    index("idx_document_parse_runs_artifact_created").on(
      table.userId,
      table.artifactId,
      table.createdAt,
    ),
    index("idx_document_parse_runs_user_status").on(table.userId, table.status),
  ],
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
export const jobs = sqliteTable(
  "jobs",
  {
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
    // Extension-imported posting metadata (WaterlooWorks, Greenhouse, …).
    // `source` is the scraper key (e.g. "waterloo_works"); `sourceJobId`
    // is the platform's posting ID (e.g. WW "471268"). Together they're
    // the natural key the bulk-scrape uses for dedupe.
    source: text("source"),
    sourceJobId: text("source_job_id"),
    // Posting-level metadata surfaced from the modal. `openings` and
    // `applicants` are int counts; `level` and `workTerm` are free-text
    // because WW exposes them as multi-line lists ("Junior, Intermediate").
    openings: integer("openings"),
    applicants: integer("applicants"),
    level: text("level"),
    workTerm: text("work_term"),
  },
  (table) => [
    index("idx_jobs_user_created").on(table.userId, table.createdAt),
    index("idx_jobs_user_url").on(table.userId, table.url),
    index("idx_jobs_user_source_job").on(
      table.userId,
      table.source,
      table.sourceJobId,
    ),
  ],
);

// Generated resumes table
export const generatedResumes = sqliteTable(
  "generated_resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    jobId: text("job_id").notNull(),
    profileId: text("profile_id").notNull(),
    contentJson: text("content_json").notNull(),
    pdfPath: text("pdf_path"),
    matchScore: real("match_score"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_generated_resumes_user_created").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

// Interview sessions table
export const interviewSessions = sqliteTable(
  "interview_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    jobId: text("job_id"),
    category: text("category"),
    profileId: text("profile_id").notNull(),
    mode: text("mode").default("text"),
    questionsJson: text("questions_json").notNull(),
    status: text("status").default("in_progress"),
    startedAt: text("started_at").default(sql`CURRENT_TIMESTAMP`),
    completedAt: text("completed_at"),
  },
  (table) => [
    index("idx_interview_sessions_user_started").on(
      table.userId,
      table.startedAt,
    ),
  ],
);

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
  firedAt: text("fired_at"),
  notifyByEmail: integer("notify_by_email", { mode: "boolean" }).default(false),
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

// Bootstrap DDL co-located in `./bootstrap-sql.ts`
// (EXTERNAL_CALENDAR_EVENTS_BOOTSTRAP_SQL). Edit BOTH on column changes.
export const externalCalendarEvents = sqliteTable(
  "external_calendar_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    provider: text("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    calendarId: text("calendar_id"),
    matchedOpportunityId: text("matched_opportunity_id"),
    action: text("action").notNull(),
    eventTitle: text("event_title"),
    eventStart: text("event_start"),
    processedAt: text("processed_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("uniq_external_calendar_events_provider_event").on(
      table.userId,
      table.provider,
      table.externalEventId,
    ),
    index("idx_external_calendar_events_user_processed").on(
      table.userId,
      table.processedAt,
    ),
  ],
);

// Bootstrap DDL co-located in `./bootstrap-sql.ts`
// (SUGGESTED_STATUS_UPDATES_BOOTSTRAP_SQL). Edit BOTH on column changes.
export const suggestedStatusUpdates = sqliteTable(
  "suggested_status_updates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    notificationId: text("notification_id").notNull().unique(),
    opportunityId: text("opportunity_id").notNull(),
    suggestedStatus: text("suggested_status").notNull(),
    sourceProvider: text("source_provider"),
    sourceEventId: text("source_event_id"),
    confidence: real("confidence"),
    reason: text("reason"),
    evidenceJson: text("evidence_json"),
    state: text("state").notNull().default("pending"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    resolvedAt: text("resolved_at"),
  },
  (table) => [
    index("idx_suggested_status_updates_user_state").on(
      table.userId,
      table.state,
    ),
  ],
);

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
    enrichmentJson: text("enrichment_json"),
    enrichedAt: text("enriched_at"),
    githubSlug: text("github_slug"),
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

// Bootstrap DDL for stripeCustomers + subscriptions co-located in
// `./bootstrap-sql.ts` (BILLING_BOOTSTRAP_SQL). Edit BOTH on column changes.
export const stripeCustomers = sqliteTable(
  "stripe_customers",
  {
    userId: text("user_id").primaryKey().notNull().default(DEFAULT_USER_ID),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    email: text("email"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_stripe_customers_stripe_id").on(table.stripeCustomerId),
  ],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    planKey: text("plan_key").notNull(),
    status: text("status").notNull(),
    stripePriceId: text("stripe_price_id"),
    currentPeriodStart: text("current_period_start"),
    currentPeriodEnd: text("current_period_end"),
    cancelAtPeriodEnd: integer("cancel_at_period_end", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    canceledAt: text("canceled_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_subscriptions_user_status").on(table.userId, table.status),
    index("idx_subscriptions_customer").on(table.stripeCustomerId),
  ],
);

// Bootstrap DDL co-located in `./bootstrap-sql.ts` (CREDITS_BOOTSTRAP_SQL).
// Edit BOTH when adding/renaming a column. See F2.7.
export const creditBalances = sqliteTable("credit_balances", {
  userId: text("user_id").primaryKey().notNull().default(DEFAULT_USER_ID),
  balance: integer("balance").notNull().default(0),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const creditTransactions = sqliteTable(
  "credit_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    feature: text("feature"),
    refId: text("ref_id"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_credit_transactions_user_created").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

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

// Email sends table. Bootstrap DDL co-located in `./bootstrap-sql.ts`
// (EMAIL_SENDS_BOOTSTRAP_SQL). Edit BOTH on column changes.
export const emailSends = sqliteTable(
  "email_sends",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    type: text("type").notNull(),
    jobId: text("job_id"),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    inReplyToDraftId: text("in_reply_to_draft_id"),
    gmailMessageId: text("gmail_message_id"),
    status: text("status").notNull().default("sent"),
    errorMessage: text("error_message"),
    sentAt: text("sent_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_email_sends_user_sent_at").on(table.userId, table.sentAt),
    index("idx_email_sends_user_recipient_type").on(
      table.userId,
      table.recipient,
      table.type,
    ),
  ],
);

// Opportunity contacts table. Bootstrap DDL co-located in
// `./bootstrap-sql.ts` (OPPORTUNITY_CONTACTS_BOOTSTRAP_SQL). Edit BOTH
// on column changes.
export const opportunityContacts = sqliteTable(
  "opportunity_contacts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    opportunityId: text("opportunity_id").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    title: text("title"),
    source: text("source").notNull().default("google"),
    googleResourceName: text("google_resource_name"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_opportunity_contacts_user_opp").on(
      table.userId,
      table.opportunityId,
    ),
    uniqueIndex("uniq_opp_contacts_user_opp_resource")
      .on(table.userId, table.opportunityId, table.googleResourceName)
      .where(sql`google_resource_name IS NOT NULL`),
  ],
);

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
    description: text("description"),
    sourceDocumentId: text("source_document_id"),
    sourceFilename: text("source_filename"),
    sourceType: text("source_type"),
    analyzedStyles: text("analyzed_styles").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
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
    parentId: text("parent_id"),
    componentType: text("component_type"),
    componentOrder: integer("component_order").default(0),
    sourceSection: text("source_section"),
    // PF.2 — positional metadata for the review-modal document preview.
    sourcePage: integer("source_page"),
    sourceBbox: text("source_bbox"),
    sourceOrder: integer("source_order"),
    sourceHeaderBbox: text("source_header_bbox"),
    sourceLinks: text("source_links"),
    sourceArtifactId: text("source_artifact_id"),
    sourceParseRunId: text("source_parse_run_id"),
    sourceSpanIds: text("source_span_ids"),
    sourceQuality: text("source_quality"),
    matchMethod: text("match_method"),
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
    index("idx_profile_bank_parent").on(table.userId, table.parentId),
    index("idx_profile_bank_component_type").on(
      table.userId,
      table.componentType,
    ),
    index("idx_profile_bank_parse_run").on(
      table.userId,
      table.sourceParseRunId,
    ),
    index("idx_profile_bank_artifact").on(table.userId, table.sourceArtifactId),
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

// Tailored resume knowledge chunks with optional embeddings.
// Bootstrap DDL co-located in `./bootstrap-sql.ts`
// (KNOWLEDGE_CHUNKS_BOOTSTRAP_SQL). Edit BOTH on column changes.
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
    deviceUserAgent: text("device_user_agent"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text("expires_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [
    index("idx_extension_sessions_token").on(table.token),
    index("idx_extension_sessions_user").on(table.userId),
  ],
);

// Reusable answers from job applications and manual curation
export const answerBank = sqliteTable(
  "answer_bank",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    question: text("question").notNull(),
    questionNormalized: text("question_normalized").notNull(),
    answer: text("answer").notNull(),
    source: text("source").notNull().default("manual"),
    sourceUrl: text("source_url"),
    sourceCompany: text("source_company"),
    timesUsed: integer("times_used").default(1),
    lastUsedAt: text("last_used_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_answer_bank_normalized").on(table.questionNormalized),
    index("idx_answer_bank_user").on(table.userId),
    index("idx_answer_bank_user_source").on(table.userId, table.source),
  ],
);

export const answerBankVersions = sqliteTable(
  "answer_bank_versions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    answerId: text("answer_id").notNull(),
    version: integer("version").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sourceUrl: text("source_url"),
    sourceCompany: text("source_company"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_answer_bank_versions_answer").on(table.answerId, table.version),
    index("idx_answer_bank_versions_user").on(table.userId),
  ],
);

// Custom field mappings for specific sites. The original (`site_pattern`,
// `field_selector`, `custom_value`, `enabled`) columns are kept for backwards
// compatibility; the corrections feedback loop (#33) adds `domain`,
// `field_signature`, `observed_value`, `hit_count`, and `last_seen_at`.
// Uniqueness on (user_id, domain, field_signature) — applied as a unique
// partial index rather than a composite PK so the existing PK on `id` and
// existing rows (with NULL signature) keep working.
export const fieldMappings = sqliteTable(
  "field_mappings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    sitePattern: text("site_pattern").notNull(),
    fieldSelector: text("field_selector").notNull(),
    fieldType: text("field_type").notNull(),
    customValue: text("custom_value"),
    enabled: integer("enabled", { mode: "boolean" }).default(true),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    // #33 corrections feedback loop columns:
    domain: text("domain"),
    fieldSignature: text("field_signature"),
    observedValue: text("observed_value"),
    hitCount: integer("hit_count").default(1),
    lastSeenAt: text("last_seen_at"),
  },
  (table) => ({
    userDomainSignatureUniq: uniqueIndex(
      "uniq_field_mappings_user_domain_signature",
    )
      .on(table.userId, table.domain, table.fieldSignature)
      .where(sql`domain IS NOT NULL AND field_signature IS NOT NULL`),
    userDomainIdx: index("idx_field_mappings_user_domain").on(
      table.userId,
      table.domain,
    ),
  }),
);

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

// Bootstrap DDL for promptVariants + promptVariantResults co-located in
// `./bootstrap-sql.ts` (PROMPT_VARIANTS_BOOTSTRAP_SQL). Edit BOTH on
// column changes.
export const promptVariants = sqliteTable(
  "prompt_variants",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    content: text("content").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_prompt_variants_user").on(table.userId)],
);

export const promptVariantResults = sqliteTable(
  "prompt_variant_results",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    promptVariantId: text("prompt_variant_id").notNull(),
    jobId: text("job_id"),
    resumeId: text("resume_id"),
    matchScore: real("match_score"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_prompt_variant_results_variant").on(table.promptVariantId),
    index("idx_prompt_variant_results_user").on(table.userId),
  ],
);

// Bootstrap DDL for userActivity + achievementUnlocks co-located in
// `./bootstrap-sql.ts` (STREAK_BOOTSTRAP_SQL). Edit BOTH on column
// changes.
export const userActivity = sqliteTable(
  "user_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastActivityDay: text("last_activity_day"),
    totalOppsCreated: integer("total_opps_created").notNull().default(0),
    totalOppsApplied: integer("total_opps_applied").notNull().default(0),
    totalResumesTailored: integer("total_resumes_tailored")
      .notNull()
      .default(0),
    totalCoverLetters: integer("total_cover_letters").notNull().default(0),
    totalEmailsSent: integer("total_emails_sent").notNull().default(0),
    totalInterviewsStarted: integer("total_interviews_started")
      .notNull()
      .default(0),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_user_activity_user_id").on(table.userId)],
);

export const achievementUnlocks = sqliteTable(
  "achievement_unlocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    achievementId: text("achievement_id").notNull(),
    unlockedAt: text("unlocked_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_achievement_unlocks_user_achievement").on(
      table.userId,
      table.achievementId,
    ),
    index("idx_achievement_unlocks_user_unlocked").on(
      table.userId,
      table.unlockedAt,
    ),
  ],
);

// View-only public shares of a tailored resume. The `id` doubles as the
// URL-safe public token, so it's generated via `crypto.randomBytes` rather
// than a UUID — see `src/lib/db/shared-resumes.ts`. Snapshots are stored
// inline (rather than referencing a `documents` row) so deleting the source
// document or editing the resume doesn't silently mutate an already-shared
// link.
export const sharedResumes = sqliteTable(
  "shared_resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    documentHtml: text("document_html").notNull(),
    documentTitle: text("document_title").notNull(),
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    viewCount: integer("view_count").notNull().default(0),
  },
  (table) => [
    index("idx_shared_resumes_user_id").on(table.userId),
    index("idx_shared_resumes_user_created").on(table.userId, table.createdAt),
  ],
);

// NextAuth.js (@auth/drizzle-adapter) tables.
// Adapter-owned columns must match @auth/drizzle-adapter/sqlite exactly — do not
// customize column names. Nullable app-owned columns are okay; the adapter only
// writes the fields it knows about.
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  onboardingDismissedAt: text("onboarding_dismissed_at"),
  createdAt: text("created_at"),
  welcomeSeriesState: text("welcome_series_state"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// Saved filter + sort presets for the review queue / opportunities list
// (spec: docs/opportunity-customization-spec.md §3.2). One row per
// preset; multiple per user. Pinned presets render as chips at the top
// of the queue, ordered by `position`.
export const opportunityPresets = sqliteTable(
  "opportunity_presets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().default(DEFAULT_USER_ID),
    name: text("name").notNull(),
    // "review" applies in /opportunities/review; "list" applies in the
    // /opportunities list view. Same row could in theory cover both but
    // the spec calls for per-scope presets to keep the chip bars distinct.
    scope: text("scope").notNull().default("review"),
    filtersJson: text("filters_json").notNull(),
    sortId: text("sort_id").notNull().default("most-recent"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    position: integer("position"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_opportunity_presets_user_pinned").on(table.userId, table.pinned),
    index("idx_opportunity_presets_user_scope").on(table.userId, table.scope),
  ],
);

// Type exports for use in application code.
//
// NOTE: the Drizzle row type is named `SettingsRow` (not `Settings`) to avoid
// collision with the UI shape exported as `Settings` from `@/types`. The two
// have totally different fields — Drizzle's row is a single key/value record,
// while the UI shape is `{ llm, theme, locale }`.
export type SettingsRow = typeof settings.$inferSelect;
export type NewSettingsRow = typeof settings.$inferInsert;

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

export type ExternalCalendarEvent = typeof externalCalendarEvents.$inferSelect;
export type NewExternalCalendarEvent =
  typeof externalCalendarEvents.$inferInsert;

export type SuggestedStatusUpdate = typeof suggestedStatusUpdates.$inferSelect;
export type NewSuggestedStatusUpdate =
  typeof suggestedStatusUpdates.$inferInsert;

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
export type EmailSend = typeof emailSends.$inferSelect;
export type NewEmailSend = typeof emailSends.$inferInsert;
export type OpportunityContact = typeof opportunityContacts.$inferSelect;
export type NewOpportunityContact = typeof opportunityContacts.$inferInsert;

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

export type AnswerBankRow = typeof answerBank.$inferSelect;
export type NewAnswerBankRow = typeof answerBank.$inferInsert;

export type AnswerBankVersion = typeof answerBankVersions.$inferSelect;
export type NewAnswerBankVersion = typeof answerBankVersions.$inferInsert;

export type FieldMapping = typeof fieldMappings.$inferSelect;
export type NewFieldMapping = typeof fieldMappings.$inferInsert;

export type ResumeAbTracking = typeof resumeAbTracking.$inferSelect;
export type NewResumeAbTracking = typeof resumeAbTracking.$inferInsert;

export type PromptVariant = typeof promptVariants.$inferSelect;
export type NewPromptVariant = typeof promptVariants.$inferInsert;

export type PromptVariantResult = typeof promptVariantResults.$inferSelect;
export type NewPromptVariantResult = typeof promptVariantResults.$inferInsert;

export type UserActivity = typeof userActivity.$inferSelect;
export type NewUserActivity = typeof userActivity.$inferInsert;

export type AchievementUnlockRow = typeof achievementUnlocks.$inferSelect;
export type NewAchievementUnlockRow = typeof achievementUnlocks.$inferInsert;

export type SharedResume = typeof sharedResumes.$inferSelect;
export type NewSharedResume = typeof sharedResumes.$inferInsert;

export type AuthUser = typeof users.$inferSelect;
export type NewAuthUser = typeof users.$inferInsert;

export type AuthAccount = typeof accounts.$inferSelect;
export type NewAuthAccount = typeof accounts.$inferInsert;

export type AuthSession = typeof sessions.$inferSelect;
export type NewAuthSession = typeof sessions.$inferInsert;

export type AuthVerificationToken = typeof verificationTokens.$inferSelect;
export type NewAuthVerificationToken = typeof verificationTokens.$inferInsert;
