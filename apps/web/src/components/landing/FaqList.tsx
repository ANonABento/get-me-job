/**
 * Editorial FAQ list — uses native `<details>` so it works without
 * client JS and stays accessible by default.
 *
 * Layout adapts based on `columns`: 1-col (long-form), 2-col (default
 * for /pricing + /extension), 3-col (dense, for /ats-scanner).
 * Paper-card chassis with hairline dividers; the chevron rotates 90°
 * when expanded via a CSS sibling trick.
 */

export type FaqItem = {
  q: string;
  a: React.ReactNode;
};

export type FaqListProps = {
  items: FaqItem[];
  columns?: 1 | 2 | 3;
  /** Optional mono-cap eyebrow above the FAQ block. */
  eyebrow?: string;
  /** Optional headline next to the eyebrow. */
  headline?: React.ReactNode;
};

export function FaqList({
  items,
  columns = 2,
  eyebrow,
  headline,
}: FaqListProps) {
  const gridClass =
    columns === 1
      ? "grid grid-cols-1"
      : columns === 2
        ? "grid grid-cols-1 md:grid-cols-2"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      {eyebrow || headline ? (
        <div className="mb-6 flex flex-col gap-2 md:mb-8">
          {eyebrow ? (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">
              {eyebrow}
            </span>
          ) : null}
          {headline ? (
            <h2 className="max-w-[20ch] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
              {headline}
            </h2>
          ) : null}
        </div>
      ) : null}

      <div
        className={`overflow-hidden rounded-2xl border border-rule bg-paper shadow-paper-card ${gridClass}`}
      >
        {items.map((item, i) => (
          <details
            key={i}
            className="group border-b border-rule last:border-0 md:border-r md:border-rule md:last-of-type:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5">
              <h3 className="text-[14.5px] font-semibold text-ink">{item.q}</h3>
              <span
                aria-hidden
                className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rule-strong-bg text-ink-2 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-[14px] leading-6 text-ink-2 md:px-6 md:pb-6">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
