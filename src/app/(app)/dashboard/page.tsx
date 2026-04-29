"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Rocket,
  CheckCircle2,
  Plus,
  Building2,
  LogIn,
} from "lucide-react";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ProfileCompletenessRing } from "@/components/dashboard/profile-completeness-ring";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RecentActivity, type ActivityItem } from "@/components/dashboard/recent-activity";
import { calculateProfileCompleteness, type ProfileCompletenessResult } from "@/lib/profile-completeness";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonStatCard, SkeletonInsights } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { buildQuickActions } from "./quick-actions";

interface DashboardStats {
  documentsCount: number;
  resumesGenerated: number;
  profileCompleteness: ProfileCompletenessResult;
}

interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    documentsCount: 0,
    resumesGenerated: 0,
    profileCompleteness: { percentage: 0, sections: [], nextAction: null },
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showErrorToast = useErrorToast();

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

        const [profileData, documentsData, analyticsData] = await Promise.all([
          fetchJson("/api/profile"),
          fetchJson("/api/documents"),
          fetchJson("/api/analytics"),
        ]);

        const profile = profileData.profile;
        const documents = documentsData.documents || [];
        const completeness = calculateProfileCompleteness(profile);
        const resumesGenerated = analyticsData.overview?.totalResumesGenerated || 0;

        setStats({
          documentsCount: documents.length,
          resumesGenerated,
          profileCompleteness: completeness,
        });

        const recentJobsList = analyticsData.recent?.jobs || [];
        setRecentJobs(recentJobsList);

        // Build activity timeline from documents + jobs
        const activities: ActivityItem[] = [];

        for (const doc of documents.slice(0, 5)) {
          activities.push({
            id: `doc-${doc.id}`,
            type: "document_uploaded",
            title: doc.filename,
            timestamp: doc.uploadedAt,
          });
        }

        for (const job of recentJobsList.slice(0, 5)) {
          activities.push({
            id: `job-${job.id}`,
            type: job.status === "applied" ? "job_applied" : "job_added",
            title: `${job.title} at ${job.company}`,
            timestamp: job.createdAt,
          });
        }

        // Sort by timestamp descending, take 5
        activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivityItems(activities.slice(0, 5));
      } catch (error) {
        const isAuthError =
          error instanceof Error && error.message === "AUTH_REQUIRED";
        showErrorToast(
          isAuthError ? new Error("Sign in to access your dashboard.") : error,
          {
            title: "Could not load dashboard",
            fallbackDescription: "Please refresh the page and try again.",
          }
        );
        setErrorMessage(
          isAuthError
            ? "Sign in to access your dashboard."
            : "We couldn't load your dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [showErrorToast]);

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

  const hasDocuments = stats.documentsCount > 0;
  const hasResumes = stats.resumesGenerated > 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="hero-gradient border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 grain">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4 animate-enter">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Job Assistant
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Land your dream job<br />
                  <span className="gradient-text">with confidence</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Upload your resume, match with jobs, generate tailored
                  applications, and ace your interviews with AI-powered
                  coaching.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/bank"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Resume
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
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      {/* Inline compact ring for hero */}
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Profile Completeness
                          </span>
                          <span className="text-sm font-semibold">
                            {stats.profileCompleteness.percentage}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                            style={{
                              width: `${stats.profileCompleteness.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <StatCard
                      icon={Upload}
                      label="Documents"
                      value={stats.documentsCount.toString()}
                      color="text-primary"
                    />
                    <StatCard
                      icon={FileText}
                      label="Resumes Built"
                      value={stats.resumesGenerated.toString()}
                      color="text-accent"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Empty state: no documents yet */}
          {!loading && !hasDocuments && (
            <EmptyState variant="no-resume" />
          )}

          {/* Empty state: has documents but no resumes built */}
          {!loading && hasDocuments && !hasResumes && (
            <EmptyState variant="no-resumes-built" />
          )}

          {/* Profile Completeness Ring + Recent Activity (side by side) */}
          {!loading && hasDocuments && (
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfileCompletenessRing data={stats.profileCompleteness} />
              <RecentActivity items={activityItems} />
            </div>
          )}

          {/* Quick Actions - only show relevant ones */}
          {!loading && hasDocuments && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <span className="text-sm text-muted-foreground">
                  Get started in minutes
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {buildQuickActions({
                  documentsCount: stats.documentsCount,
                  resumesGenerated: stats.resumesGenerated,
                }).map((action) => (
                  <QuickAction
                    key={action.href}
                    title={action.title}
                    description={action.description}
                    href={action.href}
                    icon={action.icon}
                    gradient={action.gradient}
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {!loading && hasDocuments && (
            <InsightsPanel />
          )}

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Jobs</h2>
                <Link
                  href="/jobs"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
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
                      <p className="text-sm text-muted-foreground truncate">
                        {job.company}
                      </p>
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
          <div className="rounded-2xl border bg-card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl gradient-bg text-white">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Journey to Success</h2>
                <p className="text-sm text-muted-foreground">
                  Complete these steps to maximize your job search
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Step
                number={1}
                title="Upload your resume"
                description="We'll extract and organize your professional information automatically using AI."
                done={hasDocuments}
                href="/bank"
              />
              <Step
                number={2}
                title="Complete your profile"
                description="Verify the extracted data and add any missing details to strengthen your profile."
                done={stats.profileCompleteness.percentage >= 80}
                href="/profile"
              />
              <Step
                number={3}
                title="Build a resume"
                description="Open Document Studio to select your best details and export an application-ready resume."
                done={hasResumes}
                href="/studio"
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
      <div
        className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />

      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
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
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    saved: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dismissed:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    applied:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    interviewing:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    offered:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected:
      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    withdrawn:
      "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    saved: "Saved",
    dismissed: "Dismissed",
    applied: "Applied",
    interviewing: "Interview",
    offered: "Offered",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.saved}`}
    >
      {labels[status] || "Saved"}
    </span>
  );
}
