import Image from "next/image";
import { CheckCircle2, CircleDot, FileText, Mic2, Search } from "lucide-react";
import {
  DashList,
  DeepEyebrow,
  DeepGrid,
  DeepSection,
  HighlighterEm,
  MonoCap,
} from "./primitives";

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

/* ───────────────── 01 · Knowledge Bank ───────────────── */
export function KnowledgeBankSection() {
  return (
    <DeepSection id="feat-bank">
      <DeepGrid>
        <FeatureNarrative
          number="01"
          label="Knowledge Bank"
          title={
            <>
              Save the evidence once, then use it{" "}
              <HighlighterEm>everywhere</HighlighterEm>.
            </>
          }
          bullets={[
            "Extracts projects, metrics, skills, and STAR stories from resumes and notes",
            "Keeps source context so generated drafts stay grounded",
            "Reuses the same bank across resumes, cover letters, forms, and prep",
          ]}
        >
          Slothing starts by turning your scattered career material into a
          searchable bank. Every later feature pulls from that same source, so
          the story stays consistent from the first saved job to the final
          interview.
        </FeatureNarrative>

        <AppSurface eyebrow="knowledge bank" title="Resume parsed">
          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-lg border border-rule bg-page p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" aria-hidden />
                <MonoCap>source document</MonoCap>
              </div>
              <h3 className="mt-3 font-display text-[24px] font-bold leading-tight text-ink">
                Maya Chen - senior product manager
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
                <span>extracted item</span>
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

/* ───────────────── 02 · Browser scraper ───────────────── */
export function ExtensionSection() {
  return (
    <DeepSection id="feat-scrape" alt>
      <DeepGrid reverse>
        <AppSurface eyebrow="browser extension" title="Review before tracking">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-rule bg-page p-4">
              <div className="flex items-center gap-2 rounded-md border border-rule bg-paper px-3 py-2 text-[12px] text-ink-3">
                <Search className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  linkedin.com/jobs/search?keywords=design+engineer
                </span>
              </div>
              <div className="mt-4 rounded-lg bg-brand-soft p-4">
                <MonoCap className="text-brand-dark">detected page</MonoCap>
                <p className="mt-2 text-[14px] font-medium leading-6 text-ink">
                  47 listings found. Slothing can import the page into review
                  without adding noise to your tracked list.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <MiniPill>LinkedIn</MiniPill>
                <MiniPill>Greenhouse</MiniPill>
                <MiniPill>Lever</MiniPill>
                <MiniPill>Workday</MiniPill>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-rule bg-page">
              <div className="grid grid-cols-[1fr_92px_96px] border-b border-rule px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                <span>review queue</span>
                <span>match</span>
                <span>action</span>
              </div>
              {[
                ["Linear", "Design engineer - remote", 92, "track"],
                ["Notion", "Senior product designer - NYC", 81, "review"],
                ["Figma", "UX engineer - San Francisco", 95, "track"],
                ["Stripe", "Product engineer - remote", 76, "skip"],
              ].map(([company, role, match, action]) => (
                <div
                  key={company}
                  className="grid grid-cols-[1fr_92px_96px] items-center border-b border-rule px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {company}
                    </div>
                    <div className="truncate text-[12px] text-ink-3">
                      {role}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] text-ink-2">
                    {match}%
                  </span>
                  <span className="rounded-sm bg-paper px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AppSurface>

        <FeatureNarrative
          number="02"
          label="Browser scraper"
          title={
            <>
              Capture a listing without breaking your{" "}
              <HighlighterEm>flow</HighlighterEm>.
            </>
          }
          bullets={[
            "Imports single listings or job-search pages from common boards",
            "Routes everything through review before it joins the pipeline",
            "Keeps the full description attached to the role for later tailoring",
          ]}
        >
          The extension turns job boards into an intake layer. Save the roles
          worth considering, skip the obvious misses, and let Slothing carry the
          description forward into scoring, tailoring, and prep.
        </FeatureNarrative>
      </DeepGrid>
    </DeepSection>
  );
}

/* ───────────────── 03 · ATS match ───────────────── */
export function ATSMatchSection() {
  return (
    <DeepSection id="feat-ats">
      <DeepGrid>
        <FeatureNarrative
          number="03"
          label="ATS match"
          title={
            <>
              Know what to change before you{" "}
              <HighlighterEm>apply</HighlighterEm>.
            </>
          }
          bullets={[
            "Shows covered, weak, and missing requirements in one workbench",
            "Weights evidence by recency, impact, and role fit",
            "Suggests edits using material already in your Knowledge Bank",
          ]}
        >
          Slothing does not stop at a score. It shows why the resume matches,
          where the job description is underrepresented, and which saved story
          is the best next edit.
        </FeatureNarrative>

        <AppSurface eyebrow="match workbench" title="Figma design engineer">
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
                Good fit. One motion-systems bullet would move this from strong
                to ready.
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
                  Replace a generic component maintenance bullet with the saved
                  story about designing the prototype motion system for the
                  launch dashboard.
                </p>
                <div className="mt-3 rounded-md bg-paper px-3 py-2 font-mono text-[12px] leading-5 text-ink-3">
                  source: Knowledge Bank / project: Launch dashboard
                </div>
              </div>
            </div>
          </div>
        </AppSurface>
      </DeepGrid>
    </DeepSection>
  );
}

/* ───────────────── 04 · Form autofill ───────────────── */
export function FormAutofillSection() {
  return (
    <DeepSection id="feat-autofill" alt>
      <DeepGrid reverse>
        <AppSurface
          eyebrow="application form"
          title="Draft with evidence"
          mascot
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_310px]">
            <div className="space-y-4 rounded-lg border border-rule bg-page p-4">
              {[
                ["Full name", "Maya Chen"],
                ["Work authorization", "US citizen - no sponsorship needed"],
                [
                  "Why are you interested?",
                  "Figma is one of the rare design tools where systems thinking and craft meet at scale...",
                ],
              ].map(([label, value], index) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-[12.5px] text-ink-3">
                    {label}
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
              <MonoCap className="text-inverse-ink/60">Slothing draft</MonoCap>
              <p className="mt-3 text-[14px] leading-6 opacity-85">
                Pulled from your design-engineer voice preset and the billing
                platform launch story. Review the field, then fill it.
              </p>
              <div className="mt-5 space-y-2 text-[12.5px]">
                <div className="rounded-md bg-inverse-ink/10 px-3 py-2">
                  source: Knowledge Bank
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
          label="Form autofill"
          title={
            <>
              Stop rewriting the same answer in every{" "}
              <HighlighterEm>form</HighlighterEm>.
            </>
          }
          bullets={[
            "Drafts form answers from saved stories and reusable answers",
            "Lets you inspect and edit every response before filling",
            "Works with extension flows and Slothing-native application steps",
          ]}
        >
          The autofill flow is deliberately not a black box. Slothing proposes
          an answer, shows where it came from, and waits for you to approve the
          field.
        </FeatureNarrative>
      </DeepGrid>
    </DeepSection>
  );
}

/* ───────────────── 05 · Interview prep ───────────────── */
export function InterviewPrepSection() {
  return (
    <DeepSection id="feat-interview">
      <DeepGrid>
        <FeatureNarrative
          number="05"
          label="Interview prep"
          title={
            <>
              Practice with the job and your own{" "}
              <HighlighterEm>stories</HighlighterEm>.
            </>
          }
          bullets={[
            "Builds prompts from the target role and your resume evidence",
            "Scores structure, specificity, and tradeoff reasoning",
            "Turns weak answers into follow-up practice notes",
          ]}
        >
          Interview prep uses the same role and bank context as the application.
          You practice the stories you are likely to need, not random flashcard
          prompts.
        </FeatureNarrative>

        <AppSurface eyebrow="interview notes" title="Product sense loop">
          <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="max-w-[86%] rounded-lg bg-page-2 px-4 py-3 text-[14px] leading-6 text-ink-2">
                Tell me about a time you disagreed with your manager.
              </div>
              <div className="ml-auto max-w-[88%] rounded-lg bg-ink px-4 py-3 text-[14px] leading-6 text-page">
                The roadmap had us building a marketplace, but usage data showed
                teams needed better eval tools. I pushed back with a three-week
                prototype and a narrow success metric...
              </div>
              <div className="rounded-lg border border-rule bg-page p-4">
                <MonoCap>suggested tighter version</MonoCap>
                <p className="mt-3 text-[14px] leading-6 text-ink-2">
                  Name the alternative you rejected, then quantify the eval
                  prototype result before describing the decision.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-rule bg-page p-4">
              <div className="flex items-center gap-2">
                <Mic2 className="h-4 w-4 text-brand" aria-hidden />
                <MonoCap>feedback</MonoCap>
              </div>
              {[
                ["Structure", "8.2"],
                ["Specificity", "7.4"],
                ["Tradeoff reasoning", "9.1"],
              ].map(([label, score]) => (
                <div key={label} className="mt-4">
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
              <div className="mt-5 rounded-md bg-brand-soft px-3 py-2 text-[12.5px] leading-5 text-ink-2">
                Next prompt: explain a tradeoff you owned end to end.
              </div>
            </div>
          </div>
        </AppSurface>
      </DeepGrid>
    </DeepSection>
  );
}
