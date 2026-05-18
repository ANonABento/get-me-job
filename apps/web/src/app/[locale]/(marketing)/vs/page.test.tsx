import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CompareIndexPage, { generateMetadata } from "./page";

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

describe("compare index page", () => {
  it("returns localized metadata", () => {
    expect(generateMetadata({ params: { locale: "fr" } })).toMatchObject({
      title: "Slothing comparisons",
      alternates: {
        canonical: "/vs",
      },
    });
  });

  it("renders cards and comparison schema", () => {
    const { container } = render(
      <CompareIndexPage params={{ locale: "en" }} />,
    );

    expect(
      screen.getByRole("heading", { name: /Slothing vs\. everything else/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Compare" })).toHaveLength(3);

    const schema = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(schema).not.toBeNull();

    const payload = JSON.parse(schema!.textContent ?? "{}");
    const graph = payload["@graph"];

    expect(graph).toBeInstanceOf(Array);
    expect(graph).toHaveLength(2);
    expect(graph?.[0]).toMatchObject({
      "@type": "FAQPage",
      mainEntity: expect.arrayContaining([
        expect.objectContaining({
          "@type": "Question",
        }),
      ]),
    });
    expect(graph?.[1]).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: expect.arrayContaining([
        expect.objectContaining({
          "@type": "ListItem",
        }),
      ]),
    });
  });
});
