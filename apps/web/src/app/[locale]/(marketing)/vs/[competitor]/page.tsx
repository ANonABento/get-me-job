import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Check, Github, KeyRound, ShieldCheck, TimerReset } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import {
  CompareTable,
  type CompareColumn,
  type CompareRow,
} from "@/components/landing/CompareTable";
import { InverseCTABand } from "@/components/landing/InverseCTABand";
import { HighlighterEm } from "@/components/landing/primitives";

const competitors = {
  teal: {
    name: "Teal",
    positioning: "career dashboard",
    contrast:
      "Teal is a polished hosted career dashboard. Slothing is for people who want inspectable AI workflows, self-hosting, and no annual lock-in.",
  },
  huntr: {
    name: "Huntr",
    positioning: "job search CRM",
    contrast:
      "Huntr focuses on hosted pipeline management. Slothing keeps the tracker, documents, extension, and AI prompts open so privacy-sensitive users can run it themselves.",
  },
  simplify: {
    name: "Simplify",
    positioning: "autofill platform",
    contrast:
      "Simplify is strongest around application autofill. Slothing pairs autofill with an open-source job-search workspace and BYOK controls.",
  },
} as const;

const rows = [
  ["Open-source core", "AGPL-3.0", "Closed source"],
  ["Self-hosting", "Free forever", "Not the default path"],
  ["AI key control", "BYOK or hosted credits", "Hosted vendor path"],
  ["Billing cadence", "$6.99 weekly or $19.99 monthly", "Monthly-first"],
  ["Privacy posture", "Run locally or delete hosted data", "Hosted SaaS"],
] as const;

export function generateStaticParams() {
  return Object.keys(competitors).map((competitor) => ({ competitor }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; competitor: string };
}) {
  const competitor =
    competitors[params.competitor as keyof typeof competitors] ?? null;
  if (!competitor) return {};
  return {
    title: `Slothing vs ${competitor.name}`,
    description: `Compare Slothing with ${competitor.name} on open source, privacy, BYOK, and weekly pricing.`,
    alternates: {
      canonical: `/vs/${params.competitor}`,
      languages: getAlternateLanguages(`/vs/${params.competitor}`),
    },
  };
}

function buildCompetitorSchema(
  locale: string,
  competitor: (typeof competitors)[keyof typeof competitors],
) {
  const base = getMetadataBase();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `How is Slothing different from ${competitor.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Slothing is open source and can be self-hosted, which helps with privacy, key control, and flexible deployments.`,
            },
          },
          {
            "@type": "Question",
            name: "What pricing model does this comparison use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We compare weekly-first usage plans versus monthly pricing models to keep comparisons aligned for active job seekers.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: new URL(`/${locale}`, base).toString(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Comparison",
            item: new URL(`/${locale}/vs`, base).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `Slothing vs ${competitor.name}`,
            item: new URL(
              `/${locale}/vs/${competitor.name.toLowerCase()}`,
              base,
            ).toString(),
          },
        ],
      },
    ],
  };
}

export default function CompetitorComparisonPage({
  params,
}: {
  params: { locale: string; competitor: string };
}) {
  const competitor =
    competitors[params.competitor as keyof typeof competitors] ?? null;
  if (!competitor) notFound();

  const routeHeaders = headers();
  const nonce = routeHeaders.get(CSP_NONCE_HEADER);

  const compareColumns: CompareColumn[] = [
    { key: "slothing", label: "Slothing" },
    { key: "other", label: competitor.name },
  ];
  const compareRows: CompareRow[] = rows.map(([category, slothing, other]) => ({
    label: category,
    cells: { slothing, other },
  }));

  return (
    <>
      <script
        {...(nonce ? { nonce } : {})}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCompetitorSchema(params.locale, competitor),
          ),
        }}
      />

      {/* Hero */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-[1480px] px-5 pb-16 pt-10 md:px-10 md:pb-20 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-12">
            <div className="flex max-w-[640px] flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Open-source alternative
              </span>
              <h1 className="max-w-[15ch] font-display text-[clamp(40px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-display text-ink">
                Slothing vs <HighlighterEm>{competitor.name}</HighlighterEm>
              </h1>
              <p className="max-w-[56ch] text-[16.5px] leading-[1.55] text-ink-2">
                {competitor.contrast}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-page transition-opacity hover:opacity-90"
                >
                  See pricing
                </Link>
                <a
                  href="https://github.com/ANonABento/slothing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-transparent px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-rule-strong-bg"
                >
                  <Github className="h-4 w-4" aria-hidden />
                  GitHub
                </a>
              </div>
            </div>

            <aside className="rounded-2xl border border-rule bg-paper p-5 shadow-paper-card md:p-6">
              <h2 className="font-display text-[16px] font-bold tracking-tight text-ink">
                Why people pick Slothing
              </h2>
              <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-2">
                <li className="flex gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand"
                    aria-hidden
                  />
                  <span>
                    Read and modify the code that handles your resume.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <KeyRound
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand"
                    aria-hidden
                  />
                  <span>Bring your own LLM key on hosted free.</span>
                </li>
                <li className="flex gap-2.5">
                  <TimerReset
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand"
                    aria-hidden
                  />
                  <span>Pay weekly when your search is active.</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <CompareTable
            columns={compareColumns}
            rows={compareRows}
            highlight="slothing"
            caption={`Slothing vs ${competitor.name} · ${competitor.positioning}`}
          />
        </div>
      </section>

      {/* Closer */}
      <InverseCTABand
        eyebrow="Try Slothing"
        headlineTop="One workspace."
        headlineBottom="Yours to inspect."
        body="Sign up and bring your own AI key, or self-host the whole thing on AGPL-3.0."
        ctaPrimary={{
          label: "Get started free",
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
