"use client";

import { FilterTabs } from "@/components/ui/filter-tabs";
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
    <FilterTabs
      ariaLabel={ariaLabel}
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      wrap={false}
    />
  );
}
