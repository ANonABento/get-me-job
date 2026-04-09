import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordJobStatusChange } from "@/lib/db/analytics";
import { deleteJob, getJob, updateJob } from "@/lib/db/jobs";
import { updateJobSchema } from "@/features/jobs/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    const job = getJob(params.id);
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if job exists and get current status
    const existingJob = getJob(params.id);
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
    updateJob(params.id, data);
    const job = getJob(params.id);

    // Record status change if status was updated
    if (data.status && data.status !== oldStatus) {
      try {
        recordJobStatusChange(params.id, oldStatus, data.status);
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the job's current status before updating
    const existingJob = getJob(params.id);
    const oldStatus = existingJob?.status || null;

    const data = await request.json();
    // TODO: Switch to Drizzle queries with userId once Neon is configured
    updateJob(params.id, data);
    const job = getJob(params.id);

    // Record status change if status was updated
    if (data.status && data.status !== oldStatus) {
      try {
        recordJobStatusChange(params.id, oldStatus, data.status);
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    deleteJob(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
