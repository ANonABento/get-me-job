"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Upload,
  FileText,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle,
  X,
} from "lucide-react";

const ONBOARDING_KEY = "columbus_onboarding_completed";

const steps = [
  {
    title: "Welcome to Columbus",
    description: "Your AI-powered job application command center. Let's get you set up for success.",
    icon: Rocket,
    gradient: "from-primary to-accent",
  },
  {
    title: "Upload Your Resume",
    description: "Start by uploading your resume. Columbus will automatically extract and organize your professional information.",
    icon: Upload,
    gradient: "from-blue-500 to-cyan-500",
    action: "/upload",
  },
  {
    title: "Build Your Profile",
    description: "Review and enhance your extracted profile. Add missing details to strengthen your applications.",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-500",
    action: "/profile",
  },
  {
    title: "Track Target Jobs",
    description: "Paste job descriptions to get match scores and generate tailored resumes for each application.",
    icon: Briefcase,
    gradient: "from-violet-500 to-purple-500",
    action: "/jobs",
  },
  {
    title: "Ace Your Interviews",
    description: "Practice with AI-powered mock interviews customized to your target roles. Get instant feedback.",
    icon: MessageSquare,
    gradient: "from-orange-500 to-amber-500",
    action: "/interview",
  },
];

export function OnboardingDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if onboarding has been completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleAction = (action?: string) => {
    handleComplete();
    if (action) {
      router.push(action);
    }
  };

  if (!mounted) return null;

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-primary"
                  : i < currentStep
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg mb-6`}
          >
            <step.icon className="h-10 w-10" />
          </div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              {step.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          {step.action ? (
            <>
              <Button
                onClick={() => handleAction(step.action)}
                className="gradient-bg text-white hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="ghost" onClick={handleNext}>
                {currentStep < steps.length - 1 ? "Skip this step" : "Maybe later"}
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} className="gradient-bg text-white hover:opacity-90">
              Let&apos;s Begin
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Features preview for first step */}
        {currentStep === 0 && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
              What Columbus helps you with:
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
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };

  const isCompleted = () => {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem(ONBOARDING_KEY);
  };

  return { reset, isCompleted };
}
