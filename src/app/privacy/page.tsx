import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Taida",
  description: "How Taida stores, uses, and protects your job search data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">
            Effective March 25, 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">What we collect</h2>
            <p className="mt-2">
              Taida stores the profile, resume, job tracking, reminder, and interview
              preparation data you add to the product. If you connect Google services, the
              app also stores the minimum tokens and metadata needed to sync with those tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">How we use it</h2>
            <p className="mt-2">
              Your data is used to power application tracking, document parsing, analytics,
              calendar exports, reminders, and AI-assisted features you explicitly trigger.
              We do not sell your personal job search data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data sharing</h2>
            <p className="mt-2">
              Third-party providers are only involved when you use integrations or AI features,
              such as Clerk for authentication, Google for connected workflows, or an LLM provider
              you configure in the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Retention and deletion</h2>
            <p className="mt-2">
              You control the content you add. Deleting jobs, reminders, documents, or generated
              resumes removes them from the app&apos;s active workspace. Backup exports are created only
              when you request them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              Questions about privacy or data handling can be directed through the support channel
              associated with your workspace.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
