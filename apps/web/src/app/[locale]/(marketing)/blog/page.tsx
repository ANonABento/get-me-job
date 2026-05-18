import { CalendarDays, Clock3, ArrowRight } from "lucide-react";
import { headers } from "next/headers";

import { getAlternateLanguages, getMetadataBase } from "@/lib/seo";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import { formatDateAbsolute } from "@/lib/format/time";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS, getBlogJsonLdBase } from "./posts";

export function generateMetadata({ params }: { params: { locale: string } }) {
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
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-4 border-b pb-10">
        <p className="text-sm font-semibold uppercase text-primary">
          Resources
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Slothing Blog</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Practical guides on resume optimization, interview prep, and building
          a job search workflow you control.
        </p>
      </header>

      <script
        {...(nonce ? { nonce } : {})}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBlogListJsonLd(params.locale)),
        }}
      />

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border p-6 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              {post.audience} · {post.readMinutes} min read
            </div>
            <h2 className="mt-2 text-2xl font-semibold">{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {post.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDateAbsolute(post.publishedDate, params.locale)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {post.readMinutes} min read
              </span>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Read guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
