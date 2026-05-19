import Image from "next/image";
import Link from "next/link";
import { MonoStatStrip, type MonoStat } from "./MonoStatStrip";

/**
 * Dark inverse-band CTA — the editorial closer used at the bottom of
 * landing-grade pages (`/`, `/pricing`, `/extension`, `/ats-scanner`).
 *
 * `bg-inverse` flips between Midnight Indigo (light theme) and cream
 * (dark theme) so the band always contrasts whatever surrounds it.
 *
 * Composition:
 *   - Optional mono-cap eyebrow.
 *   - Two-line Outfit H2 (line 2 in muted inverse-ink).
 *   - Body paragraph.
 *   - Filled + outlined CTA pair.
 *   - Optional `stats` strip below CTAs.
 *   - Optional mascot image on the right (omitted for surfaces that
 *     want a copy-only band).
 */

type CtaProps = {
  label: string;
  href: string;
  leadingGlyph?: string;
  trailingGlyph?: string;
  external?: boolean;
};

export type InverseCTABandProps = {
  eyebrow?: string;
  headlineTop: React.ReactNode;
  headlineBottom?: React.ReactNode;
  body?: React.ReactNode;
  ctaPrimary?: CtaProps;
  ctaSecondary?: CtaProps;
  stats?: readonly MonoStat[];
  mascot?: {
    src: string;
    alt: string;
  };
};

export function InverseCTABand({
  eyebrow,
  headlineTop,
  headlineBottom,
  body,
  ctaPrimary,
  ctaSecondary,
  stats,
  mascot,
}: InverseCTABandProps) {
  const hasMascot = Boolean(mascot);

  return (
    <section className="border-t border-rule bg-inverse text-inverse-ink">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-20 md:px-10 md:py-24 lg:py-28">
        <div
          className={
            hasMascot
              ? "grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16"
              : "mx-auto max-w-[820px] text-center"
          }
        >
          <div
            className={hasMascot ? "" : "mx-auto flex flex-col items-center"}
          >
            {eyebrow ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-inverse-ink/55">
                {eyebrow}
              </span>
            ) : null}
            <h2
              className={`mt-4 font-display text-[clamp(40px,5vw,62px)] font-extrabold leading-[0.96] tracking-display ${hasMascot ? "max-w-[16ch]" : "max-w-[18ch] mx-auto"}`}
            >
              {headlineTop}
              {headlineBottom ? (
                <>
                  <br />
                  <span className="text-inverse-ink/50">{headlineBottom}</span>
                </>
              ) : null}
            </h2>
            {body ? (
              <p
                className={`mt-5 text-[17px] leading-[1.55] text-inverse-ink/75 ${hasMascot ? "max-w-[50ch]" : "max-w-[58ch] mx-auto"}`}
              >
                {body}
              </p>
            ) : null}

            {ctaPrimary || ctaSecondary ? (
              <div
                className={`mt-7 flex flex-wrap items-center gap-3 ${hasMascot ? "" : "justify-center"}`}
              >
                {ctaPrimary ? <FilledCta {...ctaPrimary} /> : null}
                {ctaSecondary ? <OutlinedCta {...ctaSecondary} /> : null}
              </div>
            ) : null}

            {stats ? <MonoStatStrip stats={stats} surface="inverse" /> : null}
          </div>

          {mascot ? (
            <div className="relative mx-auto flex h-[360px] w-full max-w-[420px] items-end justify-center md:h-[420px]">
              <Image
                src={mascot.src}
                alt={mascot.alt}
                fill
                sizes="(max-width: 768px) 70vw, 420px"
                className="object-contain object-bottom drop-shadow-[0_24px_32px_rgba(0,0,0,0.4)]"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FilledCta({
  label,
  href,
  leadingGlyph,
  trailingGlyph = "→",
  external,
}: CtaProps) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full bg-page px-5 py-3 text-[14px] font-semibold text-ink transition-opacity hover:opacity-90";
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

function OutlinedCta({
  label,
  href,
  leadingGlyph,
  trailingGlyph,
  external,
}: CtaProps) {
  const className =
    "inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-inverse-ink/40 bg-transparent px-5 py-3 text-[14px] font-semibold text-inverse-ink transition-colors hover:border-inverse-ink/70";
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
