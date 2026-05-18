import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Database, Plug, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeepSection, HighlighterEm, LogoChip, MonoCap } from "./primitives";
import { CloserStats } from "./RichSections";

/* ───────────────── How it works ───────────────── */
export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Build the bank",
      body: "Upload a resume, paste notes, or import past answers. Slothing extracts the reusable evidence.",
      panel: "42 saved stories",
      rows: ["projects", "metrics", "saved answers"],
    },
    {
      number: "02",
      title: "Review the role",
      body: "Import listings from the extension, score each JD, and keep only the roles worth attention.",
      panel: "9 roles in queue",
      rows: ["matched", "needs tailoring", "skip"],
    },
    {
      number: "03",
      title: "Ship with context",
      body: "Tailor the resume, draft form answers, and practice the interview from the same source material.",
      panel: "2 focused moves today",
      rows: ["tailor resume", "fill form", "prep story"],
    },
  ] as const;

  return (
    <DeepSection id="how-it-works" className="border-y border-rule bg-page">
      <div className="grid gap-10 lg:grid-cols-[0.58fr_1.42fr] lg:items-start">
        <div className="max-w-[560px]">
          <MonoCap>How it works</MonoCap>
          <h2 className="mt-4 font-display text-section-h2 text-ink">
            A practical loop for the whole{" "}
            <HighlighterEm>job search</HighlighterEm>.
          </h2>
          <p className="mt-5 text-lede text-ink-2">
            Slothing is organized around the work you repeat: collect evidence,
            choose the right roles, then reuse that evidence with less friction.
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="grid gap-4 rounded-xl border border-rule bg-paper p-4 shadow-paper-card md:grid-cols-[170px_1fr_230px] md:items-center"
            >
              <div>
                <MonoCap>Step {step.number}</MonoCap>
                <h3 className="mt-2 font-display text-[24px] font-bold leading-tight text-ink">
                  {step.title}
                </h3>
              </div>
              <p className="text-[14px] leading-6 text-ink-2">{step.body}</p>
              <div className="rounded-lg border border-rule bg-page p-3">
                <div className="font-display text-[18px] font-bold text-ink">
                  {step.panel}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {step.rows.map((row) => (
                    <span
                      key={row}
                      className="rounded-sm bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3"
                    >
                      {row}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DeepSection>
  );
}

/* ───────────────── Integrations strip ───────────────── */
export function IntegrationsStrip() {
  const columns = [
    {
      icon: Database,
      label: "Career data",
      body: "Import resumes, saved answers, and job descriptions without locking the material away.",
      chips: ["PDF", "DOCX", "Drive", "Markdown"],
    },
    {
      icon: Plug,
      label: "Model choice",
      body: "Use hosted models, bring your own key, or run local models when privacy matters.",
      chips: ["OpenAI", "Anthropic", "OpenRouter", "Ollama"],
    },
    {
      icon: CalendarDays,
      label: "Follow-through",
      body: "Keep interviews, reminders, email drafts, and next steps attached to the role.",
      chips: ["Calendar", "Gmail", "Tasks", "Notes"],
    },
  ] as const;

  return (
    <DeepSection alt>
      <div className="rounded-xl border border-rule bg-paper shadow-paper-card">
        <div className="grid gap-8 border-b border-rule p-6 md:grid-cols-[0.68fr_1.32fr] md:p-8">
          <div>
            <MonoCap>Fits your setup</MonoCap>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(34px,4vw,54px)] font-bold leading-none tracking-display text-ink">
              Private when you need it, connected when it helps.
            </h2>
          </div>
          <p className="max-w-[64ch] self-end text-lede text-ink-2">
            Job searches contain sensitive data. Slothing keeps the architecture
            flexible: local-first workflows, bring-your-own-key model access,
            and integrations that move the work forward without hiding your
            files.
          </p>
        </div>

        <div className="grid divide-y divide-rule lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {columns.map(({ icon: Icon, label, body, chips }) => (
            <div key={label} className="p-6 md:p-8">
              <Icon className="h-5 w-5 text-brand" aria-hidden />
              <h3 className="mt-4 font-display text-[22px] font-bold text-ink">
                {label}
              </h3>
              <p className="mt-2 min-h-[72px] text-[14px] leading-6 text-ink-2">
                {body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <LogoChip key={chip}>{chip}</LogoChip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DeepSection>
  );
}

/* ───────────────── Job-queue product preview ───────────────── */
export function JobQueuePreview() {
  const rows: [
    string,
    string,
    string,
    "apply" | "applied" | "interview" | "saved",
    number,
    string,
    string,
  ][] = [
    [
      "Design Engineer",
      "Figma",
      "Apply",
      "apply",
      95,
      "Today",
      "Tailor resume",
    ],
    [
      "Senior PM",
      "Linear",
      "Applied",
      "applied",
      88,
      "2d ago",
      "Wait for reply",
    ],
    [
      "Product Engineer",
      "Vercel",
      "Interview",
      "interview",
      91,
      "5d ago",
      "Phone screen Tue",
    ],
    [
      "Brand Designer",
      "Notion",
      "Saved",
      "saved",
      74,
      "1w ago",
      "Decide by Fri",
    ],
    [
      "Founding Designer",
      "Replicate",
      "Apply",
      "apply",
      86,
      "Today",
      "Write cover letter",
    ],
    ["UX Engineer", "Stripe", "Saved", "saved", 78, "2w ago", "Revisit later"],
  ];
  const statusClasses: Record<(typeof rows)[number][3], string> = {
    apply: "bg-brand-soft text-brand-dark",
    applied: "bg-[var(--stage-applied-bg)] text-[var(--stage-applied-fg)]",
    interview:
      "bg-[var(--stage-interview-bg)] text-[var(--stage-interview-fg)]",
    saved: "bg-page-2 text-ink-3",
  };

  return (
    <DeepSection>
      <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
        <div className="max-w-[560px]">
          <MonoCap>A look inside</MonoCap>
          <h2 className="mt-4 font-display text-section-h2 text-ink">
            The queue shows what needs <HighlighterEm>attention</HighlighterEm>.
          </h2>
          <p className="mt-5 text-lede text-ink-2">
            Every saved role gets a status, match score, and next step. The goal
            is not more activity. It is knowing exactly what to do next.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-rule bg-paper shadow-paper-elevated">
          <div className="flex flex-col gap-4 border-b border-rule p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-2 rounded-md border border-rule bg-page px-3 py-2 text-[13px] text-ink-3">
              <Search className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="truncate">Search opportunities...</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["All", 23, true],
                ["To apply", 8, false],
                ["Applied", 10, false],
                ["Interview", 3, false],
                ["Offer", 2, false],
              ].map(([label, count, active]) => (
                <span
                  key={label as string}
                  className={`rounded-full px-3 py-1 text-[12.5px] ${
                    active ? "bg-page text-ink" : "text-ink-3"
                  }`}
                >
                  {label}{" "}
                  <span className="ml-1 font-mono text-[11px] text-ink-3">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-rule text-ink-3">
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Company
                  </th>
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Match
                  </th>
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Added
                  </th>
                  <th className="px-4 py-3 font-mono text-mono-cap uppercase">
                    Next step
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(
                  ([role, company, status, statusKey, match, added, next]) => (
                    <tr
                      key={role}
                      className="border-b border-rule last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-ink">{role}</td>
                      <td className="px-4 py-3 text-ink-2">{company}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${statusClasses[statusKey]}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-page-2">
                            <div
                              className="h-full rounded-full bg-brand"
                              style={{ width: `${match}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11.5px] text-ink-3">
                            {match}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-3">{added}</td>
                      <td className="px-4 py-3 text-ink-2">{next}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DeepSection>
  );
}

/* ───────────────── Closer ───────────────── */
export function Closer() {
  return (
    <DeepSection className="pt-0">
      <div className="relative overflow-hidden rounded-2xl bg-inverse p-8 text-inverse-ink md:p-12 lg:p-16">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-center">
          <div>
            <MonoCap className="text-inverse-ink/55">
              Ready when you are
            </MonoCap>
            <h2 className="mt-4 font-display text-closer-h2">
              A calmer job search starts with one organized workspace.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[17px] leading-7 opacity-80">
              Free to try. Free to self-host. Bring your own keys or use hosted
              Slothing when you want the boring parts handled.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="default">
                <Link href="/sign-in">Get started free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href="https://github.com/ANonABento/slothing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Star on GitHub
                </a>
              </Button>
            </div>
            <CloserStats />
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute inset-x-0 top-0 rounded-xl border border-inverse-ink/15 bg-inverse-ink/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-inverse-ink/15 pb-3">
                <MonoCap className="text-inverse-ink/55">
                  Today in Slothing
                </MonoCap>
                <span className="rounded-sm bg-inverse-ink/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-inverse-ink/70">
                  focused
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Tailor resume", "Figma design engineer"],
                  ["Fill application", "Greenhouse form ready"],
                  ["Prep story", "Roadmap pushback answer"],
                  ["Send follow-up", "Linear recruiter thread"],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-lg border border-inverse-ink/[0.12] bg-inverse-ink/[0.07] p-3"
                  >
                    <div className="text-[13px] font-semibold">{title}</div>
                    <div className="mt-1 text-[12px] opacity-65">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <Image
              src="/brand/sloths/slothing-mascot-hero.png"
              alt="Slothing mascot holding a resume folder"
              fill
              className="object-contain object-bottom drop-shadow-[0_32px_42px_rgba(0,0,0,0.34)]"
              sizes="(max-width: 768px) 70vw, 420px"
            />
          </div>
        </div>
      </div>
    </DeepSection>
  );
}

/* ───────────────── Footer ───────────────── */
export function LandingFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto w-full max-w-wrap px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-[18px] font-bold text-ink">
              Slothing
            </div>
            <p className="mt-2 text-[13px] text-ink-3">
              A calmer way to job hunt. Free and open source.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Studio", "/studio"],
              ["Opportunities", "/opportunities"],
              ["Interview prep", "/interview"],
              ["Pricing", "/pricing"],
            ]}
          />
          <FooterCol
            title="Open source"
            links={[
              ["GitHub", "https://github.com/ANonABento/slothing"],
              ["Self-host docs", "/docs/self-host"],
              ["License", "/docs/license"],
              ["Roadmap", "https://github.com/ANonABento/slothing/projects"],
            ]}
          />
          <FooterCol
            title="Community"
            links={[
              ["Discord", "https://discord.gg/slothing"],
              [
                "Discussions",
                "https://github.com/ANonABento/slothing/discussions",
              ],
              ["Issues", "https://github.com/ANonABento/slothing/issues"],
              ["Changelog", "/changelog"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-rule pt-6 text-[12.5px] text-ink-3 md:flex-row">
          <span>© 2026 Slothing</span>
          <MonoCap>v0.4 · cream · rust · outfit · soft</MonoCap>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <MonoCap>{title}</MonoCap>
      <ul className="mt-3 space-y-2 text-[13.5px]">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-ink-2 hover:text-ink">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
