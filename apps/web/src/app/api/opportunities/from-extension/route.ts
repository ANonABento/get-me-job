/**
 * @route POST /api/opportunities/from-extension
 * @description Import scraped opportunities from the Slothing browser extension as pending jobs.
 * @auth Extension token via X-Extension-Token
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import {
  createJob,
  countJobsByStatus,
  getJobByUrl,
  getJobBySource,
  updateJob,
  updateJobStatus,
} from "@/lib/db/jobs";
import { createNotification } from "@/lib/db/notifications";
import {
  buildJobFromExtension,
  parseExtensionOpportunityPayload,
} from "@/lib/extension-opportunities";
import { getViewPreferences } from "@/lib/db/opportunity-view-preferences";
import { applyAutoTagRules } from "@/lib/opportunities/auto-tag";
import type { JobDescription } from "@/types";

export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    let rawData: unknown;
    try {
      rawData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const parseResult = parseExtensionOpportunityPayload(rawData);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: parseResult.errors },
        { status: 400 },
      );
    }

    const importedJobs: JobDescription[] = [];
    const dedupedIds: string[] = [];

    // Bucket E — auto-tag rules. Loaded once per request so a 50-job
    // batch doesn't do 50 SELECTs against preferences.
    const preferences = (() => {
      try {
        return getViewPreferences(authResult.userId);
      } catch {
        return null;
      }
    })();
    const autoTagRules = preferences?.autoTagRules ?? [];

    for (const opportunity of parseResult.opportunities) {
      // Dedupe by (source, sourceJobId) before URL — the natural key from
      // the platform (e.g. WaterlooWorks "471268"). URL is fallback because
      // some sources (older imports, non-WW) lack a posting ID.
      const existingBySource =
        opportunity.source && opportunity.sourceJobId
          ? getJobBySource(
              opportunity.source,
              opportunity.sourceJobId,
              authResult.userId,
            )
          : null;
      if (existingBySource) {
        if (opportunity.status === "applied") {
          const updatedJob = updateJobStatus(
            existingBySource.id,
            "applied",
            existingBySource.appliedAt || opportunity.appliedAt,
            authResult.userId,
          );
          importedJobs.push(updatedJob || existingBySource);
        } else {
          importedJobs.push(existingBySource);
        }
        dedupedIds.push(existingBySource.id);
        continue;
      }

      if (opportunity.status === "applied" && opportunity.url) {
        const existingJob = getJobByUrl(opportunity.url, authResult.userId);
        if (existingJob) {
          const updatedJob = updateJobStatus(
            existingJob.id,
            "applied",
            existingJob.appliedAt || opportunity.appliedAt,
            authResult.userId,
          );
          importedJobs.push(updatedJob || existingJob);
          dedupedIds.push(existingJob.id);
          continue;
        }
      }

      const createdJob = createJob(
        buildJobFromExtension(opportunity),
        authResult.userId,
      );

      // Bucket E auto-tag: apply rule-derived tags to freshly-created
      // jobs only. Skipped for jobs that hit the dedupe paths above
      // (we don't want to silently rewrite a user's existing tags on
      // re-import). Best-effort — a failure here shouldn't reject the
      // whole batch.
      if (autoTagRules.length > 0) {
        try {
          const ruleTags = applyAutoTagRules(
            {
              source: opportunity.source,
              title: opportunity.title,
              workTerm: opportunity.workTerm,
              level: opportunity.level,
            },
            autoTagRules,
          );
          if (ruleTags.length > 0) {
            const mergedKeywords = Array.from(
              new Set([...(createdJob.keywords ?? []), ...ruleTags]),
            );
            updateJob(
              createdJob.id,
              { keywords: mergedKeywords },
              authResult.userId,
            );
            createdJob.keywords = mergedKeywords;
          }
        } catch (error) {
          console.error("[auto-tag] rule application failed:", error);
        }
      }

      importedJobs.push(createdJob);
    }

    const pendingCount = countJobsByStatus("pending", authResult.userId);

    if (importedJobs.length > 0) {
      const appliedCount = parseResult.opportunities.filter(
        (opportunity) => opportunity.status === "applied",
      ).length;

      createNotification(
        {
          type: "info",
          title: notificationTitle(importedJobs.length, appliedCount),
          message: notificationMessage(
            importedJobs,
            pendingCount,
            appliedCount,
          ),
          link: appliedCount > 0 ? "/opportunities" : "/opportunities/review",
        },
        authResult.userId,
      );
    }

    return NextResponse.json(
      {
        imported: importedJobs.length,
        opportunityIds: importedJobs.map((job) => job.id),
        pendingCount,
        dedupedIds,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Extension opportunity import error:", error);
    return NextResponse.json(
      { error: "Failed to import opportunities" },
      { status: 500 },
    );
  }
}

function notificationTitle(
  importedCount: number,
  appliedCount: number,
): string {
  if (appliedCount > 0) {
    return importedCount === 1
      ? "Tracked application"
      : `${appliedCount} applications tracked`;
  }

  return importedCount === 1
    ? "New opportunity waiting for review"
    : `${importedCount} new opportunities waiting for review`;
}

function notificationMessage(
  importedJobs: Array<{ title: string; company: string }>,
  pendingCount: number,
  appliedCount: number,
): string {
  if (appliedCount > 0) {
    const firstJob = importedJobs[0];
    return importedJobs.length === 1
      ? `Tracked application: ${firstJob.title} at ${firstJob.company}.`
      : `${appliedCount} submitted applications were added to Opportunities.`;
  }

  return importedJobs.length === 1
    ? `${importedJobs[0].title} at ${importedJobs[0].company} was added to Pending.`
    : `${pendingCount} pending opportunities are ready to review.`;
}
