import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";
import { Footer } from "./footer";

function renderFooter(locale: string) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Footer />
    </NextIntlClientProvider>,
  );
}

function hrefs() {
  return screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href") ?? "");
}

describe("Footer", () => {
  it("links marketing visitors only to public routes", () => {
    renderFooter("en");

    expect(screen.getByRole("heading", { name: "Resources" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Documents" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Interview Prep" })).toBeNull();

    expect(screen.getByRole("link", { name: "ATS scanner" })).toHaveAttribute(
      "href",
      "/en/ats-scanner",
    );
    expect(screen.getByRole("link", { name: "Extension" })).toHaveAttribute(
      "href",
      "/en/extension",
    );

    expect(hrefs()).not.toEqual(
      expect.arrayContaining(["/en/dashboard", "/en/bank", "/en/interview"]),
    );
  });

  it.each(["es", "zh-CN"])(
    "prefixes internal links with %s and leaves section anchors + external links unchanged",
    (locale) => {
      renderFooter(locale);

      const renderedHrefs = hrefs();
      const escapedLocale = locale.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const localePrefix = new RegExp(`^/${escapedLocale}(?:/|$|\\?)`);

      // Expected internal-link prefixes after locale normalization.
      const internalRoutes = [
        `/${locale}`,
        `/${locale}/pricing`,
        `/${locale}/extension`,
        `/${locale}/ats-scanner`,
        `/${locale}/vs`,
        `/${locale}/blog`,
        `/${locale}/docs/self-host`,
        `/${locale}/docs/license`,
        `/${locale}/privacy`,
        `/${locale}/terms`,
      ];
      for (const route of internalRoutes) {
        expect(renderedHrefs).toContain(route);
      }

      // Anchor + external links stay verbatim.
      expect(renderedHrefs).toContain("#features");
      expect(renderedHrefs).toContain("#how-it-works");
      expect(renderedHrefs).toContain("https://github.com/ANonABento/slothing");

      for (const href of renderedHrefs.filter((h) => h.startsWith("/"))) {
        expect(href, `footer link "${href}" missing /${locale} prefix`).toMatch(
          localePrefix,
        );
      }
    },
  );
});
