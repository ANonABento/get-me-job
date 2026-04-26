import type { Metadata } from "next";

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

export const SITE_NAME = "Taida";
export const SITE_TITLE = `${SITE_NAME} — AI-Powered Job Application Assistant`;
export const SITE_DESCRIPTION =
  "AI-powered job application assistant — resume tailoring, interview prep, and application tracking to land your dream job.";

const DEFAULT_SITE_URL = "https://taida.app";
const DEFAULT_LOCALE = "en_US";
const DEFAULT_TWITTER_CARD = "summary_large_image";

const pages = {
  dashboard: {
    title: "Dashboard",
    description:
      "Track your job search progress, upcoming interviews, and application stats at a glance.",
    path: "/dashboard",
  },
  bank: {
    title: "Documents",
    description:
      "Manage your resume sections, work experiences, and career documents in one place.",
    path: "/bank",
  },
  studio: {
    title: "Document Studio",
    description:
      "Build resumes, cover letters, and tailored application documents from your career knowledge bank.",
    path: "/studio",
  },
  tailor: {
    title: "Tailor Resume",
    description:
      "AI-powered resume tailoring — match your resume to any job description for higher ATS scores.",
    path: "/tailor",
  },
  jobs: {
    title: "Job Tracker",
    description:
      "Track job applications through every stage — from saved to offer.",
    path: "/jobs",
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
  salary: {
    title: "Salary Research",
    description:
      "Research compensation data and negotiate your offer with confidence.",
    path: "/salary",
  },
  settings: {
    title: "Settings",
    description: "Configure your AI provider, model preferences, and account settings.",
    path: "/settings",
  },
} satisfies Record<string, RouteSeo>;

const marketingHomePage = {
  title: SITE_TITLE,
  description:
    "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
  path: "/",
  absoluteTitle: true,
} satisfies RouteSeo;

function buildMetadata(seo: RouteSeo): Metadata {
  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.path,
    },
    openGraph: {
      type: "website",
      locale: DEFAULT_LOCALE,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      url: seo.path,
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

export function getMarketingPageMetadata(): Metadata {
  return buildMetadata(marketingHomePage);
}
