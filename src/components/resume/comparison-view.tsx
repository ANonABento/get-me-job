"use client";

import { useState, useEffect } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  GitCompare,
  Plus,
  Minus,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";
import type { ResumeComparison, DiffItem, VersionInfo } from "@/lib/resume/compare";
import type { TailoredResume } from "@/lib/resume/generator";

interface ComparisonViewProps {
  beforeId: string;
  afterId: string;
  onClose?: () => void;
}

interface ComparisonData {
  comparison: ResumeComparison;
  before: {
    id: string;
    createdAt: string;
    matchScore?: number;
    content: TailoredResume;
  };
  after: {
    id: string;
    createdAt: string;
    matchScore?: number;
    content: TailoredResume;
  };
}

function DiffBadge({ type }: { type: DiffItem["type"] }) {
  const config = {
    added: { icon: Plus, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
    removed: { icon: Minus, bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
    changed: { icon: RefreshCw, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    unchanged: { icon: FileText, bg: "bg-muted", text: "text-muted-foreground" },
  };

  const { icon: Icon, bg, text } = config[type];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", bg, text)}>
      <Icon className="h-3 w-3" />
      {type}
    </span>
  );
}

function DiffItemRow({ diff }: { diff: DiffItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <DiffBadge type={diff.type} />
          <span className="text-sm font-medium">{diff.label}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {diff.oldValue && (
            <div className={cn(
              "p-3 rounded-lg",
              diff.type === "removed" ? "bg-red-50 dark:bg-red-900/20" : "bg-muted/50"
            )}>
              <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
              <p className="text-sm whitespace-pre-wrap">{diff.oldValue}</p>
            </div>
          )}
          {diff.newValue && (
            <div className={cn(
              "p-3 rounded-lg",
              diff.type === "added" ? "bg-green-50 dark:bg-green-900/20" : "bg-muted/50"
            )}>
              <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
              <p className="text-sm whitespace-pre-wrap">{diff.newValue}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreChangeIndicator({
  scoreChange,
}: {
  scoreChange: NonNullable<ResumeComparison["matchScoreChange"]>;
}) {
  const isPositive = scoreChange.change > 0;
  const isNegative = scoreChange.change < 0;

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg",
      isPositive && "bg-green-100 dark:bg-green-900/30",
      isNegative && "bg-red-100 dark:bg-red-900/30",
      !isPositive && !isNegative && "bg-muted"
    )}>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Before</p>
        <p className="text-2xl font-bold">{scoreChange.before}%</p>
      </div>

      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
        ) : isNegative ? (
          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
        ) : (
          <RefreshCw className="h-6 w-6 text-muted-foreground" />
        )}
        <span className={cn(
          "text-lg font-bold",
          isPositive && "text-green-600 dark:text-green-400",
          isNegative && "text-red-600 dark:text-red-400"
        )}>
          {isPositive ? "+" : ""}{scoreChange.change}%
        </span>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">After</p>
        <p className="text-2xl font-bold">{scoreChange.after}%</p>
      </div>
    </div>
  );
}

export function ComparisonView({ beforeId, afterId, onClose }: ComparisonViewProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparison() {
      try {
        setLoading(true);
        const res = await fetch("/api/resumes/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beforeId, afterId }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to compare resumes");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Comparison failed");
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [beforeId, afterId]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Comparing resumes...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-red-500">{error || "Failed to load comparison"}</p>
      </div>
    );
  }

  const { comparison, before, after } = data;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Resume Comparison</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          )}
        </div>

        {/* Version info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex-1 p-3 rounded-lg bg-card border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Before</span>
            </div>
            <p className="font-medium">{formatRelativeTime(before.createdAt)}</p>
            {before.matchScore && (
              <p className="text-xs text-muted-foreground">Score: {before.matchScore}%</p>
            )}
          </div>
          <div className="flex-1 p-3 rounded-lg bg-card border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>After</span>
            </div>
            <p className="font-medium">{formatRelativeTime(after.createdAt)}</p>
            {after.matchScore && (
              <p className="text-xs text-muted-foreground">Score: {after.matchScore}%</p>
            )}
          </div>
        </div>
      </div>

      {/* Match score change */}
      {comparison.matchScoreChange && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Match Score Change</h4>
          <ScoreChangeIndicator scoreChange={comparison.matchScoreChange} />
        </div>
      )}

      {/* Summary stats */}
      <div className="p-4 border-b grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {comparison.summary.additions}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">Additions</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">
            {comparison.summary.removals}
          </p>
          <p className="text-xs text-red-600 dark:text-red-500">Removals</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {comparison.summary.modifications}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Changes</p>
        </div>
      </div>

      {/* Diff list */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {comparison.diffs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No differences found between these versions.
          </p>
        ) : (
          comparison.diffs.map((diff, i) => <DiffItemRow key={i} diff={diff} />)
        )}
      </div>
    </div>
  );
}

interface VersionTimelineProps {
  versions: VersionInfo[];
  selectedVersions: [string | null, string | null];
  onSelectVersion: (id: string, position: "before" | "after") => void;
}

export function VersionTimeline({
  versions,
  selectedVersions,
  onSelectVersion,
}: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No resume versions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((version, index) => {
        const isBeforeSelected = selectedVersions[0] === version.id;
        const isAfterSelected = selectedVersions[1] === version.id;

        return (
          <div
            key={version.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg border transition-colors",
              (isBeforeSelected || isAfterSelected) && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {index + 1}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">
                {version.jobTitle ? `${version.jobTitle} at ${version.jobCompany}` : "Resume"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(version.createdAt)}
                {version.matchScore && ` • ${version.matchScore}% match`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectVersion(version.id, "before")}
                className={cn(
                  "px-2 py-1 text-xs rounded border",
                  isBeforeSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                Before
              </button>
              <button
                onClick={() => onSelectVersion(version.id, "after")}
                className={cn(
                  "px-2 py-1 text-xs rounded border",
                  isAfterSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                After
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
