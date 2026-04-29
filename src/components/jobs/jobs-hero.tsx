"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, FileDown, Mail, Plus, Rows3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";

const GmailImportModal = dynamic(
  () => import("@/components/google").then((module) => module.GmailImportModal),
  { loading: () => <SkeletonButton className="h-10 w-36" />, ssr: false }
);

interface JobsHeroProps {
  jobsCount: number;
  onImportClick: () => void;
  onAddClick: () => void;
  onGmailImportSuccess: () => Promise<void>;
}

export function JobsHero({ jobsCount, onImportClick, onAddClick, onGmailImportSuccess }: JobsHeroProps) {
  const showErrorToast = useErrorToast();

  return (
    <div className="hero-gradient border-b">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Target className="h-4 w-4" />
              Job Tracker
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Job Applications</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Track your target jobs, analyze match scores, and generate tailored resumes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border bg-card p-5 text-center">
              <p className="text-3xl font-bold text-primary">{jobsCount}</p>
              <p className="text-sm text-muted-foreground">Jobs Tracked</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg" variant="outline">
                <Link href="/opportunities/review">
                  <Rows3 className="h-5 w-5 mr-2" />
                  Review
                </Link>
              </Button>
              <Button onClick={onImportClick} size="lg" variant="outline">
                <FileDown className="h-5 w-5 mr-2" />
                Import
              </Button>
              <GmailImportModal
                onImport={async (email) => {
                  const jobData = {
                    title: email.parsed?.role || email.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim(),
                    company: email.parsed?.company || email.from.split("@")[1]?.split(".")[0] || "Unknown",
                    description: email.snippet,
                    url: "",
                    status: "pending",
                  };

                  try {
                    const response = await fetch("/api/jobs", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(jobData),
                    });

                    await readJsonResponse<unknown>(response, "Failed to create job");

                    await onGmailImportSuccess();
                  } catch (error) {
                    showErrorToast(error, {
                      title: "Could not import Gmail job",
                      fallbackDescription: "Please try importing the email again.",
                    });
                  }
                }}
                trigger={
                  <Button size="lg" variant="outline">
                    <Mail className="h-5 w-5 mr-2" />
                    Gmail
                  </Button>
                }
              />
              <Button onClick={onAddClick} size="lg" className="gradient-bg text-white hover:opacity-90">
                <Plus className="h-5 w-5 mr-2" />
                Add Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
