import { Briefcase, FileText, Puzzle, Upload } from "lucide-react";
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

// TODO: Populate with Cover Letter generator, Interview Prep, Salary research,
// Studio templates, and Calendar integration onboarding steps.
export const ADVANCED_ONBOARDING_STEPS: OnboardingStep[] = [];

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
