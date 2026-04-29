import type { JobDescription, JobStatus } from "@/types";
import type { GeneratedResume } from "@/lib/db/resumes";

export interface TimeToMetric {
  category: string;
  count: number;
  averageDays: number;
  minDays: number;
  maxDays: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number;
}

export interface ResumePerformance {
  id: string;
  jobTitle?: string;
  company?: string;
  createdAt: string;
  matchScore?: number;
  jobStatus?: string;
  successful: boolean;
}

export interface SuccessMetrics {
  funnel: FunnelStage[];
  timeToInterview: {
    overall: TimeToMetric;
    byJobType: TimeToMetric[];
  };
  offerRate: {
    overall: number;
    byJobType: { type: string; rate: number; count: number }[];
  };
  topResumes: ResumePerformance[];
  insights: string[];
}

const SUBMITTED_APPLICATION_STATUSES: JobStatus[] = [
  "applied",
  "interviewing",
  "offered",
  "rejected",
];

function isSubmittedApplication(job: JobDescription): boolean {
  return SUBMITTED_APPLICATION_STATUSES.includes(job.status ?? "saved");
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateFunnel(jobs: JobDescription[]): FunnelStage[] {
  const appliedJobs = jobs.filter(isSubmittedApplication);
  if (appliedJobs.length === 0) {
    return [
      { stage: "Applied", count: 0, percentage: 0, conversionFromPrevious: 0 },
      { stage: "Response", count: 0, percentage: 0, conversionFromPrevious: 0 },
      { stage: "Interview", count: 0, percentage: 0, conversionFromPrevious: 0 },
      { stage: "Offer", count: 0, percentage: 0, conversionFromPrevious: 0 },
    ];
  }

  const applied = appliedJobs.length;
  const responded = appliedJobs.filter(
    (j) => j.status === "interviewing" || j.status === "offered" || j.status === "rejected"
  ).length;
  const interviewed = appliedJobs.filter(
    (j) => j.status === "interviewing" || j.status === "offered"
  ).length;
  const offered = appliedJobs.filter((j) => j.status === "offered").length;

  return [
    {
      stage: "Applied",
      count: applied,
      percentage: 100,
      conversionFromPrevious: 100,
    },
    {
      stage: "Response",
      count: responded,
      percentage: Math.round((responded / applied) * 100),
      conversionFromPrevious: Math.round((responded / applied) * 100),
    },
    {
      stage: "Interview",
      count: interviewed,
      percentage: Math.round((interviewed / applied) * 100),
      conversionFromPrevious: responded > 0 ? Math.round((interviewed / responded) * 100) : 0,
    },
    {
      stage: "Offer",
      count: offered,
      percentage: Math.round((offered / applied) * 100),
      conversionFromPrevious: interviewed > 0 ? Math.round((offered / interviewed) * 100) : 0,
    },
  ];
}

export function calculateTimeToInterview(jobs: JobDescription[]): {
  overall: TimeToMetric;
  byJobType: TimeToMetric[];
} {
  const interviewedJobs = jobs.filter(
    (j) => (j.status === "interviewing" || j.status === "offered") && j.appliedAt
  );

  const calculateMetric = (filteredJobs: JobDescription[], category: string): TimeToMetric => {
    if (filteredJobs.length === 0) {
      return { category, count: 0, averageDays: 0, minDays: 0, maxDays: 0 };
    }

    const days = filteredJobs.map((j) => daysBetween(j.createdAt, j.appliedAt || j.createdAt));
    const sum = days.reduce((a, b) => a + b, 0);

    return {
      category,
      count: filteredJobs.length,
      averageDays: Math.round(sum / days.length),
      minDays: Math.min(...days),
      maxDays: Math.max(...days),
    };
  };

  const overall = calculateMetric(interviewedJobs, "Overall");

  // Group by job type
  const byType = new Map<string, JobDescription[]>();
  interviewedJobs.forEach((job) => {
    const type = job.type || "unspecified";
    if (!byType.has(type)) {
      byType.set(type, []);
    }
    byType.get(type)?.push(job);
  });

  const byJobType: TimeToMetric[] = [];
  byType.forEach((typeJobs, type) => {
    byJobType.push(calculateMetric(typeJobs, type));
  });

  return { overall, byJobType };
}

export function calculateOfferRate(jobs: JobDescription[]): {
  overall: number;
  byJobType: { type: string; rate: number; count: number }[];
} {
  const appliedJobs = jobs.filter(isSubmittedApplication);
  const offeredJobs = jobs.filter((j) => j.status === "offered");

  const overall = appliedJobs.length > 0
    ? Math.round((offeredJobs.length / appliedJobs.length) * 100)
    : 0;

  // Group by job type
  const byType = new Map<string, { applied: number; offered: number }>();
  appliedJobs.forEach((job) => {
    const type = job.type || "unspecified";
    if (!byType.has(type)) {
      byType.set(type, { applied: 0, offered: 0 });
    }
    const stats = byType.get(type)!;
    stats.applied++;
    if (job.status === "offered") {
      stats.offered++;
    }
  });

  const byJobType: { type: string; rate: number; count: number }[] = [];
  byType.forEach((stats, type) => {
    byJobType.push({
      type,
      rate: stats.applied > 0 ? Math.round((stats.offered / stats.applied) * 100) : 0,
      count: stats.applied,
    });
  });

  return { overall, byJobType };
}

export function identifyTopResumes(
  resumes: GeneratedResume[],
  jobs: JobDescription[]
): ResumePerformance[] {
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const resumePerformance: ResumePerformance[] = resumes.map((resume) => {
    const job = jobMap.get(resume.jobId);
    const successful = job?.status === "offered" || job?.status === "interviewing";

    return {
      id: resume.id,
      jobTitle: job?.title,
      company: job?.company,
      createdAt: resume.createdAt,
      matchScore: resume.matchScore,
      jobStatus: job?.status,
      successful,
    };
  });

  // Sort by success (successful first, then by match score)
  return resumePerformance
    .sort((a, b) => {
      if (a.successful !== b.successful) {
        return a.successful ? -1 : 1;
      }
      return (b.matchScore || 0) - (a.matchScore || 0);
    })
    .slice(0, 10);
}

export function generateInsights(
  jobs: JobDescription[],
  funnel: FunnelStage[],
  timeToInterview: { overall: TimeToMetric; byJobType: TimeToMetric[] },
  offerRate: { overall: number; byJobType: { type: string; rate: number; count: number }[] }
): string[] {
  const insights: string[] = [];

  // Funnel insights
  if (funnel[1].conversionFromPrevious < 20 && funnel[0].count > 5) {
    insights.push(
      "Your response rate is below 20%. Consider tailoring your resume more specifically to each job."
    );
  }

  if (funnel[2].conversionFromPrevious > 50 && funnel[1].count > 3) {
    insights.push(
      "Great interview conversion rate! Once you get a response, you're likely to get an interview."
    );
  }

  if (funnel[3].conversionFromPrevious > 30 && funnel[2].count > 2) {
    insights.push(
      "Strong interview-to-offer conversion! You're performing well in interviews."
    );
  }

  // Time to interview insights
  if (timeToInterview.overall.averageDays > 14 && timeToInterview.overall.count > 3) {
    insights.push(
      `Average time to interview is ${timeToInterview.overall.averageDays} days. Consider following up on applications after 1-2 weeks.`
    );
  }

  // Job type insights
  const bestPerformingType = offerRate.byJobType
    .filter((t) => t.count >= 3)
    .sort((a, b) => b.rate - a.rate)[0];

  if (bestPerformingType && bestPerformingType.rate > 0) {
    insights.push(
      `You have the best success rate (${bestPerformingType.rate}%) with ${bestPerformingType.type} positions.`
    );
  }

  // Volume insight
  const totalApplied = jobs.filter(isSubmittedApplication).length;
  if (totalApplied < 10) {
    insights.push(
      "Apply to more positions to get statistically meaningful insights. Aim for 15-20+ applications."
    );
  }

  // No insights case
  if (insights.length === 0) {
    insights.push("Keep tracking your applications to unlock personalized insights!");
  }

  return insights;
}

export function calculateSuccessMetrics(
  jobs: JobDescription[],
  resumes: GeneratedResume[]
): SuccessMetrics {
  const funnel = calculateFunnel(jobs);
  const timeToInterview = calculateTimeToInterview(jobs);
  const offerRate = calculateOfferRate(jobs);
  const topResumes = identifyTopResumes(resumes, jobs);
  const insights = generateInsights(jobs, funnel, timeToInterview, offerRate);

  return {
    funnel,
    timeToInterview,
    offerRate,
    topResumes,
    insights,
  };
}
