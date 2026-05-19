import { ArrowRight, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";

import { Link } from "@/i18n/navigation";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import { HighlighterEm, MonoCap } from "@/components/landing/primitives";

const competitors = [
  {
    name: "Teal",
    slug: "teal",
    summary: "Closed job tracker and resume tooling.",
  },
  {
    name: "Huntr",
    slug: "huntr",
    summary: "Hosted job search CRM with paid AI features.",
  },
  {
    name: "Simplify",
    slug: "simplify",
    summary: "Application autofill and job tracking platform.",
  },
] as const;

export function generateMetadata({ params }: { params: { locale: string } }) {
  void params;
  return {
    title: "Slothing comparisons",
    description:
      "Compare Slothing with Teal, Huntr, and Simplify on open source, privacy, BYOK, and weekly pricing.",
    alternates: {
      canonical: "/vs",
      languages: getAlternateLanguages("/vs"),
    },
  };
}

function buildCompareIndexSchema(locale: string) {
  const base = getMetadataBase();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Why compare Slothing against other job tools?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Comparing lets you check which tool matches your privacy, ownership, and flexibility needs before switching workflows.",
            },
          },
          {
            "@type": "Question",
            name: "Is Slothing self-hostable?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Slothing is open-source and supports self-hosted deployments for teams and privacy-focused users.",
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
        ],
      },
    ],
  };
}

export default function CompareIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  const routeHeaders = headers();
  const nonce = routeHeaders.get(CSP_NONCE_HEADER);

  return (
    <>
      <script
        {...(nonce ? { nonce } : {})}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCompareIndexSchema(params.locale)),
        }}
      />

      {/* Hero */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-[1480px] px-5 pb-12 pt-10 md:px-10 md:pb-16 md:pt-16 lg:pb-20">
          <div className="flex max-w-[820px] flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Compare
            </span>
            <h1 className="font-display text-[clamp(40px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-display text-ink">
              Slothing vs. <HighlighterEm>everything else</HighlighterEm>.
            </h1>
            <p className="max-w-[58ch] text-[16.5px] leading-[1.55] text-ink-2">
              Slothing is AGPL open source, self-hostable, BYOK-friendly, and
              priced weekly for active searches.
            </p>
          </div>
        </div>
      </section>

      {/* Competitor cards */}
      <section className="border-t border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-8 flex flex-col gap-2">
            <MonoCap className="text-brand">Side by side</MonoCap>
            <h2 className="max-w-[24ch] font-display text-[clamp(24px,2.4vw,32px)] font-extrabold leading-tight tracking-display text-ink">
              Pick a comparison.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {competitors.map((competitor, index) => (
              <article
                key={competitor.slug}
                className="flex flex-col rounded-2xl border border-rule bg-page p-6 shadow-paper-card transition-colors hover:border-brand md:p-7"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                  {String(index + 1).padStart(2, "0")} · {competitor.name}
                </span>
                <h3 className="mt-3 font-display text-[22px] font-extrabold leading-tight tracking-display text-ink">
                  Slothing vs {competitor.name}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-6 text-ink-2">
                  {competitor.summary}
                </p>
                <Link
                  href={`/vs/${competitor.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[13.5px] font-semibold text-page transition-opacity hover:opacity-90"
                >
                  Compare
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
