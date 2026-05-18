import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { nowDate } from "@/lib/format/time";
import { getMetadataBase } from "@/lib/seo";
import { getBlogPostUrls } from "@/app/[locale]/(marketing)/blog/posts";

const VS_SLUGS = ["teal", "huntr", "simplify"] as const;

const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/ats-scanner", priority: 0.8, changeFrequency: "weekly" },
  { path: "/extension", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/vs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
] as const satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}>;

const VS_ROUTES = VS_SLUGS.map((slug) => ({
  path: `/vs/${slug}`,
  priority: 0.6,
  changeFrequency: "monthly" as const,
}));

const BLOG_ROUTES = getBlogPostUrls().map((post) => ({
  path: `/blog/${post.slug}`,
  priority: 0.6,
  changeFrequency: "monthly" as const,
}));

function absoluteUrl(path: string) {
  return new URL(path, getMetadataBase()).toString();
}

function localePath(locale: string, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = nowDate();
  const routes = [...PUBLIC_ROUTES, ...VS_ROUTES, ...BLOG_ROUTES];

  const entries = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, route.path)),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  );

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...entries,
  ];
}
