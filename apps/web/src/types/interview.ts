import type {
  InterviewDifficulty,
  SessionQuestionCategory,
} from "@/lib/constants";
import type { BankCategory } from "@/types";

// F2.4 consolidation: `InterviewQuestionCategory` and
// `SessionQuestionCategory` were two separately-spelled identical
// unions. Keep the legacy name as an alias so downstream files don't
// churn, but route through the single canonical union.
export type InterviewQuestionCategory = SessionQuestionCategory;

export type InterviewMode = "text" | "voice" | "generic-text";

export type InterviewContextMode =
  | "role"
  | "project-defense"
  | "skill-grill"
  | "experience-deep-dive"
  | "resume-claim"
  | "document-based"
  | "mixed-context";

export type InterviewContextSourceType =
  | "opportunity"
  | "document"
  | "bank"
  | "profile-experience"
  | "profile-project"
  | "profile-skill"
  | "company-research"
  | "custom-text"
  | "custom-url";

export interface InterviewContextSourceRef {
  type: InterviewContextSourceType;
  id?: string;
  category?: BankCategory;
  label?: string;
  url?: string;
  text?: string;
}

export interface InterviewContextPackSummary {
  detectedStack: string[];
  skills: string[];
  claims: string[];
  weakSpots: string[];
  questionAngles: string[];
  warnings: string[];
  sourceLabels: string[];
}

export interface InterviewContextPack {
  id: string;
  title: string;
  mode: InterviewContextMode;
  status: "ready" | "partial" | "failed";
  sources: InterviewContextSourceRef[];
  summary: InterviewContextPackSummary;
  rawContextExcerpt?: string;
  deepDiveEnabled: boolean;
  promotionState: "none" | "prompted" | "saved_to_bank";
  createdAt: string;
  updatedAt?: string;
}

export interface InterviewQuestion {
  question: string;
  category: InterviewQuestionCategory;
  suggestedAnswer?: string;
  difficulty?: InterviewDifficulty;
  sourceRefs?: InterviewContextSourceRef[];
  interviewMode?: InterviewContextMode;
  probeType?: string;
}

export interface FollowUpExchange {
  id?: string;
  questionIndex?: number;
  followUpQuestion: string;
  answer: string;
  feedback: string;
  createdAt?: string;
}

export interface CurrentFollowUp {
  question: string;
  reason: string;
  suggestedFocus: string[];
}

export interface InterviewSession {
  id?: string;
  jobId: string | null;
  contextPackId?: string | null;
  contextPackTitle?: string | null;
  contextPackMode?: InterviewContextMode | null;
  contextPackPromotable?: boolean;
  category?: InterviewQuestionCategory | null;
  questionCount?: number;
  timer?: {
    enabled: boolean;
    remainingMs: number;
    extended: boolean;
  } | null;
  skipped?: boolean[];
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: string[];
  feedback: string[];
  followUps: FollowUpExchange[][];
  mode: InterviewMode;
}

export interface PastSessionAnswer {
  id: string;
  questionIndex: number;
  answer: string;
  feedback?: string;
}

export interface PastSession {
  id: string;
  jobId: string | null;
  contextPackId?: string | null;
  contextPackTitle?: string | null;
  contextPackMode?: InterviewContextMode | null;
  contextPackPromotable?: boolean;
  category?: InterviewQuestionCategory | null;
  mode: InterviewMode;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers?: PastSessionAnswer[];
  followUps?: FollowUpExchange[];
}
