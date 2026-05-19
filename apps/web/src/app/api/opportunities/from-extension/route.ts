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
  parseExtensionOpportunitiesPerRow,
  type PerRowParseFailure,
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

    // Per-row validation — one bad row no longer kills its chunk-mates.
    // The popup surfaces the `failed` array to the user; the route still
    // returns 201 even when partial because that's the truth (some rows
    // imported, others didn't).
    const parseResult = parseExtensionOpportunitiesPerRow(rawData);

    if (parseResult.valid.length === 0 && parseResult.invalid.length === 0) {
      return NextResponse.json(
        {
          error:
            "Empty payload — expected `jobs` or `opportunities` array (or single opportunity).",
        },
        { status: 400 },
      );
    }

    const importedJobs: JobDescription[] = [];
    const dedupedIds: string[] = [];
    const failed: PerRowParseFailure[] = [...parseResult.invalid];

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

    for (const opportunity of parseResult.valid) {
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

      // Bucket E auto-import: when the user has enabled the bypass AND
      // the incoming opportunity status is the default "pending" (i.e.
      // the scraper didn't explicitly mark it applied), stamp the
      // user's chosen default. "saved" lands directly in the kanban,
      // bypassing the review queue. "applied" stays as-is so the user
      // can still mark a scrape "applied" through the connect-page or
      // legacy paths.
      const builtJob = buildJobFromExtension(opportunity);
      if (preferences?.autoImportEnabled && builtJob.status === "pending") {
        builtJob.status = preferences.defaultImportStatus;
      }
      const createdJob = createJob(builtJob, authResult.userId);

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

    if (importedJobs.length > 0 || failed.length > 0) {
      const appliedCount = parseResult.valid.filter(
        (opportunity) => opportunity.status === "applied",
      ).length;

      createNotification(
        {
          type: "info",
          title: notificationTitle(
            importedJobs.length,
            appliedCount,
            failed.length,
          ),
          message: notificationMessage(
            importedJobs,
            pendingCount,
            appliedCount,
            failed.length,
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
        // Per-row validation failures — the popup uses this to surface a
        // "Z failed" line + expandable list. Empty when every row parsed.
        failed,
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
  failedCount: number,
): string {
  if (importedCount === 0 && failedCount > 0) {
    return failedCount === 1
      ? "Couldn't import 1 posting"
      : `Couldn't import ${failedCount} postings`;
  }

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
  failedCount: number,
): string {
  // Build the base success/applied sentence first.
  let base: string;
  if (importedJobs.length === 0) {
    base = "";
  } else if (appliedCount > 0) {
    const firstJob = importedJobs[0];
    base =
      importedJobs.length === 1
        ? `Tracked application: ${firstJob.title} at ${firstJob.company}.`
        : `${appliedCount} submitted applications were added to Opportunities.`;
  } else if (importedJobs.length === 1) {
    base = `${importedJobs[0].title} at ${importedJobs[0].company} was added to Pending.`;
  } else {
    base = `${pendingCount} pending opportunities are ready to review.`;
  }

  if (failedCount > 0) {
    const tail =
      failedCount === 1
        ? "1 posting was skipped — open the extension popup for details."
        : `${failedCount} postings were skipped — open the extension popup for details.`;
    return base ? `${base} ${tail}` : tail;
  }

  return base;
}
