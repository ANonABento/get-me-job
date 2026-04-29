"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GapItem } from "@/lib/tailor/analyze";

export const SCORE_STRONG = 70;
export const SCORE_MODERATE = 40;

interface GapAnalysisProps {
  gaps: GapItem[];
  keywordsFound: string[];
  keywordsMissing: string[];
  matchScore: number;
}

function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const color =
    score >= SCORE_STRONG
      ? "text-success"
      : score >= SCORE_MODERATE
      ? "text-warning"
      : "text-destructive";

  const bgColor =
    score >= SCORE_STRONG
      ? "stroke-emerald-500/15"
      : score >= SCORE_MODERATE
      ? "stroke-amber-500/15"
      : "stroke-red-500/15";

  const label =
    score >= SCORE_STRONG
      ? "Strong match"
      : score >= SCORE_MODERATE
      ? "Moderate match"
      : "Needs work";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, "transition-all duration-700 ease-out")}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={cn("text-3xl font-bold", color)}>{score}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function GapAnalysis({
  gaps,
  keywordsFound,
  keywordsMissing,
  matchScore,
}: GapAnalysisProps) {
  const topFound = keywordsFound.slice(0, 12);
  const topMissing = keywordsMissing.slice(0, 12);
  const remainingFound = keywordsFound.length - topFound.length;
  const remainingMissing = keywordsMissing.length - topMissing.length;

  return (
    <div className="space-y-4">
      {/* Score ring + summary */}
      <div className="flex items-center gap-6 py-2">
        <div className="relative flex-shrink-0">
          <ScoreRing score={matchScore} />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{keywordsFound.length}</span> of{" "}
            <span className="font-semibold text-foreground">{keywordsFound.length + keywordsMissing.length}</span>{" "}
            keywords matched
          </p>
          {keywordsMissing.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Add missing keywords to improve your score
            </p>
          )}
        </div>
      </div>

      {/* Section 1: Matched Keywords */}
      {topFound.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Matched Keywords
              <span className="ml-auto text-xs font-normal text-success bg-success/10 px-2 py-0.5 rounded-full">
                {keywordsFound.length} found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {topFound.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs"
                >
                  {kw}
                </span>
              ))}
              {remainingFound > 0 && (
                <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">
                  +{remainingFound} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Missing Keywords */}
      {topMissing.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Missing Keywords
              <span className="ml-auto text-xs font-normal text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                {keywordsMissing.length} missing
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {topMissing.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs flex items-center gap-1"
                >
                  {kw}
                  <MapPin className="h-2.5 w-2.5 opacity-60" />
                </span>
              ))}
              {remainingMissing > 0 && (
                <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">
                  +{remainingMissing} more
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Try adding these keywords to your resume&apos;s Skills or Experience sections
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section 3: AI Improvement Suggestions */}
      {gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-info" />
              Improvement Suggestions
              <span className="ml-auto text-xs font-normal text-info bg-info/10 px-2 py-0.5 rounded-full">
                {gaps.length} tips
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-info" />
                  <div>
                    <p>{gap.suggestion}</p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {gap.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/bank"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Upload more documents to improve your bank
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { ScoreRing };
