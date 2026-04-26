/**
 * @route GET /api/jobs/[id]
 * @description Fetch a single job by ID
 * @route PUT /api/jobs/[id]
 * @description Full update of a job
 * @route PATCH /api/jobs/[id]
 * @description Partial update of a job (e.g. status change)
 * @route DELETE /api/jobs/[id]
 * @description Delete a job by ID
 * @auth Required
 * @request { title?: string, company?: string, status?: string, ... } (PUT/PATCH)
 * @response JobResponse | JobDeleteResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob, deleteJob } from "@/lib/db/jobs";
import { updateJobSchema } from "@/lib/constants";
import { recordJobStatusChange } from "@/lib/db/analytics";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to get job" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    // Check if job exists and get current status
    const existingJob = getJob(params.id, authResult.userId);
    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const oldStatus = existingJob.status || null;

    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = updateJobSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    updateJob(params.id, data, authResult.userId);
    const job = getJob(params.id, authResult.userId);

    // Record status change if status was updated
    if (data.status && data.status !== oldStatus) {
      try {
        recordJobStatusChange(
          params.id,
          oldStatus,
          data.status,
          undefined,
          authResult.userId
        );
      } catch (statusError) {
        console.error("Failed to record status change:", statusError);
        // Don't fail the request if recording fails
      }
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// PATCH for partial updates (e.g., status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    // Get the job's current status before updating
    const existingJob = getJob(params.id, authResult.userId);
    const oldStatus = existingJob?.status || null;

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const data = await request.json();
    updateJob(params.id, data, authResult.userId);
    const job = getJob(params.id, authResult.userId);

    // Record status change if status was updated
    if (data.status && data.status !== oldStatus) {
      try {
        recordJobStatusChange(
          params.id,
          oldStatus,
          data.status,
          undefined,
          authResult.userId
        );
      } catch (statusError) {
        console.error("Failed to record status change:", statusError);
        // Don't fail the request if recording fails
      }
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Patch job error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    deleteJob(params.id, authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
