import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MonoCap } from "./mono-cap";

interface TaskRowProps {
  /**
   * The numeric prefix shown in the leading circle (1-indexed). Pass a
   * string for non-numeric markers (e.g. "•").
   */
  index: number | string;
  title: ReactNode;
  /** Short supporting meta (e.g. "2 unread · last updated 4h"). */
  meta?: ReactNode;
  /** Right-aligned slot — typically a small button or a → link. */
  action?: ReactNode;
  /** Eyebrow above the title (e.g. mono-caps stage tag). */
  eyebrow?: string;
  /** Marks the row as the currently-focused item — adds an accent border. */
  active?: boolean;
  /** Makes the row clickable. */
  onClick?: () => void;
  className?: string;
}

export function TaskRow({
  index,
  title,
  meta,
  action,
  eyebrow,
  active,
  onClick,
  className,
}: TaskRowProps) {
  const interactive = typeof onClick === "function";
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-start gap-3 rounded-md border border-rule bg-paper px-4 py-3 transition-colors",
        interactive &&
          "cursor-pointer hover:border-rule-strong hover:bg-rule-strong-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
        active && "border-brand",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border border-rule font-mono text-[11px] font-medium tabular-nums",
          active ? "border-brand bg-brand-soft text-brand-dark" : "text-ink-3",
        )}
      >
        {typeof index === "number" ? String(index).padStart(2, "0") : index}
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <MonoCap size="sm" tone="muted" className="mb-1 block">
            {eyebrow}
          </MonoCap>
        ) : null}
        <div className="text-[14px] font-medium leading-tight text-ink">
          {title}
        </div>
        {meta ? (
          <div className="mt-1 text-[12.5px] leading-snug text-ink-3">
            {meta}
          </div>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}
