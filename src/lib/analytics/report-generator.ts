import type { JobDescription } from "@/types";
import type { SuccessMetrics, FunnelStage } from "./success-metrics";

export interface AnalyticsReportData {
  generatedAt: string;
  range: string;
  overview: {
    profileCompleteness: number;
    totalJobs: number;
    totalInterviews: number;
    totalResumesGenerated: number;
  };
  jobs: {
    total: number;
    byStatus: Record<string, number>;
    applied: number;
    interviewing: number;
    offered: number;
    rejected: number;
  };
  funnel: FunnelStage[];
  timeToInterview: {
    averageDays: number;
    minDays: number;
    maxDays: number;
  };
  offerRate: number;
  insights: string[];
  jobList: Array<{
    title: string;
    company: string;
    status: string;
    appliedAt: string | null;
    createdAt: string;
  }>;
}

function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateAnalyticsCSV(data: AnalyticsReportData): string {
  const lines: string[] = [];

  // Header
  lines.push("Slothing Search Analytics Report");
  lines.push(`Generated: ${formatDate(data.generatedAt)}`);
  lines.push(`Date Range: ${data.range}`);
  lines.push("");

  // Overview Section
  lines.push("=== OVERVIEW ===");
  lines.push(`Profile Completeness,${data.overview.profileCompleteness}%`);
  lines.push(`Total Jobs Tracked,${data.overview.totalJobs}`);
  lines.push(`Total Interviews,${data.overview.totalInterviews}`);
  lines.push(`Resumes Generated,${data.overview.totalResumesGenerated}`);
  lines.push("");

  // Job Status Breakdown
  lines.push("=== JOB STATUS BREAKDOWN ===");
  lines.push("Status,Count");
  Object.entries(data.jobs.byStatus).forEach(([status, count]) => {
    lines.push(`${escapeCSVValue(status)},${count}`);
  });
  lines.push("");

  // Funnel Metrics
  lines.push("=== APPLICATION FUNNEL ===");
  lines.push("Stage,Count,Percentage,Conversion Rate");
  data.funnel.forEach((stage) => {
    lines.push(
      `${stage.stage},${stage.count},${stage.percentage}%,${stage.conversionFromPrevious}%`,
    );
  });
  lines.push("");

  // Time Metrics
  lines.push("=== TIME METRICS ===");
  lines.push(
    `Average Time to Interview,${data.timeToInterview.averageDays} days`,
  );
  lines.push(`Fastest Response,${data.timeToInterview.minDays} days`);
  lines.push(`Slowest Response,${data.timeToInterview.maxDays} days`);
  lines.push("");

  // Success Rate
  lines.push("=== SUCCESS RATE ===");
  lines.push(`Overall Offer Rate,${data.offerRate}%`);
  lines.push("");

  // Insights
  if (data.insights.length > 0) {
    lines.push("=== INSIGHTS ===");
    data.insights.forEach((insight, i) => {
      lines.push(`${i + 1}. ${escapeCSVValue(insight)}`);
    });
    lines.push("");
  }

  // Job List
  lines.push("=== JOB APPLICATIONS ===");
  lines.push("Title,Company,Status,Applied Date,Created Date");
  data.jobList.forEach((job) => {
    lines.push(
      [
        escapeCSVValue(job.title),
        escapeCSVValue(job.company),
        escapeCSVValue(job.status),
        formatDate(job.appliedAt),
        formatDate(job.createdAt),
      ].join(","),
    );
  });

  return lines.join("\n");
}

export function generateAnalyticsJSON(data: AnalyticsReportData): string {
  return JSON.stringify(data, null, 2);
}

export function prepareReportData(
  analytics: {
    overview: {
      profileCompleteness: number;
      totalJobs: number;
      totalInterviews: number;
      totalResumesGenerated: number;
    };
    jobs: {
      byStatus: Record<string, number>;
      total: number;
      applied: number;
      interviewing: number;
      offered: number;
      rejected: number;
    };
  },
  successMetrics: SuccessMetrics,
  jobs: JobDescription[],
  range: string,
): AnalyticsReportData {
  return {
    generatedAt: new Date().toISOString(),
    range,
    overview: analytics.overview,
    jobs: analytics.jobs,
    funnel: successMetrics.funnel,
    timeToInterview: {
      averageDays: successMetrics.timeToInterview.overall.averageDays,
      minDays: successMetrics.timeToInterview.overall.minDays,
      maxDays: successMetrics.timeToInterview.overall.maxDays,
    },
    offerRate: successMetrics.offerRate.overall,
    insights: successMetrics.insights,
    jobList: jobs.map((job) => ({
      title: job.title,
      company: job.company,
      status: job.status || "saved",
      appliedAt: job.appliedAt || null,
      createdAt: job.createdAt,
    })),
  };
}
