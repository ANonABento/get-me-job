import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the Slothing application.",
  openGraph: {
    title: "Terms of Service",
    description: "Terms governing use of the Slothing application.",
    url: "/terms",
  },
  twitter: {
    title: "Terms of Service",
    description: "Terms governing use of the Slothing application.",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-muted-foreground">
            Effective March 25, 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Use of the service
            </h2>
            <p className="mt-2">
              Slothing is provided to help you organize and improve your job
              search. You are responsible for the accuracy of the information
              you upload and for how you use any generated content in
              applications or interviews.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Accounts and access
            </h2>
            <p className="mt-2">
              Access is tied to your authenticated account. You are responsible
              for keeping your credentials secure and for reviewing integrations
              you authorize, including Google services and external AI
              providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Generated content
            </h2>
            <p className="mt-2">
              AI-generated resumes, interview feedback, and outreach drafts are
              assistive outputs. You should review them before relying on them
              in a professional context.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Availability
            </h2>
            <p className="mt-2">
              The service may change over time, including integrations, file
              support, and export features. We may suspend access to protect the
              platform or comply with legal and security requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              Limitation of liability
            </h2>
            <p className="mt-2">
              The product is offered on an as-is basis. It is intended to
              support your workflow, not to guarantee hiring outcomes, interview
              performance, or offer decisions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
