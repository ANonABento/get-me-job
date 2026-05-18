import { getSiteMetadata } from "@/lib/seo";

export type BlogPostSlug = (typeof BLOG_POSTS)[number]["slug"];

export type BlogSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  readMinutes: number;
  audience: string;
  sections: BlogSection[];
  ctaHeadline: string;
  ctaText: string;
  ctaHref: string;
};

export const BLOG_POSTS = [
  {
    slug: "what-is-ats-optimization",
    title: "What is ATS optimization, and how to make your resume pass it",
    description:
      "A practical guide to how Applicant Tracking Systems work and how to tune your resume for better machine parsing results.",
    publishedDate: "2026-05-15",
    readMinutes: 7,
    audience: "job seekers",
    sections: [
      {
        heading: "Why ATS filtering matters",
        body: "ATS systems parse resumes to pull out skills, job titles, and dates. If text is too visually noisy or inconsistent, important sections can be missed and your application can drop into low-priority queues.",
      },
      {
        heading: "How ATS parsing fails",
        body: "Common failures are usually formatting issues, weak keyword alignment, and mixed role titles that don't match the posting requirements.",
        bullets: [
          "Tables and image-based resumes reduce parse reliability",
          "Inconsistent role/timeline formatting makes matching harder",
          "Buzzword-heavy summaries can dilute signal",
        ],
      },
      {
        heading: "Practical optimization sequence",
        body: "Focus on a clean structure first: clear heading hierarchy, concise job entries, and role-aligned language for each job and project.",
        bullets: [
          "Keep a reverse-chronological structure with clear dates",
          "Use plain text for core resume blocks before creative design elements",
          "Mirror critical keywords from the posting, but avoid stuffing",
          "Use action verbs and measurable outcomes to improve ranking and clarity",
        ],
      },
      {
        heading: "Where Slothing helps",
        body: "Use the ATS scanner to see what likely passes, then tailor sections with feedback loops instead of guesswork.",
      },
    ],
    ctaHeadline: "Try Slothing ATS Scoring",
    ctaText:
      "Run your resume text through Slothing and see concrete improvement gaps.",
    ctaHref: "/ats-scanner",
  },
  {
    slug: "self-hosted-job-search",
    title: "Self-hosted job search workflows: better control, better privacy",
    description:
      "A concise breakdown of self-hosting job-search tooling for privacy, ownership, and predictable costs.",
    publishedDate: "2026-05-15",
    readMinutes: 6,
    audience: "privacy-first professionals",
    sections: [
      {
        heading: "Why people move to self-hosted tooling",
        body: "Teams and solo professionals increasingly want ownership over where application data lives, who can access it, and how prompts and API keys are handled.",
        bullets: [
          "Control where your data is stored",
          "Bring your own LLM keys when you want full model and cost control",
          "Keep integrations and workflow customizations under your own change control",
        ],
      },
      {
        heading: "Trade-offs to expect",
        body: "Self-hosting brings flexibility, but also deployment and upgrade responsibility. Decide whether team workflows justify that overhead.",
        bullets: [
          "Higher upfront setup and maintenance effort",
          "More control over auditability and incident handling",
          "Fewer opaque vendor lock-in paths",
        ],
      },
      {
        heading: "Migration checklist",
        body: "Start with a narrow pilot: one account, one role workflow, and one AI model path. Then expand after confidence in backups and sync reliability.",
        bullets: [
          "Document your authentication and backup plan",
          "Verify export/import behavior for opportunities and documents",
          "Create a rollback path before switching your weekly workflow",
        ],
      },
    ],
    ctaHeadline: "Prefer self-hosting?",
    ctaText:
      "Deploy Slothing your way and keep control over how your job-search assistant runs.",
    ctaHref: "/pricing",
  },
  {
    slug: "ats-keywords-strategy",
    title: "How to build an ATS-friendly keyword strategy for each job",
    description:
      "A practical method for aligning your resume keywords to a job description without gaming your language.",
    publishedDate: "2026-05-17",
    readMinutes: 6,
    audience: "job applicants",
    sections: [
      {
        heading: "Start with role language",
        body: "Before editing your resume, list the top five outcomes in the target job post and map each to one line in your experience section.",
        bullets: [
          "Capture outcomes the recruiter can measure",
          "Use exact terminology for role seniority and scope",
          "Preserve chronology and dates in the same format",
        ],
      },
      {
        heading: "Avoid keyword stuffing",
        body: "Keywords only help when they reflect real work. Overstuffing produces repetitive text and can hurt readability and ATS scoring consistency.",
        bullets: [
          "Use each relevant term where it actually belongs in your story",
          "Favor role verbs over buzzwords",
          "Keep section titles predictable for parsers",
        ],
      },
      {
        heading: "Prove match with examples",
        body: "For every keyword group, add one concrete example with a date and measurable outcome so your resume is both parseable and persuasive.",
        bullets: [
          "Quantify the result, even with approximations",
          "Tie skills to outcomes from real projects",
          "Keep examples concise and scan-friendly",
        ],
      },
    ],
    ctaHeadline: "Score your resume before you apply",
    ctaText:
      "Feed your draft into Slothing ATS Scanner and review recommendations before submitting.",
    ctaHref: "/ats-scanner",
  },
  {
    slug: "job-search-week-plan",
    title: "A weekly job-search plan that prevents burnout",
    description:
      "Use a fixed weekly rhythm for tracking applications, follow-ups, and interview prep without burning out.",
    publishedDate: "2026-05-18",
    readMinutes: 5,
    audience: "active job hunters",
    sections: [
      {
        heading: "Monday: shortlist and prioritize",
        body: "Pick 8–10 target roles with high confidence and score each one against your readiness before week two.",
        bullets: [
          "Use one sheet of criteria per role",
          "Drop low-fit roles early",
          "Set realistic daily application targets",
        ],
      },
      {
        heading: "Tue/Wed: tailor and apply",
        body: "Apply your resume and cover letter edits in batches so each application gets real personalization, not copy-paste noise.",
        bullets: [
          "Reserve writing time for resume variants first",
          "Use tracking notes for each role",
          "Follow up with one meaningful detail per role",
        ],
      },
      {
        heading: "Thu/Fri: follow up and reflect",
        body: "Review your pipeline, adjust for low conversion stages, and keep your data tidy before the next weekly cycle.",
        bullets: [
          "Move applications through your opportunity stages daily",
          "Track response timing and notes",
          "Plan the next week's 2–3 high-priority improvements",
        ],
      },
    ],
    ctaHeadline: "Need a cleaner routine?",
    ctaText:
      "Use Slothing to keep job opportunities, notes, and follow-ups in one place with no extra tab juggling.",
    ctaHref: "/",
  },
  {
    slug: "cover-letter-storyline",
    title: "Write a cover-letter storyline that mirrors your resume",
    description:
      "Learn how to frame your cover letter as a short, role-specific narrative your recruiter will actually read.",
    publishedDate: "2026-05-19",
    readMinutes: 6,
    audience: "job seekers",
    sections: [
      {
        heading: "Anchor to the job posting",
        body: "Treat each cover letter as a response to that posting, not a general self-introduction.",
        bullets: [
          "Start with the role problem the team is hiring for",
          "Call out one direct match from your past experience",
          "Close with a next-step oriented statement",
        ],
      },
      {
        heading: "Use one concrete proof point",
        body: "Every paragraph should point to one measurable result from your history, not abstract claims.",
        bullets: [
          "Prefer outcomes over responsibility lists",
          "Quantify with scope, team size, and time frame",
          "Keep writing tight and first-person where appropriate",
        ],
      },
      {
        heading: "Keep the copy easy to skim",
        body: "A recruiter should understand your relevance in under 45 seconds, so favor short paragraphs and clear transitions.",
        bullets: [
          "Use one sentence to set context",
          "Use one sentence to prove fit",
          "Use one sentence to propose next steps",
        ],
      },
    ],
    ctaHeadline: "Need faster drafts?",
    ctaText:
      "Generate cover letter prompts in the document studio and keep the tone aligned with each role.",
    ctaHref: "/studio",
  },
] as const satisfies ReadonlyArray<BlogPost>;

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostUrls() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function getBlogJsonLdBase() {
  const siteMetadata = getSiteMetadata();

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Slothing Blog",
    description: siteMetadata.description,
    url: `${siteMetadata.metadataBase}/blog`,
  };
}
