import { getLocalizedPageMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("terms", params.locale);
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: May 11, 2026.
        </p>
        <div
          role="note"
          className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 text-foreground"
        >
          <p className="font-semibold">Note on governing law and disputes</p>
          <p className="mt-1 text-muted-foreground">
            The governing-law and dispute-resolution sections below are still
            being finalized with legal counsel. They will be updated before any
            material change to billing or service terms, and users will be
            notified of changes. All other sections are in effect. Questions:{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>
            .
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Use of the service
          </h2>
          <p className="mt-2">
            Slothing is provided to help you organize and improve your job
            search. You are responsible for the accuracy of the information you
            upload and for how you use any generated content in applications or
            interviews. You may use the service only for lawful personal or
            internal business purposes and must comply with laws, third-party
            site terms, and integration provider rules that apply to your use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Accounts and access
          </h2>
          <p className="mt-2">
            Access is tied to your authenticated account. You are responsible
            for keeping your credentials secure and for reviewing integrations
            you authorize, including Google services and external AI providers.
            You must provide accurate account information, keep contact and
            billing details current, and promptly notify us at{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>{" "}
            if you believe your account has been compromised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Generated content
          </h2>
          <p className="mt-2">
            AI-generated resumes, interview feedback, and outreach drafts are
            assistive outputs. You should review them before relying on them in
            a professional context. As between you and Slothing, you keep
            ownership of the resumes, profiles, job notes, prompts, and other
            content you provide, and you may use generated content for your job
            search subject to these Terms. You grant Slothing the limited
            permission needed to host, process, generate, display, export, and
            improve the service for you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Availability
          </h2>
          <p className="mt-2">
            The service may change over time, including integrations, file
            support, and export features. We may suspend access to protect the
            platform, perform maintenance, address abuse, or comply with legal
            and security requirements. We do not guarantee that the service,
            integrations, AI providers, or third-party job sites will always be
            available or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Billing and refunds
          </h2>
          <p className="mt-2">
            Paid plans, including any Pro tier, are billed according to the
            price, billing interval, and checkout terms shown when you
            subscribe. Subscriptions may renew automatically until canceled. You
            are responsible for applicable taxes and payment provider fees.
            Unless a checkout flow or applicable law states otherwise, fees are
            non-refundable after the paid period begins, and cancellation stops
            future renewal rather than refunding past use. To request a refund
            within 14 days of a charge, contact{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>{" "}
            and we will review your request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Termination</h2>
          <p className="mt-2">
            You may stop using Slothing or cancel a paid plan at any time
            through the available account or billing controls, or by contacting{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>
            . We may suspend or terminate access if you violate these Terms,
            create risk for the service or other users, fail to pay amounts due,
            or use the service unlawfully. Termination does not remove
            obligations that by their nature should continue, including payment
            obligations, ownership terms, disclaimers, liability limits, and
            dispute terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Acceptable use
          </h2>
          <p className="mt-2">
            You may not misuse Slothing, attempt unauthorized access, scrape or
            overload the service, bypass rate limits, interfere with security,
            upload malicious code, infringe third-party rights, submit unlawful
            or deceptive content, resell or sublicense the service without
            permission, or use automation in a way that violates job site,
            Google, AI provider, or other third-party terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Disclaimer and limitation of liability
          </h2>
          <p className="mt-2">
            The product is offered on an as-is basis. It is intended to support
            your workflow, not to guarantee hiring outcomes, interview
            performance, or offer decisions. To the fullest extent permitted by
            law, Slothing disclaims implied warranties of merchantability,
            fitness for a particular purpose, non-infringement, and
            uninterrupted or error-free operation. Slothing will not be liable
            for indirect, incidental, special, consequential, exemplary, or
            punitive damages, or for lost profits, lost data, or lost
            opportunities arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Indemnification
          </h2>
          <p className="mt-2">
            You agree to defend, indemnify, and hold Slothing harmless from
            claims, damages, liabilities, costs, and expenses arising from your
            content, your use of the service, your breach of these Terms, or
            your violation of law or third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Governing law
          </h2>
          <p className="mt-2">
            The specific governing jurisdiction for these Terms is being
            finalized with legal counsel and will be published before any
            material change to billing or service terms. For legal questions in
            the interim, please contact{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Disputes</h2>
          <p className="mt-2">
            Before filing a claim, you agree to contact{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>{" "}
            so we can try to resolve the issue informally. If we cannot resolve
            it, formal dispute resolution terms — including the required forum,
            any arbitration provisions, and applicable waivers — are being
            finalized and will be published before any material change to
            billing or service terms. Nothing in these Terms limits rights
            granted to you under applicable law.
          </p>
        </section>
      </div>
    </div>
  );
}
