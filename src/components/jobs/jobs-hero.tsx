"use client";

import dynamic from "next/dynamic";
import { FileDown, LayoutGrid, List, Mail, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import type { JobsViewMode } from "./job-kanban-utils";

const GmailImportModal = dynamic(
  () => import("@/components/google").then((module) => module.GmailImportModal),
  { loading: () => <SkeletonButton className="h-10 w-36" />, ssr: false },
);

interface JobsHeroProps {
  jobsCount: number;
  viewMode: JobsViewMode;
  onImportClick: () => void;
  onAddClick: () => void;
  onViewModeChange: (mode: JobsViewMode) => void;
  onGmailImportSuccess: () => Promise<void>;
}

export function JobsHero({
  jobsCount,
  viewMode,
  onImportClick,
  onAddClick,
  onViewModeChange,
  onGmailImportSuccess,
}: JobsHeroProps) {
  const showErrorToast = useErrorToast();

  return (
    <div className="border-b bg-card/70">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl space-y-3 animate-enter">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Job Tracker
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
                Job Applications
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track your target jobs, analyze match scores, and generate
                tailored resumes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border bg-card p-5 text-center">
              <p className="text-3xl font-bold text-primary">{jobsCount}</p>
              <p className="text-sm text-muted-foreground">Jobs Tracked</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <div
                className="flex rounded-lg border bg-card p-1"
                aria-label="Job view mode"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  aria-pressed={viewMode === "list"}
                  onClick={() => onViewModeChange("list")}
                  className="h-9"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  aria-pressed={viewMode === "kanban"}
                  onClick={() => onViewModeChange("kanban")}
                  className="h-9"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
              </div>
              <Button onClick={onImportClick} size="lg" variant="outline">
                <FileDown className="h-5 w-5 mr-2" />
                Import
              </Button>
              <GmailImportModal
                onImport={async (email) => {
                  const jobData = {
                    title:
                      email.parsed?.role ||
                      email.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim(),
                    company:
                      email.parsed?.company ||
                      email.from.split("@")[1]?.split(".")[0] ||
                      "Unknown",
                    description: email.snippet,
                    url: "",
                  };

                  try {
                    const response = await fetch("/api/jobs", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(jobData),
                    });

                    await readJsonResponse<unknown>(
                      response,
                      "Failed to create job",
                    );

                    await onGmailImportSuccess();
                  } catch (error) {
                    showErrorToast(error, {
                      title: "Could not import Gmail job",
                      fallbackDescription:
                        "Please try importing the email again.",
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
              <Button
                onClick={onAddClick}
                size="lg"
                className="gradient-bg text-white hover:opacity-90"
              >
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
