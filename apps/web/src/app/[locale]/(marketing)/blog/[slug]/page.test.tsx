import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BlogPostPage, { generateMetadata, generateStaticParams } from "./page";
import { getBlogPostBySlug, getBlogPostUrls } from "../posts";

const mockNotFound = vi.fn(() => {
  throw new Error("NOT_FOUND");
});

vi.mock("next/headers", () => ({
  headers: () => ({
    get: () => undefined,
  }),
}));

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    notFound: () => mockNotFound(),
  };
});

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("blog post page", () => {
  it("generates locale-aware static params", () => {
    expect(generateStaticParams()).toEqual(getBlogPostUrls());
  });

  it("generates metadata for localized post route", () => {
    const metadata = generateMetadata({
      params: { locale: "ja", slug: "job-search-week-plan" },
    });

    expect(metadata).toMatchObject({
      title: "A weekly job-search plan that prevents burnout",
      alternates: {
        canonical: "/blog/job-search-week-plan",
        languages: {
          "x-default": "/en/blog/job-search-week-plan",
          en: "/en/blog/job-search-week-plan",
          ja: "/ja/blog/job-search-week-plan",
        },
      },
    });
  });

  it("renders details and JSON-LD schema for a known slug", () => {
    const post = getBlogPostBySlug("job-search-week-plan");
    expect(post).toBeDefined();

    const { container } = render(
      <BlogPostPage params={{ locale: "en", slug: "job-search-week-plan" }} />,
    );

    expect(
      screen.getByRole("heading", { name: post?.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Back to blog")).toBeInTheDocument();

    const jsonLdScript = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(jsonLdScript).not.toBeNull();

    const payload = JSON.parse(jsonLdScript!.textContent ?? "{}");
    expect(payload["@type"]).toBe("BlogPosting");
    expect(payload.url).toContain("/en/blog/job-search-week-plan");
    expect(payload.mainEntityOfPage).toMatchObject({
      "@type": "WebPage",
      "@id": "https://slothing.work/en/blog/job-search-week-plan",
    });
  });

  it("throws notFound for unknown slug", () => {
    mockNotFound.mockClear();

    expect(() =>
      render(
        <BlogPostPage params={{ locale: "en", slug: "does-not-exist" }} />,
      ),
    ).toThrow("NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });
});
