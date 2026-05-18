import {
  Check,
  Github,
  HardDrive,
  Hourglass,
  KeyRound,
  Lock,
  Rocket,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/billing/billing-actions";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Link } from "@/i18n/navigation";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getLocalizedPageMetadata, getMetadataBase } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("pricing", params.locale);
}

const SLOTHING_REPO_URL = "https://github.com/ANonABento/slothing";

type TierCta =
  | { kind: "internal"; pathname: string }
  | { kind: "external"; href: string }
  | { kind: "checkout"; plan: "pro_weekly" | "pro_monthly" };

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  icon: typeof HardDrive;
  cta: string;
  ctaAction: TierCta;
  highlighted: boolean;
  ctaNote: string;
  badge?: string;
  features: readonly string[];
}

const tiers: readonly Tier[] = [
  {
    name: "Self-host",
    price: "$0",
    cadence: "forever",
    description:
      "The whole app, AGPL-3.0, run on your own machine. Your data never leaves your laptop. Bring any LLM (Ollama, OpenAI, Anthropic, OpenRouter).",
    icon: HardDrive,
    cta: "View on GitHub",
    ctaAction: { kind: "external", href: SLOTHING_REPO_URL },
    highlighted: false,
    ctaNote: "AGPL-3.0 — free to use, modify, and run locally.",
    badge: "Open source",
    features: [
      "Full feature set",
      "All AI tools (with your keys)",
      "Slothing browser extension",
      "Self-hosted, no telemetry",
      "AGPL-3.0 licensed",
    ],
  },
  {
    name: "Hosted Free",
    price: "$0",
    cadence: "bring your own key",
    description:
      "Skip the setup. Sign in, paste your OpenAI / Anthropic / OpenRouter key, and use Slothing.work with zero billing from us.",
    icon: KeyRound,
    cta: "Start with your key",
    ctaAction: { kind: "internal", pathname: "/sign-in" },
    highlighted: false,
    ctaNote: "No credit card. Your key, your provider bill.",
    features: [
      "Hosted at slothing.work",
      "Bring your own LLM key (BYOK)",
      "Full tracker + Studio + extension",
      "Cancel any time — it's free",
    ],
  },
  {
    name: "Weekly",
    price: "$6.99",
    cadence: "per week",
    description:
      "Sprint pricing for active job searches. Slothing should help you land fast — pay only for the weeks you need.",
    icon: Zap,
    cta: "Start Weekly",
    ctaAction: { kind: "checkout", plan: "pro_weekly" },
    highlighted: false,
    ctaNote:
      "Stripe checkout. Requires a Slothing account — sign in first if you're new.",
    features: [
      "Everything in Hosted Free",
      "Slothing-provided AI credits",
      "Priority generation",
      "Cancel any time, week-by-week",
    ],
  },
  {
    name: "Monthly",
    price: "$19.99",
    cadence: "per month",
    description:
      "The default plan for serious job searches. Roughly 28% cheaper than weekly when you commit to a full month.",
    icon: Rocket,
    cta: "Start Monthly",
    ctaAction: { kind: "checkout", plan: "pro_monthly" },
    highlighted: true,
    ctaNote:
      "Stripe checkout. Requires a Slothing account — sign in first if you're new.",
    badge: "Most popular",
    features: [
      "Everything in Weekly",
      "Larger monthly credit pool",
      "Advanced resume variants",
      "Early access to new tools",
    ],
  },
] as const;

const faqs = [
  {
    question: "Why weekly billing?",
    answer:
      "Slothing should make your search shorter, not longer. Weekly billing means you only pay for the weeks you actively need help. Landed an offer in three weeks? Cancel and stop paying. Most tools charge monthly or yearly because that's better for them — weekly is better for you.",
  },
  {
    question: "What's BYOK (bring your own key)?",
    answer:
      "On the Hosted Free tier, AI features run against your own OpenAI, Anthropic, or OpenRouter API key. We never proxy your data through our LLM bill, so your usage is your problem — and your privacy. Paste your key in Settings; it's stored encrypted and only sent directly to the provider you chose.",
  },
  {
    question: "Can I really self-host?",
    answer:
      "Yes. Slothing is AGPL-3.0 open source. Clone the repo, run pnpm install, and you have the whole app on your machine — including the Slothing browser extension, Document Studio, opportunity tracker, and all AI features. See the Self-host quickstart in the README.",
  },
  {
    question: "What's open source vs proprietary?",
    answer:
      "Almost everything is AGPL-3.0 open source. A small carve-out under apps/web/src/cloud/ contains the Stripe billing integration and credit ledger that power slothing.work — those files are proprietary so others can't clone the hosted business. Self-hosters don't need that code and the build excludes it by default.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Weekly and Monthly both cancel from your account settings, no questions asked. Weekly stops at the end of your current week; Monthly stops at the end of your current month. No retention dark patterns — we want you to leave when you've landed an offer.",
  },
  {
    question: "Are prices in USD?",
    answer: "Yes. Local taxes may apply depending on your billing country.",
  },
  {
    question: "What if I'm a student?",
    answer:
      "Self-hosting is genuinely free forever, so the simplest answer is to run it yourself. We may bring back a discounted hosted Student plan in the future — email students@slothing.work if you want to be notified.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Cancellation stops future renewal; it does not automatically refund past use. Within 14 days of a charge, contact support@slothing.work and we will consider refund requests on a case-by-case basis.",
  },
  {
    question: "Is annual pricing available?",
    answer:
      "No, and we don't plan to add one. Annual pricing rewards staying subscribed forever, which is the opposite of what Slothing is for.",
  },
  {
    question: "How many AI generations do paid plans include?",
    answer:
      "Credit limits are shown in Settings → Credits after you subscribe. Both Weekly and Monthly are sized for an active search — tailoring several resumes, running ATS checks, and generating cover letters throughout your billing period. If you're unsure, start with Weekly to test the volume before committing to Monthly.",
  },
  {
    question: "What happens if I reach my credit limit?",
    answer:
      "AI generation pauses for the rest of your billing period. Everything else — opportunity tracking, document storage, form autofill, and the browser extension — continues working without limits. Credits reset automatically at the start of your next billing week or month.",
  },
] as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const getBreadcrumbSchema = (baseHref: URL, locale: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: new URL(`/${locale}`, baseHref).toString(),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: new URL(`/${locale}/pricing`, baseHref).toString(),
    },
  ],
});

const comparisonRows = [
  {
    feature: "Hosting",
    selfHost: "Your machine",
    free: "slothing.work",
    weekly: "slothing.work",
    monthly: "slothing.work",
  },
  {
    feature: "AI provider",
    selfHost: "Any (Ollama, BYOK)",
    free: "Bring your own key",
    weekly: "Slothing credits",
    monthly: "Slothing credits",
  },
  {
    feature: "Tailored resumes",
    selfHost: "Unlimited (your compute)",
    free: "Unlimited (your key)",
    weekly: "Credits included",
    monthly: "More credits than weekly",
  },
  {
    feature: "Generation priority",
    selfHost: "Local",
    free: "Standard",
    weekly: "Priority",
    monthly: "Priority",
  },
  {
    feature: "Resume variants",
    selfHost: "Advanced",
    free: "Core",
    weekly: "Core",
    monthly: "Advanced",
  },
  {
    feature: "New tools",
    selfHost: "Self-merge",
    free: "General release",
    weekly: "Early access",
    monthly: "Early access",
  },
  {
    feature: "Best for",
    selfHost: "Devs, privacy fans",
    free: "Testing with your key",
    weekly: "3–4 week sprint",
    monthly: "Active multi-month search",
  },
] as const;

export default async function PricingPage() {
  const locale = await getLocale();
  const callbackUrl = `/${locale}/dashboard`;
  const nonce = headers().get(CSP_NONCE_HEADER) ?? undefined;
  const metadataBase = getMetadataBase();
  const breadcrumbSchema = getBreadcrumbSchema(metadataBase, locale);

  return (
    <main className="px-4 py-16">
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
            <Github className="h-4 w-4 text-primary" />
            Self-host today, AGPL-3.0. Hosted plans available now.
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Pay for the weeks you need. Not a day more.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Slothing is open source. Run it free on your own machine, or pay a
            small convenience fee for the hosted version at slothing.work — by
            the week or by the month.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isInternal = tier.ctaAction.kind === "internal";
            const internalPath =
              tier.ctaAction.kind === "internal"
                ? tier.ctaAction.pathname
                : null;
            const externalHref =
              tier.ctaAction.kind === "external" ? tier.ctaAction.href : null;
            const checkoutPlan =
              tier.ctaAction.kind === "checkout" ? tier.ctaAction.plan : null;

            return (
              <article
                key={tier.name}
                className={cn(
                  "flex flex-col rounded-lg border bg-card p-6 shadow-sm",
                  tier.highlighted && "border-primary ring-2 ring-primary/30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-semibold">{tier.name}</h2>
                  </div>
                  {tier.badge && (
                    <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.cadence}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  {isInternal && internalPath ? (
                    <Button asChild className="w-full">
                      <Link
                        href={{
                          pathname: internalPath,
                          query: { callbackUrl },
                        }}
                        prefetch={false}
                      >
                        {tier.cta}
                      </Link>
                    </Button>
                  ) : checkoutPlan ? (
                    <CheckoutButton
                      plan={checkoutPlan}
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      {tier.cta}
                    </CheckoutButton>
                  ) : (
                    <Button
                      asChild
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      <a
                        href={externalHref ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-tier-cta={tier.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}
                      >
                        {tier.cta}
                      </a>
                    </Button>
                  )}
                  {tier.ctaNote && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {tier.ctaNote}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section
          className="mt-10 overflow-hidden rounded-lg border bg-card"
          aria-labelledby="plan-comparison-heading"
        >
          <div className="border-b px-5 py-4">
            <h2
              id="plan-comparison-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Compare plans
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th
                    className="whitespace-nowrap px-5 py-3 font-medium"
                    scope="col"
                  >
                    Feature
                  </th>
                  <th
                    className="whitespace-nowrap px-5 py-3 font-medium"
                    scope="col"
                  >
                    Self-host
                  </th>
                  <th
                    className="whitespace-nowrap px-5 py-3 font-medium"
                    scope="col"
                  >
                    Hosted Free
                  </th>
                  <th
                    className="whitespace-nowrap px-5 py-3 font-medium"
                    scope="col"
                  >
                    Weekly
                  </th>
                  <th
                    className="whitespace-nowrap px-5 py-3 font-medium"
                    scope="col"
                  >
                    Monthly
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th className="px-5 py-4 font-medium" scope="row">
                      {row.feature}
                    </th>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.selfHost}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.free}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.weekly}
                    </td>
                    <td className="px-5 py-4 font-medium text-primary">
                      {row.monthly}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 border-t pt-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Plan questions
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-medium">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-16 border-t pt-10"
          aria-labelledby="trust-section-heading"
        >
          <h2
            id="trust-section-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Security and data handling
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            What Slothing does — and does not — do with your data.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            <div>
              <Lock className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-medium">Encrypted in transit</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All data travels over HTTPS. Resume content and credentials are
                never sent in plain text.
              </p>
            </div>
            <div>
              <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-medium">No data selling</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We do not sell your personal job search data. Third parties only
                process data needed to operate features you enable.
              </p>
            </div>
            <div>
              <Github className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-medium">Open source core</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The AI pipeline, Document Studio, and tracker are{" "}
                <a
                  href={SLOTHING_REPO_URL}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AGPL-3.0 on GitHub
                </a>
                . A small billing module for slothing.work is proprietary. Audit
                or fork the parts that touch your data.
              </p>
            </div>
            <div>
              <Trash2 className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-medium">Delete anytime</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You can delete opportunities, documents, and your account at any
                time. See our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>
            </div>
          </div>
          <p className="mt-8 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">
              AI outputs are assistive:
            </strong>{" "}
            Slothing generates tailored resumes and interview feedback to
            support your workflow. Review AI-generated content before submitting
            any application. Slothing does not guarantee hiring outcomes,
            interview results, or offer decisions.
          </p>
        </section>

        <section
          className="mt-16 grid gap-6 rounded-lg border bg-card p-6 md:grid-cols-[0.9fr_1.1fr] md:items-start"
          aria-labelledby="waitlist-heading"
        >
          <div>
            <Hourglass className="h-7 w-7 text-primary" />
            <h2 id="waitlist-heading" className="mt-3 text-xl font-semibold">
              Want launch updates?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Join the waitlist for hosted availability, extension marketplace
              listings, Google setup notes, and early launch windows. No billing
              is required to get updates.
            </p>
          </div>
          <WaitlistForm source="pricing" />
        </section>

        <section className="mt-16 flex flex-col items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
          <Hourglass className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-semibold">Ready to start?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Create a free account to use Slothing with your own AI key. Upgrade
            to Weekly or Monthly from Settings once you&apos;re inside.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                prefetch={false}
              >
                Get started free →
              </Link>
            </Button>
            <CheckoutButton plan="pro_weekly" variant="outline">
              Start Weekly — $6.99/wk
            </CheckoutButton>
            <Button asChild variant="outline">
              <a
                href={SLOTHING_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Self-host on GitHub
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paid plans require a Slothing account.{" "}
            <Link
              href={{ pathname: "/sign-in", query: { callbackUrl } }}
              className="text-primary hover:underline"
              prefetch={false}
            >
              Sign in or create one free →
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
