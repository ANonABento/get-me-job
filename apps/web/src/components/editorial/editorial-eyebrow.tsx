import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MonoCap, type MonoCapSize, type MonoCapTone } from "./mono-cap";

interface EditorialEyebrowProps {
  /**
   * Optional numeric prefix shown before the label. Rendered with a
   * leading dot ("· 01 · Knowledge Bank"). Useful for landing
   * deep-dive sections + settings group headers.
   */
  number?: string | number;
  /**
   * Show the leading accent dot. Defaults to true. Set false for the
   * sparser eyebrow form seen on dashboard quick-action cards.
   */
  dot?: boolean;
  children: ReactNode;
  size?: MonoCapSize;
  tone?: MonoCapTone;
  className?: string;
}

export function EditorialEyebrow({
  number,
  dot = true,
  children,
  size = "md",
  tone = "muted",
  className,
}: EditorialEyebrowProps) {
  return (
    <MonoCap
      size={size}
      tone={tone}
      className={cn("inline-flex items-center gap-2", className)}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-brand"
        />
      ) : null}
      {number !== undefined ? (
        <>
          <span className="tabular-nums">
            {typeof number === "number"
              ? String(number).padStart(2, "0")
              : number}
          </span>
          <span aria-hidden="true" className="opacity-60">
            ·
          </span>
        </>
      ) : null}
      <span>{children}</span>
    </MonoCap>
  );
}
