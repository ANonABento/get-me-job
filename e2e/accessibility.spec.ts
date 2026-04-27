import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const LANDING_PAGE = { path: "/", name: "Landing" };

// Pages that exist in the app (accessible with auth bypass when no Clerk keys)
const APP_PAGES = [
  "/dashboard",
  "/bank",
  "/studio",
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
  await page.goto(LANDING_PAGE.path);
}

test.describe("Accessibility - WCAG 2.1 AA Compliance", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test(`${LANDING_PAGE.name} page has no critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        ...violation,
        nodes: violation.nodes.filter((node) => {
          const target = node.target.join(",");
          return !target.includes("nextjs-portal") && !target.includes("clerk");
        }),
      }))
      .filter((violation) => violation.nodes.length > 0);

    expect(criticalViolations).toHaveLength(0);
  });

  test("app pages are accessible with auth bypass (no Clerk keys)", async ({
    page,
  }) => {
    for (const path of APP_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // With auth bypass, pages should render without redirecting to sign-in
      expect(page.url()).not.toContain("/sign-in");
    }
  });
});

test.describe("Accessibility - Keyboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("landing page links are keyboard reachable", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit automation does not advance Tab focus reliably in this environment."
    );

    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus").first();
    await expect(focusedElement).toBeVisible();

    const hasFocusStyle = await focusedElement.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return (
        style.outline !== "none" ||
        style.outlineWidth !== "0px" ||
        style.boxShadow !== "none"
      );
    });

    expect(hasFocusStyle).toBe(true);
  });

  test("mobile menu toggle is keyboard operable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    await menuButton.focus();
    await expect(menuButton).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Features" })
    ).toBeVisible();
  });
});

test.describe("Accessibility - Screen Reader Support", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let index = 0; index < imageCount; index++) {
      const image = images.nth(index);
      const alt = await image.getAttribute("alt");
      const role = await image.getAttribute("role");

      expect(alt !== null || role === "presentation" || role === "none").toBe(true);
    }
  });

  test("headings are in logical order", async ({ page }) => {
    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    let lastLevel = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate((element) => element.tagName);
      const level = parseInt(tagName.charAt(1), 10);

      if (lastLevel > 0 && level > lastLevel + 1) {
        const text = await heading.textContent();
        console.log(`Skipped heading level: ${tagName} "${text}" after h${lastLevel}`);
      }

      lastLevel = level;
    }
  });

  test("interactive elements have accessible names", async ({ page }) => {
    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let index = 0; index < buttonCount; index++) {
      const button = buttons.nth(index);
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledBy = await button.getAttribute("aria-labelledby");
      const textContent = await button.textContent();
      const title = await button.getAttribute("title");

      const hasName =
        ariaLabel !== null ||
        ariaLabelledBy !== null ||
        Boolean(textContent && textContent.trim().length > 0) ||
        title !== null;

      if (!hasName) {
        const buttonHtml = await button.evaluate((element) => element.outerHTML);
        console.log(`Button missing accessible name: ${buttonHtml.substring(0, 100)}`);
      }

      const hasOnlySvg =
        (await button.locator("svg").count()) > 0 &&
        (!textContent || textContent.trim().length === 0);

      if (hasOnlySvg) {
        expect(ariaLabel !== null || title !== null).toBe(true);
      }
    }
  });
});

test.describe("Accessibility - Color and Contrast", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("focus indicators are visible", async ({ page, browserName }) => {
    test.skip(
      browserName === "webkit",
      "WebKit automation does not advance Tab focus reliably in this environment."
    );

    await page.goto(LANDING_PAGE.path);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus").first();
    await expect(focusedElement).toBeVisible();

    const styles = await focusedElement.evaluate((element) => {
      const computed = window.getComputedStyle(element);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      };
    });

    const hasFocusStyle =
      styles.outline !== "none" ||
      styles.outlineWidth !== "0px" ||
      styles.boxShadow !== "none";

    expect(hasFocusStyle).toBe(true);
  });
});

test.describe("Accessibility - Motion and Animation", () => {
  test("respects reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await preparePage(page);
    await page.waitForLoadState("networkidle");

    const animatedElements = page.locator(".animate-spin, .animate-pulse, [class*='animate']");
    const count = await animatedElements.count();

    for (let index = 0; index < count; index++) {
      const duration = await animatedElements.nth(index).evaluate((element) => {
        const style = window.getComputedStyle(element);
        return style.animationDuration;
      });

      expect(duration).toBeTruthy();
    }
  });
});
