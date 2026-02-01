import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { getJob } from "@/lib/db/jobs";
import { analyzeATS } from "@/lib/ats/analyzer";

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please upload your resume first." },
        { status: 404 }
      );
    }

    const job = jobId ? getJob(jobId) : undefined;
    const result = analyzeATS(profile, job || undefined);

    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume for ATS compatibility" },
      { status: 500 }
    );
  }
}
