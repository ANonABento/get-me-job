"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Loader2,
  Target,
  FileText,
  Sparkles,
  Layout,
} from "lucide-react";
import type { ATSAnalysisResult, ATSIssue, KeywordAnalysis } from "@/lib/ats/analyzer";

interface ATSScoreCardProps {
  jobId?: string;
  onAnalyze?: (result: ATSAnalysisResult) => void;
}

const scoreColors = {
  excellent: "text-success",
  good: "text-info",
  fair: "text-warning",
  poor: "text-destructive",
};

const scoreBgColors = {
  excellent: "bg-success/10",
  good: "bg-info/10",
  fair: "bg-warning/10",
  poor: "bg-destructive/10",
};

function getScoreLevel(score: number): keyof typeof scoreColors {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const level = getScoreLevel(score);
  const radius = size === "lg" ? 45 : 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative", size === "lg" ? "w-32 h-32" : "w-12 h-12")}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          strokeWidth={size === "lg" ? 8 : 4}
          className="stroke-muted"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          strokeWidth={size === "lg" ? 8 : 4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            level === "excellent" && "stroke-green-500",
            level === "good" && "stroke-blue-500",
            level === "fair" && "stroke-amber-500",
            level === "poor" && "stroke-red-500"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "font-bold",
          size === "lg" ? "text-3xl" : "text-sm",
          scoreColors[level]
        )}>
          {score}
        </span>
      </div>
    </div>
  );
}

function IssueItem({ issue }: { issue: ATSIssue }) {
  const Icon = issue.type === "error" ? AlertCircle : issue.type === "warning" ? AlertTriangle : Info;
  const colorClass = issue.type === "error"
    ? "text-destructive"
    : issue.type === "warning"
    ? "text-warning"
    : "text-info";

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", colorClass)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{issue.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{issue.description}</p>
        <p className="text-sm text-primary mt-1">💡 {issue.suggestion}</p>
      </div>
    </div>
  );
}

function KeywordItem({ keyword }: { keyword: KeywordAnalysis }) {
  return (
    <div
      className={cn(
        "px-2.5 py-1.5 rounded-lg text-sm flex items-center gap-1.5",
        keyword.found
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {keyword.found ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" />
      )}
      <span>{keyword.keyword}</span>
      {keyword.found && keyword.frequency > 1 && (
        <span className="text-xs opacity-70">×{keyword.frequency}</span>
      )}
    </div>
  );
}

export function ATSScoreCard({ jobId, onAnalyze }: ATSScoreCardProps) {
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      onAnalyze?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="text-center">
          <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">ATS Compatibility Check</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Analyze your resume for Applicant Tracking System compatibility
            {jobId && " and keyword matching with this job"}.
          </p>
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const level = getScoreLevel(result.score.overall);
  const errorCount = result.issues.filter((i) => i.type === "error").length;
  const warningCount = result.issues.filter((i) => i.type === "warning").length;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with overall score */}
      <div className={cn("p-6", scoreBgColors[level])}>
        <div className="flex items-center gap-6">
          <ScoreCircle score={result.score.overall} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">ATS Compatibility Score</h3>
            <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
            <div className="flex items-center gap-4 text-sm">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {pluralize(errorCount, "error")}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {pluralize(warningCount, "warning")}
                </span>
              )}
              {errorCount === 0 && warningCount === 0 && (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  No issues found
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category scores */}
      <div className="p-4 border-b grid grid-cols-4 gap-4">
        {[
          { key: "keywords", label: "Keywords", icon: Target },
          { key: "structure", label: "Structure", icon: Layout },
          { key: "content", label: "Content", icon: FileText },
          { key: "formatting", label: "Format", icon: Sparkles },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="text-center">
            <div className="flex justify-center mb-2">
              <ScoreCircle score={result.score[key as keyof typeof result.score]} size="sm" />
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        {showDetails ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Show Details
          </>
        )}
      </button>

      {showDetails && (
        <div className="p-4 space-y-6 border-t">
          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Top Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-medium">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Keyword Analysis
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw) => (
                  <KeywordItem key={kw.keyword} keyword={kw} />
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Issues Found
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <IssueItem key={i} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {/* Re-analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2 rounded-lg border text-sm font-medium hover:bg-muted/50 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Re-analyze"}
          </button>
        </div>
      )}
    </div>
  );
}
