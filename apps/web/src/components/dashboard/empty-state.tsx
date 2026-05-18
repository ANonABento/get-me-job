"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Sparkles,
  Upload,
} from "lucide-react";
import { OnboardingEmptyState } from "@/components/ui/empty-states";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  variant: "no-resume" | "no-resumes-built";
}

export function EmptyState({ variant }: EmptyStateProps) {
  if (variant === "no-resume") {
    return (
      <OnboardingEmptyState
        title="Get started: upload your resume"
        description="Upload your existing resume and we'll extract reusable proof points automatically. Then Studio can tailor them for every application."
        illustrationName="dashboard-fresh"
        icon={Upload}
        steps={[
          {
            icon: Upload,
            label: "Add source",
            description: "Upload a resume or paste your strongest bullets.",
          },
          {
            icon: Sparkles,
            label: "Extract components",
            description: "Slothing turns raw history into reusable cards.",
          },
          {
            icon: Briefcase,
            label: "Tailor roles",
            description: "Use the library to build focused applications.",
          },
        ]}
        primaryAction={
          <Button asChild>
            <Link href="/components">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <OnboardingEmptyState
      title="Build your first resume"
      description="Add a job description and we'll assemble a tailored resume that highlights your most relevant experience."
      illustrationName="studio-zero"
      icon={FileText}
      steps={[
        {
          icon: Briefcase,
          label: "Choose a role",
          description: "Start from a saved opportunity or paste a posting.",
        },
        {
          icon: Sparkles,
          label: "Match proof",
          description: "Studio pulls the components that fit best.",
        },
        {
          icon: FileText,
          label: "Export",
          description: "Review the draft and send the finished document.",
        },
      ]}
      primaryAction={
        <Button asChild>
          <Link href="/opportunities">
            <FileText className="mr-2 h-4 w-4" />
            Build your first resume
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      }
    />
  );
}
