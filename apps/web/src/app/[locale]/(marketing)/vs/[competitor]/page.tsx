import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Check, Github, KeyRound, ShieldCheck, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";

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

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card/40">
        {/* pt-12 lg:pt-20 so the eyebrow doesn't collide with the
            fixed top navbar (~64px tall + brand subtitle line). */}
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-12 pb-16 lg:grid-cols-[1fr_360px] lg:pt-20">
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span>Open-source alternative</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              Slothing vs{" "}
              <em className="not-italic italic font-display text-brand [background-image:linear-gradient(transparent_70%,var(--brand-soft)_70%)]">
                {competitor.name}
              </em>
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {competitor.contrast}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/pricing">See pricing</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com/ANonABento/slothing">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* border-rule-strong + bg-paper so the callout reads against
              the dark Midnight Indigo paper in dark mode. The default
              `border` token nearly vanishes against bg-background. */}
          <div className="rounded-lg border border-rule-strong bg-paper p-5 shadow-paper-card">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Why people pick Slothing
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" />
                Read and modify the code that handles your resume.
              </li>
              <li className="flex gap-2">
                <KeyRound className="mt-0.5 h-4 w-4 text-success" />
                Bring your own LLM key on hosted free.
              </li>
              <li className="flex gap-2">
                <TimerReset className="mt-0.5 h-4 w-4 text-success" />
                Pay weekly when your search is active.
              </li>
            </ul>
          </div>
        </div>
      </section>

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

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-3 bg-muted px-4 py-3 text-sm font-semibold">
            <div>Category</div>
            <div>Slothing</div>
            <div>{competitor.name}</div>
          </div>
          {rows.map(([category, slothing, other]) => (
            <div
              key={category}
              className="grid grid-cols-3 gap-4 border-t px-4 py-4 text-sm"
            >
              <div className="font-medium">{category}</div>
              <div>{slothing}</div>
              <div className="text-muted-foreground">{other}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
