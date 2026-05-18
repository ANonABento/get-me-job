"use client";

import { GitBranch, Key, Lock, Sparkles } from "lucide-react";
import { DeepSection, MonoCap } from "./primitives";

/* ───────────────── Logo strip — "Scrapes from" marquee ───────────────── */

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
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="logo-strip-track flex w-max gap-9">
            {doubled.map((board, idx) => (
              <span
                key={`${board.name}-${idx}`}
                className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-ink-2"
              >
                <span
                  className="grid h-[22px] w-[22px] place-items-center rounded-sm border border-rule bg-paper text-[10px] font-bold text-brand-dark"
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

/* ───────────────── Why Slothing — 4-up proof grid ─────────────────
 *
 * Replaces the old IntegrationsStrip. Honest pitch: open source, BYOK,
 * grounded in your own data, normalized across boards.
 */

const PROOF_CELLS = [
  {
    icon: Lock,
    label: "Grounded in your own data",
    body: "Generated drafts only use components you actually saved. No invented projects, no hallucinated skills, every bullet traceable back to its source.",
    chip: "No hallucinations",
  },
  {
    icon: Key,
    label: "Bring your own key",
    body: "Use hosted Slothing, plug in OpenAI / Anthropic / OpenRouter / Ollama keys, or run local models. You decide where your data goes.",
    chip: "BYOK · local-first",
  },
  {
    icon: GitBranch,
    label: "Open source by default",
    body: "AGPL-3.0 with a cloud carve-out. Self-host the whole stack on your own machine if hosted isn't your style.",
    chip: "AGPL-3.0",
  },
  {
    icon: Sparkles,
    label: "Normalized across every board",
    body: "A Workday role and an Indeed role read the same in Slothing. Filters, salary, fit signals — all one schema, all comparable.",
    chip: "One schema",
  },
] as const;

export function WhySlothing() {
  return (
    <DeepSection id="why-slothing" alt>
      <div className="rounded-2xl border border-rule bg-paper shadow-paper-card">
        <div className="grid gap-8 border-b border-rule p-6 md:grid-cols-[0.66fr_1.34fr] md:p-10">
          <div>
            <MonoCap>Why Slothing</MonoCap>
            <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(34px,4vw,54px)] font-bold leading-none tracking-display text-ink">
              Built so the job search finally works for you.
            </h2>
          </div>
          <p className="max-w-[60ch] self-end text-lede text-ink-2">
            Slothing is built for people who already feel overworked by their
            own job hunt. That shapes every decision — what we ground in your
            data, what we keep transparent, what we leave under your control.
          </p>
        </div>

        <div className="grid divide-y divide-rule lg:grid-cols-2 lg:divide-x lg:divide-y-0 xl:grid-cols-4">
          {PROOF_CELLS.map(({ icon: Icon, label, body, chip }) => (
            <div key={label} className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand" aria-hidden />
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-dark">
                  {chip}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[20px] font-bold leading-tight text-ink">
                {label}
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </DeepSection>
  );
}
