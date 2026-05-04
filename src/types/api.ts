/**
 * Shared API request/response types for all API routes.
 *
 * These types document the shape of data flowing through the API layer.
 * Use `ApiSuccessResponse<T>` and `ApiErrorResponse` as the standard
 * envelope for all JSON responses.
 */

import type { InterviewDifficulty } from "@/lib/constants";
import type { TailoredResume } from "@/lib/resume/generator";
import type { GapItem } from "@/lib/tailor/analyze";
import type { InterviewQuestion } from "@/types/interview";
import type {
  Profile,
  JobDescription,
  BankEntry,
  BankCategory,
  EmailTemplate,
  EmailTemplateType,
  JobMatch,
  Settings,
  LLMConfig,
  DocumentType,
  Skill,
} from "./index";

// ---------------------------------------------------------------------------
// Generic envelope
// ---------------------------------------------------------------------------

/** Successful API response wrapper */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Error API response wrapper */
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/** Validation error response (from Zod) */
export interface ApiValidationErrorResponse {
  error: "Validation failed";
  errors: Array<{ field: string; message: string }>;
}

/** Union of all possible API responses */
export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse
  | ApiValidationErrorResponse;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ProfileResponse {
  profile: Profile | null;
}

export interface ProfileUpdateResponse {
  success: true;
  profile: Profile;
}

export interface ProfileDeleteResponse {
  success: true;
}

// ---------------------------------------------------------------------------
// Profile versions
// ---------------------------------------------------------------------------

export interface ProfileVersion {
  id: string;
  userId: string;
  snapshot: Profile;
  label?: string;
  createdAt: string;
}

export interface ProfileVersionsResponse {
  versions: ProfileVersion[];
}

export interface ProfileVersionResponse {
  version: ProfileVersion;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface JobsResponse {
  jobs: JobDescription[];
}

export interface JobResponse {
  job: JobDescription;
}

export interface JobAnalysisResponse {
  analysis: JobMatch;
}

export interface JobDeleteResponse {
  success: true;
}

// ---------------------------------------------------------------------------
// Cover letter
// ---------------------------------------------------------------------------

export interface CoverLetterGenerateResponse {
  success: true;
  coverLetter: string;
  highlights: string[];
  usedLLM: boolean;
}

export interface CoverLetterVersion {
  id: string;
  jobId: string;
  content: string;
  createdAt: string;
}

export interface CoverLetterHistoryResponse {
  versions: CoverLetterVersion[];
}

export interface CoverLetterSaveResponse {
  success: true;
  coverLetter: CoverLetterVersion;
}

// ---------------------------------------------------------------------------
// Resume generation & tailoring
// ---------------------------------------------------------------------------

export interface ResumeGenerateResponse {
  success: true;
  pdfUrl?: string;
  resume: Record<string, unknown>;
  savedResume?: { id: string };
}

export interface ResumesListResponse {
  resumes: Array<{
    id: string;
    jobId: string;
    content: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface ResumeTemplatesResponse {
  templates: Array<{
    id: string;
    name: string;
    description?: string;
    preview?: string;
  }>;
}

export interface TailorAnalysisResponse {
  success: true;
  analysis: {
    matchScore: number;
    keywordsFound: string[];
    keywordsMissing: string[];
    gaps: GapItem[];
    matchedEntriesCount: number;
  };
}

export interface TailorGenerateResponse {
  success: true;
  html: string;
  pdfUrl: string;
  resume: TailoredResume;
  savedResume: { id: string };
  jobId: string;
  analysis: TailorAnalysisResponse["analysis"];
}

export interface TailorRenderResponse {
  success: true;
  html: string;
}

// ---------------------------------------------------------------------------
// Resume stats & tracking
// ---------------------------------------------------------------------------

export interface ResumeStatsResponse {
  stats: Array<{
    resumeId: string;
    sentCount: number;
    responseCount: number;
    conversionRate: number;
  }>;
  recommendation?: string;
  totalTracked: number;
}

export interface ResumeTrackEntry {
  id: string;
  resumeId: string;
  jobId: string;
  sentAt: string;
  outcome?: string;
}

export interface ResumeTrackResponse {
  entries: ResumeTrackEntry[];
}

export interface ResumeCompareResponse {
  comparison: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  sectionScores: Record<string, number>;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Bank (profile knowledge bank)
// ---------------------------------------------------------------------------

export interface BankEntriesResponse {
  entries: BankEntry[];
}

export interface BankEntryUpdateResponse {
  success: true;
}

export interface BankDocumentsResponse {
  documents: Array<{
    id: string;
    filename: string;
    size: number;
    uploadedAt: string;
    chunkCount: number;
  }>;
}

export interface BankDocumentDeleteResponse {
  success: true;
  chunksDeleted: number;
  documentsDeleted?: number;
}

// ---------------------------------------------------------------------------
// Upload & parse
// ---------------------------------------------------------------------------

export interface UploadResponse {
  success: true;
  document: {
    id: string;
    filename: string;
    type: DocumentType;
    size: number;
    extractedText: string | null;
  };
  parsing?: {
    confidence: number;
    sectionsDetected: string[];
    llmUsed: boolean;
    llmSectionsCount: number;
    warnings: string[];
  };
}

export interface ParseResponse {
  success: true;
  profile: Partial<Profile>;
  parsingMethod: string;
  llmFallback: boolean;
  llmConfigured: boolean;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface DocumentsListResponse {
  documents: Array<{
    id: string;
    filename: string;
    type: DocumentType;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }>;
}

export interface DocumentDeleteResponse {
  success: true;
}

// ---------------------------------------------------------------------------
// Interview
// ---------------------------------------------------------------------------

export interface InterviewStartResponse {
  questions: InterviewQuestion[];
  difficulty: InterviewDifficulty;
}

export interface InterviewAnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer?: string;
}

export interface InterviewAnswerResponse {
  feedback: string;
}

export interface InterviewFollowupResponse {
  success: true;
  followUpQuestion: string;
  reason: string;
  suggestedFocus: string[];
}

export interface InterviewSession {
  id: string;
  jobId?: string;
  type: string;
  difficulty: string;
  status: string;
  questions: Array<{
    id: string;
    question: string;
    category: string;
    answer?: string;
    feedback?: InterviewAnswerFeedback;
  }>;
  createdAt: string;
}

export interface InterviewSessionsResponse {
  sessions: InterviewSession[];
}

export interface InterviewSessionResponse {
  session: InterviewSession;
}

export interface InterviewSessionAnswerResponse {
  answer: {
    id: string;
    sessionId: string;
    questionIndex: number;
    answer: string;
    feedback?: string;
    createdAt: string;
  };
  feedback: string;
  isComplete: boolean;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface AnalyticsOverviewResponse {
  overview: Record<string, unknown>;
  jobs: Record<string, unknown>;
  interviews: Record<string, unknown>;
  skills: Record<string, unknown>;
  recent: Record<string, unknown>;
}

export interface AnalyticsTrendsResponse {
  range: string;
  timeSeries: Array<Record<string, unknown>>;
  trends: Record<string, unknown>;
  timeline: Array<Record<string, unknown>>;
  snapshots: Record<string, unknown>;
  weekOverWeek: Record<string, unknown>;
  avgTimeInStatus: Record<string, unknown>;
}

export interface AnalyticsSuccessResponse {
  metrics: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// ATS
// ---------------------------------------------------------------------------

export interface ATSAnalyzeResponse {
  result: {
    score: number;
    issues: string[];
    keywordMatches: Array<{ keyword: string; found: boolean }>;
    suggestions: string[];
  };
}

export interface ATSScanResponse {
  id: string;
  report: Record<string, unknown>;
  fixes: Array<{
    issue: string;
    fix: string;
    priority: string;
  }>;
}

export interface ATSScanHistoryResponse {
  history: Array<{
    id: string;
    createdAt: string;
    score: number;
  }>;
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

export interface EmailDraft {
  id: string;
  jobId?: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
}

export interface EmailDraftsResponse {
  drafts: EmailDraft[];
}

export interface EmailDraftResponse {
  draft: EmailDraft;
}

export interface EmailGenerateResponse {
  success: true;
  email: EmailTemplate;
  usedLLM: boolean;
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export interface CalendarFeedUrlResponse {
  feedUrl: string;
  webcalUrl: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export interface Reminder {
  id: string;
  jobId?: string;
  type: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

export interface RemindersResponse {
  reminders: Reminder[];
}

export interface ReminderCreateResponse {
  success: true;
  reminder: Reminder;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface SettingsResponse {
  llm: LLMConfig;
  locale?: string;
}

export interface SettingsUpdateResponse {
  success: true;
  message: string;
}

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------

export interface BackupRestoreResponse {
  success: true;
  results: Record<string, { imported: number; errors: number }>;
}

// ---------------------------------------------------------------------------
// Salary
// ---------------------------------------------------------------------------

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
}

export interface SalaryOffer {
  id: string;
  jobId?: string;
  company: string;
  baseSalary: number;
  bonus?: number;
  equity?: number;
  benefits?: string[];
  status: string;
  createdAt: string;
}

export interface SalaryOffersResponse {
  offers: SalaryOffer[];
  stats: Record<string, unknown>;
}

export interface SalaryOfferResponse {
  offer: SalaryOffer;
}

export interface NegotiationScript {
  script: {
    opening: string;
    valuePoints: string[];
    theAsk: string;
    pushbackResponses: Record<string, string>;
    close: string;
  };
  source: string;
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export interface ExtensionAuthResponse {
  token: string;
  expiresAt: string;
}

export interface ExtensionAuthVerifyResponse {
  valid: boolean;
  userId: string;
  expiresAt: string;
}

export interface ExtensionProfileResponse {
  profile: Profile;
  computed: {
    firstName: string;
    lastName: string;
    currentTitle?: string;
    currentCompany?: string;
    yearsOfExperience?: number;
  };
}

export interface LearnedAnswer {
  id: string;
  question: string;
  answer: string;
  category?: string;
  source?: string;
  createdAt: string;
}

export interface LearnedAnswersResponse {
  answers: LearnedAnswer[];
}

export interface LearnedAnswerSearchResponse {
  results: Array<LearnedAnswer & { similarity: number }>;
}

// ---------------------------------------------------------------------------
// Google integrations
// ---------------------------------------------------------------------------

export interface GoogleAuthStatusResponse {
  connected: boolean;
  status: string;
}

export interface GoogleCalendarEventsResponse {
  count: number;
  events: Array<Record<string, unknown>>;
}

export interface GoogleCalendarSyncResponse {
  success: true;
  synced: number;
  failed: number;
  results: Array<Record<string, unknown>>;
}

export interface GoogleContactsResponse {
  success: true;
  count: number;
  contacts: Array<Record<string, unknown>>;
}

export interface GoogleDocsCreateResponse {
  success: true;
  docId: string;
  docUrl: string;
}

export interface GoogleDriveListResponse {
  success: true;
  folder: string;
  count: number;
  files: Array<Record<string, unknown>>;
}

export interface GoogleDriveImportResponse {
  success: true;
  fileId: string;
  fileName: string;
  mimeType: string;
  content: string;
}

export interface GoogleDriveUploadResponse {
  success: true;
  fileId: string;
  webViewLink: string;
  shareableLink?: string;
}

export interface GoogleGmailScanResponse {
  success: true;
  count: number;
  emails: Array<Record<string, unknown>>;
}

export interface GoogleGmailSendResponse {
  success: true;
  messageId: string;
}

export interface GoogleSheetsExportResponse {
  success: true;
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export interface GoogleTasksSyncResponse {
  success: true;
  synced: number;
  failed: number;
  results: Array<Record<string, unknown>>;
}

export interface GoogleTasksListResponse {
  success: true;
  count: number;
  tasks: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export interface ImportCSVPreviewResponse {
  success: true;
  preview: Array<Record<string, unknown>>;
}

export interface ImportCSVResponse {
  success: true;
  imported: number;
  failed: number;
}

export interface ImportJobPreviewResponse {
  success: true;
  preview: Record<string, unknown>;
}

export interface ImportJobResponse {
  success: true;
  job: JobDescription;
}

export interface ImportJobsBulkResponse {
  success: true;
  imported: number;
  skipped: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Insights & recommendations
// ---------------------------------------------------------------------------

export interface InsightsResponse {
  insights: Record<string, unknown>;
}

export interface RecommendationsResponse {
  recommendations: Array<Record<string, unknown>>;
  topSkillGaps: Skill[];
  growthAreas: string[];
  insights: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export interface LearningPath {
  skill: string;
  resources: Array<{
    title: string;
    url?: string;
    type: string;
    estimatedWeeks: number;
  }>;
}

export interface LearningPathsResponse {
  paths: LearningPath[];
  totalEstimatedWeeks: number;
  quickWins: string[];
  strategicSkills: string[];
  insights: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

export interface CompanyResearchResponse {
  companyName: string;
  overview?: string;
  culture?: string;
  interviewProcess?: string;
  glassdoorRating?: number;
  fromCache: boolean;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface TemplatesResponse {
  templates: Array<{
    id: string;
    name: string;
    content: string;
    isCustom: boolean;
  }>;
}

export interface TemplateAnalyzeResponse {
  analyzed: Record<string, unknown>;
  usedLLM: boolean;
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

export interface MessageResponse {
  success: true;
  message: string;
}

export interface DeleteResponse {
  success: true;
}
