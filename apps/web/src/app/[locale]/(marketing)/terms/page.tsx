import {
  LEGAL_CONTACT_EMAIL,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/lib/legal/legal-copy";
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
          Last updated: {TERMS_LAST_UPDATED}.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="mt-2">
              <LegalText text={section.body} />
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

function LegalText({ text }: { text: string }) {
  const parts = text.split(LEGAL_CONTACT_EMAIL);
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="text-primary hover:underline"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>
          )}
        </span>
      ))}
    </>
  );
}
