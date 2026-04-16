/**
 * @route GET /api/analytics/success
 * @description Calculate success metrics
 * @auth Required
 * @response AnalyticsSuccessResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { calculateSuccessMetrics } from "@/lib/analytics/success-metrics";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const jobs = getJobs(authResult.userId);
    const resumes = getAllGeneratedResumes(authResult.userId);

    const metrics = calculateSuccessMetrics(jobs, resumes);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Success metrics error:", error);
    return NextResponse.json(
      { error: "Failed to calculate success metrics" },
      { status: 500 }
    );
  }
}
