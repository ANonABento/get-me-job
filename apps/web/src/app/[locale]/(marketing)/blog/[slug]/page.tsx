import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";

import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import { formatDateAbsolute } from "@/lib/format/time";
import { Link as LocalizedLink } from "@/i18n/navigation";
import { EditorialProse } from "@/components/landing/EditorialProse";
import { MonoCap } from "@/components/landing/primitives";
import {
  getBlogPostBySlug,
  getBlogPostUrls,
  type BlogPostSlug,
  type BlogSection,
} from "../posts";

export function generateStaticParams() {
  return getBlogPostUrls();
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: BlogPostSlug };
}) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Guide not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: getAlternateLanguages(`/blog/${post.slug}`),
    },
  };
}

function buildBlogPostingJsonLd(
  post: {
    title: string;
    description: string;
    publishedDate: string;
    slug: string;
    audience: string;
    readMinutes: number;
  },
  locale: string,
) {
  const base = getMetadataBase();
  const url = new URL(`/${locale}/blog/${post.slug}`, base).toString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    inLanguage: locale,
    keywords: `ATS optimization, ${post.audience}, job search`,
    wordCount: post.readMinutes * 180,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    about: {
      "@type": "Thing",
      name: post.audience,
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = getBlogPostBySlug(params.slug);
  const routeHeaders = headers();
  const nonce = routeHeaders.get(CSP_NONCE_HEADER);

  if (!post) {
    notFound();
  }

  return (
    <>
      <script
        {...(nonce ? { nonce } : {})}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBlogPostingJsonLd(post, params.locale)),
        }}
      />

      {/* Post header */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-prose px-5 pb-10 pt-10 md:px-10 md:pb-12 md:pt-16">
          <LocalizedLink
            href="/blog"
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand transition-colors hover:text-brand-dark"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to blog
          </LocalizedLink>

          <h1 className="mt-6 font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.04] tracking-display text-ink">
            {post.title}
          </h1>
          <p className="mt-5 text-[16.5px] leading-[1.55] text-ink-2">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 border-t border-rule pt-5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {formatDateAbsolute(post.publishedDate, params.locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" aria-hidden />
              {post.readMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" aria-hidden />
              {post.audience}
            </span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-page py-12 md:py-16">
        <EditorialProse>
          {post.sections.map((section: BlogSection) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet: string) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </EditorialProse>
      </section>

      {/* From this guide */}
      <section className="border-t border-rule bg-paper py-12 md:py-16">
        <div className="mx-auto w-full max-w-prose px-5 md:px-10">
          <div className="rounded-2xl border border-rule bg-page p-6 shadow-paper-card md:p-8">
            <MonoCap className="text-brand">From this guide</MonoCap>
            <h2 className="mt-2 font-display text-[clamp(20px,2.2vw,28px)] font-extrabold leading-tight tracking-display text-ink">
              {post.ctaHeadline}
            </h2>
            <p className="mt-3 text-[14.5px] leading-6 text-ink-2">
              {post.ctaText}
            </p>
            <LocalizedLink
              href={post.ctaHref}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-page transition-opacity hover:opacity-90"
            >
              Go to tool
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LocalizedLink>
          </div>
        </div>
      </section>
    </>
  );
}
