export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  headline?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  workStyle?: string[];
  targetRoles?: string[];
  targetSalaryMin?: string;
  targetSalaryMax?: string;
  targetSalaryCurrency?: string;
  openToRecruiters?: boolean;
  shareContactInfo?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  highlights: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: "technical" | "soft" | "language" | "tool" | "other";
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Profile {
  id: string;
  contact: ContactInfo;
  summary?: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  rawText?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @deprecated Use `OpportunityStatus` from `./schemas` directly.
 * Kept as a type alias during the F2.1 consolidation so existing imports keep
 * compiling. Value set is identical to `OpportunityStatus`:
 * `"pending" | "saved" | "applied" | "interviewing" | "offer" | "rejected" | "expired" | "dismissed"`.
 *
 * Migration note: callers that previously used the legacy values `"offered"` /
 * `"withdrawn"` must translate to `"offer"` / `"dismissed"` respectively. The
 * Drizzle migration `0013_jobs_status_canonical.sql` rewrites existing DB rows.
 */
export type JobStatus = import("./schemas").OpportunityStatus;

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location?: string;
  type?: "full-time" | "part-time" | "contract" | "internship";
  remote?: boolean;
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  url?: string;
  status?: JobStatus;
  appliedAt?: string;
  deadline?: string;
  notes?: string;
  createdAt: string;
  linkedResumeId?: string;
  linkedCoverLetterId?: string;
}

export interface JobMatch {
  jobId: string;
  profileId: string;
  overallScore: number;
  skillMatches: { skill: string; matched: boolean; relevance: number }[];
  experienceMatches: { experienceId: string; relevance: number }[];
  gaps: string[];
  suggestions: string[];
}

/**
 * Provider configuration shape used by the LLM client / settings UI.
 *
 * Derived from `llmConfigSchema` in `./schemas` so the runtime validator and
 * the static type can't drift on the next field addition (F6.2 in
 * `docs/legacy-duplication-audit.md`).
 */
export type LLMConfig = import("./schemas").LLMConfigInput;

export const BANK_CATEGORIES = [
  "experience",
  "skill",
  "project",
  "education",
  "paragraph",
  "bullet",
  "achievement",
  "certification",
  "hackathon",
] as const;

export type BankCategory = (typeof BANK_CATEGORIES)[number];

export type SourceBbox = [number, number, number, number, number];

export interface SourceLinkMetadata {
  url: string;
  text?: string;
  page?: number;
  bbox?: SourceBbox;
}

export interface BankEntry {
  id: string;
  userId: string;
  category: BankCategory;
  content: Record<string, unknown>;
  sourceDocumentId?: string;
  /**
   * PF.2 — first page (1-indexed) where the entry was located in its source
   * PDF, or `undefined` if no positional metadata was captured (manual entry,
   * Drive doc, parse pre-PF.1, or fuzzy match failed).
   */
  sourcePage?: number;
  /**
   * PF.2 — `[page, x0, y0, x1, y1]` tuples covering every text run that
   * makes up this entry in the source PDF. Multiple tuples support
   * entries that span page breaks. `undefined` follows the same rule as
   * `sourcePage` above.
   */
  sourceBbox?: SourceBbox[];
  /**
   * Source-preview citation metadata — parser/document order for imported
   * entries. Used by import review before falling back to bbox/created order.
   */
  sourceOrder?: number;
  /**
   * Header-only bbox for root components. Root review navigation prefers this
   * while `sourceBbox` remains the broader/legacy positional metadata.
   */
  sourceHeaderBbox?: SourceBbox[];
  /**
   * Structured PDF link annotations attached near this entry's source span.
   */
  sourceLinks?: SourceLinkMetadata[];
  /**
   * Parser-v2 provenance. These fields point to the persisted source artifact
   * and parse run that produced the entry, plus the cited line/token ids.
   */
  sourceArtifactId?: string;
  sourceParseRunId?: string;
  sourceSpanIds?: string[];
  sourceQuality?: "exact" | "partial" | "fuzzy" | "missing";
  /**
   * Preview-match cascade P2.2 — which tier resolved this entry's
   * position. `"fuzzy"` for the free-tier deterministic matcher; future
   * values `"embedding"`, `"llm-citation"`, `"document-ai"` for the
   * premium tiers. `undefined` for legacy rows + entries with no PDF
   * source.
   */
  matchMethod?: string;
  confidenceScore: number;
  createdAt: string;
}

export interface GroupedBankEntries {
  experience: BankEntry[];
  skill: BankEntry[];
  project: BankEntry[];
  education: BankEntry[];
  paragraph: BankEntry[];
  bullet: BankEntry[];
  achievement: BankEntry[];
  certification: BankEntry[];
  hackathon: BankEntry[];
}

export type {
  CreateOpportunityInput,
  Opportunity,
  OpportunityFilters,
  OpportunityJobType,
  OpportunityLevel,
  OpportunityRemoteType,
  OpportunitySource,
  OpportunityStatus,
  OpportunityStatusChangeInput,
  OpportunityType,
  UpdateOpportunityInput,
} from "./schemas";
