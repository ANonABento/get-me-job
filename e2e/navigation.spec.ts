import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding for navigation tests
    await page.goto("/dashboard");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("should display sidebar with navigation items", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Get sidebar navigation
    const sidebar = page.locator("aside");

    // Check main navigation items visible in sidebar (feature-flagged items excluded)
    await expect(sidebar.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Documents/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Resume Builder/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Settings/i })).toBeVisible();
  });

  test("should navigate to Dashboard", async ({ page }) => {
    await page.goto("/bank");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to Documents (Bank) page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Documents/i }).click();
    await expect(page).toHaveURL("/bank");
  });

  test("should navigate to Resume Builder page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Resume Builder/i }).click();
    await expect(page).toHaveURL("/builder");
  });

  test("should navigate to Settings page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Settings/i }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("should highlight active navigation item", async ({ page }) => {
    await page.goto("/bank");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    const activeLink = sidebar.getByRole("link", { name: /Documents/i });
    await expect(activeLink).toHaveClass(/gradient-bg/);
  });

  test("should show app logo in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Taida")).toBeVisible();
  });
});

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("should open keyboard shortcuts help with ?", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Shift+?");
    // Use heading specifically
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();
  });

  test("should navigate with keyboard shortcuts", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Press 's' to go to Settings
    await page.keyboard.press("s");
    await expect(page).toHaveURL("/settings");
  });

  test("should close keyboard shortcuts dialog with Escape", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Shift+?");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).not.toBeVisible();
  });
});
