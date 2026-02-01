"use client";

import { useState, useEffect } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Trophy,
  Clock,
  Target,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Briefcase,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type {
  SuccessMetrics,
  FunnelStage,
  TimeToMetric,
  ResumePerformance,
} from "@/lib/analytics/success-metrics";

function FunnelVisualization({ stages }: { stages: FunnelStage[] }) {
  const maxWidth = 100;
  const minWidth = 40;

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const widthPercentage = Math.max(
          minWidth,
          maxWidth * (stage.percentage / 100)
        );

        return (
          <div key={stage.stage} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium text-right">
              {stage.stage}
            </div>
            <div className="flex-1 relative">
              <div
                className={cn(
                  "h-10 rounded-r-lg flex items-center justify-between px-3 transition-all",
                  index === 0 && "bg-blue-500",
                  index === 1 && "bg-purple-500",
                  index === 2 && "bg-amber-500",
                  index === 3 && "bg-green-500"
                )}
                style={{ width: `${widthPercentage}%` }}
              >
                <span className="text-white font-bold">{stage.count}</span>
                <span className="text-white/80 text-sm">{stage.percentage}%</span>
              </div>
            </div>
            <div className="w-20 text-right">
              {index > 0 && stage.conversionFromPrevious > 0 && (
                <span className="text-xs text-muted-foreground">
                  {stage.conversionFromPrevious}% conv
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimeMetricCard({ metric }: { metric: TimeToMetric }) {
  if (metric.count === 0) {
    return (
      <div className="p-3 rounded-lg border bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">No data</p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg border">
      <p className="text-sm font-medium capitalize">{metric.category}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{metric.averageDays}</span>
        <span className="text-sm text-muted-foreground">days avg</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Range: {metric.minDays}-{metric.maxDays} days ({metric.count} samples)
      </p>
    </div>
  );
}

function OfferRateChart({
  overall,
  byType,
}: {
  overall: number;
  byType: { type: string; rate: number; count: number }[];
}) {
  return (
    <div className="space-y-4">
      {/* Overall rate */}
      <div className="text-center p-4 rounded-lg bg-primary/10">
        <p className="text-4xl font-bold text-primary">{overall}%</p>
        <p className="text-sm text-muted-foreground">Overall Offer Rate</p>
      </div>

      {/* By type */}
      {byType.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">By Job Type</p>
          {byType.map(({ type, rate, count }) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-sm capitalize w-24 truncate">{type}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(rate, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{rate}%</span>
              <span className="text-xs text-muted-foreground w-16">({count})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResumePerformanceList({ resumes }: { resumes: ResumePerformance[] }) {
  if (resumes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No resume versions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resumes.map((resume, index) => (
        <div
          key={resume.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            resume.successful && "border-green-500/30 bg-green-500/5"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              index < 3 ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {resume.jobTitle || "Resume"} at {resume.company || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(resume.createdAt)}
              {resume.matchScore && ` • ${resume.matchScore}% match`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {resume.successful && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {resume.jobStatus && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded capitalize",
                  resume.jobStatus === "offered" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  resume.jobStatus === "interviewing" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  resume.jobStatus === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {resume.jobStatus}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ insight }: { insight: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm">{insight}</p>
    </div>
  );
}

export function SuccessDashboard() {
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["funnel", "insights"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics/success");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch metrics");
        }

        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-5 skeleton rounded" />
          <div className="h-6 w-36 skeleton rounded" />
        </div>
        {/* Skeleton accordion sections */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 skeleton rounded" />
                <div className="h-5 w-32 skeleton rounded" />
              </div>
              <div className="h-5 w-5 skeleton rounded" />
            </div>
            {i === 1 && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className="h-4 w-20 skeleton rounded" />
                      <div className="flex-1 h-10 skeleton rounded-r-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-red-500">{error || "Failed to load metrics"}</p>
      </div>
    );
  }

  const sections = [
    {
      id: "funnel",
      title: "Application Funnel",
      icon: Target,
      content: <FunnelVisualization stages={metrics.funnel} />,
    },
    {
      id: "time",
      title: "Time to Interview",
      icon: Clock,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <TimeMetricCard metric={metrics.timeToInterview.overall} />
          {metrics.timeToInterview.byJobType.map((m) => (
            <TimeMetricCard key={m.category} metric={m} />
          ))}
        </div>
      ),
    },
    {
      id: "offers",
      title: "Offer Rate Analysis",
      icon: Trophy,
      content: (
        <OfferRateChart
          overall={metrics.offerRate.overall}
          byType={metrics.offerRate.byJobType}
        />
      ),
    },
    {
      id: "resumes",
      title: "Top Performing Resumes",
      icon: FileText,
      content: <ResumePerformanceList resumes={metrics.topResumes} />,
    },
    {
      id: "insights",
      title: "Personalized Insights",
      icon: Sparkles,
      content: (
        <div className="space-y-2">
          {metrics.insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Success Metrics</h2>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border bg-card overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <section.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{section.title}</span>
            </div>
            {expandedSections.has(section.id) ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedSections.has(section.id) && (
            <div className="px-4 pb-4">{section.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
