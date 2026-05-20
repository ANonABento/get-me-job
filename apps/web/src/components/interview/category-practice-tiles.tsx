"use client";

import { TimeAgo } from "@/components/format/time-ago";
import { categoryColors } from "@/lib/interview/category-display";
import { pluralize } from "@/lib/text/pluralize";
import { ArrowRight } from "lucide-react";
import type { SessionQuestionCategory } from "@/lib/constants";
import type { PastSession } from "@/types/interview";

const TILE_COPY: Record<
  SessionQuestionCategory,
  { title: string; description: string }
> = {
  behavioral: {
    title: "Behavioral",
    description: "Turn past work into concise STAR stories with clear stakes.",
  },
  technical: {
    title: "Technical",
    description:
      "Explain trade-offs, debugging choices, and engineering judgment.",
  },
  situational: {
    title: "Situational",
    description: "Practice calm responses for ambiguous workplace scenarios.",
  },
  "cultural-fit": {
    title: "Cultural Fit",
    description: "Sharpen answers about values, collaboration, and trust.",
  },
  general: {
    title: "General",
    description: "Build confidence with broad interview openers.",
  },
};

const FEATURED_CATEGORIES: SessionQuestionCategory[] = [
  "behavioral",
  "technical",
  "situational",
];

interface CategoryPracticeTilesProps {
  pastSessions: PastSession[];
  onStartQuickPractice: (category: SessionQuestionCategory) => void;
}

export function CategoryPracticeTiles({
  pastSessions,
  onStartQuickPractice,
}: CategoryPracticeTilesProps) {
  return (
    <section aria-label="Quick practice categories" className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Quick practice
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Pick the muscle you want to train
          </h3>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Start without attaching a saved role. Your answers and follow-ups are
          still saved to session history.
        </p>
      </div>
      <div className="grid gap-3 text-left md:grid-cols-[1.2fr_1fr_1fr]">
        {FEATURED_CATEGORIES.map((category) => {
          const style = categoryColors[category];
          const sessions = pastSessions.filter(
            (session) => session.category === category,
          );
          const latest = sessions[0];

          return (
            <button
              type="button"
              key={category}
              onClick={() => onStartQuickPractice(category)}
              className="group flex min-h-40 flex-col rounded-lg border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring active:translate-y-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.bg} ${style.text} transition-transform group-hover:scale-105`}
                >
                  {style.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <h4 className="mt-4 font-semibold">
                {TILE_COPY[category].title}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {TILE_COPY[category].description}
              </p>
              <p className="mt-auto pt-5 text-xs font-medium text-muted-foreground">
                {sessions.length > 0 ? (
                  <>
                    {pluralize(sessions.length, "session")} saved, last{" "}
                    <TimeAgo date={latest.startedAt} />
                  </>
                ) : (
                  "No sessions yet. Start a clean run."
                )}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
