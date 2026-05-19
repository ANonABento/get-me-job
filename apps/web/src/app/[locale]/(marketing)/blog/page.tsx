import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { headers } from "next/headers";

import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { formatDateAbsolute } from "@/lib/format/time";
import { Link } from "@/i18n/navigation";
import { MonoCap } from "@/components/landing/primitives";
import { BLOG_POSTS, getBlogJsonLdBase } from "./posts";

export function generateMetadata({ params }: { params: { locale: string } }) {
  void params;
  return {
    title: "Blog",
    description:
      "Practical guides for ATS-friendly resumes, job search workflows, and self-hosted career tooling.",
    alternates: {
      canonical: "/blog",
      languages: getAlternateLanguages("/blog"),
    },
  };
}

function buildBlogListJsonLd(locale: string) {
  const base = getMetadataBase();

  const posts = BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    url: new URL(`/${locale}/blog/${post.slug}`, base).toString(),
  }));

  return {
    ...getBlogJsonLdBase(),
    mainEntity: posts,
    itemListElement: posts,
    numberOfItems: posts.length,
  };
}

export default function BlogIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  const routeHeaders = headers();
  const nonce = routeHeaders.get(CSP_NONCE_HEADER);

  return (
    <>
      <script
        {...(nonce ? { nonce } : {})}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBlogListJsonLd(params.locale)),
        }}
      />

      {/* Hero */}
      <section className="border-b border-rule bg-page">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-12 pt-10 md:px-10 md:pb-16 md:pt-16">
          <div className="flex max-w-[640px] flex-col gap-4">
            <MonoCap className="text-brand">Resources</MonoCap>
            <h1 className="font-display text-[clamp(40px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-display text-ink">
              Slothing Blog
            </h1>
            <p className="max-w-[58ch] text-[16.5px] leading-[1.55] text-ink-2">
              Practical guides on resume optimization, interview prep, and
              building a job search workflow you control.
            </p>
          </div>
        </div>
      </section>

      {/* Post grid */}
      <section className="border-t border-rule bg-paper py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="grid gap-5 md:grid-cols-2">
            {BLOG_POSTS.map((post, index) => (
              <article
                key={post.slug}
                className="flex flex-col rounded-2xl border border-rule bg-page p-6 shadow-paper-card transition-colors hover:border-brand md:p-8"
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand">
                  {String(index + 1).padStart(2, "0")} · {post.audience} ·{" "}
                  {post.readMinutes} min
                </span>
                <h2 className="mt-3 font-display text-[24px] font-extrabold leading-tight tracking-display text-ink md:text-[28px]">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-[14.5px] leading-6 text-ink-2">
                  {post.description}
                </p>
                <div className="mt-5 flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {formatDateAbsolute(post.publishedDate, params.locale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    {post.readMinutes} min read
                  </span>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  Read guide
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
