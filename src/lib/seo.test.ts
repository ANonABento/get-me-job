import { describe, it, expect } from "vitest";
import { getPageMetadata } from "./seo";

describe("getPageMetadata", () => {
  it("returns metadata with title and description for a known page", () => {
    const meta = getPageMetadata("dashboard");
    expect(meta.title).toBe("Dashboard");
    expect(meta.description).toContain("job search");
  });

  it("includes openGraph fields", () => {
    const meta = getPageMetadata("bank");
    expect(meta.openGraph).toBeDefined();
    expect((meta.openGraph as Record<string, unknown>).title).toBe("Documents");
    expect((meta.openGraph as Record<string, unknown>).url).toBe("/bank");
  });

  it("includes twitter card fields", () => {
    const meta = getPageMetadata("tailor");
    expect(meta.twitter).toBeDefined();
    expect((meta.twitter as Record<string, unknown>).title).toBe("Tailor Resume");
  });

  it("returns unique titles for each page", () => {
    const pages = [
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

    const titles = pages.map((p) => getPageMetadata(p).title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(pages.length);
  });

  it("returns unique descriptions for each page", () => {
    const pages = [
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

    const descriptions = pages.map((p) => getPageMetadata(p).description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(pages.length);
  });
});
