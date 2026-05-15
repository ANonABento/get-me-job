import type { Metadata } from "next";
import { defaultLocale, locales } from "@/i18n";

/**
 * Per-route SEO metadata for app pages.
 * Used by route layout files since page components are client-side.
 */

interface RouteSeo {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}

export const SITE_NAME = "Slothing";
export const SITE_TITLE = `${SITE_NAME} — AI-Powered Job Application Assistant`;
export const SITE_DESCRIPTION =
  "You're not lazy. Your job search system is. AI-powered resume tailoring, interview prep, and application tracking that does the work for you.";

const DEFAULT_SITE_URL = "https://slothing.work";
const DEFAULT_LOCALE = "en_US";
const DEFAULT_TWITTER_CARD = "summary_large_image";
export const CANONICAL_ROUTE_PATH_HEADER = "x-slothing-route-path";

const pages = {
  dashboard: {
    title: "Dashboard",
    description:
      "Track your job search progress, upcoming interviews, and application stats at a glance.",
    path: "/dashboard",
  },
  bank: {
    title: "Knowledge Bank",
    description:
      "Reusable components and answers from your career — extracted resumes, projects, skills, and saved Q&A.",
    path: "/bank",
  },
  builder: {
    title: "Resume Builder",
    description:
      "Open the unified Document Studio to assemble resumes from your bank.",
    path: "/builder",
  },
  coverLetter: {
    title: "Cover Letter",
    description:
      "Draft and revise tailored cover letters in the Document Studio.",
    path: "/cover-letter",
  },
  documents: {
    title: "Documents",
    description:
      "Manage uploaded resumes, cover letters, and supporting files in your bank.",
    path: "/documents",
  },
  answerBank: {
    title: "Answer Bank",
    description:
      "Manage reusable answers for application forms, repeated questions, and autofill workflows.",
    path: "/answer-bank",
  },
  studio: {
    title: "Document Studio",
    description:
      "Build application-ready resumes from your best career details in one workspace.",
    path: "/studio",
  },
  tailor: {
    title: "Tailor Resume",
    description:
      "Tailor your resume to a job description in the Document Studio.",
    path: "/tailor",
  },
  upload: {
    title: "Upload Resume",
    description: "Import a resume to populate your knowledge bank and profile.",
    path: "/upload",
  },
  jobs: {
    title: "Opportunities",
    description:
      "Track jobs and hackathons through every stage from saved to offer.",
    path: "/opportunities",
  },
  interview: {
    title: "Interview Prep",
    description:
      "Practice interviews with AI-generated questions and get instant feedback on your answers.",
    path: "/interview",
  },
  calendar: {
    title: "Calendar",
    description:
      "View upcoming interviews, application deadlines, and follow-up reminders.",
    path: "/calendar",
  },
  emails: {
    title: "Email Templates",
    description:
      "Generate professional follow-up emails, thank-you notes, and outreach templates.",
    path: "/emails",
  },
  analytics: {
    title: "Analytics",
    description:
      "Visualize your job search metrics — response rates, interview conversion, and trends.",
    path: "/analytics",
  },
  profile: {
    title: "Profile",
    description:
      "Keep your career profile, target roles, skills, and experience ready for every application.",
    path: "/profile",
  },
  salary: {
    title: "Salary Research",
    description:
      "Research compensation data and negotiate your offer with confidence.",
    path: "/salary",
  },
  settings: {
    title: "Settings",
    description:
      "Configure your AI provider, model preferences, and account settings.",
    path: "/settings",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Slothing stores, uses, and protects your job search data.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service",
    description: "Terms governing use of the Slothing application.",
    path: "/terms",
  },
  atsScanner: {
    title: "Free ATS Resume Checker",
    description:
      "Check your resume's ATS compatibility score for free. Resumes are parsed on our servers without being saved to your account and scored locally in your browser.",
    path: "/ats-scanner",
  },
  pricing: {
    title: "Pricing",
    description:
      "Free, Pro, and Student plans for Slothing — start free, upgrade when you need unlimited tailored resumes.",
    path: "/pricing",
  },
  extension: {
    title: "Browser Extension",
    description:
      "Install the Slothing browser extension to capture jobs from LinkedIn, Indeed, and company career pages in one click.",
    path: "/extension",
  },
} satisfies Record<string, RouteSeo>;

export type PageSeoKey = keyof typeof pages;

const marketingHomePage = {
  title: SITE_TITLE,
  description:
    "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
  path: "/",
  absoluteTitle: true,
} satisfies RouteSeo;

export function getAlternateLanguages(path: string): Record<string, string> {
  const suffix = path === "/" ? "" : path;
  const languages: Record<string, string> = {
    "x-default": `/${defaultLocale}${suffix}`,
  };

  for (const locale of locales) {
    languages[locale] = `/${locale}${suffix}`;
  }

  return languages;
}

function getLocalizedPath(path: string, locale: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function getAlternateLinksHeader(path: string, origin: string): string {
  return Object.entries(getAlternateLanguages(path))
    .map(([language, href]) => {
      const absoluteHref = new URL(href, origin).toString();

      return `<${absoluteHref}>; rel="alternate"; hreflang="${language}"`;
    })
    .join(", ");
}

function buildMetadata(seo: RouteSeo, locale?: string): Metadata {
  const url = locale ? getLocalizedPath(seo.path, locale) : seo.path;

  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    metadataBase: getMetadataBase(),
    alternates: {
      canonical: url,
      languages: getAlternateLanguages(seo.path),
    },
    openGraph: {
      type: "website",
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      url,
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: seo.title,
      description: seo.description,
    },
  };
}

export function getMetadataBase(): URL {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredSiteUrl) {
    try {
      return new URL(configuredSiteUrl);
    } catch {
      // Fall back to the production site URL when the env var is misconfigured.
    }
  }

  return new URL(DEFAULT_SITE_URL);
}

export function getSiteMetadata(): Metadata {
  return {
    title: {
      default: SITE_TITLE,
      template: `%s — ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: getMetadataBase(),
    alternates: {
      canonical: "/",
      languages: getAlternateLanguages("/"),
    },
    openGraph: {
      type: "website",
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: "/",
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
  };
}

export function getPageMetadata(page: keyof typeof pages): Metadata {
  return buildMetadata(pages[page]);
}

export function getLocalizedPageMetadata(
  page: keyof typeof pages,
  locale: string,
): Metadata {
  return buildMetadata(pages[page], locale);
}

export function getMarketingPageMetadata(): Metadata {
  return buildMetadata(marketingHomePage);
}

export function getLocalizedMarketingPageMetadata(locale: string): Metadata {
  return buildMetadata(marketingHomePage, locale);
}

export function getOgSeo(page: keyof typeof pages | "marketingHome") {
  const seo = page === "marketingHome" ? marketingHomePage : pages[page];

  return {
    title: seo.title,
    description: seo.description,
  };
}
