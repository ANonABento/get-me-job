import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import {
  generateTimeSeriesData,
  calculateTrendMetrics,
  generateActivityTimeline,
  type TimeRange,
} from "@/lib/analytics/time-series";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as TimeRange) || "30d";

    const jobs = getJobs();

    const timeSeries = generateTimeSeriesData(jobs, range);
    const trends = calculateTrendMetrics(jobs, range);
    const timeline = generateActivityTimeline(jobs, 20);

    return NextResponse.json({
      range,
      timeSeries,
      trends,
      timeline,
    });
  } catch (error) {
    console.error("Trends analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get trend analytics" },
      { status: 500 }
    );
  }
}
