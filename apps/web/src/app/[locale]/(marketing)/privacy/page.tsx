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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: {PRIVACY_LAST_UPDATED}.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="mt-2">
              <LegalText text={section.body} />
            </p>
            {section.title === "Data sharing" &&
              PRIVACY_ADDITIONAL_PARAGRAPHS.map((paragraph) => (
                <p className="mt-4" key={paragraph}>
                  <LegalText text={paragraph} emphasizePrefix />
                </p>
              ))}
          </section>
        ))}
      </div>
    </div>
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
          <strong>{prefix}.</strong>{" "}
        </>
      )}
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
