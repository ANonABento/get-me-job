"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { OpportunityReviewQueue } from "@/components/opportunities/review-queue";
import { Button } from "@/components/ui/button";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import type { JobDescription } from "@/types";

interface JobsResponse {
  jobs?: JobDescription[];
}

interface SettingsResponse {
  opportunityReview?: {
    enabled: boolean;
  };
}

export default function OpportunityReviewPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const showErrorToast = useErrorToast();

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResponse, jobsResponse] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/jobs"),
      ]);
      const settingsData = await readJsonResponse<SettingsResponse>(
        settingsResponse,
        "Failed to load settings",
      );
      const jobsData = await readJsonResponse<JobsResponse>(
        jobsResponse,
        "Failed to load opportunities",
      );

      setEnabled(settingsData.opportunityReview?.enabled ?? true);
      setJobs(jobsData.jobs || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load review queue",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  const updateJobStatus = async (
    job: JobDescription,
    status: JobDescription["status"],
  ) => {
    if (!status) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await readJsonResponse<unknown>(response, "Failed to update opportunity");
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status } : item,
        ),
      );
    } catch (error) {
      showErrorToast(error, {
        title: "Could not update opportunity",
        fallbackDescription: "Please try again.",
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const applyNow = async (job: JobDescription) => {
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    }
    await updateJobStatus(job, "applied");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Settings className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold">Review queue disabled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enable it in Settings to review pending opportunities.
        </p>
        <Button asChild className="mt-6">
          <Link href="/settings">Open Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Link
        href="/opportunities"
        className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        aria-label="Back to opportunities"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <OpportunityReviewQueue
        jobs={jobs}
        updating={updating}
        onStatusChange={updateJobStatus}
        onApplyNow={applyNow}
      />
    </div>
  );
}
