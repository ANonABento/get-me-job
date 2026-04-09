import type { ReactNode } from "react";
import {
  Brain,
  Lightbulb,
  MessageSquare,
  Target,
} from "lucide-react";
import type { SessionQuestionCategory } from "@/features/interview/schemas";

interface CategoryStyle {
  bg: string;
  text: string;
  icon: ReactNode;
}

const CATEGORY_STYLES: Record<SessionQuestionCategory, CategoryStyle> = {
  behavioral: {
    bg: "bg-info/10",
    text: "text-info",
    icon: <Brain className="h-4 w-4" />,
  },
  technical: {
    bg: "bg-primary/10",
    text: "text-primary",
    icon: <Target className="h-4 w-4" />,
  },
  situational: {
    bg: "bg-warning/10",
    text: "text-warning",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  general: {
    bg: "bg-success/10",
    text: "text-success",
    icon: <MessageSquare className="h-4 w-4" />,
  },
};

export function getInterviewCategoryStyle(category: SessionQuestionCategory) {
  return CATEGORY_STYLES[category];
}
