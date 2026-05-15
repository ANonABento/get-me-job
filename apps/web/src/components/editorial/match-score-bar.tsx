import { cn } from "@/lib/utils";

export type MatchTier = "strong" | "ok" | "weak";

/**
 * Color tier thresholds — kept in sync with the design's three-band
 * read (olive = "strong fit", brand/rust = "decent match", amber =
 * "stretch / mismatch"). Exposed so callers can reuse the same labels
 * when they show the tier elsewhere (status text, badge, etc.).
 */
export const MATCH_THRESHOLDS = {
  strong: 85,
  ok: 65,
} as const;

export function getMatchTier(value: number): MatchTier {
  if (value >= MATCH_THRESHOLDS.strong) return "strong";
  if (value >= MATCH_THRESHOLDS.ok) return "ok";
  return "weak";
}

const tierFillClass: Record<MatchTier, string> = {
  // Olive — leans on the existing --stage-applied-dot token (#6a8a3a).
  strong: "bg-[var(--stage-applied-dot)]",
  // Brand/rust — the editorial accent.
  ok: "bg-brand",
  // Amber — leans on --stage-interview-dot (#b8901c).
  weak: "bg-[var(--stage-interview-dot)]",
};

const tierLabel: Record<MatchTier, string> = {
  strong: "Strong fit",
  ok: "Decent match",
  weak: "Stretch",
};

interface MatchScoreBarProps {
  /** 0–100 inclusive; values outside this range are clamped. */
  value: number;
  /**
   * When provided, replaces the numeric percent shown on the right.
   * Useful when the score is partial / preview and the UI wants a
   * different word (e.g. "Pending").
   */
  trailingLabel?: string;
  /** Hide the numeric percent altogether. */
  hideValue?: boolean;
  /**
   * If true, show the tier label (Strong fit / Decent match / Stretch)
   * under the bar.
   */
  showTier?: boolean;
  className?: string;
}

export function MatchScoreBar({
  value,
  trailingLabel,
  hideValue,
  showTier,
  className,
}: MatchScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tier = getMatchTier(clamped);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Match score"
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-rule-strong-bg"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              tierFillClass[tier],
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
        {!hideValue ? (
          <span className="font-mono text-[11.5px] tabular-nums text-ink-2">
            {trailingLabel ?? `${clamped}%`}
          </span>
        ) : null}
      </div>
      {showTier ? (
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
          {tierLabel[tier]}
        </span>
      ) : null}
    </div>
  );
}
