"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useFormatter } from "next-intl";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Check, ExternalLink, Inbox, Settings } from "lucide-react";
import { ExtensionInstallButtons } from "@/components/marketing/extension-install-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OnboardingEmptyState } from "@/components/ui/empty-states";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types/opportunity";

import { toNullableEpoch } from "@/lib/format/time";
import {
  formatOpportunityPay,
  type CurrencyRateMap,
} from "@/lib/opportunities/pay";
import { getEffectiveBentoLayout } from "@/lib/opportunities/default-bento";
import { BentoGrid } from "@/components/opportunities/bento-grid";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
type QueueAction = "save" | "dismiss" | "apply";

// Sized for the bento ABOUT-THE-ROLE cell (col-span 2, row-span 2).
// 260 chars was the F.1 single-column limit; the wider cell fits ~600
// before the user benefits from the Show more affordance.
const DESCRIPTION_PREVIEW_LENGTH = 600;
const SWIPE_DISTANCE_THRESHOLD = 110;
const SWIPE_VELOCITY_THRESHOLD = 650;
// Bento — desktop card capped at max-w-5xl (1024px) since the grid
// breathes meaningfully wider than the F.1 single-column shape.
// Mobile keeps the narrow swipe deck.
const DESKTOP_MIN_WIDTH = 768;

/**
 * Picks "desktop" or "mobile" via matchMedia. SSR defaults to desktop
 * (typical laptop-first user); post-mount effect swaps to mobile if the
 * viewport is narrow. Also avoids the JSDOM "two trees in DOM" issue
 * the F.1 implementation had — only one device renders at a time.
 */
function useDevice(): "desktop" | "mobile" {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);
    const handle = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);
  return isMobile ? "mobile" : "desktop";
}

function getDeadlineTime(deadline?: string): number {
  if (!deadline) {
    return Number.POSITIVE_INFINITY;
  }

  return toNullableEpoch(deadline) ?? Number.POSITIVE_INFINITY;
}

function getCreatedAtTime(createdAt: string): number {
  return toNullableEpoch(createdAt) ?? 0;
}

export function getPendingOpportunities(jobs: Opportunity[]): Opportunity[] {
  return jobs
    .filter((job) => job.status === "pending")
    .sort((a, b) => {
      const deadlineA = getDeadlineTime(a.deadline);
      const deadlineB = getDeadlineTime(b.deadline);

      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB;
      }

      return getCreatedAtTime(b.createdAt) - getCreatedAtTime(a.createdAt);
    });
}

export function getOpportunityTags(job: Opportunity, limit = 6): string[] {
  // Tag chunk shows only first-class tags. Required skills used to be
  // merged in here, but that polluted the row with multi-sentence
  // bullets like "Be comfortable working in a heavy fabrication
  // environment" rendered as ugly chip-shaped badges. Short skill names
  // (≤ 32 chars, no period) still pass through so a clean skills list
  // ("React", "TypeScript") fills out an otherwise-empty tag row.
  const isShortSkill = (value: string): boolean =>
    value.length > 0 && value.length <= 32 && !/[.!?]/.test(value);
  const tags = [
    ...(job.tags || []),
    ...(job.requiredSkills || []).filter(isShortSkill),
  ]
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, limit);
}

export function getDescriptionPreview(description: string): string {
  if (description.length <= DESCRIPTION_PREVIEW_LENGTH) {
    return description;
  }

  return `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}...`;
}

interface OpportunityReviewQueueProps {
  jobs: Opportunity[];
  updating: boolean;
  onStatusChange: (
    job: Opportunity,
    status: Opportunity["status"],
  ) => Promise<void>;
  onApplyNow: (job: Opportunity) => Promise<void>;
  // Bucket G — when set, the salary line renders the inferred pay in
  // this unit (e.g. "$62k/yr" for a "$30/hr" posting). Defaults to
  // "annual" so the queue ranks the same way the sort comparator does.
  payDisplayUnit?: "hourly" | "monthly" | "annual";
  // Bucket G.1 — the user's preferred display currency + the FX-rate
  // map. When omitted, salary renders in its source currency
  // (back-compat). `currencyRates` is the cached map from the daily
  // /api/cron/currency-rates run.
  payDisplayCurrency?: string;
  currencyRates?: CurrencyRateMap;
  /**
   * Bento layout — user-customisable cell grid. Accepts either the new
   * bento shape, the legacy F.1 section shape (auto-migrated at read
   * time), or null (use defaults). The page wrapper fetches this from
   * /api/preferences/opportunities and passes it through.
   */
  layout?: unknown;
}

export function OpportunityReviewQueue({
  jobs,
  updating,
  onStatusChange,
  onApplyNow,
  payDisplayUnit = "annual",
  payDisplayCurrency,
  currencyRates,
  layout,
}: OpportunityReviewQueueProps) {
  const format = useFormatter();
  const a11yT = useA11yTranslations();
  const [expanded, setExpanded] = useState(false);
  const [activeAction, setActiveAction] = useState<QueueAction | null>(null);
  const queue = useMemo(() => getPendingOpportunities(jobs), [jobs]);
  const activeJob = queue[0];
  const remainingCount = queue.length;
  const bentoLayout = useMemo(() => getEffectiveBentoLayout(layout), [layout]);
  const device = useDevice();

  const runAction = async (action: QueueAction) => {
    if (!activeJob || updating || activeAction) {
      return;
    }

    setActiveAction(action);
    try {
      if (action === "save") {
        await onStatusChange(activeJob, "saved");
      } else if (action === "dismiss") {
        await onStatusChange(activeJob, "dismissed");
      } else if (activeJob.sourceUrl) {
        await onApplyNow(activeJob);
      } else {
        return;
      }
      setExpanded(false);
    } finally {
      setActiveAction(null);
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.offset.y < -SWIPE_DISTANCE_THRESHOLD ||
      info.velocity.y < -SWIPE_VELOCITY_THRESHOLD
    ) {
      void runAction("apply");
      return;
    }

    if (
      info.offset.x > SWIPE_DISTANCE_THRESHOLD ||
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    ) {
      void runAction("save");
      return;
    }

    if (
      info.offset.x < -SWIPE_DISTANCE_THRESHOLD ||
      info.velocity.x < -SWIPE_VELOCITY_THRESHOLD
    ) {
      void runAction("dismiss");
    }
  };

  if (!activeJob) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center px-5">
        <h1 className="sr-only">Review Queue</h1>
        <OnboardingEmptyState
          icon={Inbox}
          illustrationName="opportunities-review-empty"
          title={a11yT("queueCleared")}
          description="New pending opportunities will appear here when Slothing finds roles that need review."
          steps={[
            {
              icon: ExternalLink,
              label: "Open a job",
              description: "Visit roles from a job board or company site.",
            },
            {
              icon: Inbox,
              label: "Review here",
              description: "New captures land in this queue first.",
            },
            {
              icon: Check,
              label: "Save or dismiss",
              description: "Keep the roles worth tracking.",
            },
          ]}
          className="w-full"
          primaryAction={
            <div className="flex flex-col items-center gap-3">
              <Button asChild>
                <Link href="/extension">
                  Install the browser extension to auto-capture jobs
                </Link>
              </Button>
              <ExtensionInstallButtons variant="compact" onlyDetected />
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/opportunities">Open opportunities</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Review settings
                  </Link>
                </Button>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // Pre-compute the legacy salary fallback once per render. RenderChunk
  // for the `salary` chunk consults inferred pay first, but the legacy
  // string in the activeJob object isn't directly readable from the
  // chunk renderer — so it stays in the queue's render scope as a
  // computed value used only when inferred fields are absent.
  const legacySalary =
    activeJob.salaryMin != null || activeJob.salaryMax != null
      ? [activeJob.salaryMin, activeJob.salaryMax]
          .filter((value): value is number => value != null)
          .map((value) =>
            format.number(value, {
              style: "currency",
              currency: activeJob.salaryCurrency ?? "USD",
              maximumFractionDigits: 0,
            }),
          )
          .join(" - ")
      : null;
  // Decide once whether to show the legacy fallback. RenderChunk for
  // `salary` returns null when no normalized pay exists; in that case
  // we want to slot the legacy string into the same chunk position.
  const normalizedPay = formatOpportunityPay(activeJob, payDisplayUnit, {
    targetCurrency: payDisplayCurrency,
    rates: currencyRates,
  });
  const salaryFallback = !normalizedPay && legacySalary ? legacySalary : null;

  const tags = getOpportunityTags(activeJob);
  const preview = expanded
    ? activeJob.summary
    : getDescriptionPreview(activeJob.summary);
  const canApply = Boolean(activeJob.sourceUrl);
  const chunkContext = {
    preview,
    expanded,
    setExpanded,
    tags,
    payDisplayUnit,
    payDisplayCurrency,
    currencyRates,
    onAction: (action: QueueAction) => void runAction(action),
    actionDisabled: updating || Boolean(activeAction),
    canApply,
  };

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 md:pt-10">
      <h1 className="sr-only">Review Queue — {remainingCount} pending</h1>
      {/* Bento card. Desktop uses ~95vw with a generous max so the grid
          fills the screen instead of stranding cream on the sides.
          Mobile keeps the narrow swipe-deck width. */}
      <div className="relative h-[min(640px,80vh)] w-full max-w-md md:h-auto md:w-[min(100%,1600px)] md:max-w-none">
        {queue[1] && (
          <div
            className="absolute inset-x-3 top-5 h-[calc(100%-1.25rem)] rounded-lg border bg-card/50 shadow-sm md:relative md:inset-x-0 md:top-0 md:h-0"
            aria-hidden="true"
          />
        )}
        <AnimatePresence mode="popLayout">
          <motion.article
            key={activeJob.id}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              x:
                activeAction === "save"
                  ? 320
                  : activeAction === "dismiss"
                    ? -320
                    : 0,
              y: activeAction === "apply" ? -360 : 0,
              rotate:
                activeAction === "save"
                  ? 12
                  : activeAction === "dismiss"
                    ? -12
                    : 0,
              transition: { duration: 0.22 },
            }}
            className="absolute inset-0 cursor-grab overflow-hidden rounded-lg border bg-card p-3 shadow-xl active:cursor-grabbing md:relative md:inset-auto md:p-5"
          >
            <BentoGrid
              layout={bentoLayout.desktop}
              mobileExpandedCount={bentoLayout.mobile.expandedCount}
              device={device}
              opportunity={activeJob}
              context={chunkContext}
            />
            {salaryFallback && (
              <p className="mt-3 text-xs text-muted-foreground">
                Listed: {salaryFallback}
              </p>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </main>
  );
}

interface QuickActionLinkLegacyProps {
  label: string;
  icon: ReactNode;
  href: string;
}
// Kept exported for back-compat with any tests that imported the legacy
// helper. New code should use `<RenderChunk chunk="open-original" />`.
export function QuickActionLink({
  label,
  icon,
  href,
}: QuickActionLinkLegacyProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-lg border bg-card text-xs font-medium",
        "transition-colors hover:bg-muted",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}
