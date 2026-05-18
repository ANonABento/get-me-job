import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CompetitorComparisonPage, {
  generateStaticParams,
  generateMetadata,
} from "./page";

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

describe("competitor comparison page", () => {
  it("exposes competitor route params", () => {
    expect(generateStaticParams()).toEqual([
      { competitor: "teal" },
      { competitor: "huntr" },
      { competitor: "simplify" },
    ]);
  });

  it("returns localized metadata", () => {
    expect(
      generateMetadata({ params: { locale: "en", competitor: "teal" } }),
    ).toMatchObject({
      title: "Slothing vs Teal",
    });
  });

  it("renders comparison content and schema", () => {
    const { container } = render(
      <CompetitorComparisonPage
        params={{ locale: "en", competitor: "huntr" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Why people pick Slothing" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Huntr/i })).toBeInTheDocument();

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
          name: expect.stringContaining("How is Slothing different from Huntr"),
        }),
      ]),
    });
  });

  it("throws notFound for unsupported competitor", () => {
    mockNotFound.mockClear();

    expect(() =>
      render(
        <CompetitorComparisonPage
          params={{ locale: "en", competitor: "nonexistent" }}
        />,
      ),
    ).toThrow("NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });
});
