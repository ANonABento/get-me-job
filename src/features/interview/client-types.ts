import type { SessionMode } from "@/features/interview/schemas";
import type { InterviewQuestion } from "@/features/interview/types";

export interface FollowUpExchange {
  followUpQuestion: string;
  answer: string;
  feedback: string;
}

export interface FollowUpPrompt {
  question: string;
  reason: string;
  suggestedFocus: string[];
}

export interface InterviewPracticeSession {
  id?: string;
  jobId: string;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: string[];
  feedback: string[];
  followUps: FollowUpExchange[][];
  mode: SessionMode;
}

export interface PastInterviewSession {
  id: string;
  jobId: string;
  mode: SessionMode;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers?: Array<{
    id: string;
    questionIndex: number;
    answer: string;
    feedback?: string;
  }>;
}
