"use client";

import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import {
  CompanyGlyph,
  MatchScoreBar,
  StatusPill,
  type StageId,
} from "@/components/editorial";
import { TimeAgo } from "@/components/format/time-ago";
import { cn } from "@/lib/utils";
import type { Opportunity, OpportunityStatus } from "../utils";
import { formatOpportunityLocation, formatOpportunitySalary } from "../utils";

/**
 * Map the legacy OpportunityStatus union onto the editorial StatusPill's
 * StageId vocabulary. The status pill primitive defines six stages
 * (saved | apply | applied | interview | offer | rejected); the legacy
 * enum has eight (pending / expired / dismissed roll into the closest
 * editorial stage).
 */
export function mapStatusToStage(status: OpportunityStatus): StageId {
  switch (status) {
    case "pending":
      return "saved";
    case "saved":
      return "saved";
    case "applied":
      return "applied";
    case "interviewing":
      return "interview";
    case "offer":
      return "offer";
    case "rejected":
    case "expired":
    case "dismissed":
      return "rejected";
    default:
      return "saved";
  }
}

const STATUS_LABEL: Record<OpportunityStatus, string> = {
  pending: "Pending",
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  expired: "Expired",
  dismissed: "Dismissed",
};

interface OpportunityRowProps {
  opportunity: Opportunity;
  onOpen: (opportunity: Opportunity) => void;
  onArchive?: (opportunity: Opportunity) => void;
  /** Visually highlight the row (e.g. when picked as today's AI recommendation). */
  featured?: boolean;
  /** Optional match score 0–100. Renders the horizontal match-score bar when present. */
  matchScore?: number;
  locale?: string;
  className?: string;
}

/**
 * Editorial list-style row for an opportunity. Replaces the legacy
 * `OpportunityRow` table-card with a `bg-paper`/border-rule surface that
 * matches the v2 `.op` design. Click the row to open the detail drawer;
 * a single overflow action exposes archive.
 */
export function OpportunityRow({
  opportunity,
  onOpen,
  onArchive,
  featured = false,
  matchScore,
  className,
}: OpportunityRowProps) {
  const stage = mapStatusToStage(opportunity.status);
  const location = formatOpportunityLocation(opportunity);
  const salary = formatOpportunitySalary(opportunity);
  const showSalary =
    opportunity.salaryMin != null || opportunity.salaryMax != null;
  const postedAt =
    opportunity.scrapedAt ?? opportunity.createdAt ?? opportunity.savedAt;
  const tags = (opportunity.techStack ?? [])
    .concat(opportunity.tags)
    .slice(0, 4);

  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(opportunity);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(opportunity)}
      onKeyDown={handleKey}
      aria-label={`Open ${opportunity.title} at ${opportunity.company}`}
      className={cn(
        "group flex flex-col gap-3 rounded-md border border-rule bg-paper p-[18px] transition-colors hover:border-rule-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
        featured && "border-brand bg-brand-soft/40",
        className,
      )}
      style={{ borderRadius: "var(--r-md)" }}
      data-testid="opportunity-row"
    >
      <div className="flex items-start gap-4">
        <CompanyGlyph
          company={opportunity.company}
          size="lg"
          className="flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-ink-2">
              {opportunity.company}
            </span>
            <StatusPill stage={stage}>
              {STATUS_LABEL[opportunity.status]}
            </StatusPill>
          </div>
          <h3 className="mt-1 font-display text-[16px] font-semibold tracking-tight text-ink">
            {opportunity.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-3">
            <span>{location}</span>
            {showSalary ? (
              <>
                <span aria-hidden="true" className="opacity-50">
                  ·
                </span>
                <span>{salary}</span>
              </>
            ) : null}
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span className="capitalize">{opportunity.source}</span>
            {postedAt ? (
              <>
                <span aria-hidden="true" className="opacity-50">
                  ·
                </span>
                <span>
                  <TimeAgo date={postedAt} />
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div
          className="flex flex-shrink-0 items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpen(opportunity)}
            className="inline-flex h-8 items-center gap-1 rounded-sm border border-rule bg-page px-2 text-[12px] font-medium text-ink-2 transition-colors hover:border-rule-strong hover:text-ink"
            style={{ borderRadius: "var(--r-sm)" }}
            aria-label={`Open details for ${opportunity.title}`}
          >
            Open
            <ArrowUpRight className="h-3 w-3" />
          </button>
          {onArchive ? (
            <button
              type="button"
              onClick={() => onArchive(opportunity)}
              className="grid h-8 w-8 place-items-center rounded-sm border border-rule bg-page text-ink-3 transition-colors hover:border-rule-strong hover:text-ink"
              style={{ borderRadius: "var(--r-sm)" }}
              aria-label={`Archive ${opportunity.title}`}
              title="Archive"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {tags.length > 0 || matchScore != null ? (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-rule-strong-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-ink-2"
            >
              {tag}
            </span>
          ))}
          {matchScore != null ? (
            <div className="ml-auto min-w-[140px] flex-shrink-0">
              <MatchScoreBar value={matchScore} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
