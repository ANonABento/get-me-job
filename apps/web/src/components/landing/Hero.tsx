import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HaloEyebrow, MonoCap } from "./primitives";

/**
 * Neutral baseline hero — locked copy from the IA pass, but no
 * magazine treatment. Awaiting reference-driven visual direction.
 */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-page">
      <div className="mx-auto w-full max-w-[1480px] px-5 pb-16 pt-9 md:px-10 md:pb-20 md:pt-12">
        <div className="grid min-h-[calc(100dvh-86px)] items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(580px,1.14fr)] lg:gap-10">
          {/* Copy column */}
          <div className="flex max-w-[680px] flex-col gap-6">
            <HaloEyebrow>A calmer way to job hunt</HaloEyebrow>

            <h1 className="text-balance font-display text-hero-h1 text-ink">
              You&rsquo;re not lazy.
              <br />
              Your job search system is.
            </h1>

            <div className="max-w-[58ch] space-y-3 text-hero-sub text-ink-2">
              <p>
                Slothing replaces the fifteen tabs, the eight Google Docs, and
                the cover letter you&rsquo;ve rewritten for the eleventh time.
              </p>
              <p className="font-medium text-ink">
                One workspace. One source of truth. One calmer way to apply.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-in">
                  Try Slothing free{" "}
                  <span className="ml-1 transition-transform group-hover:translate-x-[3px]">
                    →
                  </span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#the-loop">See how it works ↓</a>
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
              <a
                href="https://github.com/ANonABento/slothing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-ink-2"
              >
                <span aria-hidden>★</span>
                <span>Star on GitHub</span>
              </a>
              <span className="h-1 w-1 rounded-full bg-ink-3/40" aria-hidden />
              <span>AGPL-3.0 open source</span>
              <span className="h-1 w-1 rounded-full bg-ink-3/40" aria-hidden />
              <span>BYOK · self-hostable</span>
            </div>
          </div>

          {/* Visual column — single floating prop + mascot */}
          <div className="relative mx-auto flex min-h-[520px] w-full max-w-[520px] items-end justify-center lg:mx-0 lg:min-h-[640px] lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute right-0 top-2 w-[260px] origin-top-right rounded-lg border border-rule bg-paper p-4 shadow-paper-elevated md:right-4 md:w-[300px] md:p-5"
            >
              <div className="flex items-center justify-between border-b border-rule pb-2">
                <MonoCap>Today</MonoCap>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                  Tue
                </span>
              </div>
              <div className="mt-3 font-display text-[20px] font-bold leading-tight text-ink md:text-[22px]">
                Two focused moves.
                <br />
                Then you&rsquo;re done.
              </div>
              <ul className="mt-4 space-y-2 text-[13px]">
                {[
                  ["Tailor resume · Linear", true],
                  ["Practice STAR · backend loop", false],
                ].map(([task, done]) => (
                  <li
                    key={task as string}
                    className={`flex items-center gap-2 ${
                      done ? "text-ink-3 line-through" : "text-ink"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`inline-block h-3 w-3 rounded-full ${
                        done ? "bg-brand" : "border-2 border-brand"
                      }`}
                    />
                    {task}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-rule pt-3">
                <MonoCap>Match</MonoCap>
                <div className="inline-flex items-center gap-1.5 font-display text-[18px] font-bold text-brand-dark">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                  95
                </div>
              </div>
            </div>

            <Image
              src="/brand/sloths/slothing-mascot-hero.png"
              alt="Slothing mascot holding a resume folder"
              fill
              priority
              className="object-contain object-bottom drop-shadow-[0_32px_42px_rgba(80,60,30,0.22)] dark:drop-shadow-[0_30px_44px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 768px) 80vw, (max-width: 1280px) 460px, 560px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
