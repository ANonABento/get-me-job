import { test, expect, type Page } from "@playwright/test";

async function preparePage(page: Page, path = "/dashboard") {
  await page.addInitScript(() => {
    localStorage.setItem("get_me_job_onboarding_completed", "true");
  });
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

async function ensureSidebarOpen(page: Page) {
  const openMenuButton = page.getByRole("button", { name: /open menu/i });
  if (await openMenuButton.isVisible()) {
    await openMenuButton.click();
  }

  await expect(page.locator("aside")).toBeVisible();
}

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("should display sidebar with navigation items", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);

    // Get sidebar navigation
    const sidebar = page.locator("aside");

    // Check main navigation items visible in sidebar
    await expect(sidebar.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Documents/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Document Studio/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Interview Prep/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Analytics/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Settings/i })).toBeVisible();
  });

  test("should navigate to Dashboard", async ({ page }) => {
    await preparePage(page, "/bank");
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to Documents (Bank) page", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Documents/i }).click();
    await expect(page).toHaveURL("/bank");
  });

  test("should navigate to Document Studio page", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Document Studio/i }).click();
    await expect(page).toHaveURL("/studio");
  });

  test("should navigate to Settings page", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Settings/i }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("should navigate to Interview Prep page", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Interview Prep/i }).click();
    await expect(page).toHaveURL("/interview");
  });

  test("should navigate to Analytics page", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("link", { name: /Analytics/i }).click();
    await expect(page).toHaveURL("/analytics");
  });

  test("should highlight active navigation item", async ({ page }) => {
    await preparePage(page, "/bank");
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    const activeLink = sidebar.getByRole("link", { name: /Documents/i });
    await expect(activeLink).toHaveClass(/gradient-bg/);
  });

  test("should show app logo in sidebar", async ({ page }) => {
    await preparePage(page);
    await ensureSidebarOpen(page);
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Taida")).toBeVisible();
  });
});

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test("should open keyboard shortcuts help with ?", async ({ page }) => {
    await preparePage(page);
    await page.keyboard.press("Shift+?");
    // Use heading specifically
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();
  });

  test("should navigate with keyboard shortcuts", async ({ page }) => {
    await preparePage(page);

    // Press 's' to go to Settings
    await page.keyboard.press("s");
    await expect(page).toHaveURL("/settings");
  });

  test("should close keyboard shortcuts dialog with Escape", async ({ page }) => {
    await preparePage(page);
    await page.keyboard.press("Shift+?");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Keyboard Shortcuts" })).not.toBeVisible();
  });
});
