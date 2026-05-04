"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/format/time-ago";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Target,
  Trophy,
  Loader2,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type {
  TimeSeriesData,
  TrendMetrics,
  ActivityEvent,
  TimeRange,
  DataPoint,
} from "@/lib/analytics/time-series";

interface TrendChartsProps {
  initialRange?: TimeRange;
}

interface TrendData {
  range: TimeRange;
  timeSeries: TimeSeriesData;
  trends: TrendMetrics;
  timeline: ActivityEvent[];
}

const rangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

function TrendIndicator({
  trend,
  change,
}: {
  trend: "up" | "down" | "stable";
  change: number;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const colorClass =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-1", colorClass)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">
        {change > 0 ? "+" : ""}
        {change}%
      </span>
    </div>
  );
}

function hasRealData(data: DataPoint[]): boolean {
  return data.some((d) => d.value > 0);
}

function SimpleBarChart({
  data,
  color = "primary",
  height = 120,
}: {
  data: DataPoint[];
  color?: "primary" | "green" | "blue" | "amber";
  height?: number;
}) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const colorClasses = {
    primary: "bg-primary",
    green: "bg-success",
    blue: "bg-info",
    amber: "bg-warning",
  };

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((point, i) => {
        const barHeight = (point.value / maxValue) * 100;

        return (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div
              className={cn(
                "w-full rounded-t transition-all",
                colorClasses[color],
                "hover:opacity-80"
              )}
              style={{ height: `${Math.max(barHeight, 2)}%` }}
              title={`${point.label}: ${point.value}`}
            />
            {i % Math.ceil(data.length / 5) === 0 && (
              <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-full">
                {point.label?.split(" ")[0]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  change,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  trend: "up" | "down" | "stable";
  change: number;
  icon: typeof Activity;
  description?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <TrendIndicator trend={trend} change={change} />
      </div>
      <p className="text-2xl font-bold">{typeof value === "number" ? `${value}%` : value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

function ActivityTimelineItem({ event }: { event: ActivityEvent }) {
  const iconMap = {
    application: Briefcase,
    interview: Calendar,
    offer: Trophy,
    rejection: XCircle,
    status_change: Activity,
  };

  const colorMap = {
    application: "text-info",
    interview: "text-primary",
    offer: "text-success",
    rejection: "text-destructive",
    status_change: "text-warning",
  };

  const Icon = iconMap[event.type];

  return (
    <div className="flex gap-3 py-3">
      <div className={cn("shrink-0", colorMap[event.type])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-sm text-muted-foreground truncate">{event.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <TimeAgo date={event.date} />
        </p>
      </div>
    </div>
  );
}

export function TrendCharts({ initialRange = "30d" }: TrendChartsProps) {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/trends?range=${range}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to fetch trends");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trends");
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [range]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 skeleton rounded" />
          <div className="h-10 w-80 skeleton rounded-lg" />
        </div>
        {/* Skeleton metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 skeleton rounded-lg" />
                <div className="h-5 w-12 skeleton rounded" />
              </div>
              <div className="h-8 w-16 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="h-5 w-40 skeleton rounded mb-4" />
              <div className="h-[120px] skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Trends & Analytics
        </h2>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                range === option.value
                  ? "bg-card shadow-sm font-medium"
                  : "hover:bg-card/50 text-muted-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Application Rate"
          value={data.trends.applicationRate.current}
          trend={data.trends.applicationRate.trend}
          change={data.trends.applicationRate.change}
          icon={Activity}
          description="Applications this period"
        />
        <MetricCard
          title="Response Rate"
          value={data.trends.responseRate.current}
          trend={data.trends.responseRate.trend}
          change={data.trends.responseRate.change}
          icon={CheckCircle2}
          description="Got any response"
        />
        <MetricCard
          title="Interview Rate"
          value={data.trends.interviewRate.current}
          trend={data.trends.interviewRate.trend}
          change={data.trends.interviewRate.change}
          icon={Target}
          description="Got to interview stage"
        />
        <MetricCard
          title="Success Rate"
          value={data.trends.successRate.current}
          trend={data.trends.successRate.trend}
          change={data.trends.successRate.change}
          icon={Trophy}
          description="Received offers"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applications over time */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Applications Over Time
          </h3>
          {hasRealData(data.timeSeries.applications) ? (
            <SimpleBarChart data={data.timeSeries.applications} color="primary" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-[80px] w-full flex items-end justify-around gap-1.5 mb-3 opacity-15">
                {[20, 35, 15, 45, 30, 55, 40].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">No applications yet</p>
            </div>
          )}
        </div>

        {/* Response rate over time */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-info" />
            Responses Over Time
          </h3>
          {hasRealData(data.timeSeries.responses) ? (
            <SimpleBarChart data={data.timeSeries.responses} color="blue" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-[80px] w-full flex items-end justify-around gap-1.5 mb-3 opacity-15">
                {[25, 40, 20, 50, 35, 45, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-info rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">No responses yet</p>
            </div>
          )}
        </div>

        {/* Interviews over time */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            Interviews Over Time
          </h3>
          {hasRealData(data.timeSeries.interviews) ? (
            <SimpleBarChart data={data.timeSeries.interviews} color="amber" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-[80px] w-full flex items-end justify-around gap-1.5 mb-3 opacity-15">
                {[30, 25, 45, 35, 50, 40, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-warning rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">No interviews yet</p>
            </div>
          )}
        </div>

        {/* Offers over time */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-success" />
            Offers Over Time
          </h3>
          {hasRealData(data.timeSeries.offers) ? (
            <SimpleBarChart data={data.timeSeries.offers} color="green" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-[80px] w-full flex items-end justify-around gap-1.5 mb-3 opacity-15">
                {[35, 45, 25, 55, 40, 30, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-success rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">No offers yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Activity
        </h3>
        {data.timeline.length > 0 ? (
          <div className="divide-y max-h-80 overflow-y-auto">
            {data.timeline.map((event) => (
              <ActivityTimelineItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No activity yet. Start by saving some jobs!
          </p>
        )}
      </div>
    </div>
  );
}
