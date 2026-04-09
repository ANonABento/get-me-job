import type { InterviewDifficulty, SessionQuestionCategory } from "@/features/interview/schemas";

export interface InterviewQuestion {
  question: string;
  category: SessionQuestionCategory;
  suggestedAnswer?: string;
  difficulty?: InterviewDifficulty;
}

export interface InterviewJobSummary {
  title: string;
  company: string;
  keywords: string[];
  description?: string;
}
