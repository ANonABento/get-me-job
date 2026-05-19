import {
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
import { EditorialHero } from "@/components/landing/EditorialHero";
import { PriceCard } from "@/components/landing/PriceCard";
import { CompareTable } from "@/components/landing/CompareTable";
import { FaqList } from "@/components/landing/FaqList";
import { MonoCap } from "@/components/landing/primitives";

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

const COMPARE_COLUMNS = [
  { key: "selfHost", label: "Self-host" },
  { key: "free", label: "Hosted Free" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

const comparisonRows: readonly {
  feature: string;
  cells: Record<string, string>;
}[] = [
  {
    feature: "Hosting",
    cells: {
      selfHost: "Your machine",
      free: "slothing.work",
      weekly: "slothing.work",
      monthly: "slothing.work",
    },
  },
  {
    feature: "AI provider",
    cells: {
      selfHost: "Any (Ollama, BYOK)",
      free: "Bring your own key",
      weekly: "Slothing credits",
      monthly: "Slothing credits",
    },
  },
  {
    feature: "Tailored resumes",
    cells: {
      selfHost: "Unlimited (your compute)",
      free: "Unlimited (your key)",
      weekly: "Credits included",
      monthly: "More credits than weekly",
    },
  },
  {
    feature: "Generation priority",
    cells: {
      selfHost: "Local",
      free: "Standard",
      weekly: "Priority",
      monthly: "Priority",
    },
  },
  {
    feature: "Resume variants",
    cells: {
      selfHost: "Advanced",
      free: "Core",
      weekly: "Core",
      monthly: "Advanced",
    },
  },
  {
    feature: "New tools",
    cells: {
      selfHost: "Self-merge",
      free: "General release",
      weekly: "Early access",
      monthly: "Early access",
    },
  },
  {
    feature: "Best for",
    cells: {
      selfHost: "Devs, privacy fans",
      free: "Testing with your key",
      weekly: "3–4 week sprint",
      monthly: "Active multi-month search",
    },
  },
];

const TRUST_PILLARS = [
  {
    icon: Lock,
    label: "Encrypted in transit",
    body: "All data travels over HTTPS. Resume content and credentials are never sent in plain text.",
  },
  {
    icon: ShieldCheck,
    label: "No data selling",
    body: "We do not sell your personal job search data. Third parties only process data needed to operate features you enable.",
  },
  {
    icon: Github,
    label: "Open source core",
    body: null, // body rendered inline below to keep the GitHub link in tact
  },
  {
    icon: Trash2,
    label: "Delete anytime",
    body: null,
  },
] as const;

export default async function PricingPage() {
  const locale = await getLocale();
  const callbackUrl = `/${locale}/dashboard`;
  const nonce = headers().get(CSP_NONCE_HEADER) ?? undefined;
  const metadataBase = getMetadataBase();
  const breadcrumbSchema = getBreadcrumbSchema(metadataBase, locale);

  return (
    <>
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

      <EditorialHero
        eyebrow={{
          badge: "Open source",
          label: "Self-host today, AGPL-3.0. Hosted plans available now.",
        }}
        headlineTop="Pay for the weeks you need."
        headlineBottom="Not a day more."
        body="Slothing is open source. Run it free on your own machine, or pay a small convenience fee for the hosted version at slothing.work — by the week or by the month."
      />

      {/* Tier cards */}
      <section className="border-t border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

              const tierSlug = tier.name.toLowerCase().replace(/\s+/g, "-");
              const cta =
                isInternal && internalPath ? (
                  <Button asChild className="w-full">
                    <Link
                      href={{
                        pathname: internalPath,
                        query: { callbackUrl },
                      }}
                      prefetch={false}
                      data-tier-cta={tierSlug}
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
                      data-tier-cta={tierSlug}
                    >
                      {tier.cta}
                    </a>
                  </Button>
                );

              return (
                <PriceCard
                  key={tier.name}
                  icon={<Icon className="h-5 w-5" />}
                  badge={tier.badge}
                  name={tier.name}
                  price={tier.price}
                  cadence={tier.cadence}
                  description={tier.description}
                  features={[...tier.features]}
                  cta={cta}
                  ctaNote={tier.ctaNote}
                  highlighted={tier.highlighted}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Compare plans */}
      <section
        className="border-t border-rule bg-page py-16 md:py-20"
        aria-labelledby="plan-comparison-heading"
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-8 flex flex-col gap-2">
            <MonoCap className="text-brand">Side-by-side</MonoCap>
            <h2
              id="plan-comparison-heading"
              className="max-w-[20ch] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink"
            >
              Compare plans
            </h2>
          </div>
          <CompareTable
            columns={[...COMPARE_COLUMNS]}
            rows={comparisonRows.map((row) => ({
              label: row.feature,
              cells: row.cells,
            }))}
            highlight="monthly"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <FaqList
            eyebrow="Plan questions"
            headline="Everything you'd want to ask before paying."
            items={faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
            columns={2}
          />
        </div>
      </section>

      {/* Security and data handling */}
      <section
        className="border-t border-rule bg-page py-16 md:py-20"
        aria-labelledby="trust-section-heading"
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-10 flex flex-col gap-2">
            <MonoCap className="text-brand">Trust</MonoCap>
            <h2
              id="trust-section-heading"
              className="max-w-[24ch] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink"
            >
              Security and data handling
            </h2>
            <p className="mt-2 max-w-[58ch] text-[16.5px] leading-[1.55] text-ink-2">
              What Slothing does — and does not — do with your data.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.label}
                  className="rounded-2xl border border-rule bg-paper p-6 shadow-paper-card"
                >
                  <Icon className="mb-3 h-5 w-5 text-brand" aria-hidden />
                  <h3 className="font-display text-[18px] font-bold leading-tight text-ink">
                    {pillar.label}
                  </h3>
                  {pillar.body ? (
                    <p className="mt-2 text-[14px] leading-6 text-ink-2">
                      {pillar.body}
                    </p>
                  ) : pillar.label === "Open source core" ? (
                    <p className="mt-2 text-[14px] leading-6 text-ink-2">
                      The AI pipeline, Document Studio, and tracker are{" "}
                      <a
                        href={SLOTHING_REPO_URL}
                        className="text-brand hover:text-brand-dark"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        AGPL-3.0 on GitHub
                      </a>
                      . A small billing module for slothing.work is proprietary.
                      Audit or fork the parts that touch your data.
                    </p>
                  ) : pillar.label === "Delete anytime" ? (
                    <p className="mt-2 text-[14px] leading-6 text-ink-2">
                      You can delete opportunities, documents, and your account
                      at any time. See our{" "}
                      <Link
                        href="/privacy"
                        className="text-brand hover:text-brand-dark"
                      >
                        Privacy Policy
                      </Link>{" "}
                      for full details.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="mt-8 rounded-2xl border border-rule bg-paper p-5 text-[14px] leading-6 text-ink-2 shadow-paper-card">
            <strong className="font-semibold text-ink">
              AI outputs are assistive:
            </strong>{" "}
            Slothing generates tailored resumes and interview feedback to
            support your workflow. Review AI-generated content before submitting
            any application. Slothing does not guarantee hiring outcomes,
            interview results, or offer decisions.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section
        className="border-t border-rule bg-paper py-16 md:py-20"
        aria-labelledby="waitlist-heading"
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="grid gap-6 rounded-2xl border border-rule bg-page p-6 shadow-paper-card md:grid-cols-[0.9fr_1.1fr] md:items-start md:p-10">
            <div>
              <Hourglass className="h-7 w-7 text-brand" aria-hidden />
              <h2
                id="waitlist-heading"
                className="mt-3 font-display text-[clamp(22px,2.4vw,30px)] font-extrabold leading-tight tracking-display text-ink"
              >
                Want launch updates?
              </h2>
              <p className="mt-3 max-w-[44ch] text-[14.5px] leading-6 text-ink-2">
                Join the waitlist for hosted availability, extension marketplace
                listings, Google setup notes, and early launch windows. No
                billing is required to get updates.
              </p>
            </div>
            <WaitlistForm source="pricing" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-page py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-brand bg-brand-soft p-8 text-center md:p-12">
            <Hourglass className="h-8 w-8 text-brand-dark" aria-hidden />
            <h2 className="font-display text-[clamp(26px,3vw,36px)] font-extrabold leading-tight tracking-display text-ink">
              Ready to start?
            </h2>
            <p className="max-w-[58ch] text-[15px] leading-6 text-ink-2">
              Create a free account to use Slothing with your own AI key.
              Upgrade to Weekly or Monthly from Settings once you&apos;re
              inside.
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
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Paid plans require a Slothing account.{" "}
              <Link
                href={{ pathname: "/sign-in", query: { callbackUrl } }}
                className="text-brand hover:text-brand-dark"
                prefetch={false}
              >
                Sign in or create one free →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
