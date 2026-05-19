import { HonestyPanel } from "@/components/ats/honesty-panel";
import { ScannerForm } from "@/components/ats/scanner-form";
import { getLocalizedPageMetadata } from "@/lib/seo";
import { ArrowRight, Eye, Sparkles, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MonoCap } from "@/components/landing/primitives";
import { InverseCTABand } from "@/components/landing/InverseCTABand";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("atsScanner", params.locale);
}

const BENEFITS = [
  {
    icon: Zap,
    title: "Instant Results",
    description: "Score in under a second, no signup required",
  },
  {
    icon: Eye,
    title: "Detailed Breakdown",
    description:
      "Five scoring axes plus JD keyword matching when you paste a job",
  },
  {
    icon: Sparkles,
    title: "Free and Private",
    description:
      "We parse resumes on our servers, do not save them to your account, and do not share them",
  },
];

interface ATSScannerPageProps {
  params: {
    locale: string;
  };
}

export default function ATSScannerPage({ params }: ATSScannerPageProps) {
  const locale = params.locale;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-[820px] px-5 pb-10 pt-10 text-center md:px-10 md:pb-14 md:pt-16">
          <span className="inline-flex items-center gap-2.5 self-center rounded-full border border-rule bg-paper py-1 pl-1 pr-3 text-[12.5px] text-ink-2">
            <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
              Free tool
            </span>
            No sign-in required
          </span>
          <h1 className="mx-auto mt-5 max-w-[16ch] font-display text-[clamp(36px,4.8vw,60px)] font-extrabold leading-[0.98] tracking-display text-ink">
            Free ATS Resume Scanner
          </h1>
          <p className="mx-auto mt-5 max-w-[58ch] text-[16.5px] leading-[1.55] text-ink-2">
            88% of executives in Harvard&apos;s Hidden Workers study say their
            ATS configuration excludes viable candidates. We check the
            mechanical and content issues that actually trip parsers and
            recruiters.
          </p>
          <p className="mt-3 text-xs leading-5 text-ink-3">
            <a
              href="https://www.hbs.edu/managing-the-future-of-work/Documents/research/hiddenworkers09032021.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Source: Harvard Business School, Hidden Workers (2021)
            </a>
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-rule bg-paper py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-rule bg-page p-6 shadow-paper-card md:p-7"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="mt-4 font-display text-[16px] font-bold text-ink">
                  {title}
                </div>
                <div className="mt-2 text-[13.5px] leading-6 text-ink-2">
                  {description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner form — wrapped in editorial paper card */}
      <section className="border-t border-rule bg-page py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1080px] px-5 md:px-10">
          <div className="mb-6 flex flex-col gap-2">
            <MonoCap className="text-brand">Run the scan</MonoCap>
            <h2 className="font-display text-[clamp(22px,2.4vw,30px)] font-extrabold leading-tight tracking-display text-ink">
              Drop a resume and (optionally) a job description.
            </h2>
          </div>
          <ScannerForm locale={locale} />
        </div>
      </section>

      {/* Post-scan upsell — route into Studio */}
      <section className="border-t border-rule bg-paper py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1080px] px-5 md:px-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-page p-6 shadow-paper-card md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <MonoCap className="text-brand">After the scan</MonoCap>
              <h2 className="mt-2 font-display text-[clamp(20px,2.2vw,28px)] font-extrabold leading-tight tracking-display text-ink">
                Want help fixing the gaps?
              </h2>
              <p className="mt-2 max-w-[58ch] text-[14.5px] leading-6 text-ink-2">
                Studio rewrites resumes from your saved components — every
                bullet traceable, every score actionable.
              </p>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-page transition-opacity hover:opacity-90"
            >
              Open Studio
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Honesty panel — what this score means */}
      <section className="border-t border-rule bg-page py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1080px] px-5 md:px-10">
          <HonestyPanel />
        </div>
      </section>

      {/* Closer */}
      <InverseCTABand
        eyebrow="Skip the guessing"
        headlineTop="Score, fix, send."
        headlineBottom="Then forget about ATS."
        body="Slothing's scanner catches what parsers actually choke on. Studio assembles the fix from your own components, no hallucinations."
        ctaPrimary={{
          label: "Try Slothing free",
          href: "/sign-in",
        }}
        ctaSecondary={{
          label: "Star on GitHub",
          href: "https://github.com/ANonABento/slothing",
          leadingGlyph: "★",
          external: true,
        }}
      />
    </>
  );
}
