/**
 * Editorial comparison table.
 *
 * Used by /pricing (plan vs plan) and /vs (Slothing vs competitor).
 *
 * Structure:
 *   - Header row: mono-cap column labels. The `highlight` column gets
 *     brand-tinted text + a brand-soft cell on the header.
 *   - Body rows: row label on the left, one cell per column. Cells
 *     accept any node (✓/✗ glyphs, prices, plain text).
 *   - Alternating bg-page / bg-paper row backgrounds.
 *
 * No fixed widths — table responds to natural column content. For
 * narrow viewports the wrapper is horizontally scrollable.
 */

export type CompareColumn = {
  key: string;
  label: string;
  /** Optional sub-label rendered in ink-3 below the main label. */
  sublabel?: string;
};

export type CompareRow = {
  label: string;
  /** Cell content keyed by column.key. */
  cells: Record<string, React.ReactNode>;
};

export type CompareTableProps = {
  columns: CompareColumn[];
  rows: CompareRow[];
  /** Column key to brand-tint (typically "slothing"). */
  highlight?: string;
  /** Optional caption above the table. */
  caption?: React.ReactNode;
};

export function CompareTable({
  columns,
  rows,
  highlight,
  caption,
}: CompareTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-rule bg-paper shadow-paper-card">
      {caption ? (
        <p className="border-b border-rule px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3 md:px-8">
          {caption}
        </p>
      ) : null}
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-rule">
            <th
              scope="col"
              className="px-5 py-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3 md:px-8"
            >
              Feature
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={
                  col.key === highlight
                    ? "min-w-[120px] bg-brand-soft px-5 py-4 text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-dark md:px-6"
                    : "min-w-[120px] px-5 py-4 text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3 md:px-6"
                }
              >
                <span className="block text-[12.5px] font-bold tracking-tight text-ink normal-case">
                  {col.label}
                </span>
                {col.sublabel ? (
                  <span className="mt-0.5 block text-[10px] text-ink-3 normal-case">
                    {col.sublabel}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.label}
              className={`border-b border-rule last:border-0 ${idx % 2 === 1 ? "bg-page" : ""}`}
            >
              <th
                scope="row"
                className="px-5 py-4 align-top text-[14px] font-semibold text-ink md:px-8"
              >
                {row.label}
              </th>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={
                    col.key === highlight
                      ? "px-5 py-4 align-top text-[14px] text-ink md:px-6"
                      : "px-5 py-4 align-top text-[14px] text-ink-2 md:px-6"
                  }
                >
                  {row.cells[col.key] ?? (
                    <span className="font-mono text-[12px] text-ink-3">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
