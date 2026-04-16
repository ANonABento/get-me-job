/**
 * @route GET /api/recommendations
 * @description Generate job recommendations based on user profile and job history
 * @auth Required
 * @response RecommendationsResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { getJobs } from "@/lib/db/jobs";
import { generateRecommendations } from "@/lib/recommendations/job-matcher";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please upload your resume first." },
        { status: 404 }
      );
    }

    const jobs = getJobs(authResult.userId);
    if (jobs.length === 0) {
      return NextResponse.json({
        recommendations: [],
        topSkillGaps: [],
        growthAreas: [],
        insights: ["Add some jobs to get personalized recommendations!"],
      });
    }

    const result = generateRecommendations(profile, jobs, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
