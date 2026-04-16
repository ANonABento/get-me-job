"use client";

import { cn } from "@/lib/utils";
import {
  Target,
  FileText,
  LayoutList,
  ShieldCheck,
} from "lucide-react";
import { scoreToLetterGrade } from "@/lib/ats/analyzer";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";

interface ScoreDisplayProps {
  result: ATSAnalysisResult;
}

const DIMENSIONS = [
  { key: "formatting" as const, label: "Formatting", icon: ShieldCheck, weight: "20%" },
  { key: "structure" as const, label: "Structure", icon: LayoutList, weight: "25%" },
  { key: "content" as const, label: "Content", icon: FileText, weight: "25%" },
  { key: "keywords" as const, label: "Keywords", icon: Target, weight: "30%" },
];

type ScoreLevel = "good" | "fair" | "poor";

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

const SCORE_COLORS: Record<ScoreLevel, { text: string; bar: string; bg: string }> = {
  good: {
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  fair: {
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  poor: {
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
};

function getScoreColor(score: number): string {
  return SCORE_COLORS[getScoreLevel(score)].text;
}

function getBarColor(score: number): string {
  return SCORE_COLORS[getScoreLevel(score)].bar;
}

function getGradeBg(score: number): string {
  return SCORE_COLORS[getScoreLevel(score)].bg;
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { score, summary } = result;
  const grade = scoreToLetterGrade(score.overall);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with grade and overall score */}
      <div className={cn("p-8 text-center", getGradeBg(score.overall))}>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-background shadow-lg mb-4">
          <span className={cn("text-5xl font-bold", getScoreColor(score.overall))}>
            {grade}
          </span>
        </div>
        <div className={cn("text-3xl font-bold mb-1", getScoreColor(score.overall))}>
          {score.overall}/100
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{summary}</p>
      </div>

      {/* Dimension bars */}
      <div className="p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Score Breakdown
        </h3>
        {DIMENSIONS.map(({ key, label, icon: Icon, weight }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
                <span className="text-xs opacity-60">({weight})</span>
              </span>
              <span className={cn("font-semibold", getScoreColor(score[key]))}>
                {score[key]}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", getBarColor(score[key]))}
                style={{ width: `${score[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Top Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords */}
      {result.keywords.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Keyword Analysis
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw) => (
              <span
                key={kw.keyword}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  kw.found
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {kw.found ? "\u2713" : "\u2717"} {kw.keyword}
                {kw.found && kw.frequency > 1 && (
                  <span className="opacity-60 ml-1">({kw.frequency}x)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
