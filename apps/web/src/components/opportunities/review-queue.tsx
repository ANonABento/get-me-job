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
import {
  DEFAULT_LAYOUT,
  getEffectiveLayout,
  getEnabledBySection,
} from "@/lib/opportunities/default-layout";
import type {
  ChunkKey,
  LayoutPreference,
} from "@/lib/opportunities/layout-chunks";
import { RenderChunk } from "@/lib/opportunities/render-chunk";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";
type QueueAction = "save" | "dismiss" | "apply";

const DESCRIPTION_PREVIEW_LENGTH = 260;
const SWIPE_DISTANCE_THRESHOLD = 110;
const SWIPE_VELOCITY_THRESHOLD = 650;
// Tailwind's `md` breakpoint is 768px; we use the same crossover for the
// layout-spec picker so a 700px-wide window doesn't get the desktop spec
// while the CSS still renders mobile-style.
const DESKTOP_MIN_WIDTH = 768;

// Chunks that render as primary action buttons (3-column footer).
const PRIMARY_ACTIONS: readonly ChunkKey[] = [
  "dismiss",
  "apply",
  "save",
] as const;
const PRIMARY_ACTION_SET = new Set<ChunkKey>(PRIMARY_ACTIONS);

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

/**
 * Pick `layout.desktop` or `layout.mobile` based on the viewport. SSR
 * defaults to desktop so the first paint matches the typical
 * use-from-laptop case; the post-mount effect swaps to mobile if the
 * window is narrow.
 */
function useDeviceLayout(layout: LayoutPreference) {
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
  return isMobile ? layout.mobile : layout.desktop;
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
  // F.1 — user-customisable chunk layout. When omitted, falls back to
  // `DEFAULT_LAYOUT`. The page wrapper fetches this from
  // /api/preferences/opportunities and passes it through.
  layout?: LayoutPreference | null;
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
  const effectiveLayout = useMemo(
    () => getEffectiveLayout(layout ?? DEFAULT_LAYOUT),
    [layout],
  );
  const deviceLayout = useDeviceLayout(effectiveLayout);
  const enabled = useMemo(
    () => getEnabledBySection(deviceLayout),
    [deviceLayout],
  );

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

  // Split the actions section into primary-button vs quick-link groups
  // so we can render each in its own footer strip. Their relative order
  // within `enabled.actions` is preserved — user reordering still wins.
  const primaryActionChunks = enabled.actions.filter((chunk) =>
    PRIMARY_ACTION_SET.has(chunk),
  );
  const quickActionChunks = enabled.actions.filter(
    (chunk) => !PRIMARY_ACTION_SET.has(chunk),
  );

  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-12 pt-6 md:pt-10">
      <h1 className="sr-only">Review Queue — {remainingCount} pending</h1>
      {/* F.1 — single-column card. Width caps mirror the old design
          (mobile narrow, desktop comfortably wide) but the inner layout
          is now chunk-driven so we don't need a hard-coded aside. The
          page-level toolbar owns the count chip + sort/preset/layout
          controls, so the card stage starts clean.
          Top-aligned (not vertically centered) so the card sits near
          the toolbar instead of stranded in cream. */}
      <div className="relative h-[min(640px,80vh)] w-full max-w-md md:h-auto md:min-h-[520px] md:max-w-2xl">
        {queue[1] && (
          <div
            className="absolute inset-x-3 top-5 h-[calc(100%-1.25rem)] rounded-lg border bg-card/50 shadow-sm"
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
            className="absolute inset-0 flex cursor-grab flex-col overflow-hidden rounded-lg border bg-card shadow-xl active:cursor-grabbing"
          >
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Header section — company + title block + status/badge chips */}
              {enabled.header.length > 0 && (
                <HeaderSection
                  chunks={enabled.header}
                  activeJob={activeJob}
                  chunkContext={chunkContext}
                />
              )}

              {/* Meta section — small chips strip */}
              {enabled.meta.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {enabled.meta.map((chunk) => (
                    <RenderChunk
                      key={chunk}
                      chunk={chunk}
                      opportunity={activeJob}
                      context={chunkContext}
                    />
                  ))}
                </div>
              )}

              {/* Body section — vertical flow of location/salary/deadline/tags/summary */}
              {(enabled.body.length > 0 || salaryFallback) && (
                <div className="mt-6 space-y-4">
                  {enabled.body.map((chunk) => {
                    // Legacy fallback: when inferred pay is missing we
                    // still want to render the salary string at the
                    // chunk's chosen position. Substitute a simple
                    // span in place of the chunk.
                    if (chunk === "salary" && salaryFallback) {
                      return (
                        <span
                          key="salary-fallback"
                          className="text-sm text-muted-foreground"
                        >
                          {salaryFallback}
                        </span>
                      );
                    }
                    return (
                      <RenderChunk
                        key={chunk}
                        chunk={chunk}
                        opportunity={activeJob}
                        context={chunkContext}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {primaryActionChunks.length > 0 && (
              <div
                className={cn(
                  "grid gap-2 border-t bg-background/80 p-4 backdrop-blur",
                  primaryActionChunks.length === 1 && "grid-cols-1",
                  primaryActionChunks.length === 2 && "grid-cols-2",
                  primaryActionChunks.length === 3 && "grid-cols-3",
                )}
              >
                {primaryActionChunks.map((chunk) => (
                  <RenderChunk
                    key={chunk}
                    chunk={chunk}
                    opportunity={activeJob}
                    context={chunkContext}
                  />
                ))}
              </div>
            )}

            {/* P0 quick actions — passive lookups that don't mutate
                  status. "Search company" googles the employer; "Open
                  original" round-trips to the source posting (for WW the
                  hash hook in the content script reopens the modal). */}
            {quickActionChunks.length > 0 && (
              <div className="grid grid-cols-2 gap-2 border-t bg-background/60 p-2 backdrop-blur">
                {quickActionChunks.map((chunk) => (
                  <RenderChunk
                    key={chunk}
                    chunk={chunk}
                    opportunity={activeJob}
                    context={chunkContext}
                  />
                ))}
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </main>
  );
}

/**
 * Header chunks render in two visual rows: company + title flow as
 * stacked text, then the badge cluster (status pill, remote, source)
 * sits in a horizontal flex below them. This grouping is fixed —
 * reordering "title" above "company" still works because the layout
 * preserves array order; but interleaving badges with text would look
 * broken, so we partition here rather than letting them flow inline.
 */
function HeaderSection({
  chunks,
  activeJob,
  chunkContext,
}: {
  chunks: ChunkKey[];
  activeJob: Opportunity;
  chunkContext: Parameters<typeof RenderChunk>[0]["context"];
}) {
  const textChunks = chunks.filter(
    (chunk) => chunk === "company" || chunk === "title",
  );
  const badgeChunks = chunks.filter(
    (chunk) => chunk !== "company" && chunk !== "title",
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {textChunks.map((chunk) => (
            <RenderChunk
              key={chunk}
              chunk={chunk}
              opportunity={activeJob}
              context={chunkContext}
            />
          ))}
        </div>
      </div>
      {badgeChunks.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {badgeChunks.map((chunk) => (
            <RenderChunk
              key={chunk}
              chunk={chunk}
              opportunity={activeJob}
              context={chunkContext}
            />
          ))}
        </div>
      )}
    </div>
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
