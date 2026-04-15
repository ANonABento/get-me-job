"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GapItem } from "@/lib/tailor/analyze";

interface GapAnalysisProps {
  gaps: GapItem[];
  keywordsFound: string[];
  keywordsMissing: string[];
  matchScore: number;
}

export function GapAnalysis({
  gaps,
  keywordsFound,
  keywordsMissing,
  matchScore,
}: GapAnalysisProps) {
  const topFound = keywordsFound.slice(0, 12);
  const topMissing = keywordsMissing.slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Keywords overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Keywords Analysis
            <span
              className={cn(
                "ml-auto text-xs font-normal px-2 py-0.5 rounded-full",
                matchScore >= 70
                  ? "bg-emerald-500/10 text-emerald-600"
                  : matchScore >= 40
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-red-500/10 text-red-600"
              )}
            >
              {keywordsFound.length} / {keywordsFound.length + keywordsMissing.length} keywords matched
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topFound.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Matched
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topFound.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topMissing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Missing
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topMissing.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 text-xs"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap suggestions */}
      {gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
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
              href="/upload"
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
