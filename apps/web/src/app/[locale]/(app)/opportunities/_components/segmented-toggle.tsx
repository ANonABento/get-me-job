"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedToggleProps<T extends string> {
  options: ReadonlyArray<SegmentedToggleOption<T>>;
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      className="flex items-center gap-1 rounded-md bg-muted p-1"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-ink text-paper shadow-[var(--shadow-button)]"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
