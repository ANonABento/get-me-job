import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAlternateLanguages,
  getAlternateLinksHeader,
  getLocalizedMarketingPageMetadata,
  getLocalizedPageMetadata,
  getMarketingPageMetadata,
  getMetadataBase,
  getOgSeo,
  getPageMetadata,
  getSiteMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteMetadata", () => {
  it("returns the default site metadata", () => {
    const meta = getSiteMetadata();

    expect(meta.description).toBe(SITE_DESCRIPTION);
    expect(meta.openGraph).toMatchObject({
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: "/",
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
  });

  it("uses the configured app URL as metadataBase", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://jobs.example.com");

    expect(getMetadataBase().toString()).toBe("https://jobs.example.com/");
    expect(getSiteMetadata().metadataBase?.toString()).toBe(
      "https://jobs.example.com/",
    );
  });

  it("includes hreflang alternates for the localized home pages", () => {
    expect(getSiteMetadata().alternates).toMatchObject({
      canonical: "/",
      languages: {
        "x-default": "/en",
        en: "/en",
        es: "/es",
        "zh-CN": "/zh-CN",
        "pt-BR": "/pt-BR",
        hi: "/hi",
        fr: "/fr",
        ja: "/ja",
        ko: "/ko",
      },
    });
  });

  it("falls back to the default site URL when the app URL is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

    expect(getMetadataBase().toString()).toBe("https://slothing.work/");
  });

  it("falls back to the default site URL when the app URL is invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a valid url");

    expect(getMetadataBase().toString()).toBe("https://slothing.work/");
  });
});

describe("getMarketingPageMetadata", () => {
  it("returns absolute title metadata for the landing page", () => {
    const meta = getMarketingPageMetadata();

    expect(meta.title).toEqual({ absolute: SITE_TITLE });
    expect(meta.alternates).toMatchObject({ canonical: "/" });
    expect(meta.alternates).toMatchObject({
      languages: {
        "x-default": "/en",
        en: "/en",
        ja: "/ja",
      },
    });
    expect(meta.openGraph).toMatchObject({
      siteName: SITE_NAME,
      title: SITE_TITLE,
      url: "/",
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: SITE_TITLE,
    });
  });
});

describe("getLocalizedMarketingPageMetadata", () => {
  it("canonicalizes the localized landing page to the current locale", () => {
    const meta = getLocalizedMarketingPageMetadata("ja");

    expect(meta.alternates).toMatchObject({ canonical: "/ja" });
    expect(meta.alternates).toMatchObject({
      languages: {
        "x-default": "/en",
        en: "/en",
        ja: "/ja",
      },
    });
    expect(meta.openGraph).toMatchObject({ url: "/ja" });
  });
});

const ALL_PAGES = [
  "dashboard",
  "bank",
  "studio",
  "jobs",
  "interview",
  "calendar",
  "emails",
  "analytics",
  "profile",
  "salary",
  "settings",
  "privacy",
  "terms",
  "atsScanner",
  "pricing",
  "extension",
] as const;

describe("getAlternateLanguages", () => {
  it("maps the root path to locale roots and x-default to English", () => {
    expect(getAlternateLanguages("/")).toEqual({
      "x-default": "/en",
      en: "/en",
      es: "/es",
      "zh-CN": "/zh-CN",
      "pt-BR": "/pt-BR",
      hi: "/hi",
      fr: "/fr",
      ja: "/ja",
      ko: "/ko",
    });
  });

  it("maps route paths across every supported locale", () => {
    expect(getAlternateLanguages("/ats-scanner")).toEqual({
      "x-default": "/en/ats-scanner",
      en: "/en/ats-scanner",
      es: "/es/ats-scanner",
      "zh-CN": "/zh-CN/ats-scanner",
      "pt-BR": "/pt-BR/ats-scanner",
      hi: "/hi/ats-scanner",
      fr: "/fr/ats-scanner",
      ja: "/ja/ats-scanner",
      ko: "/ko/ats-scanner",
    });
  });
});

describe("getAlternateLinksHeader", () => {
  it("formats localized alternate link headers with x-default on English", () => {
    const header = getAlternateLinksHeader("/pricing", "https://slothing.work");

    expect(header).toContain(
      '<https://slothing.work/en/pricing>; rel="alternate"; hreflang="x-default"',
    );
    expect(header).toContain(
      '<https://slothing.work/ja/pricing>; rel="alternate"; hreflang="ja"',
    );
  });
});

describe("getPageMetadata", () => {
  it("returns metadata with title and description for a known page", () => {
    const meta = getPageMetadata("dashboard");
    expect(meta.title).toBe("Dashboard");
    expect(meta.description).toContain("job search");
  });

  it("includes openGraph fields", () => {
    const meta = getPageMetadata("bank");
    expect(meta.openGraph).toBeDefined();
    expect(meta.alternates).toMatchObject({ canonical: "/components" });
    expect((meta.openGraph as Record<string, unknown>).title).toBe(
      "Components",
    );
    expect((meta.openGraph as Record<string, unknown>).url).toBe("/components");
    expect((meta.openGraph as Record<string, unknown>).siteName).toBe(
      SITE_NAME,
    );
  });

  it("includes public extension page metadata", () => {
    const meta = getPageMetadata("extension");

    expect(meta.title).toBe("Browser Extension");
    expect(meta.alternates).toMatchObject({ canonical: "/extension" });
    expect(meta.alternates).toMatchObject({
      languages: {
        "x-default": "/en/extension",
        en: "/en/extension",
        ja: "/ja/extension",
      },
    });
  });

  it("includes twitter card fields", () => {
    const meta = getPageMetadata("studio");
    expect(meta.twitter).toBeDefined();
    expect((meta.twitter as Record<string, unknown>).title).toBe(
      "Document Studio",
    );
    expect((meta.twitter as Record<string, unknown>).card).toBe(
      "summary_large_image",
    );
  });

  it("returns unique titles for each page", () => {
    const titles = ALL_PAGES.map((p) => getPageMetadata(p).title);
    expect(new Set(titles).size).toBe(ALL_PAGES.length);
  });

  it("returns unique descriptions for each page", () => {
    const descriptions = ALL_PAGES.map((p) => getPageMetadata(p).description);
    expect(new Set(descriptions).size).toBe(ALL_PAGES.length);
  });
});

describe("getLocalizedPageMetadata", () => {
  it("canonicalizes localized route pages to the current locale", () => {
    const meta = getLocalizedPageMetadata("pricing", "es");

    expect(meta.alternates).toMatchObject({ canonical: "/es/pricing" });
    expect(meta.alternates).toMatchObject({
      languages: {
        "x-default": "/en/pricing",
        en: "/en/pricing",
        es: "/es/pricing",
        ja: "/ja/pricing",
      },
    });
    expect(meta.openGraph).toMatchObject({ url: "/es/pricing" });
  });
});

describe("getOgSeo", () => {
  it("returns plain strings for route OG images", () => {
    expect(getOgSeo("dashboard")).toEqual({
      title: "Dashboard",
      description:
        "Track your job search progress, upcoming interviews, and application stats at a glance.",
    });
  });

  it("returns plain strings for the marketing home page", () => {
    expect(getOgSeo("marketingHome")).toEqual({
      title: SITE_TITLE,
      description:
        "Land your dream job with AI-powered resume tailoring, ATS optimization, interview coaching, and application tracking.",
    });
  });
});
