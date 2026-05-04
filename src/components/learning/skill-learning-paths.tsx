"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
import {
  GraduationCap,
  Clock,
  Target,
  TrendingUp,
  Book,
  Video,
  FileText,
  Code,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lightbulb,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type {
  LearningPathResult,
  SkillLearningPath,
  LearningResource,
} from "@/lib/learning/skill-paths";

const resourceTypeIcons = {
  course: Video,
  tutorial: Code,
  documentation: FileText,
  book: Book,
  project: Code,
  certification: Award,
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

const levelColors = {
  none: "bg-muted",
  beginner: "bg-success",
  intermediate: "bg-warning",
  advanced: "bg-destructive",
  expert: "bg-primary",
};

function ProgressBar({
  currentLevel,
  targetLevel,
}: {
  currentLevel: string;
  targetLevel: string;
}) {
  const levels = ["none", "beginner", "intermediate", "advanced", "expert"];
  const currentIndex = levels.indexOf(currentLevel);
  const targetIndex = levels.indexOf(targetLevel);
  const progress = currentIndex > 0 ? (currentIndex / targetIndex) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="capitalize">{currentLevel === "none" ? "Not started" : currentLevel}</span>
        <span className="capitalize">{targetLevel}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: LearningResource }) {
  const Icon = resourceTypeIcons[resource.type] || FileText;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{resource.title}</p>
            {resource.platform && (
              <p className="text-xs text-muted-foreground">{resource.platform}</p>
            )}
          </div>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted rounded"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {resource.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {resource.duration}
            </span>
          )}
          <span
            className={cn(
              "px-1.5 py-0.5 text-xs rounded capitalize",
              resource.difficulty === "beginner" && "bg-success/10 text-success",
              resource.difficulty === "intermediate" && "bg-warning/10 text-warning",
              resource.difficulty === "advanced" && "bg-destructive/10 text-destructive"
            )}
          >
            {resource.difficulty}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 text-xs rounded",
              resource.free
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {resource.free ? "Free" : "Paid"}
          </span>
        </div>
      </div>
    </div>
  );
}

function LearningPathCard({ path }: { path: SkillLearningPath }) {
  const [expanded, setExpanded] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState<Set<number>>(new Set());

  const toggleMilestone = (index: number) => {
    setCompletedMilestones(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{path.skill}</h3>
              <p className="text-xs text-muted-foreground">
                {pluralize(path.jobsRequiring, "job")} require this skill
              </p>
            </div>
          </div>
          <span className={cn("px-2 py-0.5 text-xs rounded font-medium capitalize", priorityColors[path.priority])}>
            {path.priority} priority
          </span>
        </div>

        <ProgressBar currentLevel={path.currentLevel} targetLevel={path.targetLevel} />

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~{path.estimatedWeeks} weeks
          </span>
          <span className="flex items-center gap-1">
            <Book className="h-4 w-4" />
            {path.resources.length} resources
          </span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View Learning Path
          </>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t space-y-4">
          {/* Milestones */}
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Learning Milestones
            </h4>
            <div className="space-y-2">
              {path.milestones.map((milestone, i) => (
                <button
                  key={i}
                  onClick={() => toggleMilestone(i)}
                  className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  {completedMilestones.has(i) ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      completedMilestones.has(i) && "line-through text-muted-foreground"
                    )}
                  >
                    {milestone}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Book className="h-4 w-4 text-primary" />
              Recommended Resources
            </h4>
            <div className="space-y-2">
              {path.resources.map((resource, i) => (
                <ResourceCard key={i} resource={resource} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillLearningPaths() {
  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaths() {
      try {
        setLoading(true);
        const res = await fetch("/api/learning/paths?limit=5");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch learning paths");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load learning paths");
      } finally {
        setLoading(false);
      }
    }

    fetchPaths();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 skeleton rounded" />
            <div className="h-6 w-44 skeleton rounded" />
          </div>
          <div className="h-5 w-28 skeleton rounded" />
        </div>

        {/* Insights skeleton */}
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="h-4 w-4 skeleton rounded shrink-0 mt-0.5" />
              <div className="flex-1 h-4 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Quick wins / Strategic skills skeleton */}
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 skeleton rounded" />
                <div className="h-4 w-24 skeleton rounded" />
              </div>
              <div className="h-4 w-full skeleton rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-16 skeleton rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Learning path cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 skeleton rounded-lg" />
                    <div>
                      <div className="h-5 w-32 skeleton rounded mb-1" />
                      <div className="h-3 w-24 skeleton rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-20 skeleton rounded" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 skeleton rounded" />
                    <div className="h-3 w-16 skeleton rounded" />
                  </div>
                  <div className="h-2 skeleton rounded-full" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-4 w-20 skeleton rounded" />
                  <div className="h-4 w-24 skeleton rounded" />
                </div>
              </div>
              <div className="px-4 py-2 border-t">
                <div className="h-4 w-28 skeleton rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!result || result.paths.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No skill gaps identified.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your profile matches well with saved jobs!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Skill Learning Paths</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          ~{result.totalEstimatedWeeks} weeks total
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

      {/* Quick wins and strategic skills */}
      <div className="grid md:grid-cols-2 gap-4">
        {result.quickWins.length > 0 && (
          <div className="p-4 rounded-xl border bg-success/5">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-success" />
              Quick Wins
            </h3>
            <p className="text-sm text-muted-foreground">
              Learn these fast for immediate impact:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.quickWins.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-lg bg-success/10 text-success"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.strategicSkills.length > 0 && (
          <div className="p-4 rounded-xl border bg-info/5">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-info" />
              Strategic Focus
            </h3>
            <p className="text-sm text-muted-foreground">
              Core skills for your target roles:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.strategicSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-lg bg-info/10 text-info"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning paths */}
      <div className="space-y-4">
        {result.paths.map((path, i) => (
          <LearningPathCard key={i} path={path} />
        ))}
      </div>
    </div>
  );
}
