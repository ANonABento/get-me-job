import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { getJob } from "@/lib/db/jobs";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { jobId } = await request.json();

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return NextResponse.json(
        { error: "No profile found. Please upload your resume first." },
        { status: 404 }
      );
    }

    const { analyzeATS } = await import("@/lib/ats/analyzer");
    const job = jobId ? getJob(jobId, authResult.userId) : undefined;
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
