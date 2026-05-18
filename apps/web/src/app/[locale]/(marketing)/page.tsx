import { headers } from "next/headers";
import { LandingHero } from "@/components/landing/Hero";
import { TheLoop } from "@/components/landing/TheLoop";
import { Section, type SectionProps } from "@/components/landing/Section";
import { Closer } from "@/components/landing/ClosingSections";
import { LogoStrip } from "@/components/landing/RichSections";
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

/**
 * 8-section editorial composition.
 *
 * 01–06 are the product loop. 07 + 08 prove the section pattern is
 * extensible without breaking rhythm. Backgrounds alternate (odd index
 * page, even index paper), flipped layout alternates every other row.
 */
const SECTIONS: SectionProps[] = [
  {
    number: "01",
    eyebrow: "Atomize",
    headline: "Your career, in reusable pieces.",
    body: "Upload resumes, docs, past applications. Slothing parses them into stories, projects, skills, and answers — your single source of truth that every later section pulls from.",
    details: [
      { label: "parses", value: "PDF · DOCX · TXT" },
      { label: "feeds into", value: "Studio · Forms · Prep" },
    ],
    flipped: false,
    alt: false,
    variant: "video",
    frameLabel: "atomize.mp4",
    videoSrc: "/marketing/sections/atomize.mp4",
    posterPanel: 1,
    meta: { path: "/marketing/sections/atomize", duration: "0:12" },
  },
  {
    number: "02",
    eyebrow: "Capture",
    headline: "Jobs come to you, even overnight.",
    body: "Browser extension scrapes LinkedIn, Greenhouse, Lever, Workday, Indeed and more. Leave the agent running while you sleep — wake up to a normalized queue.",
    details: [
      { label: "scrapes", value: "8+ boards · JSON-LD" },
      { label: "runs", value: "overnight · headless" },
    ],
    flipped: true,
    alt: true,
    variant: "video",
    frameLabel: "capture.mp4",
    videoSrc: "/marketing/sections/capture.mp4",
    posterPanel: 2,
    meta: { path: "/marketing/sections/capture", duration: "0:14" },
  },
  {
    number: "03",
    eyebrow: "Review",
    headline: "Tinder for jobs, on your phone.",
    body: "Every saved role is normalized so a Workday listing and an Indeed listing read the same. Swipe through over breakfast — yes, save-for-later, no.",
    details: [
      { label: "format", value: "normalized · comparable" },
      { label: "surfaces on", value: "mobile · desktop" },
    ],
    flipped: false,
    alt: false,
    variant: "video",
    frameLabel: "review.mp4",
    videoSrc: "/marketing/sections/review.mp4",
    posterPanel: 3,
    meta: { path: "/marketing/sections/review", duration: "0:11" },
  },
  {
    number: "04",
    eyebrow: "Tailor",
    headline: "Resumes assembled, not hallucinated.",
    body: "Studio builds resumes, cover letters, and portfolios from your real components — every bullet traceable back to your bank. ATS scores included.",
    details: [
      { label: "grounded in", value: "your components only" },
      { label: "exports", value: "PDF · DOCX · LaTeX" },
    ],
    flipped: true,
    alt: true,
    variant: "video",
    frameLabel: "tailor.mp4",
    videoSrc: "/marketing/sections/tailor.mp4",
    posterPanel: 4,
    meta: { path: "/marketing/sections/tailor", duration: "0:18" },
  },
  {
    number: "05",
    eyebrow: "Autofill",
    headline: "Type each answer exactly once.",
    body: "The extension auto-imports your tailored doc and fills application forms from an answer bank that learns your voice as you go.",
    details: [
      { label: "memory", value: "self-evolving" },
      { label: "fills", value: "Greenhouse · Workday · Lever" },
    ],
    flipped: false,
    alt: false,
    variant: "video",
    frameLabel: "autofill.mp4",
    videoSrc: "/marketing/sections/autofill.mp4",
    posterPanel: 5,
    meta: { path: "/marketing/sections/autofill", duration: "0:09" },
  },
  {
    number: "06",
    eyebrow: "Practice",
    headline: "Ready by the time the interview lands.",
    body: "Research agents pull company, role, salary, and team context. Voice-based STAR practice uses the same stories you applied with — no random flashcards.",
    details: [
      { label: "research", value: "role · team · comp" },
      { label: "practice", value: "voice · STAR · scored" },
    ],
    flipped: true,
    alt: true,
    variant: "video",
    frameLabel: "practice.mp4",
    videoSrc: "/marketing/sections/practice.mp4",
    posterPanel: 6,
    meta: { path: "/marketing/sections/practice", duration: "0:13" },
  },
  {
    number: "07",
    eyebrow: "Extension",
    headline: "One shortcut for every job board.",
    body: "The Slothing extension lives in your browser. Capture from any board with one click, autofill any form, prep for any interview from the page you're already on.",
    details: [
      { label: "supports", value: "Chrome · Firefox · Edge" },
      { label: "size", value: "< 2MB · MV3" },
    ],
    flipped: false,
    alt: false,
    variant: "placeholder",
    frameLabel: "extension.mp4",
    smallLabel: "/marketing/sections/extension",
    bigLabel: "Browser extension demo",
    smallTail: "Recorded · 0:22",
  },
  {
    number: "08",
    eyebrow: "Open source",
    headline: "Your data. Your keys. Your machine.",
    body: "Slothing is AGPL-3.0 open source. Use the hosted version, plug in your own OpenAI / Anthropic / OpenRouter / Ollama key, or run the whole stack on your laptop. Whichever feels right.",
    details: [
      { label: "license", value: "AGPL-3.0" },
      { label: "model", value: "BYOK · self-hostable" },
    ],
    flipped: true,
    alt: true,
    variant: "placeholder",
    frameLabel: "github.com/ANonABento/slothing",
    smallLabel: "/marketing/sections/open-source",
    bigLabel: "★ Star on GitHub",
    smallTail: "AGPL-3.0 · BYOK · MIT-style cloud carve-out",
  },
];

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
      <TheLoop />
      <LogoStrip />
      {SECTIONS.map((section) => (
        <Section key={section.number} {...section} />
      ))}
      <Closer />
    </>
  );
}
