import Link from "next/link";

/**
 * Reusable editorial hero block for marketing surfaces other than the
 * landing (which has its own bespoke video-stage hero in `Hero.tsx`).
 *
 * Composition:
 *   - Optional mono-cap eyebrow pill on top (rust badge + label).
 *   - Two-line Outfit H1 — line 1 in `text-ink`, line 2 in `text-ink-3`.
 *   - Body paragraph with optional bold reinforce line.
 *   - Two pill CTAs (filled `bg-ink` primary + outlined secondary).
 *   - Optional `visual` slot on the right (image, mock, illustration).
 *
 * When `visual` is omitted the hero centers the copy at a comfortable
 * reading width — used by /pricing, /vs and /ats-scanner where the
 * topic doesn't carry a single illustration.
 */

type CtaProps = {
  label: string;
  href: string;
  /** Optional leading glyph (★, →, etc.). */
  leadingGlyph?: string;
  /** Optional trailing glyph. Defaults to "→" on primary CTA. */
  trailingGlyph?: string;
  /** External links open in a new tab; defaults to false. */
  external?: boolean;
};

export type EditorialHeroProps = {
  /** Eyebrow content — pass `null` to omit. */
  eyebrow?: {
    badge: string;
    label: string;
  } | null;
  headlineTop: React.ReactNode;
  headlineBottom?: React.ReactNode;
  body: React.ReactNode;
  /** Optional bold reinforce line under body. */
  reinforce?: React.ReactNode;
  ctaPrimary?: CtaProps;
  ctaSecondary?: CtaProps;
  /** Right-column visual. When omitted the hero centers the copy. */
  visual?: React.ReactNode;
  /** Override the section background ("page" default, "paper" alt band). */
  surface?: "page" | "paper";
};

export function EditorialHero({
  eyebrow,
  headlineTop,
  headlineBottom,
  body,
  reinforce,
  ctaPrimary,
  ctaSecondary,
  visual,
  surface = "page",
}: EditorialHeroProps) {
  const hasVisual = Boolean(visual);

  return (
    <section
      className={`border-b border-rule ${surface === "paper" ? "bg-paper" : "bg-page"}`}
    >
      <div
        className={`mx-auto w-full max-w-[1480px] px-5 pb-12 pt-10 md:px-10 md:pb-16 md:pt-14 lg:pb-20 ${hasVisual ? "" : "lg:pt-20"}`}
      >
        <div
          className={
            hasVisual
              ? "grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14"
              : "mx-auto max-w-[820px] text-center"
          }
        >
          <div
            className={
              hasVisual
                ? "flex max-w-[640px] flex-col"
                : "mx-auto flex flex-col items-center"
            }
          >
            {eyebrow ? (
              <span className="inline-flex items-center gap-2.5 self-start rounded-full border border-rule bg-paper py-1 pl-1 pr-3 text-[12.5px] text-ink-2">
                <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
                  {eyebrow.badge}
                </span>
                {eyebrow.label}
              </span>
            ) : null}

            <h1
              className={`mt-5 font-display text-[clamp(40px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-display text-ink ${hasVisual ? "max-w-[15ch]" : "max-w-[18ch] mx-auto"}`}
            >
              {headlineTop}
              {headlineBottom ? (
                <>
                  <br />
                  <span className="text-ink-3">{headlineBottom}</span>
                </>
              ) : null}
            </h1>

            <div
              className={`mt-5 text-[16.5px] leading-[1.55] text-ink-2 ${hasVisual ? "max-w-[520px]" : "max-w-[58ch] mx-auto"}`}
            >
              <p>{body}</p>
              {reinforce ? (
                <p className="mt-3 font-semibold text-ink">{reinforce}</p>
              ) : null}
            </div>

            {ctaPrimary || ctaSecondary ? (
              <div
                className={`mt-7 flex flex-wrap items-center gap-2.5 ${hasVisual ? "" : "justify-center"}`}
              >
                {ctaPrimary ? <PrimaryCta {...ctaPrimary} /> : null}
                {ctaSecondary ? <SecondaryCta {...ctaSecondary} /> : null}
              </div>
            ) : null}
          </div>

          {visual ? visual : null}
        </div>
      </div>
    </section>
  );
}

function PrimaryCta({
  label,
  href,
  leadingGlyph,
  trailingGlyph = "→",
  external,
}: CtaProps) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-page transition-opacity hover:opacity-90";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {leadingGlyph ? <span aria-hidden>{leadingGlyph}</span> : null}
        {label}
        {trailingGlyph ? <span aria-hidden>{trailingGlyph}</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {leadingGlyph ? <span aria-hidden>{leadingGlyph}</span> : null}
      {label}
      {trailingGlyph ? <span aria-hidden>{trailingGlyph}</span> : null}
    </Link>
  );
}

function SecondaryCta({
  label,
  href,
  leadingGlyph,
  trailingGlyph,
  external,
}: CtaProps) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-transparent px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-rule-strong-bg";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {leadingGlyph ? <span aria-hidden>{leadingGlyph}</span> : null}
        {label}
        {trailingGlyph ? <span aria-hidden>{trailingGlyph}</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {leadingGlyph ? <span aria-hidden>{leadingGlyph}</span> : null}
      {label}
      {trailingGlyph ? <span aria-hidden>{trailingGlyph}</span> : null}
    </Link>
  );
}
