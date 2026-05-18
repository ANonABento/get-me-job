import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BLOG_POSTS } from "./posts";
import BlogIndexPage, { generateMetadata } from "./page";

vi.mock("next/headers", () => ({
  headers: () => ({
    get: () => undefined,
  }),
}));

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

describe("blog index page", () => {
  it("returns localized metadata", () => {
    expect(generateMetadata({ params: { locale: "zh-CN" } })).toMatchObject({
      title: "Blog",
      alternates: {
        canonical: "/blog",
        languages: {
          "x-default": "/en/blog",
          en: "/en/blog",
          es: "/es/blog",
          "zh-CN": "/zh-CN/blog",
        },
      },
    });
  });

  it("renders blog cards and blog schema", () => {
    const { container } = render(<BlogIndexPage params={{ locale: "en" }} />);

    expect(
      screen.getByRole("heading", { name: "Slothing Blog" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      BLOG_POSTS.length,
    );

    const jsonLdScript = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(jsonLdScript).not.toBeNull();

    const payload = JSON.parse(jsonLdScript!.textContent ?? "{}");
    expect(payload["@type"]).toBe("Blog");
    expect(payload.itemListElement).toHaveLength(BLOG_POSTS.length);
    expect(payload.itemListElement[0]).toMatchObject({
      "@type": "BlogPosting",
      headline: BLOG_POSTS[0].title,
    });
  });
});
