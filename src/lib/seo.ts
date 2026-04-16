import type { Metadata } from "next";

/**
 * Per-route SEO metadata for app pages.
 * Used by route layout files since page components are client-side.
 */

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

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
};

export function getPageMetadata(page: keyof typeof pages): Metadata {
  const seo = pages[page];
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.path,
    },
    twitter: {
      title: seo.title,
      description: seo.description,
    },
  };
}
