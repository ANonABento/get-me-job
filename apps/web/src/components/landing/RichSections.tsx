"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DeepSection, HighlighterEm, MonoCap } from "./primitives";

/* ───────────────── Logo strip — "Scrapes from" marquee ─────────────────
 *
 * Horizontal infinite-scroll band of job-board names. Sits under the
 * hero as instant "this works on the boards you actually use"
 * credibility. Marquee is implemented with a 50% translate over
 * duplicated content so the loop is seamless. CSS keyframes inline.
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
  // Duplicate the list so the marquee can loop cleanly at translate(-50%).
  const doubled = [...SCRAPED_BOARDS, ...SCRAPED_BOARDS];
  return (
    <section className="overflow-hidden border-y border-rule bg-page-2 py-7">
      <div className="mx-auto flex max-w-[1480px] items-center gap-7 px-5 md:px-10">
        <span className="flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Works where jobs live
        </span>
        {/* Mask the edges so items fade in/out as they enter/leave. */}
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

      {/* Marquee animation. 38s loop; pauses on hover so users can read.
          Respects prefers-reduced-motion. */}
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
          animation: logo-strip-scroll 38s linear infinite;
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

/* ───────────────── Problem compare — Before / After ─────────────────
 *
 * The setup beat: "Job hunting wasn't supposed to need fifteen tabs."
 * Wide, app-like bridge from scattered job-search work into a Slothing
 * workspace. This intentionally sets up the product flow before the
 * feature deep dives.
 */
const BEFORE_ROWS = [
  ["Resume_v7_final.docx", "Where did the Figma bullet go?"],
  ["Spreadsheet tracker", "Two roles are missing follow-up dates"],
  ["Chat draft", "Cover letter tone does not match the resume"],
  ["Workday form", "Typing the same answer again"],
] as const;

const AFTER_ROWS = [
  ["Knowledge Bank", "Stories, projects, metrics, and saved answers"],
  ["Review queue", "Imported jobs wait for a quick yes/no"],
  ["Studio", "Tailored resume and cover letter share the same evidence"],
  ["Interview prep", "Practice prompts use the role and your own stories"],
] as const;

export function ProblemCompare() {
  return (
    <DeepSection alt className="border-b border-rule">
      <div className="grid gap-10 lg:grid-cols-[0.66fr_1.34fr] lg:items-end">
        <div className="max-w-[590px]">
          <MonoCap>The shift</MonoCap>
          <h2 className="mt-4 font-display text-section-h2 text-ink">
            Turn scattered job-search work into{" "}
            <HighlighterEm>one calm workspace</HighlighterEm>.
          </h2>
          <p className="mt-5 max-w-[54ch] text-lede text-ink-2">
            Slothing keeps the moving parts connected: the role you saved, the
            resume you tailored, the form answer you wrote, and the interview
            story you need next.
          </p>
        </div>

        <div className="relative">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_56px_minmax(0,1.14fr)]">
            <WorkflowPanel
              label="Before"
              title="Pieces drift apart"
              rows={BEFORE_ROWS}
              muted
            />

            <div className="flex items-center justify-center text-ink-3">
              <ArrowRight
                className="hidden h-6 w-12 lg:block"
                aria-hidden="true"
              />
              <ArrowRight
                className="block h-6 w-12 rotate-90 lg:hidden"
                aria-hidden="true"
              />
            </div>

            <WorkflowPanel
              label="After"
              title="The work stays linked"
              rows={AFTER_ROWS}
            />
          </div>

          <div className="pointer-events-none absolute -bottom-16 right-5 hidden h-44 w-36 lg:block">
            <Image
              src="/brand/sloths/slothing-mascot-hero.png"
              alt=""
              fill
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(80,60,30,0.16)]"
              sizes="144px"
            />
          </div>
        </div>
      </div>
    </DeepSection>
  );
}

function WorkflowPanel({
  label,
  title,
  rows,
  muted = false,
}: {
  label: string;
  title: string;
  rows: readonly (readonly [string, string])[];
  muted?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-rule bg-paper shadow-paper-card ${
        muted ? "opacity-85" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${muted ? "bg-ink-3/50" : "bg-brand"}`}
            aria-hidden
          />
          <MonoCap>{label}</MonoCap>
        </div>
        {!muted ? (
          <span className="rounded-sm bg-brand-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-dark">
            synced
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="font-display text-[24px] font-bold leading-tight text-ink">
          {title}
        </h3>
        <div className="mt-5 divide-y divide-rule rounded-lg border border-rule bg-page">
          {rows.map(([name, detail]) => (
            <div
              key={name}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_1fr]"
            >
              <span className="text-[13px] font-semibold text-ink">{name}</span>
              <span className="text-[13px] leading-5 text-ink-3">{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ───────────────── Closer stats — 4 numbers in the closer ─────────────────
 *
 * Sits inside the existing <Closer/>, BUT can also be rendered standalone.
 * Numbers are honest placeholders; swap when we have real data.
 */
const CLOSER_STATS = [
  { num: "BYOK", cap: "Bring your key" },
  { num: "AGPL", cap: "Open license" },
  { num: "$0", cap: "Free forever (hosted free tier)" },
  { num: "100%", cap: "Self-hostable" },
] as const;

export function CloserStats() {
  return (
    <div className="mt-10 flex flex-wrap gap-9 border-t border-inverse-ink/15 pt-8 dark:border-rule">
      {CLOSER_STATS.map((stat) => (
        <div key={stat.num}>
          <div className="font-display text-[28px] font-bold tracking-tight leading-none text-inverse-ink">
            {stat.num}
          </div>
          <div className="mt-1.5 text-[12.5px] text-inverse-ink/55">
            {stat.cap}
          </div>
        </div>
      ))}
    </div>
  );
}
