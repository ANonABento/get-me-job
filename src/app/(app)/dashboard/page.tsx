"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Rocket,
  Star,
  Building2,
  Plus,
  Lightbulb,
  GraduationCap,
  Zap,
  LogIn,
} from "lucide-react";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonStatCard, SkeletonInsights } from "@/components/ui/skeleton";

interface Stats {
  documentsCount: number;
  jobsCount: number;
  profileComplete: boolean;
  profileCompleteness: number;
  appliedJobs: number;
  interviewsCount: number;
}

interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
}

interface JobRecommendation {
  job: { id: string; title: string; company: string };
  score: number;
  reasons: string[];
}

interface SkillGap {
  skill: string;
  priority: "high" | "medium" | "low";
  jobsRequiring: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    documentsCount: 0,
    jobsCount: 0,
    profileComplete: false,
    profileCompleteness: 0,
    appliedJobs: 0,
    interviewsCount: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJson(url: string) {
      const response = await fetch(url);
      const body = await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        throw new Error(body?.error || `Request failed for ${url}`);
      }

      return body;
    }

    async function fetchStats() {
      try {
        setErrorMessage(null);

        const [profileData, jobsData, documentsData, analyticsData, recsData, learningData] = await Promise.all([
          fetchJson("/api/profile"),
          fetchJson("/api/jobs"),
          fetchJson("/api/documents"),
          fetchJson("/api/analytics"),
          fetchJson("/api/recommendations?limit=3"),
          fetchJson("/api/learning/paths?limit=3"),
        ]);

        const profile = profileData.profile;
        const hasContact = profile?.contact?.name && profile?.contact?.email;
        const hasExperience = profile?.experiences?.length > 0;

        setStats({
          documentsCount: documentsData.documents?.length || 0,
          jobsCount: jobsData.jobs?.length || 0,
          profileComplete: hasContact && hasExperience,
          profileCompleteness: analyticsData.overview?.profileCompleteness || 0,
          appliedJobs: analyticsData.jobs?.applied || 0,
          interviewsCount: analyticsData.overview?.totalInterviews || 0,
        });

        setRecentJobs(analyticsData.recent?.jobs || []);

        // Set recommendations
        if (recsData.recommendations) {
          setRecommendations(
            recsData.recommendations.slice(0, 3).map((r: { job: { id: string; title: string; company: string }; score: number; reasons: string[] }) => ({
              job: r.job,
              score: r.score,
              reasons: r.reasons,
            }))
          );
        }

        // Set skill gaps from learning paths
        if (learningData.paths) {
          setSkillGaps(
            learningData.paths.slice(0, 3).map((p: { skill: string; priority: "high" | "medium" | "low"; jobsRequiring: number }) => ({
              skill: p.skill,
              priority: p.priority,
              jobsRequiring: p.jobsRequiring,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setErrorMessage(
          error instanceof Error && error.message === "AUTH_REQUIRED"
            ? "Sign in to access your dashboard."
            : "We couldn't load your dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const completedSteps = [
    stats.profileComplete,
    stats.profileComplete,
    stats.jobsCount > 0,
    stats.interviewsCount > 0,
  ].filter(Boolean).length;

  if (errorMessage) {
    const needsSignIn = errorMessage === "Sign in to access your dashboard.";

    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {needsSignIn ? "Sign in required" : "Dashboard unavailable"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
          <div className="mt-6 flex justify-center gap-3">
            {needsSignIn ? (
              <Link
                href="/sign-in?redirect_url=/dashboard"
                className="inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-2.5 font-medium text-white shadow-lg transition-opacity hover:opacity-90"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 font-medium transition-colors hover:bg-muted"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 grain">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Job Assistant
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Land your dream job<br />
                <span className="gradient-text">with confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Upload your resume, match with jobs, generate tailored applications, and ace your interviews with AI-powered coaching.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/bank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-4 w-4" />
                  Upload Resume
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border font-medium hover:bg-muted transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  Add Job
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 lg:w-80">
              {loading ? (
                <>
                  <SkeletonStatCard className="col-span-2" />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                </>
              ) : (
                <>
                  <div className="rounded-xl border bg-card p-4 col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Profile Completeness</span>
                      <span className="text-sm font-semibold">{stats.profileCompleteness}%</span>
                    </div>
                    <Progress value={stats.profileCompleteness} className="h-2" />
                  </div>
                  <StatCard
                    icon={Briefcase}
                    label="Jobs Tracked"
                    value={stats.jobsCount.toString()}
                    color="text-primary"
                  />
                  <StatCard
                    icon={Star}
                    label="Applied"
                    value={stats.appliedJobs.toString()}
                    color="text-warning"
                  />
                  <StatCard
                    icon={MessageSquare}
                    label="Interviews"
                    value={stats.interviewsCount.toString()}
                    color="text-success"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Progress"
                    value={`${completedSteps}/4`}
                    color="text-accent"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
          <span className="text-sm text-muted-foreground">Get started in minutes</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <QuickAction
            title="Upload Resume"
            description="Extract your professional info automatically"
            href="/bank"
            icon={Upload}
            gradient="from-violet-500 to-purple-400"
          />
          <QuickAction
            title="Edit Profile"
            description="Review and refine your career details"
            href="/bank"
            icon={FileText}
            gradient="from-rose-400 to-orange-400"
          />
          <QuickAction
            title="Track Jobs"
            description="Get tailored resumes for each application"
            href="/jobs"
            icon={Briefcase}
            gradient="from-blue-500 to-indigo-400"
          />
          <QuickAction
            title="Interview Prep"
            description="Practice with AI mock interviews"
            href="/interview"
            icon={MessageSquare}
            gradient="from-amber-400 to-orange-400"
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <InsightsPanel />
      </div>

      {/* Smart Insights Row */}
      {(recommendations.length > 0 || skillGaps.length > 0) && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Job Recommendations */}
            {recommendations.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">Top Matches</h3>
                  </div>
                  <Link href="/jobs" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <Link
                      key={rec.job.id}
                      href="/jobs"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        rec.score >= 70
                          ? "bg-success/10 text-success"
                          : rec.score >= 50
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {rec.score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{rec.job.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{rec.job.company}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Develop */}
            {skillGaps.length > 0 && (
              <div className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">Skills to Develop</h3>
                  </div>
                  <Link href="/analytics" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Learning paths <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {skillGaps.map((gap) => (
                    <div
                      key={gap.skill}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Lightbulb className={`h-4 w-4 ${
                          gap.priority === "high"
                            ? "text-destructive"
                            : gap.priority === "medium"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`} />
                        <span className="font-medium">{gap.skill}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {gap.jobsRequiring} job{gap.jobsRequiring !== 1 ? "s" : ""} need this
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentJobs.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link href="/jobs" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentJobs.slice(0, 3).map((job) => (
              <Link
                key={job.id}
                href="/jobs"
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{job.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
            <Link
              href="/jobs"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Job</span>
            </Link>
          </div>
        </div>
      )}

      {/* Getting Started Journey */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border bg-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl gradient-bg text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Your Journey to Success</h2>
              <p className="text-sm text-muted-foreground">Complete these steps to maximize your job search</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Step
              number={1}
              title="Upload your resume"
              description="We'll extract and organize your professional information automatically using AI."
              done={stats.profileComplete}
              href="/bank"
            />
            <Step
              number={2}
              title="Review your profile"
              description="Verify the extracted data and add any missing details to strengthen your profile."
              done={stats.profileComplete}
              href="/bank"
            />
            <Step
              number={3}
              title="Add target jobs"
              description="Paste job descriptions to generate tailored resumes and see your match score."
              done={stats.jobsCount > 0}
              href="/jobs"
            />
            <Step
              number={4}
              title="Ace the interview"
              description="Practice with AI-powered mock interviews customized to your target roles."
              done={false}
              href="/interview"
            />
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
    >
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />

      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    </Link>
  );
}

function Step({
  number,
  title,
  description,
  done,
  href,
}: {
  number: number;
  title: string;
  description: string;
  done: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
          done
            ? "bg-success text-success-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : number}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    saved: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    applied: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    interviewing: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    offered: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  const labels: Record<string, string> = {
    saved: "Saved",
    applied: "Applied",
    interviewing: "Interview",
    offered: "Offered",
    rejected: "Rejected",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.saved}`}>
      {labels[status] || "Saved"}
    </span>
  );
}
