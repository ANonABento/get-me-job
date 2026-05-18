import { headers } from "next/headers";
import { LandingHero } from "@/components/landing/Hero";
import { TheLoop } from "@/components/landing/TheLoop";
import {
  AnswerBankSection,
  CaptureAndQueueSection,
  InterviewResearchSection,
  KnowledgeBankSection,
  StudioSection,
} from "@/components/landing/FeatureSections";
import { Closer } from "@/components/landing/ClosingSections";
import { LogoStrip, WhySlothing } from "@/components/landing/RichSections";
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
    "You're not lazy. Your job search system is. Slothing is one workspace that atomizes your career into reusable components, captures jobs from every board, and lets you tailor and apply without re-typing your life into every form.",
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
      <LogoStrip />
      <TheLoop />
      <KnowledgeBankSection />
      <CaptureAndQueueSection />
      <StudioSection />
      <AnswerBankSection />
      <InterviewResearchSection />
      <WhySlothing />
      <Closer />
    </>
  );
}
