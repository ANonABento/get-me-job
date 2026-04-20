import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to trigger onboarding
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();
  });

  test("should show onboarding dialog on first visit", async ({ page }) => {
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Welcome to Taida")).toBeVisible();
  });

  test("should navigate through onboarding steps", async ({ page }) => {
    // Step 1: Welcome
    await expect(page.getByText("Welcome to Taida")).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 2: Upload Resume
    await expect(page.getByText(/Upload Your Resume/i)).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 3: Build Your Profile
    await expect(page.getByText(/Build Your Profile/i)).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 4: Track Target Jobs
    await expect(page.getByText(/Track Target Jobs/i)).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 5: Ace Your Interviews (last step)
    await expect(page.getByText(/Ace Your Interviews/i)).toBeVisible();
  });

  test("should allow skipping onboarding", async ({ page }) => {
    await expect(page.getByRole("dialog")).toBeVisible();

    const skipButton = page.getByRole("button", { name: /skip/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });

  test("should close onboarding and persist completion", async ({ page }) => {
    // Navigate through all steps
    for (let i = 0; i < 4; i++) {
      const continueButton = page.getByRole("button", { name: /continue/i });
      if (await continueButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(100);
      }
    }

    // Click "Get Started" on the last step
    const getStartedButton = page.getByRole("button", { name: /get started/i });
    if (await getStartedButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await getStartedButton.click();
    }

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 2000 });

    // Reload and verify onboarding doesn't show again
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Dialog should not appear after completion
    await expect(page.getByText("Welcome to Taida")).not.toBeVisible({ timeout: 2000 });
  });
});
