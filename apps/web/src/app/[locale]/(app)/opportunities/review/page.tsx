"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { OpportunityReviewQueue } from "@/components/opportunities/review-queue";
import { OpportunitiesReviewSkeleton } from "@/components/skeletons/opportunities-review-skeleton";
import { Button } from "@/components/ui/button";
import { AppPage, PageContent } from "@/components/ui/page-layout";
import { PrerequisiteEmptyState } from "@/components/ui/empty-states";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import type { SettingsResponse } from "@/types/api";
import type { Opportunity } from "@/types/opportunity";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
}

export default function OpportunityReviewPage() {
  const a11yT = useA11yTranslations();

  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const showErrorToast = useErrorToast();

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResponse, jobsResponse] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/opportunities"),
      ]);
      const settingsData = await readJsonResponse<SettingsResponse>(
        settingsResponse,
        "Failed to load settings",
      );
      const jobsData = await readJsonResponse<OpportunitiesResponse>(
        jobsResponse,
        "Failed to load opportunities",
      );

      setEnabled(settingsData.opportunityReview?.enabled ?? true);
      setJobs(jobsData.opportunities || []);
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
    job: Opportunity,
    status: Opportunity["status"],
  ) => {
    if (!status) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/opportunities/${job.id}`, {
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

  const applyNow = async (job: Opportunity) => {
    if (job.sourceUrl) {
      window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
    }
    await updateJobStatus(job, "applied");
  };

  if (loading) {
    return <OpportunitiesReviewSkeleton />;
  }

  if (!enabled) {
    return (
      <AppPage>
        <PageContent>
          <PrerequisiteEmptyState
            icon={Settings}
            title={a11yT("reviewQueueDisabled")}
            description="Enable it in Settings to review pending opportunities."
            action={
              <Button asChild>
                <Link href="/settings">Open Settings</Link>
              </Button>
            }
          />
        </PageContent>
      </AppPage>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Link
        href="/opportunities"
        className="fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        aria-label={a11yT("openOpportunities")}
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
