import { test, expect, type Page } from "@playwright/test";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
};

// Pages accessible with auth bypass (no Clerk keys)
const APP_PAGES = [
  "/dashboard",
  "/bank",
  "/studio",
  "/jobs",
  "/settings",
];

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("get_me_job_onboarding_completed", "true");
  });
  await page.goto("/");
}

test.describe("Responsive - Mobile (375px)", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("mobile menu button is visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible();
  });

  test("mobile menu reveals navigation links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Toggle menu" }).click();

    await expect(
      page.getByRole("banner").getByRole("link", { name: "Features" })
    ).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "How It Works" })
    ).toBeVisible();
  });

  test("landing page content does not overflow horizontally", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test("touch targets are reasonably sized", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button, a, [role='button']");
    const count = await buttons.count();

    for (let index = 0; index < Math.min(count, 20); index++) {
      const button = buttons.nth(index);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.width >= 36 || box.height >= 36).toBe(true);
        }
      }
    }
  });

  test("app pages are accessible on mobile with auth bypass", async ({ page }) => {
    for (const path of APP_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // With auth bypass, pages should NOT redirect to sign-in
      expect(page.url()).not.toContain("/sign-in");
    }
  });

  test.describe("Studio mobile layout", () => {
    test("shows the tab switcher and defaults to Edit", async ({ page }) => {
      await page.goto("/studio");
      await page.waitForLoadState("networkidle");

      const tablist = page.getByRole("tablist", { name: "Builder view" });
      await expect(tablist).toBeVisible();

      const editTab = page.getByRole("tab", { name: /edit/i });
      const previewTab = page.getByRole("tab", { name: /preview/i });

      await expect(editTab).toHaveAttribute("aria-selected", "true");
      await expect(previewTab).toHaveAttribute("aria-selected", "false");

      await expect(page.locator("#builder-edit-panel")).toBeVisible();
      await expect(page.locator("#builder-preview-panel")).toBeHidden();
    });

    test("Preview tab swaps which panel is visible", async ({ page }) => {
      await page.goto("/studio");
      await page.waitForLoadState("networkidle");
      await page.getByRole("tab", { name: /preview/i }).click();

      await expect(page.locator("#builder-preview-panel")).toBeVisible();
      await expect(page.locator("#builder-edit-panel")).toBeHidden();
      await expect(page.getByRole("tab", { name: /preview/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    test("does not introduce horizontal scroll", async ({ page }) => {
      await page.goto("/studio");
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
    });
  });
});

test.describe("Responsive - Tablet (768px)", () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("landing page layout adapts for tablet", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Responsive visual baselines are only maintained for the desktop Chromium project."
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("landing-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("hero content remains readable on tablet", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heroHeading = page.getByRole("heading", { level: 1 }).first();
    await expect(heroHeading).toBeVisible();

    const box = await heroHeading.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(250);
  });
});

test.describe("Responsive - Desktop (1280px)", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("desktop navigation is visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("banner").getByRole("link", { name: "Features" })
    ).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Get Started" })
    ).toBeVisible();
  });

  test("landing page uses available width without stretching excessively", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const body = page.locator("body");
    const box = await body.boundingBox();

    expect(box?.width ?? 0).toBeGreaterThan(1000);
    expect(box?.width ?? 0).toBeLessThanOrEqual(VIEWPORTS.desktop.width);
  });

  test("dashboard is accessible on desktop with auth bypass", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // With auth bypass, should NOT redirect to sign-in
    expect(page.url()).not.toContain("/sign-in");
  });

  test("studio shows both resume panels and no tab strip on desktop", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForLoadState("networkidle");

    // Tab strip is in the DOM but hidden by md:hidden
    const tablist = page.getByRole("tablist", { name: "Builder view" });
    await expect(tablist).toBeHidden();

    await expect(page.locator("#builder-edit-panel")).toBeVisible();
    await expect(page.locator("#builder-preview-panel")).toBeVisible();
  });
});

test.describe("Responsive - Wide Screen (1920px)", () => {
  test.use({ viewport: VIEWPORTS.wide });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("landing page content is centered on wide screens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heroContent = page.getByRole("heading", { level: 1 }).first();
    const box = await heroContent.boundingBox();

    expect(box?.x ?? 0).toBeGreaterThan(100);
  });

  test("wide layout remains visually stable", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Responsive visual baselines are only maintained for the desktop Chromium project."
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("landing-wide.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
