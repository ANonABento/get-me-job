import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Layers,
  Mic2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { DeepSection, MonoCap } from "./primitives";

/**
 * Neutral baseline loop section — keeps the 6-stage IA and the real
 * `/marketing/loop/loop-hero.png` illustration, but drops the magazine
 * masthead / giant ordinals / column rules while we wait on
 * reference-driven visual direction.
 */

const STAGES = [
  {
    n: "01",
    label: "Atomize",
    icon: Layers,
    title: "Your career, in reusable pieces",
    body: "Upload resumes, docs, past applications. Slothing parses them into stories, projects, skills, and answers — your single source of truth.",
  },
  {
    n: "02",
    label: "Capture",
    icon: Sparkles,
    title: "Jobs come to you, even overnight",
    body: "The browser extension scrapes LinkedIn, Greenhouse, Lever, Workday, Indeed, and more. Leave the agent running while you sleep.",
  },
  {
    n: "03",
    label: "Review",
    icon: Smartphone,
    title: "Tinder for jobs, on your phone",
    body: "Every saved role is normalized so a Workday listing and an Indeed listing read the same. Swipe through over breakfast.",
  },
  {
    n: "04",
    label: "Tailor",
    icon: FileText,
    title: "Resumes assembled, not hallucinated",
    body: "Studio builds resumes, cover letters, and portfolios from your real components — every bullet traceable to your bank. ATS scores included.",
  },
  {
    n: "05",
    label: "Autofill",
    icon: ArrowRight,
    title: "Type each answer exactly once",
    body: "The extension auto-imports your tailored doc and fills application forms from an answer bank that learns your voice as you go.",
  },
  {
    n: "06",
    label: "Practice",
    icon: Mic2,
    title: "Ready by the time the interview lands",
    body: "Research agents pull company, role, salary, and team context. Voice-based STAR practice uses the same stories you applied with.",
  },
] as const;

export function TheLoop() {
  return (
    <DeepSection id="the-loop" className="border-y border-rule">
      <div className="grid gap-10 lg:grid-cols-[0.52fr_1.48fr] lg:items-end">
        <div className="max-w-[560px]">
          <MonoCap>The loop</MonoCap>
          <h2 className="mt-4 font-display text-section-h2 text-ink">
            One workspace. Six quieter steps.
          </h2>
          <p className="mt-5 text-lede text-ink-2">
            Slothing is built around how job searches actually work — a loop
            that keeps everything connected, so the work you did for one role
            keeps paying off for the next.
          </p>
        </div>
      </div>

      <div className="mt-12 overflow-hidden rounded-xl border border-rule bg-paper md:mt-16">
        <Image
          src="/marketing/loop/loop-hero.png"
          alt="Slothing mascot walking through the six stages of the loop"
          width={2400}
          height={1030}
          sizes="100vw"
          className="h-auto w-full object-cover"
          priority={false}
        />
      </div>

      <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <li
              key={stage.n}
              className="relative flex flex-col gap-3 rounded-xl border border-rule bg-paper p-5 shadow-paper-card md:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <MonoCap>
                    {stage.n} · {stage.label}
                  </MonoCap>
                </span>
                <CalendarDays className="h-4 w-4 text-ink-3/40" aria-hidden />
              </div>
              <h3 className="font-display text-[22px] font-bold leading-tight text-ink">
                {stage.title}
              </h3>
              <p className="text-[14px] leading-6 text-ink-2">{stage.body}</p>
            </li>
          );
        })}
      </ol>
    </DeepSection>
  );
}
