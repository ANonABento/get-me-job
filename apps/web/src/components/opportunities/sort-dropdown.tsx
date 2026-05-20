"use client";

/**
 * Sort-by dropdown that drives `sortOpportunities()` in the queue / list.
 * Reads SORT_OPTIONS so adding a sort is data-driven — no UI changes
 * needed. Spec: docs/opportunity-customization-spec.md §4 bucket B.
 */
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortContext } from "@/lib/opportunities/sort";
import type { OpportunitySortId } from "@slothing/shared/schemas";

export interface SortDropdownProps {
  value: OpportunitySortId;
  onChange(value: OpportunitySortId): void;
  ctx?: SortContext;
}

export function SortDropdown({ value, onChange, ctx }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Sort
      </span>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as OpportunitySortId)}
      >
        <SelectTrigger className="h-8 w-[180px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => {
            const available = option.isAvailable(ctx ?? {});
            return (
              <SelectItem
                key={option.id}
                value={option.id}
                disabled={!available}
              >
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
