/**
 * Single source of truth for opportunity sort orders. Drives the
 * "Sort by…" dropdown in the review queue, the opportunities list, and
 * (later) the kanban lane ordering. Adding a new sort = add to
 * OPPORTUNITY_SORT_IDS in @slothing/shared/schemas + a comparator here.
 */
import type { OpportunitySortId } from "@slothing/shared/schemas";
import type { Opportunity } from "@/types/opportunity";

/**
 * Per-call context that some comparators need but aren't on the opportunity
 * itself (user location for "closest-to-location", profile score for
 * "ai-recommended"). All fields optional — comparators fall back gracefully
 * when their preconditions aren't met.
 */
export interface SortContext {
  userLocation?: { latitude: number; longitude: number };
  // Map of opportunityId → 0-1 fit score. Populated by an AI scoring pass
  // (not in scope for P0); when undefined, `ai-recommended` falls back to
  // `most-recent`.
  recommendationScores?: Record<string, number>;
}

export interface SortOption {
  id: OpportunitySortId;
  label: string;
  // Whether this sort is selectable in the dropdown right now. Sort IDs
  // with unmet preconditions (e.g. no user location set) return false so
  // the UI can disable them with a tooltip.
  isAvailable(ctx: SortContext): boolean;
  // When unavailable, what to fall back to in `sortOpportunities`.
  fallback?: OpportunitySortId;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    id: "most-recent",
    label: "Most recent",
    isAvailable: () => true,
  },
  {
    id: "soonest-deadline",
    label: "Soonest deadline",
    isAvailable: () => true,
  },
  {
    id: "highest-pay",
    label: "Highest pay",
    isAvailable: () => true,
  },
  {
    id: "lowest-pay",
    label: "Lowest pay",
    isAvailable: () => true,
  },
  {
    id: "lowest-applicants",
    label: "Lowest applicants",
    isAvailable: () => true,
  },
  {
    id: "highest-applicants",
    label: "Highest applicants",
    isAvailable: () => true,
  },
  {
    id: "best-applicant-ratio",
    label: "Best applicant ratio",
    isAvailable: () => true,
  },
  {
    id: "ai-recommended",
    label: "AI recommended (coming soon)",
    isAvailable: (ctx) => !!ctx.recommendationScores,
    fallback: "most-recent",
  },
  {
    id: "closest-to-location",
    label: "Closest to me (coming soon)",
    isAvailable: (ctx) => !!ctx.userLocation,
    fallback: "most-recent",
  },
];

const SORT_OPTIONS_BY_ID = new Map(
  SORT_OPTIONS.map((option) => [option.id, option] as const),
);

export function getSortOption(id: OpportunitySortId): SortOption | undefined {
  return SORT_OPTIONS_BY_ID.get(id);
}

/**
 * Stable comparator runner. Falls back to `most-recent` when the requested
 * sort isn't available (e.g. user picked "AI recommended" but we don't
 * have scores yet). Never mutates the input array.
 */
export function sortOpportunities(
  list: readonly Opportunity[],
  sortId: OpportunitySortId,
  ctx: SortContext = {},
): Opportunity[] {
  const requested = SORT_OPTIONS_BY_ID.get(sortId);
  const effectiveId =
    requested && !requested.isAvailable(ctx) && requested.fallback
      ? requested.fallback
      : sortId;
  const comparator = COMPARATORS[effectiveId] ?? COMPARATORS["most-recent"];
  return [...list].sort((a, b) => comparator(a, b, ctx));
}

type Comparator = (a: Opportunity, b: Opportunity, ctx: SortContext) => number;

// Pushes undefined to the end regardless of sort direction. Returns 0 when
// both sides are defined so the caller can do its own comparison.
function nullsLast(
  aValue: number | undefined,
  bValue: number | undefined,
): number | null {
  const aMissing = aValue === undefined || Number.isNaN(aValue);
  const bMissing = bValue === undefined || Number.isNaN(bValue);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return null;
}

function parseDeadlineTs(deadline?: string): number | undefined {
  if (!deadline) return undefined;
  const ts = Date.parse(deadline);
  return Number.isFinite(ts) ? ts : undefined;
}

// Annualized USD-equivalent for cross-postings ranking. Conservative —
// uses salaryMin when both bounds present (worst-case for the candidate).
// Bucket G in opportunity-customization-spec will replace this with a
// proper normalize/convert pipeline; for P0 it's good enough to rank.
function approxAnnualPay(opportunity: Opportunity): number | undefined {
  const min = opportunity.salaryMin;
  const max = opportunity.salaryMax;
  if (min === undefined && max === undefined) return undefined;
  // Use the midpoint when both are present; otherwise whichever exists.
  if (min !== undefined && max !== undefined) return (min + max) / 2;
  return min ?? max;
}

function applicantRatio(opportunity: Opportunity): number | undefined {
  const applicants = opportunity.applicants;
  if (applicants === undefined) return undefined;
  // 1 opening assumed when employer didn't disclose — keeps ratio defined
  // so the comparator can rank these alongside multi-opening postings.
  const openings = opportunity.openings ?? 1;
  if (openings <= 0) return undefined;
  return applicants / openings;
}

function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const COMPARATORS: Record<OpportunitySortId, Comparator> = {
  "most-recent": (a, b) => {
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    return (tb || 0) - (ta || 0); // newest first
  },
  "soonest-deadline": (a, b) => {
    const ta = parseDeadlineTs(a.deadline);
    const tb = parseDeadlineTs(b.deadline);
    const sentinel = nullsLast(ta, tb);
    if (sentinel !== null) return sentinel;
    return (ta as number) - (tb as number);
  },
  "highest-pay": (a, b) => {
    const pa = approxAnnualPay(a);
    const pb = approxAnnualPay(b);
    const sentinel = nullsLast(pa, pb);
    if (sentinel !== null) return sentinel;
    return (pb as number) - (pa as number);
  },
  "lowest-pay": (a, b) => {
    const pa = approxAnnualPay(a);
    const pb = approxAnnualPay(b);
    const sentinel = nullsLast(pa, pb);
    if (sentinel !== null) return sentinel;
    return (pa as number) - (pb as number);
  },
  "lowest-applicants": (a, b) => {
    const sentinel = nullsLast(a.applicants, b.applicants);
    if (sentinel !== null) return sentinel;
    return (a.applicants as number) - (b.applicants as number);
  },
  "highest-applicants": (a, b) => {
    const sentinel = nullsLast(a.applicants, b.applicants);
    if (sentinel !== null) return sentinel;
    return (b.applicants as number) - (a.applicants as number);
  },
  "best-applicant-ratio": (a, b) => {
    const ra = applicantRatio(a);
    const rb = applicantRatio(b);
    const sentinel = nullsLast(ra, rb);
    if (sentinel !== null) return sentinel;
    return (ra as number) - (rb as number);
  },
  "ai-recommended": (a, b, ctx) => {
    const scores = ctx.recommendationScores ?? {};
    const sa = scores[a.id];
    const sb = scores[b.id];
    const sentinel = nullsLast(sa, sb);
    if (sentinel !== null) return sentinel;
    return (sb as number) - (sa as number);
  },
  "closest-to-location": (a, b, ctx) => {
    const me = ctx.userLocation;
    if (!me) return 0;
    // Opportunities don't carry geo today — distance is undefined for now.
    // Bucket B's spec calls out that we'd populate this from the
    // city/province/country fields via a geocoder. For P0 this comparator
    // is gated by isAvailable() returning false, so it falls back to
    // most-recent before reaching here. We keep this stub so adding the
    // geo data later doesn't require touching the dispatch table.
    void a;
    void b;
    return 0;
  },
};
