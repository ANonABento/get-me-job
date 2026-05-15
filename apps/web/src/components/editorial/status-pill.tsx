import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical opportunity stage names. The codebase already uses
 * `saved | applied | interviewing | offered | rejected` in the
 * opportunities schema; this primitive widens that with `apply`
 * (a queued / drafted apply that hasn't been submitted) per v2 design.
 */
export type StageId =
  | "saved"
  | "apply"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

interface StagePresentation {
  label: string;
  /** Container classes (background + foreground). */
  container: string;
  /** Class applied to the leading dot. */
  dot: string;
  /** Extra container modifiers (e.g. strikethrough for rejected). */
  extra?: string;
}

const STAGE_PRESENTATION: Record<StageId, StagePresentation> = {
  saved: {
    label: "Saved",
    container: "bg-rule-strong-bg text-ink-2",
    dot: "bg-ink-3",
  },
  apply: {
    // Accent-aligned — primed-for-action stage, pops slightly more than saved.
    label: "To apply",
    container: "bg-brand-soft text-brand-dark dark:text-brand",
    dot: "bg-brand",
  },
  applied: {
    label: "Applied",
    container: "bg-[var(--stage-applied-bg)] text-[var(--stage-applied-fg)]",
    dot: "bg-[var(--stage-applied-dot)]",
  },
  interview: {
    label: "Interviewing",
    container:
      "bg-[var(--stage-interview-bg)] text-[var(--stage-interview-fg)]",
    dot: "bg-[var(--stage-interview-dot)]",
  },
  offer: {
    label: "Offer",
    container: "bg-[var(--stage-offer-bg)] text-[var(--stage-offer-fg)]",
    dot: "bg-[var(--stage-offer-dot)]",
  },
  rejected: {
    label: "Rejected",
    container: "bg-rule-strong-bg text-ink-3",
    dot: "bg-ink-3",
    extra: "line-through decoration-from-font",
  },
};

interface StatusPillProps {
  stage: StageId;
  /**
   * Override the default label (e.g. show a localized string while
   * keeping the stage's color treatment).
   */
  children?: ReactNode;
  className?: string;
}

export function StatusPill({ stage, children, className }: StatusPillProps) {
  const presentation = STAGE_PRESENTATION[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium",
        presentation.container,
        presentation.extra,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          presentation.dot,
        )}
      />
      {children ?? presentation.label}
    </span>
  );
}

export { STAGE_PRESENTATION };
