/**
 * @route GET /api/insights
 * @description Generate AI-powered insights on skill gaps, market trends, and application strategy
 * @auth Required
 * @response InsightsResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getProfile } from "@/lib/db";
import { getJobs } from "@/lib/db/jobs";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { getAnalyticsSnapshots } from "@/lib/db/analytics";
import { getInsights, clearInsightCache } from "@/lib/resume/insights";

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const url = new URL(request.url);
    const refresh = url.searchParams.get("refresh") === "true";

    if (refresh) {
      clearInsightCache(authResult.userId);
    }

    const profile = getProfile(authResult.userId);
    const jobs = getJobs(authResult.userId);
    const resumes = getAllGeneratedResumes(authResult.userId);

    // Get snapshots from last 30 days for trend analysis
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const snapshots = getAnalyticsSnapshots(
      thirtyDaysAgo.toISOString().split("T")[0],
      now.toISOString().split("T")[0],
      authResult.userId
    );

    const generatedResumes = resumes.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      matchScore: r.matchScore ?? null,
      createdAt: r.createdAt,
    }));

    const insights = getInsights(
      { profile, jobs, snapshots, generatedResumes },
      authResult.userId
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
