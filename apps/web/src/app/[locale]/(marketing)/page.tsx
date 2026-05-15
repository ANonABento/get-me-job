import { headers } from "next/headers";
import { LandingHero } from "@/components/landing/Hero";
import {
  ATSMatchSection,
  ExtensionSection,
  FormAutofillSection,
  InterviewPrepSection,
  KnowledgeBankSection,
} from "@/components/landing/FeatureSections";
import {
  Closer,
  IntegrationsStrip,
  JobQueuePreview,
} from "@/components/landing/ClosingSections";
import { getLocalizedMarketingPageMetadata } from "@/lib/seo";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return getLocalizedMarketingPageMetadata(params.locale);
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Slothing",
  description:
    "A calmer way to job hunt. AI-powered resume tailoring, interview prep, and application tracking — local-first and open source.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  const nonce = headers().get(CSP_NONCE_HEADER) ?? undefined;

  return (
    <>
      {/* JSON-LD is data, not executable script — the CSP nonce
          legitimately differs between server and client requests, so
          we keep it server-side only and suppress the hydration
          warning rather than emit a mismatch every render. */}
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHero />
      <KnowledgeBankSection />
      <ExtensionSection />
      <ATSMatchSection />
      <FormAutofillSection />
      <InterviewPrepSection />
      <IntegrationsStrip />
      <JobQueuePreview />
      <Closer />
    </>
  );
}
