/**
 * @route GET /api/analytics/trends
 * @description Time-series trends data
 * @auth Required
 * @response AnalyticsTrendsResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import {
  generateTimeSeriesData,
  calculateTrendMetrics,
  generateActivityTimeline,
  type TimeRange,
} from "@/lib/analytics/time-series";
import {
  getAnalyticsSnapshots,
  getWeekOverWeekChange,
  getAverageTimeInStatus,
} from "@/lib/db/analytics";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as TimeRange) || "30d";

    const jobs = getJobs(authResult.userId);

    const timeSeries = generateTimeSeriesData(jobs, range);
    const trends = calculateTrendMetrics(jobs, range);
    const timeline = generateActivityTimeline(jobs, 20);

    // Get historical snapshots
    const today = new Date();
    const rangeMap: Record<string, number> = {
      "7d": 7,
      "14d": 14,
      "30d": 30,
      "90d": 90,
    };
    const daysBack = rangeMap[range] || 30;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysBack);

    const snapshots = getAnalyticsSnapshots(
      startDate.toISOString().split("T")[0],
      today.toISOString().split("T")[0],
      authResult.userId
    );

    // Get week-over-week changes
    const weekOverWeek = getWeekOverWeekChange(authResult.userId);

    // Get average time in status
    const avgTimeInStatus = getAverageTimeInStatus(authResult.userId);

    return NextResponse.json({
      range,
      timeSeries,
      trends,
      timeline,
      snapshots,
      weekOverWeek,
      avgTimeInStatus,
    });
  } catch (error) {
    console.error("Trends analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get trend analytics" },
      { status: 500 }
    );
  }
}
