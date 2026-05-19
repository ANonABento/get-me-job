import {
  LEGAL_CONTACT_EMAIL,
  PRIVACY_ADDITIONAL_PARAGRAPHS,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from "@/lib/legal/legal-copy";
import { getLocalizedPageMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedPageMetadata("privacy", params.locale);
}

/**
 * Privacy Policy — editorial typographic pass.
 *
 * `max-w-prose mx-auto` keeps line length comfortable for legal reading.
 * Mono-cap "LEGAL · LAST UPDATED" eyebrow, Outfit H1, paper card chassis
 * around each section's body for visual rhythm without competing with
 * the copy itself.
 *
 * Section structure (h1/h2/p) and contact email mailto links are
 * load-bearing for the page test.
 */
export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-prose px-5 pb-10 pt-10 md:px-10 md:pb-12 md:pt-16">
          <span className="inline-flex w-fit items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
            Legal · Last updated {PRIVACY_LAST_UPDATED}
          </span>
          <h1 className="mt-5 font-display text-[clamp(36px,4.4vw,56px)] font-extrabold leading-[1.04] tracking-display text-ink">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-2">
            What we collect, why we collect it, and how to delete it. Email{" "}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="text-brand underline-offset-4 hover:underline"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>{" "}
            with anything we&apos;ve missed.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-page py-12 md:py-16">
        <div className="mx-auto w-full max-w-prose space-y-8 px-5 md:px-10">
          {PRIVACY_SECTIONS.map((section) => (
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
              {section.title === "Data sharing" &&
                PRIVACY_ADDITIONAL_PARAGRAPHS.map((paragraph) => (
                  <p
                    className="mt-3 text-[15px] leading-[1.7] text-ink-2"
                    key={paragraph}
                  >
                    <LegalText text={paragraph} emphasizePrefix />
                  </p>
                ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function LegalText({
  text,
  emphasizePrefix = false,
}: {
  text: string;
  emphasizePrefix?: boolean;
}) {
  const splitAt = emphasizePrefix ? text.indexOf(". ") : -1;
  const prefix = splitAt > 0 ? text.slice(0, splitAt) : "";
  const content = prefix ? text.slice(splitAt + 2) : text;
  const parts = content.split(LEGAL_CONTACT_EMAIL);

  return (
    <>
      {emphasizePrefix && prefix && (
        <>
          <strong className="font-semibold text-ink">{prefix}.</strong>{" "}
        </>
      )}
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
