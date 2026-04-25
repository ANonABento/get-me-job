import type { ReactNode } from "react";
import { Brain, Target, Lightbulb, MessageSquare } from "lucide-react";
import type { InterviewQuestionCategory } from "@/types/interview";

interface CategoryStyle {
  bg: string;
  text: string;
  icon: ReactNode;
}

export const categoryColors: Record<InterviewQuestionCategory, CategoryStyle> = {
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

interface CategoryBadgeProps {
  category: InterviewQuestionCategory;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const style = categoryColors[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text} ${className}`}
    >
      {style.icon}
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
