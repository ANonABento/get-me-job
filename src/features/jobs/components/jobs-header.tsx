"use client";

import { Button } from "@/components/ui/button";
import { GmailImportModal } from "@/components/google";
import type { ImportedEmailPreview } from "@/features/jobs/client-types";
import { ArrowLeft, FileDown, Mail, Plus, Target } from "lucide-react";
import Link from "next/link";

interface JobsHeaderProps {
  jobsCount: number;
  onAddJob: () => void;
  onCreateFromEmail: (email: ImportedEmailPreview) => void;
  onImportJobs: () => void;
}

export function JobsHeader({
  jobsCount,
  onAddJob,
  onCreateFromEmail,
  onImportJobs,
}: JobsHeaderProps) {
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
          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Target className="h-4 w-4" />
              Job Tracker
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Job Applications
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Track your target jobs, analyze match scores, and generate tailored resumes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border bg-card p-5 text-center">
              <p className="text-3xl font-bold text-primary">{jobsCount}</p>
              <p className="text-sm text-muted-foreground">Jobs Tracked</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onImportJobs}
                size="lg"
                variant="outline"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Import
              </Button>
              <GmailImportModal
                onImport={onCreateFromEmail}
                trigger={
                  <Button size="lg" variant="outline">
                    <Mail className="h-5 w-5 mr-2" />
                    Gmail
                  </Button>
                }
              />
              <Button
                onClick={onAddJob}
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
