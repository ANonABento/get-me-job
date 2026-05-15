import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MonoCap } from "./mono-cap";

/**
 * Paper-card surface — the editorial counterpart to <PagePanel>.
 *
 * <PagePanel> wraps its children in `p-5 sm:p-6` (or now the
 * `app-shell-panel` density class). EditorialPanel goes the other way:
 * it owns the border + bg + radius but does NOT impose internal
 * padding. Sub-components (<EditorialPanelHeader>, <EditorialPanelBody>,
 * <EditorialPanelFooter>) carry their own padding, separated by 1px
 * hairlines — this matches Kev's v2 `.panel`/`.panel-head` pattern
 * where the head and body are visually distinct rows.
 */

interface EditorialPanelProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "aside" | "article" | "div";
}

export function EditorialPanel({
  children,
  className,
  as: Tag = "section",
}: EditorialPanelProps) {
  return (
    <Tag
      className={cn(
        "overflow-hidden rounded-lg border border-rule bg-paper",
        className,
      )}
      style={{ borderRadius: "var(--r-lg)" }}
    >
      {children}
    </Tag>
  );
}

interface EditorialPanelHeaderProps {
  title: string;
  /**
   * Optional mono-caps eyebrow above the title (e.g. "TODAY").
   */
  eyebrow?: string;
  /**
   * Optional icon shown to the left of the title (renders at 16px).
   */
  icon?: ElementType;
  /**
   * Right-aligned slot — typically a small "View all →" link or an
   * icon button.
   */
  action?: ReactNode;
  className?: string;
}

export function EditorialPanelHeader({
  title,
  eyebrow,
  icon: Icon,
  action,
  className,
}: EditorialPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-rule px-[18px] py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <Icon className="h-4 w-4 flex-shrink-0 text-ink-3" aria-hidden />
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <MonoCap size="sm" tone="muted" className="block">
              {eyebrow}
            </MonoCap>
          ) : null}
          <h2 className="truncate font-display text-[15px] font-semibold tracking-tight text-ink">
            {title}
          </h2>
        </div>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}

interface EditorialPanelBodyProps {
  children: ReactNode;
  className?: string;
  /**
   * Skip the default `app-shell-panel` padding (useful when the body is
   * a table or list that should go edge-to-edge inside the panel).
   */
  flush?: boolean;
}

export function EditorialPanelBody({
  children,
  className,
  flush,
}: EditorialPanelBodyProps) {
  return (
    <div className={cn(!flush && "app-shell-panel", className)}>{children}</div>
  );
}

interface EditorialPanelFooterProps {
  children: ReactNode;
  className?: string;
}

export function EditorialPanelFooter({
  children,
  className,
}: EditorialPanelFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-rule px-[18px] py-3 text-[13px] text-ink-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
