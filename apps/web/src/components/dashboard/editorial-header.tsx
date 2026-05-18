"use client";

import { Zap } from "lucide-react";
import { nowDate } from "@slothing/shared";
import { Link } from "@/i18n/navigation";
import { pluralize } from "@/lib/text/pluralize";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-layout";

interface EditorialDashboardHeaderProps {
  title: string;
  subline?: string;
  primaryActionHref?: string;
  primaryActionLabel?: string;
}

/**
 * Editorial page head used at the top of the dashboard.
 * Uses the shared compact app-page header while preserving the dashboard's
 * date / queue meta and "Plan my day" action.
 */
export function EditorialDashboardHeader({
  title,
  subline,
  primaryActionHref = "/opportunities/review",
  primaryActionLabel = "Plan my day",
}: EditorialDashboardHeaderProps) {
  return (
    <PageHeader
      icon={Zap}
      title={title}
      variant="compact"
      meta={subline ? <span>· {subline}</span> : null}
      actions={
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={primaryActionHref}>
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{primaryActionLabel}</span>
          </Link>
        </Button>
      }
    />
  );
}

/**
 * Build the date sub-line used under the "Today" h1. Falls back to a less
 * informative version if no stats are available yet.
 */
export function buildDashboardSubline({
  queueCount,
  interviewsThisWeek,
  date = nowDate(),
  locale = "en-US",
}: {
  queueCount?: number;
  interviewsThisWeek?: number;
  date?: Date;
  locale?: string;
}): string {
  const parts: string[] = [
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date),
  ];
  if (queueCount !== undefined) {
    parts.push(`${pluralize(queueCount, "job")} in queue`);
  }
  if (interviewsThisWeek !== undefined && interviewsThisWeek > 0) {
    parts.push(`${pluralize(interviewsThisWeek, "interview")} this week`);
  }
  return parts.join(" · ");
}
