import { headers } from "next/headers";
import { CalendarDays, ChevronLeft, Clock3, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import { formatDateAbsolute } from "@/lib/format/time";
import { Link as LocalizedLink } from "@/i18n/navigation";
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
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <header className="space-y-5 border-b pb-8">
        <LocalizedLink
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to blog
        </LocalizedLink>

        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateAbsolute(post.publishedDate, params.locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {post.readMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {post.audience}
          </span>
        </div>

        <a
          href={`#main-content`}
          className="text-xs inline-block text-muted-foreground"
          aria-label={`SEO guide: ${post.slug}`}
        >
          permalink
        </a>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none pt-10">
        {post.sections.map((section: BlogSection) => (
          <section key={section.heading} className="not-prose">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet: string) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>

      <section className="mt-12 rounded-lg border p-6">
        <h2 className="text-2xl font-semibold">From this guide</h2>
        <p className="mt-3 text-sm text-muted-foreground">{post.ctaHeadline}</p>
        <p className="mt-2 text-sm text-muted-foreground">{post.ctaText}</p>
        <LocalizedLink
          href={post.ctaHref}
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Go to tool
        </LocalizedLink>
      </section>

      <script
        {...(nonce ? { nonce } : {})}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBlogPostingJsonLd(post, params.locale)),
        }}
      />
    </main>
  );
}
