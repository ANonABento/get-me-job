import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KbdChipSize = "sm" | "md";

const sizeClass: Record<KbdChipSize, string> = {
  // 10px — AppBar search hint, sidebar shortcut hints
  sm: "text-[10px] px-1.5 py-px",
  // 11px — quick-action cards, larger surfaces
  md: "text-[11px] px-2 py-0.5",
};

interface KbdChipProps {
  /**
   * Single key as a string ("K") or an array of key labels rendered as
   * one chip per token with a thin gap between them (`["⌘", "K"]`).
   */
  children?: ReactNode;
  keys?: ReadonlyArray<string>;
  size?: KbdChipSize;
  className?: string;
}

export function KbdChip({
  children,
  keys,
  size = "sm",
  className,
}: KbdChipProps) {
  if (keys && keys.length > 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono uppercase text-ink-3",
        )}
        aria-label={keys.join(" ")}
      >
        {keys.map((key, i) => (
          <Fragment key={`${key}-${i}`}>
            <kbd
              className={cn(
                "inline-flex items-center justify-center rounded-sm border border-rule bg-paper font-medium text-ink-3",
                sizeClass[size],
                className,
              )}
            >
              {key}
            </kbd>
          </Fragment>
        ))}
      </span>
    );
  }

  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-sm border border-rule bg-paper font-mono uppercase font-medium text-ink-3",
        sizeClass[size],
        className,
      )}
    >
      {children}
    </kbd>
  );
}
