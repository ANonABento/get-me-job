"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  TrendingUp,
  Target,
  FileText,
  BarChart3,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { Insight, InsightType, InsightPriority } from "@/lib/resume/insights";

const ICON_MAP: Record<InsightType, React.ElementType> = {
  strongest_skills: Zap,
  missing_keywords: Target,
  ats_trend: TrendingUp,
  resume_performance: FileText,
  quantified_metrics: BarChart3,
  application_momentum: TrendingUp,
  profile_completeness: UserCheck,
};

const PRIORITY_STYLES: Record<InsightPriority, string> = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-success bg-success/5",
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const url = refresh ? "/api/insights?refresh=true" : "/api/insights";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setInsights(data.insights || []);
    } catch {
      // Silently fail - insights are non-critical
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        {!loading && insights.length > 0 && (
          <button
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add more data to your profile and track some jobs to get personalized insights.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = ICON_MAP[insight.type] || Lightbulb;
            const priorityStyle = PRIORITY_STYLES[insight.priority];

            return (
              <div
                key={insight.id}
                className={`rounded-lg border-l-4 p-4 ${priorityStyle}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.actionLabel && insight.actionUrl && (
                      <Link
                        href={insight.actionUrl}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-2"
                      >
                        {insight.actionLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
