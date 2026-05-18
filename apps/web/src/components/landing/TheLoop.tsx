import Image from "next/image";

/**
 * § The Loop · in motion — full-width section.
 *
 * Layered structure:
 *   - Animated SVG ribbon flowing edge-to-edge (opacity 0.85),
 *     two thick stroke paths + one dashed accent.
 *   - "§ The Loop · in motion" mono caption centered above.
 *   - 1300px-max panorama frame holding the loop-hero.png illustration,
 *     with a live "autoplay · loop" badge.
 *   - 6-up stage pip row below: brand dot + vertical connector +
 *     mono "01" + bold label for Atomize → Practice.
 */

const STAGES = [
  { n: "01", label: "Atomize" },
  { n: "02", label: "Capture" },
  { n: "03", label: "Review" },
  { n: "04", label: "Tailor" },
  { n: "05", label: "Autofill" },
  { n: "06", label: "Practice" },
] as const;

export function TheLoop() {
  return (
    <section
      id="the-loop"
      className="relative overflow-hidden border-t border-rule bg-page py-16 md:py-20"
    >
      <RibbonBackground />

      <div className="relative z-[1] mx-auto w-full max-w-[1480px] px-5 md:px-10">
        <p className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
            § The Loop · in motion
          </span>
        </p>

        <div className="relative mx-auto mt-5 max-w-[1300px] overflow-hidden rounded-[22px] border border-rule bg-paper shadow-paper-elevated">
          <span className="absolute right-3.5 top-3.5 z-[3] inline-flex items-center gap-2 rounded-full bg-inverse px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-inverse-ink">
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-brand">
              <span
                aria-hidden
                className="absolute -inset-1 rounded-full bg-brand opacity-40 animate-ping"
              />
            </span>
            autoplay · loop
          </span>
          <Image
            src="/marketing/loop/loop-hero.png"
            alt="The six stages of the Slothing loop, illustrated"
            width={2400}
            height={1030}
            sizes="(max-width: 1300px) 100vw, 1300px"
            className="block h-auto w-full"
            priority={false}
          />
        </div>

        <ol className="relative mx-auto mt-7 grid max-w-[1300px] grid-cols-3 gap-3 md:grid-cols-6 md:gap-2">
          {STAGES.map((stage) => (
            <li
              key={stage.n}
              className="relative pt-[18px] text-center"
              aria-label={`Stage ${stage.n}: ${stage.label}`}
            >
              {/* Vertical connector */}
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-brand"
              />
              {/* Brand dot */}
              <span
                aria-hidden
                className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_0_3px_var(--bg)]"
              />
              <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                {stage.n}
              </span>
              <span className="mt-1 block text-[14px] font-bold tracking-tight text-ink">
                {stage.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RibbonBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[120px] bottom-[90px] z-[0] opacity-[0.85]"
    >
      <svg
        viewBox="0 0 1600 360"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        <defs>
          <linearGradient id="rb1" x1="0" x2="1" y1="0" y2="0">
            <stop
              offset="0%"
              stopColor="var(--brand-soft)"
              stopOpacity="0.55"
            />
            <stop offset="50%" stopColor="var(--brand)" stopOpacity="0.7" />
            <stop
              offset="100%"
              stopColor="var(--inverse-bg)"
              stopOpacity="0.55"
            />
          </linearGradient>
          <linearGradient id="rb2" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--inverse-bg)" stopOpacity="0.4" />
            <stop
              offset="50%"
              stopColor="var(--brand-soft)"
              stopOpacity="0.45"
            />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d="M0,180 C260,40 540,300 820,160 C1100,40 1320,300 1600,140 L1600,180 L0,180 Z"
          fill="none"
          stroke="url(#rb1)"
          strokeWidth="44"
          strokeLinecap="round"
        />
        <path
          d="M0,210 C260,80 540,330 820,200 C1100,70 1320,330 1600,170 L1600,210 L0,210 Z"
          fill="none"
          stroke="url(#rb2)"
          strokeWidth="26"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M0,240 C220,120 560,360 820,220 C1100,100 1340,360 1600,200"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeDasharray="6 8"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
