"use client";

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";
import type { ATSIssue } from "@/lib/ats/analyzer";

interface FixSuggestionsListProps {
  issues: ATSIssue[];
  maxItems?: number;
}

function getIssueIcon(type: ATSIssue["type"]) {
  switch (type) {
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    default:
      return Info;
  }
}

function getIssueBorder(type: ATSIssue["type"]): string {
  switch (type) {
    case "error":
      return "border-l-red-500";
    case "warning":
      return "border-l-amber-500";
    default:
      return "border-l-blue-500";
  }
}

function getIssueIconColor(type: ATSIssue["type"]): string {
  switch (type) {
    case "error":
      return "text-red-500";
    case "warning":
      return "text-amber-500";
    default:
      return "text-blue-500";
  }
}

export function FixSuggestionsList({ issues, maxItems = 5 }: FixSuggestionsListProps) {
  if (issues.length === 0) return null;

  // Sort: errors first, then warnings, then info
  const sorted = [...issues].sort((a, b) => {
    const priority = { error: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });

  const displayed = sorted.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">How to Fix</h3>
        <span className="text-xs text-muted-foreground">
          ({issues.length} {issues.length === 1 ? "issue" : "issues"} found)
        </span>
      </div>

      <div className="space-y-3">
        {displayed.map((issue, i) => {
          const Icon = getIssueIcon(issue.type);
          return (
            <div
              key={i}
              className={cn(
                "rounded-lg border border-l-4 bg-card p-4",
                getIssueBorder(issue.type)
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", getIssueIconColor(issue.type))} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full capitalize",
                      issue.type === "error" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      issue.type === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      issue.type === "info" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    )}>
                      {issue.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                  <p className="text-sm text-primary mt-2 flex items-start gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {issue.suggestion}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {issues.length > maxItems && (
        <p className="text-sm text-muted-foreground text-center">
          +{issues.length - maxItems} more {issues.length - maxItems === 1 ? "issue" : "issues"} not shown
        </p>
      )}
    </div>
  );
}
