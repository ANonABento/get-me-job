import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should display sidebar with all navigation items", async ({ page }) => {
    await page.goto("/");

    // Check main navigation items are visible
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Upload" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Documents" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jobs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Interview Prep" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("should navigate to Dashboard", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
  });

  test("should navigate to Upload page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Upload" }).click();
    await expect(page).toHaveURL("/upload");
  });

  test("should navigate to Profile page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "My Profile" }).click();
    await expect(page).toHaveURL("/profile");
  });

  test("should navigate to Jobs page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Jobs" }).click();
    await expect(page).toHaveURL("/jobs");
  });

  test("should navigate to Interview page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Interview Prep" }).click();
    await expect(page).toHaveURL("/interview");
  });

  test("should navigate to Analytics page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Analytics" }).click();
    await expect(page).toHaveURL("/analytics");
  });

  test("should navigate to Settings page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("should highlight active navigation item", async ({ page }) => {
    await page.goto("/jobs");
    const activeLink = page.getByRole("link", { name: "Jobs" });
    await expect(activeLink).toHaveClass(/gradient-bg/);
  });

  test("should show app logo in sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Columbus")).toBeVisible();
    await expect(page.getByText("Job Assistant")).toBeVisible();
  });
});

test.describe("Keyboard Shortcuts", () => {
  test("should open keyboard shortcuts help with ?", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Shift+?");
    await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();
  });

  test("should navigate with keyboard shortcuts", async ({ page }) => {
    await page.goto("/");

    // Press 'j' to go to Jobs
    await page.keyboard.press("j");
    await expect(page).toHaveURL("/jobs");

    // Press 'h' to go to Dashboard
    await page.keyboard.press("h");
    await expect(page).toHaveURL("/");

    // Press 'p' to go to Profile
    await page.keyboard.press("p");
    await expect(page).toHaveURL("/profile");

    // Press 's' to go to Settings
    await page.keyboard.press("s");
    await expect(page).toHaveURL("/settings");
  });

  test("should close keyboard shortcuts dialog with Escape", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Shift+?");
    await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Keyboard Shortcuts")).not.toBeVisible();
  });
});
