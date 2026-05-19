import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe2,
  Mail,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { ExtensionInstallButtons } from "@/components/marketing/extension-install-buttons";
import { Link } from "@/i18n/navigation";
import { getCurrentUserId } from "@/lib/auth";
import {
  getExtensionLaunchCopy,
  getExtensionLaunchState,
} from "@/lib/extension/install";
import { getA11yTranslations } from "@/lib/i18n/get-a11y-translations";
import { getLocalizedPageMetadata } from "@/lib/seo";
import { FaqList } from "@/components/landing/FaqList";
import { MonoCap } from "@/components/landing/primitives";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("extension", params.locale);
}

/**
 * /extension landing page — editorial rebuild.
 *
 * Preserves all load-bearing content (the H1, "Less copying, more deciding"
 * H2, ExtensionInstallButtons launch state, FAQ items, privacy posture,
 * /extension/connect deep link) while migrating the chrome onto editorial
 * tokens and primitives shipped in Phase 0.
 */

const featureBlocks = [
  {
    title: "Auto-capture from job boards",
    description:
      "Save roles from LinkedIn, Indeed, Greenhouse, Lever, Workable, and niche boards without copying details by hand.",
    icon: Globe2,
    screenshot: "/marketing/extension/job-board-capture.png",
    visualLabel: "Slothing popover saving a LinkedIn job posting",
  },
  {
    title: "Gmail recruiter import (Slothing web app)",
    description:
      "Once you sign in to Slothing with Google, the web app can turn recruiter outreach into pending opportunities. The extension itself never reads Gmail — the import runs in your Slothing dashboard.",
    icon: Mail,
    screenshot: "/marketing/extension/gmail-import.png",
    visualLabel: "Gmail recruiter import view showing pending opportunities",
  },
  {
    title: "One-click review queue",
    description:
      "Send captured roles straight into Slothing for review, prioritization, and tailored document work.",
    icon: MousePointerClick,
    screenshot: "/marketing/extension/review-queue.png",
    visualLabel: "Review queue with three captured roles",
  },
] as const;

const steps = [
  {
    title: "Install",
    description: "Add Slothing to your browser from the store.",
  },
  {
    title: "Sign in",
    description: "Connect the extension to your Slothing account.",
  },
  {
    title: "Capture",
    description: "Open any role and send it to your review queue.",
  },
] as const;

const PRIVACY_PILLARS = [
  [
    "Active tab + supported sites",
    "Runs on the job sites you visit (LinkedIn, Indeed, Greenhouse, Lever, Workday, Waterloo Works) so it can show the capture popup and detect listings. It does not run on other pages.",
  ],
  [
    "Local storage",
    "Stores your Slothing connection token on your device using the browser's extension storage. The token is sent only to Slothing when you capture or sync.",
  ],
  [
    "No Gmail permission",
    "The extension does not request Gmail access. Gmail recruiter import runs in the Slothing web app under your Google sign-in, not in the extension.",
  ],
] as const;

const faqs = [
  {
    question: "Which browsers are supported?",
    answer:
      "Chrome, Microsoft Edge, and Firefox are the first supported browsers. Safari support is planned.",
  },
  {
    question: "Does it work on Safari?",
    answer:
      "Not yet. The Safari extension is not available in v1, but the landing page will point to it when it is ready.",
  },
  {
    question: "Can I import existing Gmail history?",
    answer:
      "Gmail recruiter import runs inside the Slothing web app, not the extension. After you sign in to Slothing with Google, the dashboard can bring recruiter outreach into your pending opportunity workflow. The extension itself does not request Gmail access.",
  },
  {
    question: "How do I uninstall?",
    answer:
      "Remove Slothing from your browser's extensions page. Your saved opportunities stay in your Slothing account.",
  },
] as const;

export default async function ExtensionLandingPage() {
  const userId = await getCurrentUserId();
  const a11yT = await getA11yTranslations();
  const launchCopy = getExtensionLaunchCopy(getExtensionLaunchState());

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-[1480px] px-5 pb-12 pt-7 md:px-10 md:pb-16 md:pt-12 lg:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
            <div className="flex max-w-[640px] flex-col">
              <span className="inline-flex items-center gap-2.5 self-start rounded-full border border-rule bg-paper py-1 pl-1 pr-3 text-[12.5px] text-ink-2">
                <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
                  Beta
                </span>
                {launchCopy.label}
              </span>
              <h1 className="mt-5 max-w-[15ch] font-display text-[clamp(40px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-display text-ink">
                Capture jobs from any site, instantly.
              </h1>
              <p className="mt-5 max-w-[520px] text-[16.5px] leading-[1.55] text-ink-2">
                The Slothing browser extension turns any LinkedIn, Indeed, or
                company careers page into a one-click save.
              </p>
              <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-ink-3">
                {launchCopy.description}
              </p>
              <div className="mt-7">
                <ExtensionInstallButtons variant="primary" />
              </div>
            </div>

            <HeroMockup
              ariaLabel={a11yT("extensionPopoverPreviewOnAJobPosting")}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-rule bg-paper py-16 md:py-20"
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-10 flex flex-col gap-2">
            <MonoCap className="text-brand">What it does</MonoCap>
            <h2 className="max-w-[22ch] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
              Less copying, more deciding
            </h2>
          </div>

          <div className="space-y-5">
            {featureBlocks.map((feature, index) => {
              const Icon = feature.icon;
              const reversed = index % 2 === 1;
              return (
                <article
                  key={feature.title}
                  className="grid gap-6 rounded-2xl border border-rule bg-page p-6 shadow-paper-card md:grid-cols-2 md:items-center md:p-8"
                >
                  <div className={reversed ? "md:order-2" : undefined}>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-display text-[22px] font-extrabold leading-tight tracking-display text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-[14.5px] leading-6 text-ink-2">
                      {feature.description}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rule bg-paper p-4">
                    <Image
                      src={feature.screenshot}
                      alt={feature.visualLabel}
                      width={960}
                      height={600}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[8/5] w-full rounded-lg border border-rule bg-page object-cover"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-rule bg-page py-16 md:py-20"
      >
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-10 flex flex-col gap-2">
            <MonoCap className="text-brand">Three steps</MonoCap>
            <h2 className="max-w-[18ch] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
              How it works
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-rule bg-paper p-6 shadow-paper-card md:p-7"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-[15px] font-extrabold text-page">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-display text-[20px] font-extrabold leading-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-ink-2">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy + trust */}
      <section className="border-y border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <ShieldCheck className="h-10 w-10 text-brand" aria-hidden />
              <h2 className="mt-4 font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
                Privacy and trust
              </h2>
              <p className="mt-3 max-w-[44ch] text-[14.5px] leading-6 text-ink-2">
                Captured job data goes to your Slothing account over HTTPS. We
                don&apos;t sell or share it. See the Privacy Policy linked below
                for details.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-[14px] font-medium">
                <Link
                  href="/privacy"
                  className="text-brand hover:text-brand-dark"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-brand hover:text-brand-dark"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {PRIVACY_PILLARS.map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-rule bg-page p-5 shadow-paper-card"
                >
                  <h3 className="font-display text-[16px] font-bold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-ink-2">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-rule bg-page py-16 md:py-20">
        <div className="mx-auto w-full max-w-[1480px] px-5 md:px-10">
          <div className="mb-8 flex flex-col gap-2">
            <MonoCap className="text-brand">Common questions</MonoCap>
            <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
              FAQ
            </h2>
          </div>
          <FaqList
            items={faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
            columns={2}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-paper py-16 md:py-20">
        <div className="mx-auto w-full max-w-[820px] px-5 text-center md:px-10">
          <Sparkles className="mx-auto h-10 w-10 text-brand" aria-hidden />
          <h2 className="mt-4 font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-display text-ink">
            Start capturing while you browse
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-[14.5px] leading-6 text-ink-2">
            Install the extension now, then send the next promising role
            straight to Slothing.
          </p>
          <div className="mt-7">
            <ExtensionInstallButtons variant="primary" />
          </div>
          {userId ? (
            <Link
              href="/extension/connect"
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand hover:text-brand-dark"
            >
              Already installed? Connect it{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
            <span>Version 0.1</span>
            <a href="mailto:support@slothing.work" className="hover:text-ink-2">
              support@slothing.work
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroMockup({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative min-h-[420px] rounded-2xl border border-rule bg-paper p-4 shadow-paper-elevated"
    >
      {/* Browser-frame chrome */}
      <div className="mb-4 flex items-center gap-2 border-b border-rule pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
        <span className="ml-2 h-7 flex-1 rounded-md bg-page" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        {/* Mocked job posting body */}
        <div className="space-y-4 rounded-xl border border-rule bg-page p-5">
          <div className="h-4 w-28 rounded-sm bg-brand-soft" />
          <div className="h-7 w-3/4 rounded-sm bg-rule-strong-bg" />
          <div className="h-3 w-44 rounded-sm bg-rule-strong-bg" />
          <div className="space-y-2 pt-3">
            <div className="h-2.5 rounded-sm bg-rule-strong-bg" />
            <div className="h-2.5 rounded-sm bg-rule-strong-bg" />
            <div className="h-2.5 w-5/6 rounded-sm bg-rule-strong-bg" />
          </div>
        </div>
        {/* Mocked extension popover */}
        <div className="rounded-xl border border-brand bg-page p-4 shadow-paper-card">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-brand" aria-hidden />
            <span className="font-display text-[14px] font-bold text-ink">
              Save to Slothing
            </span>
          </div>
          <ul className="mt-4 space-y-2.5 text-[13px] text-ink-2">
            {["Frontend Engineer", "Acme Labs", "Remote"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 w-full rounded-full bg-ink py-2 text-[13px] font-semibold text-page transition-opacity hover:opacity-90"
          >
            Capture role
          </button>
        </div>
      </div>
    </div>
  );
}
