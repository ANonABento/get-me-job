"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Loader2,
  Target,
  Briefcase,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  FileText,
  Users,
  GraduationCap,
  LineChart,
  Zap,
  Download,
  ChevronDown,
  Printer,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TimeAgo } from "@/components/format/time-ago";
import { formatDateAbsolute } from "@/lib/format/time";
import { pluralize } from "@/lib/text/pluralize";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  AppPage,
  PageContent,
  PageHeader,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import { SkeletonChart, SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";

const TrendCharts = dynamic(
  () =>
    import("@/components/analytics/trend-charts").then((m) => m.TrendCharts),
  { loading: () => <SkeletonChart /> },
);
const SuccessDashboard = dynamic(
  () =>
    import("@/components/analytics/success-dashboard").then(
      (m) => m.SuccessDashboard,
    ),
  { loading: () => <SkeletonChart /> },
);
const SkillLearningPaths = dynamic(
  () =>
    import("@/components/learning/skill-learning-paths").then(
      (m) => m.SkillLearningPaths,
    ),
  { loading: () => <SkeletonChart /> },
);
const ExportToSheetsButton = dynamic(
  () => import("@/components/google").then((m) => m.ExportToSheetsButton),
  { loading: () => <SkeletonButton />, ssr: false },
);

interface Analytics {
  overview: {
    profileCompleteness: number;
    totalJobs: number;
    totalDocuments: number;
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
  interviews: {
    total: number;
    completed: number;
    inProgress: number;
  };
  skills: {
    total: number;
    gaps: string[];
    byCategory: Record<string, number>;
  };
  recent: {
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      status: string;
      createdAt: string;
    }>;
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "bg-muted-foreground", icon: Clock },
  saved: { label: "Saved", color: "bg-muted-foreground", icon: Star },
  dismissed: {
    label: "Dismissed",
    color: "bg-muted-foreground",
    icon: XCircle,
  },
  applied: { label: "Applied", color: "bg-info", icon: CheckCircle },
  interviewing: {
    label: "Interviewing",
    color: "bg-warning",
    icon: MessageSquare,
  },
  offered: { label: "Offered", color: "bg-success", icon: TrendingUp },
  rejected: { label: "Rejected", color: "bg-destructive", icon: XCircle },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-muted-foreground",
    icon: AlertTriangle,
  },
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportRange, setExportRange] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const showErrorToast = useErrorToast();

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const response = await fetch(
        `/api/analytics/export?format=${format}&range=${exportRange}`,
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `slothing-analytics-${exportRange}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showErrorToast(err, {
        title: "Could not export analytics",
        fallbackDescription: "Please try the export again.",
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatAnalyticsForSheets = (): {
    headers: string[];
    rows: string[][];
  } => {
    if (!analytics) return { headers: [], rows: [] };

    const headers = ["Metric", "Value"];
    const rows: string[][] = [
      ["Profile Completeness", `${analytics.overview.profileCompleteness}%`],
      ["Total Jobs", analytics.overview.totalJobs.toString()],
      ["Total Documents", analytics.overview.totalDocuments.toString()],
      ["Total Interviews", analytics.overview.totalInterviews.toString()],
      [
        "Resumes Generated",
        analytics.overview.totalResumesGenerated.toString(),
      ],
      ["", ""],
      ["--- Jobs by Status ---", ""],
      ...Object.entries(analytics.jobs.byStatus).map(([status, count]) => [
        status,
        count.toString(),
      ]),
      ["", ""],
      ["--- Skills by Category ---", ""],
      ...Object.entries(analytics.skills.byCategory).map(
        ([category, count]) => [category, count.toString()],
      ),
    ];

    return { headers, rows };
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-muted-foreground">
            {error || "Failed to load analytics"}
          </p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  const applicationRate =
    analytics.overview.totalJobs > 0
      ? Math.round(
          (analytics.jobs.applied / analytics.overview.totalJobs) * 100,
        )
      : 0;

  const interviewRate =
    analytics.jobs.applied > 0
      ? Math.round((analytics.jobs.interviewing / analytics.jobs.applied) * 100)
      : 0;

  const offerRate =
    analytics.jobs.interviewing > 0
      ? Math.round((analytics.jobs.offered / analytics.jobs.interviewing) * 100)
      : 0;

  return (
    <AppPage>
      <PageHeader
        icon={BarChart3}
        eyebrow="Insights"
        title="Analytics Dashboard"
        description="Track your job search progress and identify areas for improvement."
        actions={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Select value={exportRange} onValueChange={setExportRange}>
              <SelectTrigger className="w-36" aria-label="Export date range">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <ExportToSheetsButton
                title={`Job Search Analytics - ${formatDateAbsolute(new Date())}`}
                data={formatAnalyticsForSheets()}
                size="sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="hidden sm:inline-flex"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <PageContent>
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Profile Completeness */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">
                  {analytics.overview.profileCompleteness}%
                </span>
              </div>
              <h3 className="font-medium mb-2">Profile Complete</h3>
              <Progress
                value={analytics.overview.profileCompleteness}
                aria-label="Profile completeness"
                className="h-2"
              />
              {analytics.overview.profileCompleteness < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Link
                    href="/bank"
                    className="text-primary underline underline-offset-2 font-medium"
                  >
                    Complete your profile
                  </Link>{" "}
                  to improve your chances
                </p>
              )}
            </div>

            {/* Total Jobs */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-info/10 text-info">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">
                  {analytics.overview.totalJobs}
                </span>
              </div>
              <h3 className="font-medium mb-1">Total Jobs Tracked</h3>
              <p className="text-sm text-muted-foreground">
                {analytics.jobs.applied} applied
              </p>
            </div>

            {/* Interviews */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">
                  {analytics.overview.totalInterviews}
                </span>
              </div>
              <h3 className="font-medium mb-1">Interview Sessions</h3>
              <p className="text-sm text-muted-foreground">
                {analytics.interviews.completed} completed
              </p>
            </div>

            {/* Resumes */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-success/10 text-success">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">
                  {analytics.overview.totalResumesGenerated}
                </span>
              </div>
              <h3 className="font-medium mb-1">Resumes Generated</h3>
              <p className="text-sm text-muted-foreground">
                Tailored for each job
              </p>
            </div>
          </div>

          {/* Pipeline & Skills Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Job Pipeline */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Application Pipeline
              </h3>

              <div className="space-y-4">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = analytics.jobs.byStatus[status] || 0;
                  const percentage =
                    analytics.overview.totalJobs > 0
                      ? (count / analytics.overview.totalJobs) * 100
                      : 0;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <config.icon
                            className={`h-4 w-4 ${config.color.replace("bg-", "text-")}`}
                          />
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {pluralize(count, "job")}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${config.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Conversion Rates */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-4">Conversion Rates</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-info">
                      {applicationRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Applied</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">
                      {interviewRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      To Interview
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {offerRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">To Offer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Overview */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Skills Overview
              </h3>

              {/* Skills by Category */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Skills</span>
                  <span className="text-muted-foreground">
                    {analytics.skills.total}
                  </span>
                </div>

                {Object.entries(analytics.skills.byCategory).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">{category}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ),
                )}
              </div>

              {/* Skill Gaps */}
              {analytics.skills.gaps.length > 0 && (
                <div className="pt-6 border-t">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Skill Gaps from Job Listings
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.skills.gaps.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium capitalize"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    These skills appear frequently in your saved jobs but
                    aren&apos;t in your profile.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Job Activity
            </h3>

            {analytics.recent.jobs.length > 0 ? (
              <div className="space-y-3">
                {analytics.recent.jobs.map((job) => {
                  const statusConfig =
                    STATUS_CONFIG[job.status] || STATUS_CONFIG.saved;
                  return (
                    <Link
                      key={job.id}
                      href={`/jobs?highlight=${job.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${statusConfig.color}/10`}
                        >
                          <statusConfig.icon
                            className={`h-4 w-4 ${statusConfig.color.replace("bg-", "text-")}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}/10 ${statusConfig.color.replace("bg-", "text-")}`}
                        >
                          {statusConfig.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          <TimeAgo date={job.createdAt} />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <StandardEmptyState
                icon={Briefcase}
                title="No jobs tracked yet"
                action={
                  <Button asChild variant="outline">
                    <Link href="/jobs">Add your first job</Link>
                  </Button>
                }
                className="min-h-64"
              />
            )}
          </div>

          {/* Advanced Analytics Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 pb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Advanced Insights</h2>
                <p className="text-sm text-muted-foreground">
                  Deep dive into your job search performance
                </p>
              </div>
            </div>

            {/* Trends */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Activity Trends
              </h3>
              <ErrorBoundary>
                <TrendCharts />
              </ErrorBoundary>
            </div>

            {/* Success Metrics */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Success Metrics
              </h3>
              <ErrorBoundary>
                <SuccessDashboard />
              </ErrorBoundary>
            </div>

            {/* Learning Paths */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Skill Development
              </h3>
              <ErrorBoundary>
                <SkillLearningPaths />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}
