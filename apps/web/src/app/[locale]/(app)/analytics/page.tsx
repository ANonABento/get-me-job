"use client";

import { Suspense, useEffect, useState } from "react";
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
import { ExtensionInstallButtons } from "@/components/marketing/extension-install-buttons";
import { AnalyticsSkeleton } from "@/components/skeletons/analytics-skeleton";
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
import { formatDateAbsolute, nowDate } from "@/lib/format/time";
import { pluralize } from "@/lib/text/pluralize";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  AppPage,
  CenteredPagePanel,
  PageContent,
  PageHeader,
  PageIconTile,
  PagePanel,
  PagePanelHeader,
  pageGridClasses,
  StandardEmptyState,
} from "@/components/ui/page-layout";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonButton,
  SkeletonStatCard,
} from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

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
  const a11yT = useA11yTranslations();

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
      ["Total Opportunities", analytics.overview.totalJobs.toString()],
      ["Total Documents", analytics.overview.totalDocuments.toString()],
      ["Total Interviews", analytics.overview.totalInterviews.toString()],
      [
        "Resumes Generated",
        analytics.overview.totalResumesGenerated.toString(),
      ],
      ["", ""],
      ["--- Opportunities by Status ---", ""],
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
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return (
      <CenteredPagePanel>
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-muted-foreground">
            {error || "Failed to load analytics"}
          </p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </CenteredPagePanel>
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
        title={a11yT("analyticsDashboard")}
        description="Track your job search progress and identify areas for improvement."
        actions={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Select value={exportRange} onValueChange={setExportRange}>
              <SelectTrigger
                className="w-36"
                aria-label={a11yT("exportDateRange")}
              >
                <SelectValue placeholder={a11yT("dateRange")} />
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
                title={`Job Search Analytics - ${formatDateAbsolute(nowDate())}`}
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
          <Suspense
            fallback={
              <div className={pageGridClasses.fourStats}>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </div>
            }
          >
            <div
              className={pageGridClasses.fourStats}
              data-testid="analytics-overview"
            >
              {/* Profile Completeness */}
              <PagePanel>
                <div className="flex items-center justify-between mb-4">
                  <PageIconTile icon={Target} />
                  <span className="font-display text-2xl font-bold tracking-tight">
                    {analytics.overview.profileCompleteness}%
                  </span>
                </div>
                <h3 className="font-medium mb-2">Profile Complete</h3>
                <Progress
                  value={analytics.overview.profileCompleteness}
                  aria-label={a11yT("profileCompleteness")}
                  className="h-2"
                />
                {analytics.overview.profileCompleteness < 100 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <Link
                      href="/components"
                      className="text-primary underline underline-offset-2 font-medium"
                    >
                      Complete your profile
                    </Link>{" "}
                    to improve your chances
                  </p>
                )}
              </PagePanel>

              {/* Total Opportunities */}
              <PagePanel>
                <div className="flex items-center justify-between mb-4">
                  <PageIconTile
                    icon={Briefcase}
                    className="bg-info/10 text-info"
                  />
                  <span className="font-display text-2xl font-bold tracking-tight">
                    {analytics.overview.totalJobs}
                  </span>
                </div>
                <h3 className="font-medium mb-1">Total Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  {analytics.jobs.applied} applied
                </p>
              </PagePanel>

              {/* Interviews */}
              <PagePanel>
                <div className="flex items-center justify-between mb-4">
                  <PageIconTile
                    icon={MessageSquare}
                    className="bg-warning/10 text-warning"
                  />
                  <span className="font-display text-2xl font-bold tracking-tight">
                    {analytics.overview.totalInterviews}
                  </span>
                </div>
                <h3 className="font-medium mb-1">Interview Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  {analytics.interviews.completed} completed
                </p>
              </PagePanel>

              {/* Resumes */}
              <PagePanel>
                <div className="flex items-center justify-between mb-4">
                  <PageIconTile
                    icon={FileText}
                    className="bg-success/10 text-success"
                  />
                  <span className="font-display text-2xl font-bold tracking-tight">
                    {analytics.overview.totalResumesGenerated}
                  </span>
                </div>
                <h3 className="font-medium mb-1">Resumes Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored for each opportunity
                </p>
              </PagePanel>
            </div>
          </Suspense>

          {/* Pipeline & Skills Row */}
          <Suspense
            fallback={
              <div className="grid gap-6 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            }
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Job Pipeline */}
              <PagePanel>
                <PagePanelHeader
                  title={a11yT("applicationPipeline")}
                  icon={TrendingUp}
                />

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
                            {pluralize(count, "opportunity", "opportunities")}
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
                  <h4 className="mb-4 font-display text-sm font-medium tracking-tight">
                    Conversion Rates
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-display text-2xl font-bold tracking-tight text-info">
                        {applicationRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Applied</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold tracking-tight text-warning">
                        {interviewRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To Interview
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold tracking-tight text-success">
                        {offerRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">To Offer</p>
                    </div>
                  </div>
                </div>
              </PagePanel>

              {/* Skills Overview */}
              <PagePanel>
                <PagePanelHeader title={a11yT("skillsOverview")} icon={Users} />

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
                      Skill Gaps from Opportunity Listings
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
                      These skills appear frequently in your saved opportunities
                      but aren&apos;t in your profile.
                    </p>
                  </div>
                )}
              </PagePanel>
            </div>
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<SkeletonCard />}>
            <div data-testid="analytics-recent">
              <PagePanel>
                <PagePanelHeader
                  title={a11yT("recentOpportunityActivity")}
                  icon={Clock}
                />

                {analytics.recent.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recent.jobs.map((job) => {
                      const statusConfig =
                        STATUS_CONFIG[job.status] || STATUS_CONFIG.saved;
                      return (
                        <Link
                          key={job.id}
                          href={`/opportunities?highlight=${job.id}`}
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
                    title={a11yT("noOpportunitiesTrackedYet")}
                    action={
                      <div className="flex flex-col items-center gap-3">
                        <p className="max-w-sm text-center text-sm text-muted-foreground">
                          Install the extension to start capturing roles.
                        </p>
                        <ExtensionInstallButtons
                          variant="compact"
                          onlyDetected
                        />
                        <Button asChild variant="outline">
                          <Link href="/opportunities">
                            Add your first opportunity
                          </Link>
                        </Button>
                      </div>
                    }
                    className="min-h-64"
                  />
                )}
              </PagePanel>
            </div>
          </Suspense>

          {/* Advanced Analytics Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 pb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Advanced Insights
                </h2>
                <p className="text-sm text-muted-foreground">
                  Deep dive into your opportunity search performance
                </p>
              </div>
            </div>

            {/* Trends */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display font-semibold tracking-tight">
                <LineChart className="h-5 w-5 text-primary" />
                Activity Trends
              </h3>
              <ErrorBoundary>
                <Suspense fallback={<SkeletonChart />}>
                  <TrendCharts />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Success Metrics */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display font-semibold tracking-tight">
                <Target className="h-5 w-5 text-primary" />
                Success Metrics
              </h3>
              <ErrorBoundary>
                <Suspense fallback={<SkeletonChart />}>
                  <SuccessDashboard />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Learning Paths */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display font-semibold tracking-tight">
                <GraduationCap className="h-5 w-5 text-primary" />
                Skill Development
              </h3>
              <ErrorBoundary>
                <Suspense fallback={<SkeletonChart />}>
                  <SkillLearningPaths />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}
