"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { VersionStats, ABRecommendation, ABOutcome } from "@/lib/resume/compare";

interface StatsResponse {
  stats: VersionStats[];
  recommendation: ABRecommendation | null;
  totalTracked: number;
}

const OUTCOME_LABELS: Record<ABOutcome, string> = {
  applied: "Applied",
  screening: "Screening",
  interviewing: "Interviewing",
  offered: "Offered",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const OUTCOME_COLORS: Record<ABOutcome, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screening: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  interviewing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  offered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

function ConversionBar({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{rate}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

function VersionStatsCard({ stats, isRecommended }: { stats: VersionStats; isRecommended: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-4",
        isRecommended && "border-primary ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[180px]" title={stats.resumeId}>
            Resume ...{stats.resumeId.slice(-8)}
          </span>
          {isRecommended && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              <Trophy className="h-3 w-3" />
              Best
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{stats.totalSent} sent</span>
      </div>

      <div className="space-y-2">
        <ConversionBar
          label="Interview Rate"
          rate={stats.interviewRate}
          color="bg-amber-500"
        />
        <ConversionBar
          label="Offer Rate"
          rate={stats.offerRate}
          color="bg-green-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.entries(stats.outcomes) as [ABOutcome, number][])
          .filter(([, count]) => count > 0)
          .map(([outcome, count]) => (
            <span
              key={outcome}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                OUTCOME_COLORS[outcome]
              )}
            >
              {OUTCOME_LABELS[outcome]}: {count}
            </span>
          ))}
      </div>
    </div>
  );
}

function RecommendationBanner({ recommendation }: { recommendation: ABRecommendation }) {
  const confidenceColors = {
    low: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    medium: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    high: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  };

  return (
    <div className={cn("rounded-lg border p-4", confidenceColors[recommendation.confidence])}>
      <div className="flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{recommendation.reason}</p>
          <p className="text-xs text-muted-foreground">
            Confidence: {recommendation.confidence} ({recommendation.stats.reduce((s, v) => s + v.totalSent, 0)} data points)
          </p>
        </div>
      </div>
    </div>
  );
}

interface PipelineStage {
  outcome: ABOutcome;
  count: number;
}

function OutcomePipeline({ stats }: { stats: VersionStats[] }) {
  const aggregated: PipelineStage[] = (["applied", "screening", "interviewing", "offered"] as ABOutcome[]).map(
    (outcome) => ({
      outcome,
      count: stats.reduce((sum, s) => sum + s.outcomes[outcome], 0),
    })
  );

  const maxCount = Math.max(...aggregated.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Application Pipeline</h4>
      <div className="flex items-end gap-1">
        {aggregated.map((stage, i) => (
          <div key={stage.outcome} className="flex items-end gap-1 flex-1">
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-sm font-bold">{stage.count}</span>
              <div
                className={cn(
                  "w-full rounded-t transition-all duration-500",
                  i === 0 && "bg-blue-400",
                  i === 1 && "bg-purple-400",
                  i === 2 && "bg-amber-400",
                  i === 3 && "bg-green-400"
                )}
                style={{ height: `${Math.max((stage.count / maxCount) * 80, 8)}px` }}
              />
              <span className="text-xs text-muted-foreground text-center">
                {OUTCOME_LABELS[stage.outcome]}
              </span>
            </div>
            {i < aggregated.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground mb-5 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ABTracker() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resume/stats");
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch stats");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading A/B tracking data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
        <p className="mt-4 text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.totalTracked === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-4 text-muted-foreground">
          No resume tracking data yet. Send resumes to jobs to start tracking performance.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Resume A/B Tracking</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {data.totalTracked} applications tracked across {data.stats.length} resume versions
        </p>
      </div>

      {data.recommendation && (
        <div className="p-4 border-b">
          <RecommendationBanner recommendation={data.recommendation} />
        </div>
      )}

      <div className="p-4 border-b">
        <OutcomePipeline stats={data.stats} />
      </div>

      <div className="p-4 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Version Performance</h4>
        {data.stats.map((stat) => (
          <VersionStatsCard
            key={stat.resumeId}
            stats={stat}
            isRecommended={data.recommendation?.recommendedResumeId === stat.resumeId}
          />
        ))}
      </div>
    </div>
  );
}
