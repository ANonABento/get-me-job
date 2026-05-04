"use client";

import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/text/pluralize";
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

const ISSUE_STYLES: Record<
  ATSIssue["type"],
  { icon: typeof AlertCircle; border: string; iconColor: string; badge: string }
> = {
  error: {
    icon: AlertCircle,
    border: "border-l-red-500",
    iconColor: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-amber-500",
    iconColor: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  info: {
    icon: Info,
    border: "border-l-blue-500",
    iconColor: "text-info",
    badge: "bg-info/10 text-info",
  },
};

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
          ({pluralize(issues.length, "issue")} found)
        </span>
      </div>

      <div className="space-y-3">
        {displayed.map((issue, i) => {
          const { icon: Icon, border, iconColor, badge } = ISSUE_STYLES[issue.type];
          return (
            <div
              key={i}
              className={cn("rounded-lg border border-l-4 bg-card p-4", border)}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full capitalize", badge)}>
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
          +{pluralize(issues.length - maxItems, "more issue")} not shown
        </p>
      )}
    </div>
  );
}
