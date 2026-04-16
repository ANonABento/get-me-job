/**
 * @route POST /api/ats/scan
 * @route GET /api/ats/scan
 * @description POST: Generate ATS scan report. GET: Fetch scan history.
 * @auth Required
 * @request { jobId: string } (POST)
 * @response ATSScanResponse / ATSScanHistoryResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { getJob } from "@/lib/db/jobs";
import { generateFixSuggestions } from "@/lib/ats/fix-suggestions";
import { saveScanResult, getScanHistory } from "@/lib/db/ats-scans";
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

    const { generateScanReport } = await import("@/lib/ats/analyzer");
    const job = jobId ? getJob(jobId, authResult.userId) : undefined;
    const report = generateScanReport(profile, job || undefined);
    const fixes = generateFixSuggestions(profile, report.issues, report.keywords);

    const scanId = saveScanResult(authResult.userId, report, fixes, jobId);

    return NextResponse.json({
      id: scanId,
      ...report,
      fixes,
    });
  } catch (error) {
    console.error("ATS scan error:", error);
    return NextResponse.json(
      { error: "Failed to perform ATS scan" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const history = getScanHistory(authResult.userId, limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("ATS scan history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan history" },
      { status: 500 }
    );
  }
}
