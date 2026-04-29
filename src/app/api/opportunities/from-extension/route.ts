/**
 * @route POST /api/opportunities/from-extension
 * @description Import scraped opportunities from the Columbus browser extension as pending jobs.
 * @auth Extension token via X-Extension-Token
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { createJob, countJobsByStatus } from "@/lib/db/jobs";
import { createNotification } from "@/lib/db/notifications";
import {
  buildPendingJobFromExtension,
  parseExtensionOpportunityPayload,
} from "@/lib/extension-opportunities";

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

    const importedJobs = parseResult.opportunities.map((opportunity) =>
      createJob(buildPendingJobFromExtension(opportunity), authResult.userId),
    );
    const pendingCount = countJobsByStatus("pending", authResult.userId);

    if (importedJobs.length > 0) {
      createNotification(
        {
          type: "info",
          title:
            importedJobs.length === 1
              ? "New opportunity waiting for review"
              : `${importedJobs.length} new opportunities waiting for review`,
          message:
            importedJobs.length === 1
              ? `${importedJobs[0].title} at ${importedJobs[0].company} was added to Pending.`
              : `${pendingCount} pending opportunities are ready to review.`,
          link: "/opportunities",
        },
        authResult.userId,
      );
    }

    return NextResponse.json(
      {
        imported: importedJobs.length,
        opportunityIds: importedJobs.map((job) => job.id),
        pendingCount,
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
