import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  FileText,
  Mic2,
  Search,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturePill, HaloEyebrow, HighlighterEm, MonoCap } from "./primitives";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-page">
      <div className="mx-auto w-full max-w-[1480px] px-5 pb-16 pt-9 md:px-10 md:pb-20 md:pt-12">
        <div className="grid min-h-[calc(100dvh-86px)] items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(620px,1.14fr)] lg:gap-10">
          {/* Copy column */}
          <div className="flex max-w-[720px] flex-col gap-6">
            <HaloEyebrow>A calmer way to job hunt</HaloEyebrow>

            <h1 className="max-w-[13ch] text-balance font-display text-hero-h1 text-ink">
              A job search that <HighlighterEm>doesn&rsquo;t</HighlighterEm>{" "}
              wear you out.
            </h1>

            <p className="max-w-[52ch] text-hero-sub text-ink-2">
              One workspace for resumes, opportunities, application forms, and
              interview prep. Built by people who got tired of switching between
              fifteen tools to send one email.
            </p>

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
                <a href="#feat-bank">See how it works</a>
              </Button>
            </div>

            {/* Hero meta — social proof line, replaces what would be a
                "trusted by X companies" logo bar for SaaS. Open-source
                + permissive license + free is the angle. */}
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

            <div className="mt-3 flex flex-col gap-3 border-t border-rule pt-5">
              <MonoCap>Inside Slothing</MonoCap>
              <div className="flex flex-wrap gap-2">
                <FeaturePill href="#feat-bank" icon={<FileText size={14} />}>
                  Knowledge Bank
                </FeaturePill>
                <FeaturePill href="#feat-scrape" icon={<Search size={14} />}>
                  Browser scraper
                </FeaturePill>
                <FeaturePill href="#feat-ats" icon={<Target size={14} />}>
                  ATS match
                </FeaturePill>
                <FeaturePill href="#feat-autofill" icon={<Edit3 size={14} />}>
                  Form autofill
                </FeaturePill>
                <FeaturePill href="#feat-interview" icon={<Mic2 size={14} />}>
                  Interview prep
                </FeaturePill>
              </div>
            </div>
          </div>

          {/* Visual column: mascot anchored to a product workspace. */}
          <div className="relative mx-auto min-h-[580px] w-full max-w-[760px] lg:mx-0 lg:min-h-[680px] lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute left-6 right-2 top-6 h-[360px] rounded-xl border border-rule bg-paper shadow-paper-elevated md:left-0 md:right-10 md:h-[430px] lg:h-[470px]"
            >
              <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
                <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                  slothing workspace
                </span>
              </div>

              <div className="grid h-[calc(100%-49px)] grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 p-4">
                <div className="hidden flex-col gap-3 md:flex">
                  {[
                    ["Bank", "42 stories", "bg-brand"],
                    ["Tracker", "9 roles", "bg-ink-3"],
                    ["Studio", "3 drafts", "bg-ink-3"],
                    ["Interview", "Tue 10:00", "bg-brand"],
                  ].map(([label, value, dot]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-rule bg-page px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${dot}`}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                          {label}
                        </span>
                      </div>
                      <div className="mt-1 font-display text-[18px] font-bold text-ink">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-rule bg-page p-4">
                    <MonoCap>Today</MonoCap>
                    <div className="mt-2 font-display text-[24px] font-bold leading-tight text-ink">
                      Two focused moves, then you&rsquo;re done.
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {[
                        ["Tailor resume", "Linear · 92% match"],
                        ["Prep stories", "Backend loop · 5 prompts"],
                      ].map(([title, body]) => (
                        <div
                          key={title}
                          className="rounded-md border border-rule bg-paper px-3 py-2"
                        >
                          <div className="text-[13px] font-semibold text-ink">
                            {title}
                          </div>
                          <div className="mt-1 text-[12px] text-ink-3">
                            {body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-rule bg-page p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <MonoCap>Resume match</MonoCap>
                        <div className="mt-1 font-display text-[20px] font-bold text-ink">
                          Design Engineer
                        </div>
                      </div>
                      <div className="grid h-16 w-16 place-items-center rounded-full border border-brand bg-brand-soft font-display text-[22px] font-bold text-brand-dark">
                        95
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
                      <div className="h-full w-[95%] rounded-full bg-brand" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["React", "Systems", "Figma", "CSS"].map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-1 text-[11px] text-ink-2"
                        >
                          <CheckCircle2 className="h-3 w-3 text-brand" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Image
              src="/brand/sloths/slothing-mascot-hero.png"
              alt="Slothing mascot holding a resume folder"
              fill
              priority
              className="object-contain object-bottom drop-shadow-[0_32px_42px_rgba(80,60,30,0.22)] dark:drop-shadow-[0_30px_44px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 768px) 82vw, (max-width: 1280px) 520px, 620px"
            />

            <div className="absolute bottom-4 left-0 hidden w-[270px] rounded-lg border border-rule bg-paper/95 p-4 shadow-paper-card backdrop-blur md:block">
              <MonoCap>Next up</MonoCap>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  ["Tailor resume for Linear", true],
                  ["Send recruiter follow-up", true],
                  ["Practice STAR story", false],
                ].map(([task, done]) => (
                  <li
                    key={task as string}
                    className={`flex items-center gap-2 ${done ? "text-ink-3 line-through" : "text-ink"}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${done ? "bg-brand" : "border-2 border-brand"}`}
                      aria-hidden="true"
                    />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
