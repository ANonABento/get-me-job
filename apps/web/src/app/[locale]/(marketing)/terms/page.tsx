import {
  LEGAL_CONTACT_EMAIL,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/lib/legal/legal-copy";
import { getLocalizedPageMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("terms", params.locale);
}

/**
 * Terms of Service — editorial typographic pass.
 *
 * Same shell as `/privacy`: max-w-prose, mono-cap eyebrow, Outfit H1,
 * paper-card sections. Section structure preserved verbatim for SEO
 * and for the page test.
 */
export default function TermsPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-prose px-5 pb-10 pt-10 md:px-10 md:pb-12 md:pt-16">
          <span className="inline-flex w-fit items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
            Legal · Last updated {TERMS_LAST_UPDATED}
          </span>
          <h1 className="mt-5 font-display text-[clamp(36px,4.4vw,56px)] font-extrabold leading-[1.04] tracking-display text-ink">
            Terms of Service
          </h1>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-2">
            The contract between Slothing and you. Questions go to{" "}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="text-brand underline-offset-4 hover:underline"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-page py-12 md:py-16">
        <div className="mx-auto w-full max-w-prose space-y-8 px-5 md:px-10">
          {TERMS_SECTIONS.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-rule bg-paper p-6 shadow-paper-card md:p-7"
            >
              <h2 className="font-display text-[22px] font-extrabold leading-tight tracking-display text-ink md:text-[24px]">
                {section.title}
              </h2>
              <p className="mt-3 text-[15px] leading-[1.7] text-ink-2">
                <LegalText text={section.body} />
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
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
              className="text-brand underline-offset-4 hover:underline"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>
          )}
        </span>
      ))}
    </>
  );
}
