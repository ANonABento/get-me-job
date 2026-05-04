"use client";

import dynamic from "next/dynamic";
import { FileDown, LayoutGrid, List, Mail, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, type PageWidth } from "@/components/ui/page-layout";
import { SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import {
  THEME_PRIMARY_GRADIENT_BUTTON_CLASSES,
  THEME_SURFACE_CLASSES,
} from "@/lib/theme/component-classes";
import { pluralize } from "@/lib/text/pluralize";
import { cn } from "@/lib/utils";
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
  width?: PageWidth;
}

export function JobsHero({
  jobsCount,
  viewMode,
  onImportClick,
  onAddClick,
  onViewModeChange,
  onGmailImportSuccess,
  width = "wide",
}: JobsHeroProps) {
  const showErrorToast = useErrorToast();

  return (
    <PageHeader
      width={width}
      icon={Target}
      eyebrow="Job Tracker"
      title="Job Applications"
      description="Track your target jobs, analyze match scores, and generate tailored resumes."
      actions={
        <>
          <div className={cn(THEME_SURFACE_CLASSES, "px-4 py-3 text-center")}>
            <p className="text-2xl font-bold text-primary">{jobsCount}</p>
            <p className="text-xs text-muted-foreground">
              {pluralize(jobsCount, "Job")} Tracked
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <div
              className={cn(THEME_SURFACE_CLASSES, "flex p-1")}
              aria-label="Job view mode"
            >
              <Button
                type="button"
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                aria-pressed={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                className="h-11"
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
                className="h-11"
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
              className={THEME_PRIMARY_GRADIENT_BUTTON_CLASSES}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Job
            </Button>
          </div>
        </>
      }
    />
  );
}
