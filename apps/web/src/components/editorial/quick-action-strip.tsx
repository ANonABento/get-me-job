import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KbdChip } from "./kbd-chip";

interface QuickActionCardProps {
  /** Icon component (lucide-react or any 16/20px svg-tile renderer). */
  icon: ElementType;
  title: string;
  subtitle?: string;
  /**
   * Keyboard shortcut shown in the top-right corner. Pass an array
   * (`["⌘", "U"]`) or a single string ("⌘U") — both render as a
   * `<KbdChip>`.
   */
  shortcut?: string | ReadonlyArray<string>;
  onClick?: () => void;
  /**
   * When provided, the card renders as a link (anchor) — wraps the
   * outer surface. The caller is responsible for using Next's `<Link>`
   * elsewhere if locale-aware routing matters.
   */
  href?: string;
  className?: string;
  /**
   * If the card is intentionally disabled (e.g. waiting on data),
   * grays it out and disables interactivity.
   */
  disabled?: boolean;
}

export function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  shortcut,
  onClick,
  href,
  className,
  disabled,
}: QuickActionCardProps) {
  const interactive = !disabled && (Boolean(onClick) || Boolean(href));
  const sharedClasses = cn(
    "group flex h-full flex-col gap-3 rounded-md border border-rule bg-paper p-4 text-left transition-all",
    interactive &&
      "cursor-pointer hover:-translate-y-px hover:border-brand hover:shadow-paper-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
    disabled && "cursor-not-allowed opacity-60",
    className,
  );

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-sm border border-rule bg-page text-brand transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-paper"
        >
          <Icon className="h-4 w-4" />
        </span>
        {shortcut ? (
          <KbdChip
            size="sm"
            keys={
              Array.isArray(shortcut)
                ? shortcut
                : typeof shortcut === "string"
                  ? shortcut.split(/\s+/).filter(Boolean)
                  : undefined
            }
          />
        ) : null}
      </div>
      <div className="space-y-1">
        <div className="text-[14px] font-semibold leading-tight text-ink">
          {title}
        </div>
        {subtitle ? (
          <div className="text-[12px] leading-snug text-ink-3">{subtitle}</div>
        ) : null}
      </div>
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={sharedClasses}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={sharedClasses}
    >
      {inner}
    </button>
  );
}

interface QuickActionStripProps {
  children: ReactNode;
  /**
   * Number of columns at the lg breakpoint. v2 design is 4-up; trims to
   * 2 at md and 1 at base.
   */
  cols?: 3 | 4;
  className?: string;
}

export function QuickActionStrip({
  children,
  cols = 4,
  className,
}: QuickActionStripProps) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        "sm:grid-cols-2",
        cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
