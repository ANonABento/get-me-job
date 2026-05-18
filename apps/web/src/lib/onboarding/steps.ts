import {
  Briefcase,
  CalendarDays,
  DollarSign,
  FileText,
  LayoutTemplate,
  PenLine,
  Puzzle,
  Upload,
} from "lucide-react";
import { getPipelineTotal } from "@/lib/opportunities/pipeline";
import type { OnboardingStats, OnboardingStep } from "./types";

export const BASIC_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "upload-resume",
    icon: Upload,
    href: "/components",
    isComplete: (stats) => stats.documentsCount > 0,
    tier: "basic",
  },
  {
    id: "install-extension",
    icon: Puzzle,
    href: "/extension",
    isComplete: (stats) => stats.extensionInstalled === true,
    tier: "basic",
  },
  {
    id: "add-opportunity",
    icon: Briefcase,
    href: "/opportunities",
    isComplete: (stats) => getPipelineTotal(stats.jobsByStatus) > 0,
    tier: "basic",
  },
  {
    id: "create-tailored-doc",
    icon: FileText,
    href: "/studio",
    isComplete: (stats) => stats.resumesGenerated > 0,
    tier: "basic",
  },
];

export const ADVANCED_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "draft-cover-letter",
    icon: PenLine,
    href: "/studio?mode=cover-letter",
    title: "Draft a cover letter",
    description:
      "Open Studio's cover-letter mode and generate or refine a letter.",
    actionLabel: "Open Studio",
    isComplete: (stats) => stats.resumesGenerated > 0,
    tier: "advanced",
  },
  {
    id: "practice-interview",
    icon: CalendarDays,
    href: "/interview",
    title: "Practice an interview",
    description: "Use interview prep against a tracked opportunity.",
    actionLabel: "Practice",
    isComplete: (stats) => getPipelineTotal(stats.jobsByStatus) > 0,
    tier: "advanced",
  },
  {
    id: "research-salary",
    icon: DollarSign,
    href: "/toolkit?tab=salary",
    title: "Research salary",
    description: "Use the salary toolkit before you negotiate or apply.",
    actionLabel: "Open salary",
    isComplete: (stats) => getPipelineTotal(stats.jobsByStatus) > 0,
    tier: "advanced",
  },
  {
    id: "choose-studio-template",
    icon: LayoutTemplate,
    href: "/studio",
    title: "Choose a Studio template",
    description: "Preview resume and cover-letter templates before export.",
    actionLabel: "Open Studio",
    isComplete: (stats) => stats.resumesGenerated > 0,
    tier: "advanced",
  },
  {
    id: "review-calendar",
    icon: CalendarDays,
    href: "/calendar",
    title: "Review your calendar",
    description: "Keep interviews, reminders, and deadlines visible.",
    actionLabel: "Open calendar",
    isComplete: (stats) => getPipelineTotal(stats.jobsByStatus) > 0,
    tier: "advanced",
  },
];

export function getActiveStepIndex(
  steps: OnboardingStep[],
  stats: OnboardingStats,
): number {
  return steps.findIndex((step) => !step.isComplete(stats));
}

export function countCompletedSteps(
  steps: OnboardingStep[],
  stats: OnboardingStats,
): number {
  return steps.filter((step) => step.isComplete(stats)).length;
}
