import { ArrowRight, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";

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
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex max-w-3xl flex-col gap-5">
            {/* Eyebrow groups with the shield so it isn't a floating orphan. */}
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span>Compare</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              Slothing vs.{" "}
              <em className="not-italic italic font-display text-brand [background-image:linear-gradient(transparent_70%,var(--brand-soft)_70%)]">
                everything else
              </em>
              .
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Slothing is AGPL open source, self-hostable, BYOK-friendly, and
              priced weekly for active searches.
            </p>
          </div>
        </div>
      </section>

      <script
        {...(nonce ? { nonce } : {})}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCompareIndexSchema(params.locale)),
        }}
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3">
        {competitors.map((competitor, index) => (
          <article
            key={competitor.slug}
            className="flex flex-col rounded-lg border border-rule bg-paper p-6 transition-colors hover:border-brand/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              {String(index + 1).padStart(2, "0")} · {competitor.name}
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Slothing vs {competitor.name}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {competitor.summary}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href={`/vs/${competitor.slug}`}>
                Compare
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </section>
    </main>
  );
}
