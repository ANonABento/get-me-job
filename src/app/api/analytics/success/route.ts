import { NextResponse } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { calculateSuccessMetrics } from "@/lib/analytics/success-metrics";

export async function GET() {
  try {
    const jobs = getJobs();
    const resumes = getAllGeneratedResumes();

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
