/**
 * Central chunk renderer for the opportunity review card. Spec:
 * docs/opportunity-card-layout-builder-spec.md.
 *
 * `<RenderChunk>` maps a single ChunkKey to its concrete JSX, given a
 * (possibly sample) opportunity + the chunk-specific callbacks the
 * review queue holds (dismiss/save/apply). Returns null when the chunk's
 * underlying data is absent — the layout collapses around it.
 *
 * Both the live review-queue card and the layout-builder preview share
 * this renderer; that's how we guarantee the preview is honest.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Check, ExternalLink, Link2, MapPin, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/opportunities/status-pill";
import { cn } from "@/lib/utils";
import {
  formatOpportunityPay,
  type CurrencyRateMap,
} from "@/lib/opportunities/pay";
import type { Opportunity } from "@/types/opportunity";
import type { ChunkKey } from "./layout-chunks";

const DESCRIPTION_PREVIEW_LENGTH = 260;

export interface RenderChunkContext {
  /** Truncated summary used by the `summary` chunk. */
  preview: string;
  /** Whether the user has "show more" expanded the summary. */
  expanded: boolean;
  setExpanded(next: boolean): void;
  /** Already-deduped, truncated tag list. */
  tags: string[];
  /** Pay-display preferences passed through to the renderer. */
  payDisplayUnit?: "hourly" | "monthly" | "annual";
  payDisplayCurrency?: string;
  currencyRates?: CurrencyRateMap;
  /** Click handlers for the action chunks. */
  onAction?(action: "save" | "dismiss" | "apply"): void;
  /** Disables action buttons while an action is in flight. */
  actionDisabled?: boolean;
  /** Apply button needs a sourceUrl present to do anything. */
  canApply?: boolean;
}

export interface RenderChunkProps {
  chunk: ChunkKey;
  opportunity: Opportunity;
  context: RenderChunkContext;
}

export function RenderChunk({
  chunk,
  opportunity,
  context,
}: RenderChunkProps): ReactNode {
  switch (chunk) {
    case "company":
      return (
        <p className="text-sm font-medium text-primary">
          {opportunity.company}
        </p>
      );

    case "title":
      return (
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {opportunity.title}
        </h2>
      );

    case "status-pill":
      return <StatusPill status={opportunity.status} />;

    case "remote-badge":
      return opportunity.remoteType === "remote" ? (
        <Badge variant="info">Remote</Badge>
      ) : null;

    case "source-badge":
      return opportunity.source === "waterlooworks" ? (
        <Badge variant="outline">WaterlooWorks</Badge>
      ) : null;

    case "applicants":
      return typeof opportunity.applicants === "number" ? (
        <MetaChip
          tone={applicantTone(opportunity.applicants)}
          label={`${opportunity.applicants} applicant${
            opportunity.applicants === 1 ? "" : "s"
          }`}
        />
      ) : null;

    case "openings":
      return typeof opportunity.openings === "number" ? (
        <MetaChip
          label={`${opportunity.openings} opening${
            opportunity.openings === 1 ? "" : "s"
          }`}
        />
      ) : null;

    case "work-term":
      return opportunity.workTerm ? (
        <MetaChip label={opportunity.workTerm} />
      ) : null;

    case "level":
      return opportunity.level ? (
        <MetaChip
          label={
            opportunity.level.charAt(0).toUpperCase() +
            opportunity.level.slice(1)
          }
        />
      ) : null;

    case "applicant-ratio": {
      if (typeof opportunity.applicants !== "number") return null;
      const openings = opportunity.openings ?? 1;
      if (openings <= 0) return null;
      const ratio = opportunity.applicants / openings;
      return (
        <MetaChip
          label={`${ratio.toFixed(1)} per opening`}
          tone={ratio <= 10 ? "good" : ratio <= 50 ? "neutral" : "warn"}
        />
      );
    }

    case "location": {
      const location = [
        opportunity.city,
        opportunity.province,
        opportunity.country,
      ]
        .filter(Boolean)
        .join(", ");
      if (!location) return null;
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {location}
        </span>
      );
    }

    case "salary": {
      const normalized = formatOpportunityPay(
        opportunity,
        context.payDisplayUnit ?? "annual",
        {
          targetCurrency: context.payDisplayCurrency,
          rates: context.currencyRates,
        },
      );
      if (!normalized) return null;
      return (
        <span className="text-sm text-muted-foreground">{normalized}</span>
      );
    }

    case "deadline":
      return opportunity.deadline ? (
        <span className="text-sm text-muted-foreground">
          Deadline {opportunity.deadline}
        </span>
      ) : null;

    case "tags":
      return context.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {context.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null;

    case "summary": {
      const showToggle =
        opportunity.summary.length > DESCRIPTION_PREVIEW_LENGTH;
      return (
        <div>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {context.preview}
          </p>
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 px-0"
              onClick={() => context.setExpanded(!context.expanded)}
            >
              {context.expanded ? "Show less" : "Show more"}
            </Button>
          )}
        </div>
      );
    }

    case "dismiss":
      return (
        <ActionButton
          label="Dismiss"
          icon={<X className="h-4 w-4" />}
          className="text-destructive"
          disabled={context.actionDisabled}
          onClick={() => context.onAction?.("dismiss")}
        />
      );

    case "apply":
      return (
        <ActionButton
          label="Apply"
          icon={<ExternalLink className="h-4 w-4" />}
          disabled={context.actionDisabled || context.canApply === false}
          onClick={() => context.onAction?.("apply")}
        />
      );

    case "save":
      return (
        <ActionButton
          label="Save"
          icon={<Check className="h-4 w-4" />}
          className="text-primary"
          disabled={context.actionDisabled}
          onClick={() => context.onAction?.("save")}
        />
      );

    case "google-company":
      return (
        <QuickActionLink
          label={`Search "${opportunity.company}"`}
          icon={<Search className="h-4 w-4" />}
          href={`https://www.google.com/search?q=${encodeURIComponent(
            opportunity.company,
          )}`}
        />
      );

    case "open-original":
      return opportunity.sourceUrl ? (
        <QuickActionLink
          label="Open original"
          icon={<Link2 className="h-4 w-4" />}
          href={opportunity.sourceUrl}
        />
      ) : null;
  }
}

type ChipTone = "neutral" | "good" | "warn";

/**
 * Maps the applicant count to a chip tone. WaterlooWorks postings under
 * 25 applicants are unusually competitive gems (signal: "apply now"),
 * 26–100 are average, 100+ are noisy/crowded.
 */
function applicantTone(count: number): ChipTone {
  if (count <= 25) return "good";
  if (count <= 100) return "neutral";
  return "warn";
}

function MetaChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: ChipTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
        tone === "good" && "border-primary/30 bg-primary/10 text-primary",
        tone === "warn" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "neutral" && "border-border text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function ActionButton({
  label,
  icon,
  className,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-lg border bg-card text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickActionLink({
  label,
  icon,
  href,
}: {
  label: string;
  icon: ReactNode;
  href: string;
}) {
  // Internal-looking links use next/link for client-side nav; external
  // gets <a target="_blank">. Sourceurl + the google search are both
  // external, so this always renders a plain anchor today. The split is
  // here in case we later add an "open in app" deep link variant.
  const isExternal = /^https?:\/\//i.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 items-center justify-center gap-2 rounded-lg border bg-card text-xs font-medium transition-colors hover:bg-muted"
      >
        {icon}
        <span className="truncate">{label}</span>
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="flex h-10 items-center justify-center gap-2 rounded-lg border bg-card text-xs font-medium transition-colors hover:bg-muted"
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
