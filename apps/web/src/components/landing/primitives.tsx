import * as React from "react";
import { cn } from "@/lib/utils";

/** Mono-cap eyebrow caption ("01 · Knowledge Bank", "INSIDE SLOTHING", etc.). */
export function MonoCap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("font-mono text-mono-cap uppercase text-ink-3", className)}
    >
      {children}
    </span>
  );
}

/** Halo-dot eyebrow pill — paper bg, hairline border, accent dot. */
export function HaloEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full border border-rule bg-paper py-1.5 pl-7 pr-4 text-[12.5px] font-medium text-ink-2",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute left-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-brand-soft"
      />
      <span
        aria-hidden
        className="absolute left-[10px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand"
      />
      {children}
    </span>
  );
}

/** Italic + accent color + highlighter-stripe underline mark on emphasis words. */
export function HighlighterEm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <em
      className={cn(
        "not-italic italic font-display text-brand [background-image:linear-gradient(transparent_70%,var(--brand-soft)_70%)]",
        className,
      )}
    >
      {children}
    </em>
  );
}

/** Numbered eyebrow for deep-dive feature sections — accent dot + "NN · Name". */
export function DeepEyebrow({
  number,
  label,
  className,
}: {
  number: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-mono-cap uppercase text-ink-3",
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
      <span className="text-ink-2">{number}</span>
      <span>·</span>
      <span>{label}</span>
    </span>
  );
}

/** Full-width section wrapper. `alt` flips the band to --bg-2 full-bleed. */
export function DeepSection({
  id,
  alt = false,
  children,
  className,
}: {
  id?: string;
  alt?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-[84px] py-[64px] md:py-[112px]",
        alt && "bg-page-2",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
        {children}
      </div>
    </section>
  );
}

/** Two-column deep-section grid. `reverse` swaps copy/visual order at md+. */
export function DeepGrid({
  reverse = false,
  className,
  children,
}: {
  reverse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)] lg:gap-16",
        reverse && "md:[&>*:first-child]:order-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Floating prop card — paper surface, optional rotation, drops out at mobile. */
export function PropCard({
  rotate = 0,
  children,
  className,
}: {
  rotate?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        "rounded-lg border border-rule bg-paper p-5 shadow-paper-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Feature pill — accent-soft icon square + label, in the hero pill bar. */
export function FeaturePill({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper py-1.5 pl-1.5 pr-4 text-[13.5px] font-medium text-ink-2 transition-colors hover:border-rule-strong hover:text-ink"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-brand">
        {icon}
      </span>
      {children}
    </a>
  );
}

/** Logo chip — used in integrations strip "Plays well with…" rows. */
export function LogoChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-3 py-1 text-[13px] text-ink-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Bullet list with accent dash markers. */
export function DashList({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-6 text-[14.5px] leading-[1.5] text-ink-2"
        >
          <span
            aria-hidden
            className="absolute left-0 top-2.5 h-[5px] w-4 rounded-full bg-brand"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
