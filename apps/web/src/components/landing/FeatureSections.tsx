import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  CircleDot,
  FileText,
  Heart,
  Mic2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  DashList,
  DeepEyebrow,
  DeepGrid,
  DeepSection,
  HighlighterEm,
  MonoCap,
} from "./primitives";

/* ─────────── Shared local primitives ─────────── */

function FeatureNarrative({
  number,
  label,
  title,
  children,
  bullets,
}: {
  number: string;
  label: string;
  title: React.ReactNode;
  children: React.ReactNode;
  bullets: string[];
}) {
  return (
    <div className="flex max-w-[620px] flex-col gap-5">
      <DeepEyebrow number={number} label={label} />
      <h2 className="font-display text-section-h2 text-ink">{title}</h2>
      <p className="max-w-[56ch] text-lede text-ink-2">{children}</p>
      <DashList items={bullets} />
    </div>
  );
}

function AppSurface({
  eyebrow,
  title,
  children,
  mascot = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  mascot?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rule bg-paper shadow-paper-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
          <MonoCap className="ml-2 truncate">{eyebrow}</MonoCap>
        </div>
        <span className="hidden rounded-sm bg-page px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 sm:inline">
          {title}
        </span>
      </div>
      <div className="relative p-4 md:p-6">{children}</div>
      {mascot ? (
        <div className="pointer-events-none absolute -bottom-11 -right-3 h-40 w-32 opacity-95 md:h-52 md:w-40">
          <Image
            src="/brand/sloths/slothing-mascot-hero.png"
            alt=""
            fill
            className="object-contain object-bottom drop-shadow-[0_20px_30px_rgba(80,60,30,0.16)]"
            sizes="160px"
          />
        </div>
      ) : null}
    </div>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-medium text-brand-dark">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ANCHOR 01 — Knowledge Bank                                  */
/* "Atomize your career into reusable parts."                  */
/* ─────────────────────────────────────────────────────────── */

export function KnowledgeBankSection() {
  return (
    <DeepSection id="feat-bank">
      <DeepGrid>
        <FeatureNarrative
          number="01"
          label="Knowledge Bank"
          title={
            <>
              Upload once. Reuse <HighlighterEm>everywhere</HighlighterEm>.
            </>
          }
          bullets={[
            "Parses resumes, docs, and past applications into stories, projects, skills, and answers",
            "Keeps source context attached, so every later draft is grounded in something you actually did",
            "Becomes the single bank that resumes, cover letters, forms, and interview prep all draw from",
          ]}
        >
          Your career stops being scattered across fifteen Google Docs. Slothing
          turns it into a searchable component library — the source of truth
          every other part of the product reads from.
        </FeatureNarrative>

        <AppSurface eyebrow="knowledge bank" title="Resume parsed">
          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-lg border border-rule bg-page p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" aria-hidden />
                <MonoCap>source document</MonoCap>
              </div>
              <h3 className="mt-3 font-display text-[24px] font-bold leading-tight text-ink">
                Maya Chen — senior product manager
              </h3>
              <div className="mt-4 space-y-2 text-[13px] leading-5 text-ink-3">
                <p className="rounded-md bg-brand-soft px-3 py-2 text-ink-2">
                  Led billing platform launch from 0 to 1, reaching $4.2M ARR in
                  year one.
                </p>
                <p className="px-3 py-2">
                  Managed roadmap tradeoffs across product, design, and
                  engineering.
                </p>
                <p className="rounded-md bg-brand-soft px-3 py-2 text-ink-2">
                  Mentored six PMs through two reorganizations while maintaining
                  team delivery pace.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-rule bg-page">
              <div className="grid grid-cols-[1fr_92px_92px] border-b border-rule px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                <span>component</span>
                <span>type</span>
                <span>reuse</span>
              </div>
              {[
                ["Billing platform launch, $4.2M ARR", "impact", "resume"],
                ["Roadmap pushback with prototype evidence", "story", "prep"],
                ["Mentored six PMs to senior scope", "lead", "forms"],
                ["Payment rails architecture decisions", "skill", "cover"],
              ].map(([item, type, reuse]) => (
                <div
                  key={item}
                  className="grid grid-cols-[1fr_92px_92px] items-center border-b border-rule px-4 py-3 last:border-0"
                >
                  <span className="text-[13px] font-medium text-ink">
                    {item}
                  </span>
                  <span className="font-mono text-[11px] text-ink-3">
                    {type}
                  </span>
                  <span className="rounded-sm bg-paper px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    {reuse}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AppSurface>
      </DeepGrid>
    </DeepSection>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ANCHOR 02 — Capture overnight + Tinder review queue         */
/* "Jobs come to you. Review them on your phone."              */
/* ─────────────────────────────────────────────────────────── */

const QUEUE_CARDS = [
  {
    company: "Linear",
    role: "Design Engineer",
    location: "Remote · NA",
    match: 92,
    salary: "$170–210k",
    tags: ["React", "Design systems", "Remote-first"],
  },
  {
    company: "Notion",
    role: "Senior Product Designer",
    location: "NYC · Hybrid",
    match: 81,
    salary: "$160–195k",
    tags: ["Prototyping", "Editor tooling"],
  },
  {
    company: "Figma",
    role: "UX Engineer",
    location: "SF",
    match: 95,
    salary: "$185–225k",
    tags: ["WebGL", "Motion", "Design systems"],
  },
] as const;

export function CaptureAndQueueSection() {
  return (
    <DeepSection id="feat-capture" alt>
      <DeepGrid reverse>
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-rule bg-page-2 shadow-paper">
            <Image
              src="/marketing/anchors/overnight-capture.png"
              alt="Slothing mascot napping while job cards queue themselves from a laptop"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 640px"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {QUEUE_CARDS.slice(0, 2).map((card) => (
              <PhoneCard key={card.company} card={card} />
            ))}
          </div>
        </div>

        <FeatureNarrative
          number="02"
          label="Capture + Review"
          title={
            <>
              Job hunt while you sleep.
              <br />
              Review on your <HighlighterEm>coffee break</HighlighterEm>.
            </>
          }
          bullets={[
            "Browser extension scrapes LinkedIn, Greenhouse, Lever, Workday, Indeed, Waterloo Works, and generic JSON-LD postings",
            "Leave the agent running overnight — wake up to a normalized queue",
            "Swipe through it on your phone over breakfast, A/B-compare like for like across sources",
          ]}
        >
          The hardest part of a job hunt isn&rsquo;t applying. It&rsquo;s
          deciding what&rsquo;s worth applying to. Slothing collects roles from
          every board, normalizes them so they read the same, and lets you
          triage from your phone in the minutes you already have.
        </FeatureNarrative>
      </DeepGrid>
    </DeepSection>
  );
}

function PhoneCard({ card }: { card: (typeof QUEUE_CARDS)[number] }) {
  return (
    <div className="rounded-xl border border-rule bg-paper p-4 shadow-paper-card">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm border border-rule bg-page font-mono text-[11px] font-bold text-brand-dark">
            {card.company.slice(0, 2)}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink">
              {card.company}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-3">
              {card.location}
            </div>
          </div>
        </div>
        <div className="font-mono text-[11px] text-ink-2">{card.match}%</div>
      </div>
      <div className="mt-3 font-display text-[16px] font-bold leading-tight text-ink">
        {card.role}
      </div>
      <div className="mt-1 font-mono text-[11px] text-ink-3">{card.salary}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-page px-2 py-0.5 text-[11px] text-ink-2"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-rule bg-page text-[12px] text-ink-3">
          Skip
        </span>
        <span className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand text-[12px] font-medium text-page">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          Save
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ANCHOR 03 — Studio + ATS match                              */
/* "Tailor without hallucination."                             */
/* ─────────────────────────────────────────────────────────── */

export function StudioSection() {
  return (
    <DeepSection id="feat-studio">
      <DeepGrid>
        <FeatureNarrative
          number="03"
          label="Studio + ATS"
          title={
            <>
              Tailored to the role.
              <br />
              Grounded in <HighlighterEm>your bank</HighlighterEm>.
            </>
          }
          bullets={[
            "Assembles resumes, cover letters, and portfolios from real components — every bullet traceable back to your bank",
            "AI rewrites and net-new bullets are optional, and anything you like saves back to the bank for next time",
            "ATS scanner shows covered, weak, and missing requirements before you submit",
          ]}
        >
          Every tailored resume comes from your own words. The bank is the
          source of truth — so generated drafts can&rsquo;t hallucinate a
          project you never shipped or a skill you never used.
        </FeatureNarrative>

        <AppSurface eyebrow="studio · ats match" title="Figma design engineer">
          <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
            <div className="rounded-lg border border-rule bg-page p-5 text-center">
              <MonoCap>resume match</MonoCap>
              <div className="relative mx-auto mt-5 h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke="var(--rule)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${0.92 * 2 * Math.PI * 43} ${2 * Math.PI * 43}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-[34px] font-bold text-ink">
                    92
                  </span>
                  <MonoCap className="text-[9px]">match</MonoCap>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-5 text-ink-3">
                Strong fit. One motion-systems bullet would move this from
                strong to ready.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-lg border border-rule bg-page p-4">
                <div className="mb-3 flex items-center justify-between">
                  <MonoCap>requirement coverage</MonoCap>
                  <span className="font-mono text-[11px] text-ink-3">
                    18 of 21 covered
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "TypeScript",
                    "design systems",
                    "prototyping",
                    "cross-functional",
                  ].map((tag) => (
                    <MiniPill key={tag}>{tag}</MiniPill>
                  ))}
                  {["WebGL", "motion systems", "plugin APIs"].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper px-2.5 py-1 text-[11.5px] text-ink-3"
                    >
                      <CircleDot className="h-3 w-3" aria-hidden />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-rule bg-page p-4">
                <MonoCap>suggested edit</MonoCap>
                <p className="mt-3 text-[14px] leading-6 text-ink-2">
                  Swap the generic component-maintenance bullet for your saved
                  story about the launch-dashboard motion system.
                </p>
                <div className="mt-3 rounded-md bg-paper px-3 py-2 font-mono text-[12px] leading-5 text-ink-3">
                  source: Knowledge Bank · project: Launch dashboard
                </div>
              </div>
            </div>
          </div>
        </AppSurface>
      </DeepGrid>
    </DeepSection>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* SUPPORTING 04 — Answer Bank (autofill memory)               */
/* "Type each answer once. Slothing remembers the rest."       */
/* ─────────────────────────────────────────────────────────── */

export function AnswerBankSection() {
  return (
    <DeepSection id="feat-autofill" alt>
      <DeepGrid reverse>
        <AppSurface
          eyebrow="application form · greenhouse"
          title="Autofilled from memory"
          mascot
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
            <div className="space-y-4 rounded-lg border border-rule bg-page p-4">
              {[
                ["Full name", "Maya Chen", "remembered"],
                [
                  "Work authorization",
                  "US citizen — no sponsorship needed",
                  "remembered",
                ],
                [
                  "Why are you interested?",
                  "Figma is one of the rare design tools where systems thinking and craft meet at scale…",
                  "drafting",
                ],
              ].map(([label, value, state], index) => (
                <label key={label} className="block">
                  <span className="mb-1 flex items-center justify-between text-[12.5px] text-ink-3">
                    <span>{label}</span>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${
                        state === "remembered"
                          ? "bg-brand-soft text-brand-dark"
                          : "bg-page-2 text-ink-3"
                      }`}
                    >
                      {state}
                    </span>
                  </span>
                  <span
                    className={`block rounded-md border bg-paper px-3 py-2 text-[14px] leading-6 text-ink ${
                      index === 2 ? "border-brand" : "border-rule"
                    }`}
                  >
                    {value}
                    {index === 2 ? (
                      <span className="ml-px inline-block h-4 w-px translate-y-[3px] animate-caret-blink bg-brand" />
                    ) : null}
                  </span>
                </label>
              ))}
            </div>

            <div className="relative rounded-lg bg-inverse p-5 text-inverse-ink">
              <MonoCap className="text-inverse-ink/60">Memory</MonoCap>
              <p className="mt-3 text-[14px] leading-6 opacity-85">
                Pulled from your design-engineer voice preset and the launch
                story you wrote three applications ago. Edit once — it learns.
              </p>
              <div className="mt-5 space-y-2 text-[12.5px]">
                <div className="rounded-md bg-inverse-ink/10 px-3 py-2">
                  source: Answer Bank · 17 saved
                </div>
                <div className="rounded-md bg-inverse-ink/10 px-3 py-2">
                  tone: practical, concise
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <span className="rounded-md border border-current/20 px-3 py-1.5 text-[12px]">
                  Edit
                </span>
                <span className="rounded-md bg-inverse-ink px-3 py-1.5 text-[12px] text-inverse">
                  Fill field
                </span>
              </div>
            </div>
          </div>
        </AppSurface>

        <FeatureNarrative
          number="04"
          label="Answer Bank"
          title={
            <>
              Type each answer once.
              <br />
              Slothing <HighlighterEm>remembers the rest</HighlighterEm>.
            </>
          }
          bullets={[
            "The extension auto-imports your tailored resume and pre-fills every form field with one click",
            "Persistent answer bank stores free-text replies and adapts them per role — no copy-paste, no re-typing",
            "Every suggested answer shows its source, so you stay in control of the words that go out",
          ]}
        >
          Application forms are the silent tax on a job hunt. Slothing&rsquo;s
          answer bank turns the eleventh time you write &ldquo;why this
          company?&rdquo; into a one-click fill — and gets better at sounding
          like you with every edit.
        </FeatureNarrative>
      </DeepGrid>
    </DeepSection>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* SUPPORTING 05 — Research + Interview prep                   */
/* "When the interview lands, you're already prepared."        */
/* ─────────────────────────────────────────────────────────── */

export function InterviewResearchSection() {
  return (
    <DeepSection id="feat-interview">
      <DeepGrid>
        <FeatureNarrative
          number="05"
          label="Research + Practice"
          title={
            <>
              When the interview lands,
              <br />
              you&rsquo;re <HighlighterEm>already prepared</HighlighterEm>.
            </>
          }
          bullets={[
            "Research agents pull company, role, salary band, team, and recent news into a single dossier",
            "Interview prep generates prompts from the actual role and your bank — not generic flashcards",
            "Voice recording + STAR coaching grade structure, specificity, and tradeoff reasoning",
          ]}
        >
          Most interview prep tools throw generic questions at you. Slothing
          uses the same role context and the same stories you applied with, so
          the practice rehearses the answers you&rsquo;re actually going to
          need.
        </FeatureNarrative>

        <div className="grid gap-4">
          <AppSurface eyebrow="research · figma" title="Company dossier">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  icon: Building2,
                  label: "Company snapshot",
                  body: "Series E. Recent multimodal AI launch. Hiring across editor + AI surface area.",
                },
                {
                  icon: Sparkles,
                  label: "Salary band",
                  body: "$185k – $225k base + equity. Comp transparency in offer letter.",
                },
                {
                  icon: Search,
                  label: "Team you'd join",
                  body: "Reports to Sho Kuwamoto. Six engineers, two designers. Eng-heavy.",
                },
                {
                  icon: FileText,
                  label: "Likely topics",
                  body: "Design systems, prototyping in code, motion, plugin APIs.",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-lg border border-rule bg-page p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-brand" aria-hidden />
                      <MonoCap>{card.label}</MonoCap>
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-ink-2">
                      {card.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </AppSurface>

          <AppSurface eyebrow="interview · practice" title="STAR loop">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <div className="max-w-[88%] rounded-lg bg-page-2 px-4 py-3 text-[13.5px] leading-6 text-ink-2">
                  Tell me about a time you disagreed with your manager.
                </div>
                <div className="ml-auto max-w-[88%] rounded-lg bg-ink px-4 py-3 text-[13.5px] leading-6 text-page">
                  The roadmap had us building a marketplace, but usage data
                  showed teams needed better eval tools. I pushed back with a
                  three-week prototype…
                </div>
              </div>

              <div className="rounded-lg border border-rule bg-page p-3">
                <div className="flex items-center gap-2">
                  <Mic2 className="h-3.5 w-3.5 text-brand" aria-hidden />
                  <MonoCap>feedback</MonoCap>
                </div>
                {[
                  ["Structure", "8.2"],
                  ["Specificity", "7.4"],
                  ["Tradeoffs", "9.1"],
                ].map(([label, score]) => (
                  <div key={label} className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[12.5px]">
                      <span className="text-ink-2">{label}</span>
                      <span className="font-mono font-medium text-ink">
                        {score}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Number(score) * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AppSurface>
        </div>
      </DeepGrid>
    </DeepSection>
  );
}
