import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { getLocalizedPageMetadata } from "@/lib/seo";
import { CSP_NONCE_HEADER } from "@/lib/security/headers";
import messages from "@/messages/en.json";
import PricingPage, { generateMetadata } from "./page";

const localeState = vi.hoisted(() => ({ current: "en" }));

vi.mock("next-intl/server", () => ({
  getLocale: () => Promise.resolve(localeState.current),
  getRequestConfig: (createRequestConfig: unknown) => createRequestConfig,
}));

vi.mock("next/headers", () => ({
  headers: () => ({
    get: vi.fn((header: string) =>
      header === CSP_NONCE_HEADER ? null : undefined,
    ),
  }),
}));

async function renderPricingPage(locale = "en") {
  localeState.current = locale;
  const ui = await PricingPage();

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

function expectLocalizedSignInHref(link: HTMLElement, locale: string) {
  expect(link.getAttribute("href")).toMatch(
    new RegExp(
      `^/${locale}/sign-in\\?callbackUrl=(%2F${locale}%2Fdashboard|/${locale}/dashboard)$`,
    ),
  );
}

describe("PricingPage", () => {
  it("uses localized metadata for alternates and canonical URLs", () => {
    expect(generateMetadata({ params: { locale: "es" } })).toEqual(
      getLocalizedPageMetadata("pricing", "es"),
    );
  });

  it("renders the four tiers with their prices", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Self-host" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Hosted Free" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Weekly" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Monthly" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("$0")).toHaveLength(2);
    expect(screen.getByText("$6.99")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("links Self-host to the GitHub repository", async () => {
    await renderPricingPage();

    const selfHostCta = screen.getByRole("link", { name: /View on GitHub/i });
    expect(selfHostCta).toHaveAttribute("data-tier-cta", "self-host");
    expect(selfHostCta).toHaveAttribute(
      "href",
      "https://github.com/ANonABento/slothing",
    );
    expect(selfHostCta).toHaveAttribute("target", "_blank");
    expect(selfHostCta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links Hosted Free to localized sign-in", async () => {
    await renderPricingPage();

    expectLocalizedSignInHref(
      screen.getByRole("link", { name: /Start with your key/i }),
      "en",
    );
  });

  it("routes Weekly and Monthly CTAs to Stripe checkout buttons", async () => {
    await renderPricingPage();

    expect(
      screen.getAllByRole("button", { name: /Start Weekly/i }),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByRole("button", { name: /Start Monthly/i }),
    ).not.toHaveLength(0);

    expect(
      screen.queryByRole("link", { name: /Email us for early access/i }),
    ).not.toBeInTheDocument();
  });

  it("highlights Monthly as the most popular tier and Self-host as open source", async () => {
    await renderPricingPage();

    expect(screen.getByText("Most popular")).toBeInTheDocument();
    // "Open source" appears in both the Self-host badge and the trust section heading
    expect(screen.getAllByText("Open source").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the open-source / self-host banner at the top", async () => {
    await renderPricingPage();

    expect(
      screen.getByText(
        "Self-host today, AGPL-3.0. Hosted plans available now.",
      ),
    ).toBeInTheDocument();
  });

  it("answers the new pricing FAQ questions", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Why weekly billing?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "What's BYOK (bring your own key)?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Can I really self-host?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "What's open source vs proprietary?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Can I cancel anytime?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Are prices in USD?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Is there a refund policy?" }),
    ).toBeInTheDocument();
  });

  it("rejects annual pricing in the FAQ", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Is annual pricing available?" }),
    ).toBeInTheDocument();
  });

  it("renders the plan comparison with all four columns", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Compare plans" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Self-host" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Hosted Free" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Weekly" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Monthly" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /AI provider/i })).toHaveTextContent(
      "Bring your own key",
    );
    expect(screen.getByRole("row", { name: /Hosting/i })).toHaveTextContent(
      "Your machine",
    );
  });

  it("renders the trust and security section with open-source pillar", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Security and data handling" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Encrypted in transit")).toBeInTheDocument();
    expect(screen.getByText("No data selling")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Open source core" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delete anytime")).toBeInTheDocument();
    expect(screen.getByText(/AI outputs are assistive/)).toBeInTheDocument();
  });

  it("shows checkout and self-host CTAs at the bottom", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Ready to start?" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Start Weekly/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Start Monthly/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("link", { name: /Join the waitlist/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^mailto:/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Self-host on GitHub/i }),
    ).toBeInTheDocument();
  });

  it("renders the launch waitlist form", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Want launch updates?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Join waitlist/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("aligns refund answer with billing terms", async () => {
    await renderPricingPage();

    expect(
      screen.getByRole("heading", { name: "Is there a refund policy?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cancellation stops future renewal/),
    ).toBeInTheDocument();
  });

  it("preserves non-English locale in internal links", async () => {
    await renderPricingPage("es");

    expectLocalizedSignInHref(
      screen.getByRole("link", { name: /Start with your key/i }),
      "es",
    );
  });
});
