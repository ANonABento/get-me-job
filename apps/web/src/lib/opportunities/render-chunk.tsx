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
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/opportunities/status-pill";
import { cn } from "@/lib/utils";
import {
  formatOpportunityPay,
  type CurrencyRateMap,
} from "@/lib/opportunities/pay";
import { pluralize } from "@/lib/text/pluralize";
import type { Opportunity } from "@/types/opportunity";
import type { ChunkKey } from "./layout-chunks";

// Keep in sync with review-queue.tsx — the queue truncates `preview`
// before passing into context, but this constant gates the show-more
// affordance inside the summary chunk.
const DESCRIPTION_PREVIEW_LENGTH = 600;

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
      // audit/12: was text-3xl md:text-4xl (30/36px). On a 390px-wide
      // review deck the 3xl wraps a typical "Senior Frontend Engineer"
      // to 2 lines and eats vertical density when scanning a queue.
      // Drop mobile to text-2xl (24px); desktop md:text-4xl unchanged.
      return (
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight md:text-4xl">
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
      // audit/18: use the canonical pluralize helper (CLAUDE.md rule)
      // instead of inline ternary. Same output, central rule.
      return typeof opportunity.applicants === "number" ? (
        <MetaChip
          tone={applicantTone(opportunity.applicants)}
          label={pluralize(opportunity.applicants, "applicant")}
        />
      ) : null;

    case "openings":
      return typeof opportunity.openings === "number" ? (
        <MetaChip label={pluralize(opportunity.openings, "opening")} />
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

    case "deadline": {
      if (!opportunity.deadline) return null;
      // audit/09: scraper-side data often carries a trailing time
      // ("May 19, 2026 9:00 AM"). For card display, the date alone is
      // enough — strip ` H:MM[:SS][ AM/PM]` from the end. The original
      // string is still in the DB for callers that want hour-precision.
      const display = opportunity.deadline.replace(
        /\s+\d{1,2}:\d{2}(:\d{2})?(\s*[AP]M)?$/i,
        "",
      );
      return (
        <span className="text-sm text-muted-foreground">
          Deadline {display}
        </span>
      );
    }

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
              className="mt-3 gap-1.5 px-0 text-primary hover:text-primary"
              onClick={() => context.setExpanded(!context.expanded)}
            >
              {context.expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show more
                </>
              )}
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
          // audit/06: Apply is THE goal of the review queue. Promote
          // it to a primary CTA (filled brand) so it stands above the
          // outline-styled Dismiss/Save siblings. The swipe gesture
          // (up = apply) is implicit; the button is the explicit path.
          className="border-primary bg-primary text-primary-foreground hover:bg-primary/90"
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

    case "google-company": {
      // audit/15: long company names like "Chemetics Inc (A Worley
      // Company)" produce a wordy quoted label that visually competes
      // with the actual content. Trim parenthetical parent-company
      // qualifiers from the *displayed* label only; the search URL
      // still uses the full string so the result quality doesn't
      // suffer.
      const trimmedLabel = opportunity.company.replace(/\s*\(.*\)\s*$/, "");
      return (
        <QuickActionLink
          label={`Search "${trimmedLabel}"`}
          icon={<Search className="h-4 w-4" />}
          href={`https://www.google.com/search?q=${encodeURIComponent(
            opportunity.company,
          )}`}
        />
      );
    }

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
