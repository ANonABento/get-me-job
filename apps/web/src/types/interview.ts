import type {
  InterviewDifficulty,
  SessionQuestionCategory,
} from "@/lib/constants";

// F2.4 consolidation: `InterviewQuestionCategory` and
// `SessionQuestionCategory` were two separately-spelled identical
// unions. Keep the legacy name as an alias so downstream files don't
// churn, but route through the single canonical union.
export type InterviewQuestionCategory = SessionQuestionCategory;

export type InterviewMode = "text" | "voice" | "generic-text";

export interface InterviewQuestion {
  question: string;
  category: InterviewQuestionCategory;
  suggestedAnswer?: string;
  difficulty?: InterviewDifficulty;
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
  category?: InterviewQuestionCategory | null;
  mode: InterviewMode;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers?: PastSessionAnswer[];
  followUps?: FollowUpExchange[];
}
