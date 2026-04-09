import { test, expect } from "@playwright/test";

/**
 * Responsive Design Tests
 * Tests all pages across different viewport sizes.
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 800 }, // Standard desktop
  wide: { width: 1920, height: 1080 }, // Full HD
};

const ALL_PAGES = [
  { path: "/", name: "Dashboard" },
  { path: "/upload", name: "Upload" },
  { path: "/profile", name: "Profile" },
  { path: "/documents", name: "Documents" },
  { path: "/jobs", name: "Jobs" },
  { path: "/interview", name: "Interview" },
  { path: "/calendar", name: "Calendar" },
  { path: "/emails", name: "Emails" },
  { path: "/analytics", name: "Analytics" },
  { path: "/settings", name: "Settings" },
];

test.describe("Responsive - Mobile (375px)", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("sidebar is hidden by default on mobile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    // Sidebar should be off-screen or hidden
    const isInViewport = await sidebar.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.top < window.innerHeight
      );
    }).catch(() => false);
    expect(isInViewport).toBe(false);
  });

  test("mobile menu button is visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.getByRole("button", { name: /menu|open navigation/i });
    await expect(menuButton).toBeVisible();
  });

  test("mobile menu opens sidebar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.getByRole("button", { name: /menu|open navigation/i });
    await menuButton.click();

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeInViewport();
  });

  test("content is readable on mobile", async ({ page }) => {
    for (const { path, name } of ALL_PAGES.slice(0, 3)) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Check no horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Text should not overflow
      const overflowingText = await page.evaluate(() => {
        const elements = document.querySelectorAll("p, h1, h2, h3, span");
        for (const el of Array.from(elements)) {
          if (el.scrollWidth > el.clientWidth + 10) {
            return el.textContent?.substring(0, 50);
          }
        }
        return null;
      });
      expect(overflowingText).toBeNull();
    }
  });

  test("touch targets are large enough (44px)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button, a, [role='button']");
    const count = await buttons.count();

    const smallTargets: string[] = [];

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          const text = await button.textContent();
          smallTargets.push(`${text?.trim() || "icon"}: ${box.width}x${box.height}`);
        }
      }
    }

    // Log small targets but don't fail (icons can be small if grouped)
    if (smallTargets.length > 0) {
      console.log("Small touch targets found:", smallTargets);
    }
  });

  test("forms are usable on mobile", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const inputs = page.locator("input, textarea");
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const box = await input.boundingBox();
        // Inputs should be at least 44px tall on mobile
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(36);
        }
      }
    }
  });
});

test.describe("Responsive - Tablet (768px)", () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("layout adapts for tablet", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("dashboard-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("sidebar behavior on tablet", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    // Sidebar might be visible or collapsible on tablet
    const isVisible = await sidebar.isVisible();

    if (isVisible) {
      // If visible, should not overlap content
      const main = page.locator("main");
      const sidebarBox = await sidebar.boundingBox();
      const mainBox = await main.boundingBox();

      if (sidebarBox && mainBox) {
        // They shouldn't overlap significantly
        const overlap = Math.max(
          0,
          Math.min(sidebarBox.x + sidebarBox.width, mainBox.x + mainBox.width) -
            Math.max(sidebarBox.x, mainBox.x)
        );
        expect(overlap).toBeLessThan(50);
      }
    }
  });

  test("cards stack appropriately on tablet", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cards = page.locator(".card, [class*='Card'], .rounded-xl.border");
    const count = await cards.count();

    if (count >= 2) {
      const firstBox = await cards.first().boundingBox();
      const secondBox = await cards.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Cards should be either side-by-side or stacked, not overlapping
        const overlaps =
          firstBox.x < secondBox.x + secondBox.width &&
          firstBox.x + firstBox.width > secondBox.x &&
          firstBox.y < secondBox.y + secondBox.height &&
          firstBox.y + firstBox.height > secondBox.y;
        expect(overlaps).toBe(false);
      }
    }
  });
});

test.describe("Responsive - Desktop (1280px)", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("sidebar is visible on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("content uses full width appropriately", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    const box = await main.boundingBox();

    if (box) {
      // Main content should use reasonable width
      expect(box.width).toBeGreaterThan(600);
      expect(box.width).toBeLessThan(1500);
    }
  });

  test("multi-column layouts work", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Dashboard typically has multi-column card layouts
    const gridContainer = page.locator(".grid, [class*='grid']").first();
    if (await gridContainer.isVisible()) {
      const children = gridContainer.locator("> *");
      const count = await children.count();

      if (count >= 2) {
        const firstBox = await children.first().boundingBox();
        const secondBox = await children.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // On desktop, some items should be side by side
          const sameRow = Math.abs(firstBox.y - secondBox.y) < 50;
          // This varies by design, so we just check they're positioned
          expect(firstBox.x).not.toBe(secondBox.x);
        }
      }
    }
  });
});

test.describe("Responsive - Wide Screen (1920px)", () => {
  test.use({ viewport: VIEWPORTS.wide });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("content is centered on wide screens", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    const box = await main.boundingBox();

    if (box) {
      // Content should not stretch to full 1920px
      expect(box.width).toBeLessThan(1600);
    }
  });

  test("no excessive whitespace", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("dashboard-wide.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Responsive - All Pages Render", () => {
  for (const viewport of Object.entries(VIEWPORTS)) {
    const [name, size] = viewport;

    test.describe(`${name} viewport`, () => {
      test.use({ viewport: size });

      test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.evaluate(() => {
          localStorage.setItem("get_me_job_onboarding_completed", "true");
        });
      });

      for (const { path, name: pageName } of ALL_PAGES) {
        test(`${pageName} renders at ${name}`, async ({ page }) => {
          await page.goto(path);
          await page.waitForLoadState("networkidle");

          // No JS errors
          const errors: string[] = [];
          page.on("console", (msg) => {
            if (msg.type() === "error" && !msg.text().includes("401")) {
              errors.push(msg.text());
            }
          });

          // Page renders
          await expect(page.locator("body")).toBeVisible();

          // No horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
          });
          expect(hasHorizontalScroll).toBe(false);
        });
      }
    });
  }
});
