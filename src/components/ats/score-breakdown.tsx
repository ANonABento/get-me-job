"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Sparkles,
  FileText,
  Target,
  LayoutList,
} from "lucide-react";
import type { ATSAnalysisResult, ATSScore, ATSIssue, KeywordAnalysis } from "@/lib/ats/analyzer";

interface ATSScoreBreakdownProps {
  result: ATSAnalysisResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const getColorClass = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: ATSIssue }) {
  const getIcon = () => {
    switch (issue.type) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-info" />;
    }
  };

  const getBgClass = () => {
    switch (issue.type) {
      case "error":
        return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900";
      default:
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900";
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${getBgClass()}`}>
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{issue.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
          <p className="text-xs text-primary mt-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {issue.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

function KeywordBadge({ keyword }: { keyword: KeywordAnalysis }) {
  return (
    <Badge
      variant={keyword.found ? "default" : "secondary"}
      className={`text-xs ${
        keyword.found
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {keyword.found ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
      {keyword.keyword}
      {keyword.found && keyword.frequency > 1 && (
        <span className="ml-1 opacity-70">({keyword.frequency}x)</span>
      )}
    </Badge>
  );
}

export function ATSScoreBreakdown({ result, open, onOpenChange }: ATSScoreBreakdownProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "issues">("overview");
  const { score, issues, keywords, summary, recommendations } = result;

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const foundKeywords = keywords.filter((k) => k.found).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            ATS Compatibility Analysis
          </DialogTitle>
          <DialogDescription>
            Review your score, matched keywords, and resume issues that affect ATS parsing.
          </DialogDescription>
        </DialogHeader>

        {/* Overall Score */}
        <div className="flex items-center justify-center py-4">
          <div className="relative" role="img" aria-label={`ATS score: ${score.overall} out of 100`}>
            <svg className="w-32 h-32 transform -rotate-90" aria-hidden="true">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${(score.overall / 100) * 352} 352`}
                strokeLinecap="round"
                className={
                  score.overall >= 80
                    ? "text-success"
                    : score.overall >= 60
                    ? "text-warning"
                    : "text-destructive"
                }
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score.overall}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-center text-muted-foreground px-4">
          {summary}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mx-4 mt-2">
          {(["overview", "keywords", "issues"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "issues" && (errorCount + warningCount > 0) && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                  {errorCount + warningCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {activeTab === "overview" && (
            <>
              {/* Score Breakdown */}
              <div className="space-y-3 pt-2">
                <ScoreBar label="Keywords Match" score={score.keywords} icon={Target} />
                <ScoreBar label="Content Quality" score={score.content} icon={FileText} />
                <ScoreBar label="Structure" score={score.structure} icon={LayoutList} />
                <ScoreBar label="Formatting" score={score.formatting} icon={ShieldCheck} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-emerald-600">{foundKeywords}</div>
                  <div className="text-xs text-muted-foreground">Keywords Found</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-red-600">{errorCount}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-amber-600">{warningCount}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="pt-2">
                  <h3 className="font-medium text-sm mb-2">Top Recommendations</h3>
                  <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "keywords" && (
            <div className="pt-2 space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Found in Resume ({foundKeywords})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {keywords
                    .filter((k) => k.found)
                    .map((k, i) => (
                      <KeywordBadge key={i} keyword={k} />
                    ))}
                </div>
              </div>

              {keywords.filter((k) => !k.found).length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Missing Keywords ({keywords.filter((k) => !k.found).length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords
                      .filter((k) => !k.found)
                      .map((k, i) => (
                        <KeywordBadge key={i} keyword={k} />
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Consider adding these keywords to your resume where relevant.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "issues" && (
            <div className="pt-2 space-y-3">
              {issues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p>No issues found!</p>
                </div>
              ) : (
                <>
                  {issues
                    .sort((a, b) => {
                      const priority = { error: 0, warning: 1, info: 2 };
                      return priority[a.type] - priority[b.type];
                    })
                    .map((issue, i) => (
                      <IssueCard key={i} issue={issue} />
                    ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact badge for showing ATS score inline
export function ATSScoreBadge({
  score,
  onClick,
}: {
  score: number;
  onClick?: () => void;
}) {
  const getColorClass = () => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (score >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-80 ${getColorClass()}`}
    >
      <ShieldCheck className="h-3 w-3" />
      ATS {score}%
    </button>
  );
}
