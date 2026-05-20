"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FilterTabOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface FilterTabsProps<T extends string> {
  options: ReadonlyArray<FilterTabOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  wrap?: boolean;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  wrap = true,
}: FilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-2 overflow-x-auto whitespace-nowrap",
        wrap && "sm:flex-wrap sm:overflow-x-visible sm:whitespace-normal",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const isDisabled = Boolean(option.disabled && !isActive);

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-ink text-paper shadow-[var(--shadow-button)]"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              isDisabled && "cursor-not-allowed opacity-60",
            )}
          >
            {option.label}
            {typeof option.count === "number" &&
            (isActive || option.count > 0) ? (
              <span
                className={cn(
                  "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 font-mono text-[10px] tabular-nums",
                  isActive
                    ? "bg-paper text-brand"
                    : "bg-background text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
