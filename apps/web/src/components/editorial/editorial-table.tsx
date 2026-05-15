import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial table primitive. Full-width, mono-caps thead, rule-hairline
 * rows. The `<EditorialTableRow>` is a real `<tr>`; when used inside a
 * link-row pattern (e.g. opportunities), wrap each row's first cell in
 * an anchor — keeping `<tr role="link">` is an a11y mess.
 *
 * Density: each cell uses `app-shell-cell`, so row vertical padding
 * follows `--density-pad-cell` (12px comfy / 8px compact).
 */

interface EditorialTableProps {
  children: ReactNode;
  className?: string;
  /** Aria label or labelled-by hook for the table. */
  ariaLabel?: string;
}

export function EditorialTable({
  children,
  className,
  ariaLabel,
}: EditorialTableProps) {
  return (
    <table
      aria-label={ariaLabel}
      className={cn("w-full border-collapse text-[13.5px]", className)}
    >
      {children}
    </table>
  );
}

interface EditorialTableHeadProps {
  children: ReactNode;
  className?: string;
}

export function EditorialTableHead({
  children,
  className,
}: EditorialTableHeadProps) {
  return <thead className={className}>{children}</thead>;
}

interface EditorialTableHeaderCellProps {
  children: ReactNode;
  className?: string;
  /** Horizontal alignment. Default left. */
  align?: "left" | "right" | "center";
}

const alignClass: Record<
  NonNullable<EditorialTableHeaderCellProps["align"]>,
  string
> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function EditorialTableHeaderCell({
  children,
  className,
  align = "left",
}: EditorialTableHeaderCellProps) {
  return (
    <th
      className={cn(
        // Mono-caps eyebrow style on every <th>; matches v2's
        // `.panel-table thead` rule (10px / 0.1em / uppercase).
        "border-b border-rule px-[18px] py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3",
        alignClass[align],
        className,
      )}
    >
      {children}
    </th>
  );
}

interface EditorialTableRowProps {
  children: ReactNode;
  className?: string;
  /**
   * Marks the row as interactive — adds a cursor pointer + hover fill.
   * Use for rows that wrap their first cell in a `<Link>` (the link
   * still owns the actual navigation, this just gives a hover hint).
   */
  interactive?: boolean;
  onClick?: () => void;
}

export function EditorialTableRow({
  children,
  className,
  interactive,
  onClick,
}: EditorialTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-rule last:border-b-0",
        interactive &&
          "cursor-pointer transition-colors hover:bg-rule-strong-bg",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface EditorialTableCellProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  /** Apply `font-mono tabular-nums` for time/count columns. */
  mono?: boolean;
}

export function EditorialTableCell({
  children,
  className,
  align = "left",
  mono,
}: EditorialTableCellProps) {
  return (
    <td
      className={cn(
        "app-shell-cell px-[18px] text-ink",
        alignClass[align],
        mono && "font-mono tabular-nums text-[12px] text-ink-3",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function EditorialTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}
