import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getTrackingEntries, getTrackedResumeIds } from "@/lib/db/resume-tracking";
import { calculateVersionStats, generateRecommendation } from "@/lib/resume/compare";

// GET /api/resume/stats — conversion rates by resume version
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const entries = getTrackingEntries(authResult.userId);
    const resumeIds = getTrackedResumeIds(authResult.userId);

    const stats = resumeIds.map((id) => calculateVersionStats(id, entries));
    const recommendation = generateRecommendation(entries, resumeIds);

    return NextResponse.json({
      stats,
      recommendation,
      totalTracked: entries.length,
    });
  } catch (error) {
    console.error("Resume stats error:", error);
    return NextResponse.json(
      { error: "Failed to calculate resume stats" },
      { status: 500 }
    );
  }
}
