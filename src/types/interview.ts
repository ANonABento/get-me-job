import type { InterviewDifficulty } from "@/lib/constants";

export type InterviewQuestionCategory =
  | "behavioral"
  | "technical"
  | "situational"
  | "general";

export type InterviewMode = "text" | "voice";

export interface InterviewQuestion {
  question: string;
  category: InterviewQuestionCategory;
  suggestedAnswer?: string;
  difficulty?: InterviewDifficulty;
}

export interface FollowUpExchange {
  followUpQuestion: string;
  answer: string;
  feedback: string;
}

export interface CurrentFollowUp {
  question: string;
  reason: string;
  suggestedFocus: string[];
}

export interface InterviewSession {
  id?: string;
  jobId: string;
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
  jobId: string;
  mode: InterviewMode;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers?: PastSessionAnswer[];
}
