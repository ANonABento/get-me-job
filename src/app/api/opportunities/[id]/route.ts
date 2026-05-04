import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getJob, updateJob, deleteJob } from "@/lib/db/jobs";
import { updateJobSchema } from "@/lib/constants";
import { recordJobStatusChange } from "@/lib/db/analytics";
import { jobToOpportunity } from "@/lib/opportunities";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ job, opportunity: jobToOpportunity(job) });
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunity" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const existingJob = getJob(params.id, authResult.userId);
    if (!existingJob) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    const oldStatus = existingJob.status || null;
    const rawData = await request.json();
    const parseResult = updateJobSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 },
      );
    }

    const data = parseResult.data;
    if (!Object.prototype.hasOwnProperty.call(rawData, "status")) {
      delete data.status;
    }
    if (data.status === "applied" && !data.appliedAt && !existingJob.appliedAt) {
      data.appliedAt = new Date().toISOString();
    }

    updateJob(params.id, data, authResult.userId);
    const job = getJob(params.id, authResult.userId);

    if (data.status && data.status !== oldStatus) {
      try {
        recordJobStatusChange(
          params.id,
          oldStatus,
          data.status,
          undefined,
          authResult.userId,
        );
      } catch (statusError) {
        console.error("Failed to record status change:", statusError);
      }
    }

    return NextResponse.json({
      job,
      opportunity: job ? jobToOpportunity(job) : null,
    });
  } catch (error) {
    console.error("Update opportunity error:", error);
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const existing = getJob(params.id, authResult.userId);
    if (!existing) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    deleteJob(params.id, authResult.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    return NextResponse.json({ error: "Failed to delete opportunity" }, { status: 500 });
  }
}
