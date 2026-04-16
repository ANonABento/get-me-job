/**
 * @route GET /api/analytics/export
 * @description Export analytics in CSV or JSON format
 * @auth Required
 * @response CSV or JSON file
 */
import { NextRequest } from "next/server";
import { getJobs } from "@/lib/db/jobs";
import { getProfile, getDocuments } from "@/lib/db";
import { getInterviewSessions } from "@/lib/db/interviews";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { calculateSuccessMetrics } from "@/lib/analytics/success-metrics";
import {
  generateAnalyticsCSV,
  generateAnalyticsJSON,
  prepareReportData,
} from "@/lib/analytics/report-generator";
import type { JobDescription } from "@/types";
import { requireAuth, isAuthError } from "@/lib/auth";

type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

function filterJobsByRange(jobs: JobDescription[], range: TimeRange): JobDescription[] {
  if (range === "all") return jobs;

  const now = new Date();
  let cutoff: Date;

  switch (range) {
    case "7d":
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return jobs;
  }

  return jobs.filter((job) => new Date(job.createdAt) >= cutoff);
}

function getRangeLabel(range: TimeRange): string {
  switch (range) {
    case "7d":
      return "Last 7 Days";
    case "30d":
      return "Last 30 Days";
    case "90d":
      return "Last 90 Days";
    case "1y":
      return "Last Year";
    case "all":
      return "All Time";
    default:
      return "All Time";
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const format = (searchParams.get("format") || "csv") as "csv" | "json";
    const range = (searchParams.get("range") || "all") as TimeRange;

    // Fetch all data
    const profile = getProfile(authResult.userId);
    const allJobs = getJobs(authResult.userId);
    const documents = getDocuments(authResult.userId);
    const interviews = getInterviewSessions(undefined, authResult.userId);
    const resumes = getAllGeneratedResumes(authResult.userId);

    // Filter jobs by range
    const jobs = filterJobsByRange(allJobs, range);

    // Calculate profile completeness
    let profileScore = 0;
    if (profile) {
      if (profile.contact?.name) profileScore += 15;
      if (profile.contact?.email) profileScore += 10;
      if (profile.contact?.phone) profileScore += 5;
      if (profile.summary && profile.summary.length > 50) profileScore += 15;
      if (profile.experiences.length > 0) profileScore += 20;
      if (profile.education.length > 0) profileScore += 10;
      if (profile.skills.length >= 3) profileScore += 15;
      if (profile.projects.length > 0) profileScore += 5;
      if (profile.certifications.length > 0) profileScore += 5;
    }

    // Job status breakdown
    const jobsByStatus = jobs.reduce((acc, job) => {
      const status = job.status || "saved";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      overview: {
        profileCompleteness: Math.min(profileScore, 100),
        totalJobs: jobs.length,
        totalDocuments: documents.length,
        totalInterviews: interviews.length,
        totalResumesGenerated: resumes.length,
      },
      jobs: {
        byStatus: jobsByStatus,
        total: jobs.length,
        applied: jobsByStatus["applied"] || 0,
        interviewing: jobsByStatus["interviewing"] || 0,
        offered: jobsByStatus["offered"] || 0,
        rejected: jobsByStatus["rejected"] || 0,
      },
    };

    // Calculate success metrics
    const successMetrics = calculateSuccessMetrics(jobs, resumes);

    // Prepare report data
    const reportData = prepareReportData(
      analytics,
      successMetrics,
      jobs,
      getRangeLabel(range)
    );

    // Generate output based on format
    if (format === "json") {
      const jsonContent = generateAnalyticsJSON(reportData);
      return new Response(jsonContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="taida-analytics-${range}.json"`,
        },
      });
    }

    // Default to CSV
    const csvContent = generateAnalyticsCSV(reportData);
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="taida-analytics-${range}.csv"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return new Response(JSON.stringify({ error: "Failed to export analytics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
