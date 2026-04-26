/**
 * @route GET /api/resume/track
 * @route POST /api/resume/track
 * @route PATCH /api/resume/track
 * @description GET: List tracking entries. POST: Log a resume sent to a company. PATCH: Update tracking outcome.
 * @auth Required
 * @request { resumeId: string, jobId: string, company: string } (POST)
 * @request { trackingId: string, outcome: string } (PATCH)
 * @response ResumeTrackResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import type { ZodError } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { trackResumeSentSchema, updateTrackingOutcomeSchema } from "@/lib/constants";

function validationErrorResponse(error: ZodError) {
  const errors = error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
}
import {
  trackResumeSent,
  updateTrackingOutcome,
  getTrackingEntries,
} from "@/lib/db/resume-tracking";
import { getGeneratedResume } from "@/lib/db/resumes";
import { getJob } from "@/lib/db/jobs";

// POST /api/resume/track — log which version sent to which job
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();
    const parseResult = trackResumeSentSchema.safeParse(rawData);

    if (!parseResult.success) return validationErrorResponse(parseResult.error);

    const { resumeId, jobId, notes } = parseResult.data;

    // Verify resume exists
    const resume = getGeneratedResume(resumeId, authResult.userId);
    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const job = getJob(jobId, authResult.userId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const entry = trackResumeSent(resumeId, jobId, authResult.userId, notes);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Resume tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track resume" },
      { status: 500 }
    );
  }
}

// PATCH /api/resume/track — update outcome for a tracking entry
export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();
    const parseResult = updateTrackingOutcomeSchema.safeParse(rawData);

    if (!parseResult.success) return validationErrorResponse(parseResult.error);

    const { id, outcome } = parseResult.data;
    const updated = updateTrackingOutcome(id, outcome, authResult.userId);

    if (!updated) {
      return NextResponse.json(
        { error: "Tracking entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id, outcome });
  } catch (error) {
    console.error("Tracking update error:", error);
    return NextResponse.json(
      { error: "Failed to update tracking" },
      { status: 500 }
    );
  }
}

// GET /api/resume/track — list all tracking entries
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const entries = getTrackingEntries(authResult.userId);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Tracking list error:", error);
    return NextResponse.json(
      { error: "Failed to list tracking entries" },
      { status: 500 }
    );
  }
}
