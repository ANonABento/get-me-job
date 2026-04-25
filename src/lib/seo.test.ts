import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getMarketingPageMetadata,
  getMetadataBase,
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
      "https://jobs.example.com/"
    );
  });

  it("falls back to the default site URL when the app URL is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

    expect(getMetadataBase().toString()).toBe("https://taida.app/");
  });

  it("falls back to the default site URL when the app URL is invalid", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a valid url");

    expect(getMetadataBase().toString()).toBe("https://taida.app/");
  });
});

describe("getMarketingPageMetadata", () => {
  it("returns absolute title metadata for the landing page", () => {
    const meta = getMarketingPageMetadata();

    expect(meta.title).toEqual({ absolute: SITE_TITLE });
    expect(meta.alternates).toMatchObject({ canonical: "/" });
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

const ALL_PAGES = [
  "dashboard",
  "bank",
  "tailor",
  "jobs",
  "interview",
  "calendar",
  "emails",
  "analytics",
  "salary",
  "settings",
] as const;

describe("getPageMetadata", () => {
  it("returns metadata with title and description for a known page", () => {
    const meta = getPageMetadata("dashboard");
    expect(meta.title).toBe("Dashboard");
    expect(meta.description).toContain("job search");
  });

  it("includes openGraph fields", () => {
    const meta = getPageMetadata("bank");
    expect(meta.openGraph).toBeDefined();
    expect(meta.alternates).toMatchObject({ canonical: "/bank" });
    expect((meta.openGraph as Record<string, unknown>).title).toBe("Documents");
    expect((meta.openGraph as Record<string, unknown>).url).toBe("/bank");
    expect((meta.openGraph as Record<string, unknown>).siteName).toBe(SITE_NAME);
  });

  it("includes twitter card fields", () => {
    const meta = getPageMetadata("tailor");
    expect(meta.twitter).toBeDefined();
    expect((meta.twitter as Record<string, unknown>).title).toBe("Tailor Resume");
    expect((meta.twitter as Record<string, unknown>).card).toBe(
      "summary_large_image"
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
