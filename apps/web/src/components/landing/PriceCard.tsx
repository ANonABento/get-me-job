/**
 * Editorial pricing tier card.
 *
 * Composition:
 *   - Brand-soft icon square in the corner.
 *   - Optional eyebrow badge ("MOST POPULAR", "SELF-HOST", etc).
 *   - Tier name (Outfit display).
 *   - Big price + cadence row.
 *   - Short description.
 *   - Dash-list features (uses `DashList` from primitives — passed as children).
 *   - Optional CTA slot (any node — typically a CheckoutButton or Link).
 *   - Optional fine-print note under the CTA.
 *
 * `highlighted` adds a brand-tinted ring + brand-soft background, used
 * for the recommended tier. Cards are pure presentation; behavior
 * (Stripe checkout, etc.) lives in the CTA slot.
 */

export type PriceCardProps = {
  icon?: React.ReactNode;
  /** Eyebrow chip above the tier name. */
  badge?: string;
  name: string;
  price: string;
  cadence?: string;
  description?: React.ReactNode;
  /** Bullet features — rendered as a dash-list. */
  features: React.ReactNode[];
  /** CTA node (button, link, server component). */
  cta?: React.ReactNode;
  /** Small note under the CTA. */
  ctaNote?: React.ReactNode;
  highlighted?: boolean;
};

export function PriceCard({
  icon,
  badge,
  name,
  price,
  cadence,
  description,
  features,
  cta,
  ctaNote,
  highlighted,
}: PriceCardProps) {
  return (
    <div
      className={
        highlighted
          ? "relative flex h-full flex-col rounded-2xl border border-brand bg-brand-soft p-6 shadow-paper-elevated md:p-8"
          : "relative flex h-full flex-col rounded-2xl border border-rule bg-paper p-6 shadow-paper-card md:p-8"
      }
    >
      {badge ? (
        <span
          className={
            highlighted
              ? "mb-4 inline-flex w-fit items-center rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-page"
              : "mb-4 inline-flex w-fit items-center rounded-full bg-rule-strong-bg px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2"
          }
        >
          {badge}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        {icon ? (
          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-page text-brand">
            {icon}
          </span>
        ) : null}
        <h3 className="font-display text-[22px] font-extrabold leading-tight tracking-display text-ink">
          {name}
        </h3>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-ink">
          {price}
        </span>
        {cadence ? (
          <span className="text-[14px] text-ink-3">{cadence}</span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-[14px] leading-6 text-ink-2">{description}</p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-2.5">
        {features.map((item, i) => (
          <li
            key={i}
            className="relative pl-6 text-[14px] leading-[1.5] text-ink-2"
          >
            <span
              aria-hidden
              className="absolute left-0 top-2.5 h-[5px] w-4 rounded-full bg-brand"
            />
            {item}
          </li>
        ))}
      </ul>

      {cta || ctaNote ? (
        <div className="mt-auto flex flex-col gap-2 pt-7">
          {cta}
          {ctaNote ? (
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
              {ctaNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
