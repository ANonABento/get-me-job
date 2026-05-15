import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MonoCapSize = "sm" | "md" | "lg";
export type MonoCapTone = "muted" | "ink" | "accent";

const sizeClass: Record<MonoCapSize, string> = {
  // 10px — sidebar section labels, tiny eyebrows
  sm: "text-[10px]",
  // 11px — eyebrow above headings, panel link captions
  md: "text-[11px]",
  // 12.5px — landing eyebrow chips
  lg: "text-[12.5px]",
};

const toneClass: Record<MonoCapTone, string> = {
  muted: "text-ink-3",
  ink: "text-ink-2",
  accent: "text-brand",
};

interface MonoCapProps {
  children: ReactNode;
  size?: MonoCapSize;
  tone?: MonoCapTone;
  className?: string;
  as?: ElementType;
}

export function MonoCap({
  children,
  size = "md",
  tone = "muted",
  className,
  as: Tag = "span",
}: MonoCapProps) {
  return (
    <Tag
      className={cn(
        "font-mono uppercase tracking-[0.14em]",
        sizeClass[size],
        toneClass[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
