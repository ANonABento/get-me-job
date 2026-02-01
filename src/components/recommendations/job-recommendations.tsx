"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ExternalLink,
  Star,
} from "lucide-react";
import type { RecommendationResult, JobRecommendation, SkillMatch } from "@/lib/recommendations/job-matcher";

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? "stroke-green-500"
      : score >= 50
      ? "stroke-amber-500"
      : "stroke-red-400";

  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          className="stroke-muted"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", color)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{score}</span>
      </div>
    </div>
  );
}

function SkillMatchBadge({ match }: { match: SkillMatch }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
        match.matched
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : match.relevance === "high"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      {match.matched ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {match.skill}
    </span>
  );
}

function RecommendationCard({ recommendation }: { recommendation: JobRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const { job, score, skillMatches, skillGaps, matchExplanation, reasons } = recommendation;

  const highRelevanceSkills = skillMatches.filter((m) => m.relevance === "high");
  const mediumRelevanceSkills = skillMatches.filter((m) => m.relevance === "medium");

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              {score >= 70 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                  <Star className="h-3 w-3" />
                  Strong Match
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{matchExplanation}</p>
          </div>
        </div>

        {/* Quick reasons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {reasons.slice(0, 2).map((reason, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View Details
          </>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t space-y-4">
          {/* Skills breakdown */}
          <div className="pt-4">
            {highRelevanceSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Core Skills Required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {highRelevanceSkills.map((match, i) => (
                    <SkillMatchBadge key={i} match={match} />
                  ))}
                </div>
              </div>
            )}

            {mediumRelevanceSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Additional Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mediumRelevanceSkills.map((match, i) => (
                    <SkillMatchBadge key={i} match={match} />
                  ))}
                </div>
              </div>
            )}

            {skillGaps.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3" />
                  Skills to Develop
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  {skillGaps.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs?id=${job.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              <Briefcase className="h-4 w-4" />
              View Job
            </Link>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                Apply
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function JobRecommendations() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const res = await fetch("/api/recommendations?limit=10");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch recommendations");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Analyzing your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!result || result.recommendations.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No jobs to recommend yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Save some jobs to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Job Recommendations</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {result.recommendations.length} matches found
        </span>
      </div>

      {/* Insights */}
      {result.insights.length > 0 && (
        <div className="space-y-2">
          {result.insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skill gaps summary */}
      {result.topSkillGaps.length > 0 && (
        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Top Skills to Develop</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.topSkillGaps.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-lg bg-card border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <div className="space-y-4">
        {result.recommendations.map((rec, i) => (
          <RecommendationCard key={rec.job.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
