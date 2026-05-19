// Shared types for Slothing extension
export type {
  Certification,
  ContactInfo,
  Education,
  Experience,
  Profile,
  Project,
  Skill,
} from "@slothing/shared/types";

import type { Profile } from "@slothing/shared/types";

// Extension-specific types
export interface ExtensionProfile extends Profile {
  computed: ComputedProfileFields;
}

export interface ComputedProfileFields {
  firstName?: string;
  lastName?: string;
  currentCompany?: string;
  currentTitle?: string;
  mostRecentSchool?: string;
  mostRecentDegree?: string;
  mostRecentField?: string;
  graduationYear?: string;
  yearsExperience?: number;
  skillsList?: string;
}

// Field detection types
export type FieldType =
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "state"
  | "zipCode"
  | "country"
  | "linkedin"
  | "github"
  | "website"
  | "portfolio"
  | "currentCompany"
  | "currentTitle"
  | "education"
  | "degree"
  | "school"
  | "graduationYear"
  | "gpa"
  | "fieldOfStudy"
  | "experience"
  | "yearsExperience"
  | "resume"
  | "coverLetter"
  | "salary"
  | "salaryExpectation"
  | "startDate"
  | "availability"
  | "workAuthorization"
  | "sponsorship"
  | "veteranStatus"
  | "disability"
  | "gender"
  | "ethnicity"
  | "skills"
  | "summary"
  | "customQuestion"
  | "unknown";

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  confidence: number;
  suggestedValue?: string;
  label?: string;
  placeholder?: string;
}

export type DocumentUploadKind =
  | "resume"
  | "coverLetter"
  | "portfolio"
  | "transcript"
  | "unknown";

export interface DetectedUploadField {
  element: HTMLInputElement;
  kind: DocumentUploadKind;
  label?: string;
  accept?: string;
}

export interface FieldSignals {
  name: string;
  id: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  label: string;
  ariaLabel: string;
  nearbyText: string;
  parentClasses: string[];
}

// Scraper types
export interface ScrapedJob {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  salary?: string;
  type?: "full-time" | "part-time" | "contract" | "internship";
  remote?: boolean;
  url: string;
  source: string;
  sourceJobId?: string;
  deadline?: string;
  postedAt?: string;
  keywords?: string[];
  // Posting-level metadata. `openings` and `applicants` are integer counts;
  // `level` and `workTerm` are free-text because WaterlooWorks exposes them
  // as multi-value lists ("Junior, Intermediate", "2026 - Fall"). Other
  // sources can leave these undefined.
  openings?: number;
  applicants?: number;
  level?: string;
  workTerm?: string;
}

export interface PageSnapshot {
  url: string;
  host: string;
  title: string;
  headline?: string;
  submittedAt: string;
  thumbnailDataUrl?: string;
}

export interface TrackedApplicationPayload extends PageSnapshot {
  scrapedJob?: ScrapedJob | null;
}

export type SidebarDock = "left" | "right" | "floating";

export interface SidebarPosition {
  x: number;
  y: number;
}

export interface SidebarLayout {
  dock: SidebarDock;
  position: SidebarPosition | null;
  collapsed: boolean;
}

export interface PageSurfaceContext {
  tab: {
    url: string;
    host: string;
    supported: boolean;
    contentScriptReady: boolean;
  };
  page: {
    hasApplicationForm: boolean;
    detectedFieldCount: number;
    detectedUploadCount: number;
    documentUploads: Array<{
      kind: DocumentUploadKind;
      label?: string;
      accept?: string;
    }>;
    job: ScrapedJob | null;
  };
  workspace: {
    visible: boolean;
    dismissed: boolean;
    layout: SidebarLayout;
  };
}

// Learning types
export interface LearnedAnswer {
  id: string;
  question: string;
  questionNormalized: string;
  answer: string;
  source: "extension" | "curated" | "manual";
  sourceUrl?: string;
  sourceCompany?: string;
  timesUsed: number;
  createdAt: string;
}

export interface SimilarAnswer {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  timesUsed: number;
}

// Answer-bank match result returned by /api/answer-bank/match.
// Differs from SimilarAnswer (legacy /api/extension/learned-answers/search):
// the match route returns a normalized `score` (0..1) and an optional category
// rather than `similarity` + `timesUsed`.
export interface AnswerBankMatch {
  id: string;
  question: string;
  answer: string;
  score: number;
  category?: string;
}

// Message types for background/content communication
export type MessageType =
  | "GET_PROFILE"
  | "FILL_FORM"
  | "SCRAPE_JOB"
  | "SCRAPE_JOB_LIST"
  | "IMPORT_JOB"
  | "IMPORT_JOBS_BATCH"
  | "TRACK_APPLIED"
  | "OPEN_DASHBOARD"
  | "CAPTURE_VISIBLE_TAB"
  | "GET_SETTINGS"
  | "TAILOR_FROM_PAGE"
  | "GENERATE_COVER_LETTER_FROM_PAGE"
  | "LIST_RESUMES"
  | "SAVE_ANSWER"
  | "SEARCH_ANSWERS"
  | "MATCH_ANSWER_BANK"
  | "GET_LEARNED_ANSWERS"
  | "DELETE_ANSWER"
  | "GET_AUTH_STATUS"
  | "AUTH_STATUS_CHANGED"
  | "GET_SURFACE_CONTEXT"
  | "OPEN_AUTH"
  | "LOGOUT"
  | "JOB_DETECTED"
  | "WW_GET_PAGE_STATE"
  | "WW_SCRAPE_ALL_VISIBLE"
  | "WW_SCRAPE_ALL_PAGINATED"
  | "WW_BULK_PROGRESS"
  | "WW_BULK_PROGRESS_FANOUT"
  | "WW_BULK_CANCEL"
  | "GET_BULK_PROGRESS"
  | "GET_IMPORTED_SOURCE_JOB_IDS"
  // P3/#39 — Generic bulk-scrape orchestrators for public ATS hosts.
  | "BULK_GREENHOUSE_GET_PAGE_STATE"
  | "BULK_GREENHOUSE_SCRAPE_VISIBLE"
  | "BULK_GREENHOUSE_SCRAPE_PAGINATED"
  | "BULK_GREENHOUSE_PROGRESS"
  | "BULK_LEVER_GET_PAGE_STATE"
  | "BULK_LEVER_SCRAPE_VISIBLE"
  | "BULK_LEVER_SCRAPE_PAGINATED"
  | "BULK_LEVER_PROGRESS"
  | "BULK_WORKDAY_GET_PAGE_STATE"
  | "BULK_WORKDAY_SCRAPE_VISIBLE"
  | "BULK_WORKDAY_SCRAPE_PAGINATED"
  | "BULK_WORKDAY_PROGRESS"
  | "AUTH_CALLBACK"
  | "SAVE_CORRECTION"
  // P3 / #36 #37 — multi-step form support (Workday, Greenhouse).
  // Background → content: a `webNavigation.onHistoryStateUpdated` event fired
  // for a tab that has an in-progress multi-step application. The content
  // script re-runs the autofill engine against the new DOM.
  | "MULTISTEP_STEP_TRANSITION"
  // Background → content: poll for the current tab id. Used by the content
  // script to scope `chrome.storage.session` entries (see session.ts).
  | "GET_TAB_ID"
  // Content → background: ask the background to ensure the `webNavigation`
  // permission is granted. On Chrome MV3 this is a no-op (declared in
  // `permissions`); on Firefox MV2 the background calls
  // `browser.permissions.request(...)` and returns whether the user
  // accepted.
  | "REQUEST_WEBNAVIGATION_PERMISSION"
  // Content → background: query whether `webNavigation` is currently
  // available. The result determines whether we wait for a step transition
  // event from the background or fall back to the prompted in-page toast.
  | "HAS_WEBNAVIGATION_PERMISSION"
  // P4/#40 — Inline AI assistant in the in-page sidebar. The content script
  // opens a `chrome.runtime.connect` Port (name = CHAT_PORT_NAME) and posts a
  // CHAT_STREAM_START to the background, which streams tokens back on the same
  // port. We deliberately use a Port (not chrome.tabs.sendMessage) so the
  // service worker can deliver back-pressure-friendly token frames without
  // needing the tab id, and so the channel cleanly tears down on either side.
  | "CHAT_STREAM_START"
  | "CHAT_STREAM_TOKEN"
  | "CHAT_STREAM_END"
  | "CHAT_STREAM_ERROR";

/**
 * P4/#40 — Long-lived port name used by the inline AI assistant. The content
 * script calls `chrome.runtime.connect({ name: CHAT_PORT_NAME })` and the
 * background's `chrome.runtime.onConnect` listener filters by this name.
 */
export const CHAT_PORT_NAME = "slothing-chat-stream";

/**
 * P4/#40 — Trimmed job-context payload the sidebar sends to the chat route.
 * Sized to fit the LLM context window comfortably; the server truncates
 * `description` again as a safety net.
 */
export interface ChatJobContext {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  url?: string;
  /** Stable per-source job id when the scraper has one (e.g. Greenhouse). */
  sourceJobId?: string;
}

/** P4/#40 — Payload posted from content script → background on the chat port. */
export interface ChatStreamStartPayload {
  type: "CHAT_STREAM_START";
  prompt: string;
  jobContext?: ChatJobContext;
}

/** P4/#40 — Token frame pushed from background → content script. */
export interface ChatStreamTokenPayload {
  type: "CHAT_STREAM_TOKEN";
  token: string;
}

/** P4/#40 — Terminal success frame: stream completed. */
export interface ChatStreamEndPayload {
  type: "CHAT_STREAM_END";
}

/** P4/#40 — Terminal error frame: human-readable message for the UI. */
export interface ChatStreamErrorPayload {
  type: "CHAT_STREAM_ERROR";
  error: string;
}

export type ChatPortMessage =
  | ChatStreamStartPayload
  | ChatStreamTokenPayload
  | ChatStreamEndPayload
  | ChatStreamErrorPayload;

/**
 * Payload for the SAVE_CORRECTION message (#33). Sent by the content script's
 * corrections tracker when a user edits a field we autofilled and the final
 * value differs from the original suggestion. The background script forwards
 * this to /api/extension/field-mappings/correct so the per-domain mapping
 * grows stronger over time.
 */
export interface SaveCorrectionPayload {
  domain: string;
  fieldSignature: string;
  fieldType: FieldType;
  originalSuggestion: string;
  userValue: string;
  confidence?: number;
}

/**
 * Summary of a previously-generated tailored resume, surfaced by
 * GET /api/extension/resumes for the popup's multi-resume picker (#34).
 */
export interface ExtensionResumeSummary {
  id: string;
  name: string;
  targetRole: string;
  updatedAt: string;
}

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage types
export interface ExtensionStorage {
  authToken?: string;
  tokenExpiry?: string;
  apiBaseUrl: string;
  cachedProfile?: ExtensionProfile;
  profileCachedAt?: string;
  /**
   * ISO timestamp of the most recent time we observed a working auth state
   * (either via setAuthToken or a successful isAuthenticated() call).
   * Used by the popup to distinguish a real logout from a service-worker
   * state-loss event (e.g. after extension auto-update). See #27.
   */
  lastSeenAuthAt?: string;
  settings: ExtensionSettings;
}

export interface ExtensionSettings {
  autoFillEnabled: boolean;
  showConfidenceIndicators: boolean;
  minimumConfidence: number;
  learnFromAnswers: boolean;
  notifyOnJobDetected: boolean;
  autoTrackApplicationsEnabled: boolean;
  captureScreenshotEnabled: boolean;
  // Bulk-scrape knobs surfaced via the options page (spec §4 bucket D).
  // The orchestrator reads these before each run.
  scrapeThrottleMs: number;
  scrapeChunkSize: number;
  scrapeMaxJobs: number;
  scrapeMaxPages: number;
  scrapeDedupeEnabled: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  autoFillEnabled: true,
  showConfidenceIndicators: true,
  minimumConfidence: 0.5,
  learnFromAnswers: true,
  notifyOnJobDetected: true,
  autoTrackApplicationsEnabled: true,
  captureScreenshotEnabled: false,
  scrapeThrottleMs: 500,
  scrapeChunkSize: 5,
  scrapeMaxJobs: 200,
  scrapeMaxPages: 50,
  scrapeDedupeEnabled: true,
};

export const LEGACY_LOCAL_API_BASE_URL = "http://localhost:3000";
export const DEFAULT_API_BASE_URL =
  process.env.SLOTHING_EXTENSION_API_BASE_URL || "https://slothing.work";
export const SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL =
  DEFAULT_API_BASE_URL !== LEGACY_LOCAL_API_BASE_URL;
