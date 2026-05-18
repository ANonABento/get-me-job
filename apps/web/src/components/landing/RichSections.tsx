"use client";

/**
 * Marquee of job boards Slothing scrapes / autofills.
 *
 * Editorial paper band sitting flush against TheLoop panorama. Mask
 * edges, hover pause, prefers-reduced-motion respected.
 *
 * The old WhySlothing 4-up proof grid was retired — the dark closer
 * carries the same trust signals (BYOK · AGPL · $0 · 100%) more
 * compactly.
 */

const SCRAPED_BOARDS = [
  { name: "LinkedIn", initial: "in" },
  { name: "WaterlooWorks", initial: "W" },
  { name: "Greenhouse", initial: "G" },
  { name: "Lever", initial: "L" },
  { name: "Workday", initial: "W" },
  { name: "Ashby", initial: "A" },
  { name: "Y Combinator", initial: "YC" },
  { name: "Indeed", initial: "in" },
  { name: "Wellfound", initial: "WF" },
  { name: "Otta", initial: "O" },
] as const;

export function LogoStrip() {
  const doubled = [...SCRAPED_BOARDS, ...SCRAPED_BOARDS];
  return (
    <section className="overflow-hidden border-y border-rule bg-paper py-4">
      <div className="mx-auto flex max-w-[1480px] items-center gap-7 px-5 md:px-10">
        <span className="flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Works where jobs live
        </span>
        <div
          className="flex-1 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="logo-strip-track flex w-max gap-9">
            {doubled.map((board, idx) => (
              <span
                key={`${board.name}-${idx}`}
                className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-ink-2"
              >
                <span
                  className="grid h-[22px] w-[22px] place-items-center rounded-sm border border-rule bg-page text-[10px] font-bold text-brand-dark"
                  aria-hidden="true"
                >
                  {board.initial}
                </span>
                {board.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes logo-strip-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        :global(.logo-strip-track) {
          animation: logo-strip-scroll 32s linear infinite;
        }
        :global(.logo-strip-track:hover) {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.logo-strip-track) {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
