"use client";

import { cn } from "@/lib/utils";
import type { OpportunityStatus } from "../utils";

/**
 * v2 design uses tab segments All / Saved / Applied / Interviewing / Offer /
 * Rejected as the primary filter chrome above the opportunity list. Each tab
 * shows a count chip on the right. Tabs are list-mode only; the kanban view
 * provides its own column structure.
 */
export type StatusTabValue = OpportunityStatus | "all";

export interface StatusTabOption {
  value: StatusTabValue;
  label: string;
  count: number;
}

interface StatusTabsProps {
  options: ReadonlyArray<StatusTabOption>;
  value: StatusTabValue;
  onChange: (value: StatusTabValue) => void;
  ariaLabel: string;
  className?: string;
}

export function StatusTabs({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap items-center gap-0.5 rounded-md border border-rule bg-paper p-1",
        className,
      )}
      style={{ borderRadius: "var(--r-md)" }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-[12.5px] font-medium transition-colors",
              isActive
                ? "bg-ink text-paper"
                : "text-ink-2 hover:bg-rule-strong-bg",
            )}
            style={{ borderRadius: "var(--r-sm)" }}
          >
            {option.label}
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-1.5 py-px font-mono text-[10px] tabular-nums",
                isActive
                  ? "bg-paper text-brand"
                  : "bg-rule-strong-bg text-ink-3",
              )}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
