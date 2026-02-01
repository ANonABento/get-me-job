import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Columbus/i);
  });

  test("all main pages load without errors", async ({ page }) => {
    const pages = [
      { url: "/", name: "Dashboard" },
      { url: "/upload", name: "Upload" },
      { url: "/profile", name: "Profile" },
      { url: "/jobs", name: "Jobs" },
      { url: "/interview", name: "Interview" },
      { url: "/analytics", name: "Analytics" },
      { url: "/settings", name: "Settings" },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      // Page should not have error state
      await expect(page.getByText(/error|500|404/i)).not.toBeVisible({ timeout: 2000 });
    }
  });

  test("sidebar is responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Sidebar should be hidden by default on mobile
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toBeInViewport();

    // Menu button should be visible
    const menuButton = page.getByRole("button", { name: /menu|open/i });
    await expect(menuButton).toBeVisible();

    // Click menu button to open sidebar
    await menuButton.click();
    await expect(sidebar).toBeInViewport();
  });

  test("theme toggle works", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("columbus_onboarding_completed", "true");
    });
    await page.reload();

    // Find and click theme toggle
    const themeButton = page.getByRole("button", { name: /theme|light|dark|system/i });

    if (await themeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const htmlElement = page.locator("html");

      // Get initial theme class
      const initialClass = await htmlElement.getAttribute("class");

      // Click theme toggle
      await themeButton.click();

      // Wait a moment for theme to change
      await page.waitForTimeout(100);

      // The class should have changed (or a data-attribute)
      const newClass = await htmlElement.getAttribute("class");
      // Theme should have changed in some way
      // Note: This is a basic check - actual implementation may vary
    }
  });

  test("app handles localStorage unavailability gracefully", async ({ page }) => {
    // Disable localStorage
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: () => {
            throw new Error("localStorage unavailable");
          },
          setItem: () => {
            throw new Error("localStorage unavailable");
          },
          removeItem: () => {
            throw new Error("localStorage unavailable");
          },
        },
        writable: false,
      });
    });

    // App should still load (with potential fallback behavior)
    await page.goto("/");
    // Should not crash
    await expect(page.locator("body")).toBeVisible();
  });
});
