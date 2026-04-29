import type { Profile, JobDescription } from "@/types";
import type { AnalyticsSnapshot } from "@/lib/db/analytics";

export type InsightType =
  | "strongest_skills"
  | "missing_keywords"
  | "ats_trend"
  | "resume_performance"
  | "quantified_metrics"
  | "application_momentum"
  | "profile_completeness";

export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: InsightPriority;
  actionLabel?: string;
  actionUrl?: string;
}

export interface InsightData {
  profile: Profile | null;
  jobs: JobDescription[];
  snapshots: AnalyticsSnapshot[];
  generatedResumes: Array<{
    id: string;
    jobId: string;
    matchScore: number | null;
    createdAt: string;
  }>;
}

interface InsightCache {
  insights: Insight[];
  generatedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, InsightCache>();

export function clearInsightCache(userId: string): void {
  cache.delete(userId);
}

export function getInsights(
  data: InsightData,
  userId: string = "default",
): Insight[] {
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
    return cached.insights;
  }

  const insights = generateInsights(data);
  cache.set(userId, { insights, generatedAt: Date.now() });
  return insights;
}

export function generateInsights(data: InsightData): Insight[] {
  const allInsights: Insight[] = [];

  allInsights.push(...analyzeStrongestSkills(data));
  allInsights.push(...analyzeMissingKeywords(data));
  allInsights.push(...analyzeAtsTrend(data));
  allInsights.push(...analyzeResumePerformance(data));
  allInsights.push(...analyzeQuantifiedMetrics(data));
  allInsights.push(...analyzeApplicationMomentum(data));
  allInsights.push(...analyzeProfileCompleteness(data));

  // Sort by priority, then return top 5
  const priorityOrder: Record<InsightPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  allInsights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  return allInsights.slice(0, 5);
}

export function analyzeStrongestSkills(data: InsightData): Insight[] {
  const { profile, jobs } = data;
  if (!profile || profile.skills.length === 0 || jobs.length === 0) return [];

  // Count how many jobs each skill appears in (via keywords)
  const skillMatchCounts = new Map<string, number>();
  const profileSkillNames = profile.skills.map((s) => s.name.toLowerCase());

  for (const job of jobs) {
    const jobKeywords = (job.keywords || []).map((k) => k.toLowerCase());
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    for (const skillName of profileSkillNames) {
      if (
        jobKeywords.some(
          (k) => k.includes(skillName) || skillName.includes(k),
        ) ||
        jobText.includes(skillName)
      ) {
        skillMatchCounts.set(
          skillName,
          (skillMatchCounts.get(skillName) || 0) + 1,
        );
      }
    }
  }

  if (skillMatchCounts.size === 0) return [];

  const sorted = Array.from(skillMatchCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const topSkills = sorted.slice(0, 3);
  const topPercentage = Math.round((topSkills[0][1] / jobs.length) * 100);

  if (topPercentage < 20) return [];

  const skillNames = topSkills.map(([name]) => capitalize(name));

  return [
    {
      id: "strongest-skills",
      type: "strongest_skills",
      title: "Your strongest skills",
      description: `${skillNames.join(", ")} appear in ${topPercentage}% of your tracked jobs. These are your most marketable skills.`,
      priority: "low",
      actionLabel: "View Profile",
      actionUrl: "/bank",
    },
  ];
}

export function analyzeMissingKeywords(data: InsightData): Insight[] {
  const { profile, jobs } = data;
  if (!profile || jobs.length === 0) return [];

  const profileSkillNames = new Set(
    profile.skills.map((s) => s.name.toLowerCase()),
  );
  const profileText = extractProfileText(profile).toLowerCase();

  // Count keyword frequency across all jobs
  const keywordCounts = new Map<string, number>();
  for (const job of jobs) {
    for (const keyword of job.keywords || []) {
      const kw = keyword.toLowerCase();
      if (!profileSkillNames.has(kw) && !profileText.includes(kw)) {
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      }
    }
  }

  if (keywordCounts.size === 0) return [];

  const sorted = Array.from(keywordCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const topMissing = sorted.slice(0, 3);
  const topPercentage = Math.round((topMissing[0][1] / jobs.length) * 100);

  if (topPercentage < 20) return [];

  const missingNames = topMissing.map(([name]) => `'${name}'`);

  return [
    {
      id: "missing-keywords",
      type: "missing_keywords",
      title: "Missing in-demand keywords",
      description: `You're missing ${missingNames.join(", ")} keywords that appear in ${topPercentage}% of your target jobs. Adding these could improve your match rate.`,
      priority: "high",
      actionLabel: "Edit Profile",
      actionUrl: "/bank",
    },
  ];
}

function getSnapshotWindow(
  snapshots: InsightData["snapshots"],
): [(typeof snapshots)[number], (typeof snapshots)[number]] | null {
  if (snapshots.length < 2) return null;
  const recent = snapshots[snapshots.length - 1];
  const older = snapshots[Math.max(0, snapshots.length - 8)];
  if (recent.snapshotDate === older.snapshotDate) return null;
  return [recent, older];
}

export function analyzeAtsTrend(data: InsightData): Insight[] {
  const window = getSnapshotWindow(data.snapshots);
  if (!window) return [];
  const [recent, older] = window;

  const recentCompleteness = recent.profileCompleteness;
  const olderCompleteness = older.profileCompleteness;
  const change = recentCompleteness - olderCompleteness;

  if (change === 0) return [];

  const improving = change > 0;

  return [
    {
      id: "ats-trend",
      type: "ats_trend",
      title: improving ? "Profile improving" : "Profile needs attention",
      description: improving
        ? `Your profile completeness improved ${change} points since ${older.snapshotDate}. Keep it up!`
        : `Your profile completeness dropped ${Math.abs(change)} points since ${older.snapshotDate}. Consider updating your profile.`,
      priority: improving ? "low" : "medium",
      actionLabel: "View Analytics",
      actionUrl: "/analytics",
    },
  ];
}

export function analyzeResumePerformance(data: InsightData): Insight[] {
  const { jobs, generatedResumes } = data;
  if (generatedResumes.length < 2 || jobs.length === 0) return [];

  // Group resumes by job and check which jobs progressed to interviews
  const interviewingJobs = new Set(
    jobs
      .filter((j) => j.status === "interviewing" || j.status === "offered")
      .map((j) => j.id),
  );

  const resumesWithScore = generatedResumes.filter(
    (r) => r.matchScore !== null,
  );
  if (resumesWithScore.length < 2) return [];

  const interviewResumes = resumesWithScore.filter((r) =>
    interviewingJobs.has(r.jobId),
  );
  const nonInterviewResumes = resumesWithScore.filter(
    (r) => !interviewingJobs.has(r.jobId),
  );

  if (interviewResumes.length === 0 || nonInterviewResumes.length === 0)
    return [];

  const avgInterviewScore =
    interviewResumes.reduce((sum, r) => sum + (r.matchScore || 0), 0) /
    interviewResumes.length;
  const avgNonInterviewScore =
    nonInterviewResumes.reduce((sum, r) => sum + (r.matchScore || 0), 0) /
    nonInterviewResumes.length;

  const scoreDiff = Math.round(avgInterviewScore - avgNonInterviewScore);

  if (scoreDiff <= 0) return [];

  return [
    {
      id: "resume-performance",
      type: "resume_performance",
      title: "Higher-scoring resumes get results",
      description: `Resumes that led to interviews scored ${scoreDiff} points higher on average. Focus on tailoring your resume to each job for better outcomes.`,
      priority: "medium",
      actionLabel: "View Opportunities",
      actionUrl: "/opportunities",
    },
  ];
}

export function analyzeQuantifiedMetrics(data: InsightData): Insight[] {
  const { profile } = data;
  if (!profile || profile.experiences.length === 0) return [];

  const allText = profile.experiences
    .map((exp) => [exp.description, ...exp.highlights].join(" "))
    .join(" ");

  const hasNumbers =
    /\d+%|\$[\d,]+|\d+ (people|users|clients|projects|team|members)/i.test(
      allText,
    );

  if (hasNumbers) return [];

  return [
    {
      id: "quantified-metrics",
      type: "quantified_metrics",
      title: "Add quantified achievements",
      description:
        "Consider adding metrics to your experience (e.g., 'Increased sales by 20%', 'Led team of 5'). Resumes with numbers score higher with recruiters and ATS systems.",
      priority: "high",
      actionLabel: "Edit Experience",
      actionUrl: "/bank",
    },
  ];
}

export function analyzeApplicationMomentum(data: InsightData): Insight[] {
  const window = getSnapshotWindow(data.snapshots);
  if (!window) return [];
  const [recent, older] = window;

  const appliedChange = recent.jobsApplied - older.jobsApplied;
  const interviewChange = recent.jobsInterviewing - older.jobsInterviewing;

  if (appliedChange <= 0 && interviewChange <= 0) {
    return [
      {
        id: "application-momentum",
        type: "application_momentum",
        title: "Keep up your momentum",
        description:
          "Your application activity has slowed down. Try to apply to a few jobs this week to maintain your search momentum.",
        priority: "medium",
        actionLabel: "Browse Opportunities",
        actionUrl: "/opportunities",
      },
    ];
  }

  if (interviewChange > 0) {
    return [
      {
        id: "application-momentum",
        type: "application_momentum",
        title: "Great progress!",
        description: `You've moved ${interviewChange} more job(s) to the interview stage recently. Your application strategy is working!`,
        priority: "low",
        actionLabel: "View Analytics",
        actionUrl: "/analytics",
      },
    ];
  }

  return [];
}

export function analyzeProfileCompleteness(data: InsightData): Insight[] {
  const { profile } = data;
  if (!profile) {
    return [
      {
        id: "profile-completeness",
        type: "profile_completeness",
        title: "Set up your profile",
        description:
          "Upload your resume to get started. A complete profile helps generate better-tailored resumes and insights.",
        priority: "high",
        actionLabel: "Upload Resume",
        actionUrl: "/bank",
      },
    ];
  }

  const missing: string[] = [];
  if (!profile.summary || profile.summary.length < 50)
    missing.push("professional summary");
  if (profile.skills.length < 3) missing.push("skills (at least 3)");
  if (profile.experiences.length === 0) missing.push("work experience");
  if (!profile.contact?.email) missing.push("email address");

  if (missing.length === 0) return [];

  return [
    {
      id: "profile-completeness",
      type: "profile_completeness",
      title: "Complete your profile",
      description: `Add ${missing.join(", ")} to strengthen your profile and improve AI-generated resume quality.`,
      priority: "high",
      actionLabel: "Edit Profile",
      actionUrl: "/bank",
    },
  ];
}

function extractProfileText(profile: Profile): string {
  const parts: string[] = [];
  if (profile.summary) parts.push(profile.summary);
  for (const exp of profile.experiences) {
    parts.push(exp.title, exp.company, exp.description, ...exp.highlights);
  }
  for (const skill of profile.skills) {
    parts.push(skill.name);
  }
  return parts.join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
