"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  WelcomeStep,
  UploadStep,
  ReviewStep,
  ConfigureStep,
  DoneStep,
} from "@/components/onboarding/steps";

export const ONBOARDING_STEP_COUNT = 5;

const STEP_TITLES = [
  "Welcome to Taida",
  "Upload Your Resume",
  "Review Your Profile",
  "Configure AI",
  "All Set",
] as const;

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <WelcomeStep />;
    case 1:
      return <UploadStep />;
    case 2:
      return <ReviewStep />;
    case 3:
      return <ConfigureStep />;
    case 4:
      return <DoneStep />;
    default:
      return null;
  }
}

export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Onboarding progress">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current
              ? "w-6 bg-primary"
              : i < current
              ? "w-1.5 bg-primary/50"
              : "w-1.5 bg-muted"
          }`}
          aria-label={
            i === current
              ? `Step ${i + 1} of ${total}, current`
              : i < current
              ? `Step ${i + 1} of ${total}, completed`
              : `Step ${i + 1} of ${total}`
          }
        />
      ))}
    </div>
  );
}
const steps = [
  {
    title: "Welcome to Taida",
    description: "Your AI-powered job application command center. Let's get you set up for success.",
    icon: Rocket,
    gradient: "from-primary to-accent",
  },
  {
    title: "Upload Your Resume",
    description: "Start by uploading your resume. Taida will automatically extract and organize your professional information.",
    icon: Upload,
    gradient: "from-violet-500 to-purple-400",
    action: "/bank",
  },
  {
    title: "Build Your Profile",
    description: "Review and enhance your extracted profile. Add missing details to strengthen your applications.",
    icon: FileText,
    gradient: "from-rose-400 to-orange-400",
    action: "/bank",
  },
  {
    title: "Track Target Jobs",
    description: "Paste job descriptions to get match scores and generate tailored resumes for each application.",
    icon: Briefcase,
    gradient: "from-blue-500 to-indigo-400",
    action: "/jobs",
  },
  {
    title: "Ace Your Interviews",
    description: "Practice with AI-powered mock interviews customized to your target roles. Get instant feedback.",
    icon: MessageSquare,
    gradient: "from-amber-400 to-orange-400",
    action: "/interview",
  },
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const markComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
    setOpen(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEP_COUNT - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      markComplete();
    }
  }, [currentStep, markComplete]);

  if (!mounted) return null;

  const isLastStep = currentStep === ONBOARDING_STEP_COUNT - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        {/* Accessible but hidden title/description for the dialog */}
        <DialogTitle className="sr-only">
          {STEP_TITLES[currentStep]}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Onboarding step {currentStep + 1} of {ONBOARDING_STEP_COUNT}
        </DialogDescription>

        {/* Skip button */}
        <button
          onClick={markComplete}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        <div className="mb-6">
          <ProgressDots total={ONBOARDING_STEP_COUNT} current={currentStep} />
        </div>

        {/* Step content */}
        <StepContent step={currentStep} />

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleNext}
            className="gradient-bg text-white hover:opacity-90"
          >
            {isLastStep ? "Get Started" : "Continue"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          {!isLastStep && (
            <Button variant="ghost" onClick={markComplete}>
              Skip setup
            </Button>
          )}
        </div>

        {/* Features preview for first step */}
        {currentStep === 0 && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
              What Taida helps you with:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "AI resume parsing",
                "Job match scoring",
                "Tailored resumes",
                "Mock interviews",
                "Cover letters",
                "Progress tracking",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-success" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook to reset onboarding (useful for testing)
export function useOnboarding() {
  const reset = () => {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    window.location.reload();
  };

  const isCompleted = () => {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  };

  return { reset, isCompleted };
}
