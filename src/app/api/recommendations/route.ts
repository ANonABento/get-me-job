import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { getJobs } from "@/lib/db/jobs";
import { generateRecommendations } from "@/lib/recommendations/job-matcher";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please upload your resume first." },
        { status: 404 }
      );
    }

    const jobs = getJobs();
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
