import { getLocalizedPageMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("privacy", params.locale);
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: May 11, 2026.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            What we collect
          </h2>
          <p className="mt-2">
            Slothing stores the profile, resume, job tracking, reminder, and
            interview preparation data you add to the product. If you connect
            Google services, the app also stores the minimum tokens and metadata
            needed to sync with those tools. We may also collect account
            identifiers, email address, usage events, device and log
            information, and files or text you upload for parsing, generation,
            export, or troubleshooting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            How we use it
          </h2>
          <p className="mt-2">
            Your data is used to power application tracking, document parsing,
            analytics, calendar exports, reminders, and AI-assisted features you
            explicitly trigger. We do not sell your personal job search data. We
            may also use limited operational data to secure the service, prevent
            abuse, debug errors, improve product quality, and communicate
            important account or service updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Data sharing
          </h2>
          <p className="mt-2">
            Third-party providers are only involved when you use integrations or
            AI features, such as Google for sign-in and connected workflows,
            hosting and infrastructure providers, analytics and email tooling,
            or an LLM provider you configure in the app. These providers may
            process data on our behalf under their own security and privacy
            commitments. We may disclose information if required by law, to
            protect rights and safety, or as part of a corporate transaction.
          </p>
          <p className="mt-4">
            <strong>Google sign-in scopes.</strong> When you sign in with
            Google, Slothing currently requests the following scopes together so
            connected workflows are ready when you need them: basic account
            profile and email, Google Calendar, Drive (files created by the
            app), Gmail read and send, and read-only Contacts. You will be shown
            these scopes by Google before you grant access, and you can revoke
            them at any time from your Google Account permissions page. Slothing
            only calls these APIs in response to features you trigger, and does
            not background-scan your inbox or files outside of features you
            explicitly use.
          </p>
          <p className="mt-4">
            <strong>Slothing AI credits vs. BYOK.</strong> On Weekly and Monthly
            plans, your content is sent to Slothing&apos;s LLM provider accounts
            to generate AI outputs. We do not use your job search content to
            train models, and we do not retain raw LLM inputs beyond what is
            needed to display results. On BYOK (Hosted Free), content goes
            directly from the app to the provider you configured; their terms
            and data policies apply. In both cases, you can review which
            providers are involved in the relevant account settings screen.
          </p>
          <p className="mt-4">
            <strong>Browser extension.</strong> The Slothing browser extension
            requests only the permissions needed to read job pages you visit on
            supported job sites and to keep your connection token in extension
            storage. It does not request Gmail, Calendar, Drive, or Contacts
            permissions — those workflows run in the Slothing web app under your
            Google sign-in instead.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Retention and deletion
          </h2>
          <p className="mt-2">
            You control the content you add. Deleting jobs, reminders,
            documents, or generated resumes removes them from the app&apos;s
            active workspace. Account records, audit logs, security records,
            billing records, and backup copies may remain for a limited period
            where needed for legal, security, fraud prevention, tax, accounting,
            disaster recovery, or operational purposes. Backup exports are
            created only when you request them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Your privacy rights
          </h2>
          <p className="mt-2">
            Depending on where you live, you may have rights to request access
            to personal information we hold about you, correction of inaccurate
            information, deletion of your information, a portable copy of your
            information, restriction of certain processing, or an objection to
            certain uses. California residents may also have rights to know,
            delete, correct, and opt out of certain sharing or sale of personal
            information. We do not sell personal job search data. To exercise
            these rights, contact us at{" "}
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
          <h2 className="text-xl font-semibold text-foreground">
            Cookies and local storage
          </h2>
          <p className="mt-2">
            Slothing uses cookies and similar technologies for authentication,
            session management, locale preferences, security, and basic product
            functionality. For example, NextAuth may set cookies to keep you
            signed in. The browser extension uses browser local storage for
            extension state such as authentication tokens, dismissed domains,
            and settings needed to operate across job sites. You can control
            cookies through your browser settings, but disabling them may
            prevent sign-in or core features from working.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Children&apos;s privacy
          </h2>
          <p className="mt-2">
            Slothing is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13. If
            you believe a child has provided personal information to Slothing,
            contact us so we can take appropriate deletion steps.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            International transfers
          </h2>
          <p className="mt-2">
            Slothing and its providers may process information in countries
            other than where you live, including where Google services, hosting
            providers, support tools, analytics providers, or LLM providers
            operate. When required, we use appropriate safeguards for
            international transfers, such as contractual commitments and
            provider security terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Security</h2>
          <p className="mt-2">
            We use administrative, technical, and organizational measures
            designed to protect personal information, including authenticated
            access, limited provider access, encrypted transport where
            supported, and monitoring for abuse or operational issues. No online
            service can guarantee absolute security, so you should use a strong
            account credential and keep connected integrations under your
            control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            Questions about privacy, data handling, or rights requests can be
            sent to{" "}
            <a
              href="mailto:support@slothing.work"
              className="text-primary hover:underline"
            >
              support@slothing.work
            </a>
            . We use this address for account support, privacy questions, and
            requests to exercise privacy rights.
          </p>
        </section>
      </div>
    </div>
  );
}
