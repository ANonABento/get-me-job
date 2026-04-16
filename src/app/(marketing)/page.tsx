import type { Metadata } from "next";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";
import { CTASection } from "./components/cta-section";

export const metadata: Metadata = {
  title: "Taida — AI-Powered Job Application Assistant",
  description:
    "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
  openGraph: {
    title: "Taida — AI-Powered Job Application Assistant",
    description:
      "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
    url: "/",
  },
  twitter: {
    title: "Taida — AI-Powered Job Application Assistant",
    description:
      "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Taida",
  description: "AI-powered job application assistant — resume tailoring, interview prep, and application tracking.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  );
}
