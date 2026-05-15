"use client";

import { Zap } from "lucide-react";
import { nowDate } from "@slothing/shared";
import { Link } from "@/i18n/navigation";
import { pluralize } from "@/lib/text/pluralize";

interface EditorialDashboardHeaderProps {
  title: string;
  subline?: string;
  primaryActionHref?: string;
  primaryActionLabel?: string;
}

/**
 * Editorial page head used at the top of the dashboard.
 * Mirrors the Slothing handoff `.main-head` block: display-font h1, terse
 * sub-line, and an optional "Plan my day" right-aligned action.
 */
export function EditorialDashboardHeader({
  title,
  subline,
  primaryActionHref = "/opportunities/review",
  primaryActionLabel = "Plan my day",
}: EditorialDashboardHeaderProps) {
  return (
    <header
      className="flex flex-col gap-3 px-6 py-7 lg:flex-row lg:items-end lg:justify-between"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      <div className="min-w-0">
        <h1
          className="m-0 truncate"
          style={{
            fontFamily: "var(--display)",
            fontSize: "36px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "var(--ink)",
          }}
        >
          {title}
        </h1>
        {subline ? (
          <p
            className="mt-1 text-[13.5px] leading-snug"
            style={{ color: "var(--ink-3)" }}
          >
            {subline}
          </p>
        ) : null}
      </div>

      <Link
        href={primaryActionHref}
        className="inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-medium transition-colors"
        style={{
          backgroundColor: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--r-md)",
          color: "var(--ink)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--brand)";
          e.currentTarget.style.color = "var(--brand)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--rule)";
          e.currentTarget.style.color = "var(--ink)";
        }}
      >
        <Zap
          className="h-3.5 w-3.5"
          aria-hidden="true"
          style={{ color: "var(--brand)" }}
        />
        <span>{primaryActionLabel}</span>
      </Link>
    </header>
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
