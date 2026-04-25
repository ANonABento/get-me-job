import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Taida/i);
  });

  test("protected pages are accessible with auth bypass (no Clerk keys)", async ({ page }) => {
    const pages = [
      { url: "/dashboard", name: "Dashboard" },
      { url: "/bank", name: "Documents" },
      { url: "/builder", name: "Resume Builder" },
      { url: "/jobs", name: "Jobs" },
      { url: "/settings", name: "Settings" },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      await page.waitForLoadState("networkidle");
      // With auth bypass (no Clerk keys), pages should NOT redirect to sign-in
      expect(page.url()).not.toContain("/sign-in");
    }
  });

  test("landing page navigation is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Features" })
    ).toBeVisible();
  });

  test("landing page renders without crash states", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1:has-text('500')")).not.toBeVisible();
    await expect(page.locator("h1:has-text('404')")).not.toBeVisible();
    await expect(page.getByText(/something went wrong|page not found/i)).not.toBeVisible();
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
