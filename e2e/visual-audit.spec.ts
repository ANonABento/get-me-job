import { test, expect, type Page } from "@playwright/test";

const PUBLIC_PAGES = [
  { path: "/", name: "landing" },
];

// Pages accessible with auth bypass (no Clerk keys configured)
const APP_PAGES = [
  "/dashboard",
  "/bank",
  "/builder",
  "/tailor",
  "/cover-letter",
  "/jobs",
  "/settings",
];

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("get_me_job_onboarding_completed", "true");
  });
  await page.goto("/");
}

test.describe("Visual Audit - Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const { path, name } of PUBLIC_PAGES) {
    test(`${name} page renders correctly`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Visual baselines are only maintained for the desktop Chromium project."
      );

      const errors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveScreenshot(`${name}-full-page.png`, {
        fullPage: true,
        animations: "disabled",
      });

      const criticalErrors = errors.filter(
        (error) => !error.includes("favicon.ico") && !error.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe("Visual Audit - Auth Bypass Behavior", () => {
  test("app pages are accessible without Clerk keys (auth bypass)", async ({ page }) => {
    await preparePage(page);

    for (const path of APP_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // With auth bypass, pages should NOT redirect to sign-in
      expect(page.url()).not.toContain("/sign-in");
    }
  });
});

test.describe("Visual Audit - Landing Page States", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("landing page light theme", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are only maintained for the desktop Chromium project."
    );

    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("landing-light.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("landing page dark theme", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are only maintained for the desktop Chromium project."
    );

    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot("landing-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("mobile navigation state renders correctly", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are only maintained for the desktop Chromium project."
    );

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Toggle menu" }).click();

    await expect(page.locator("header")).toHaveScreenshot("landing-mobile-menu.png");
  });
});

test.describe("Visual Audit - Typography and Icons", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("landing page has a visible h1", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const fontSize = await h1.evaluate((element) => window.getComputedStyle(element).fontSize);
    expect(parseInt(fontSize, 10)).toBeGreaterThanOrEqual(24);
  });

  test("landing page icons render with non-zero size", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const icons = page.locator("svg");
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThan(5);

    const size = await icons.first().evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));

    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});
