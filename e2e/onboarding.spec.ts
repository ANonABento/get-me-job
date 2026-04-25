import { test, expect, type Page } from "@playwright/test";

const onboardingHeading = (page: Page) =>
  page.getByRole("dialog").locator("h2.text-2xl");

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  });

  test("should show onboarding dialog on first visit", async ({ page }) => {
    await expect(onboardingHeading(page)).toHaveText("Welcome to Taida");
  });

  test("should navigate through onboarding steps", async ({ page }) => {
    // Step 1: Welcome
    await expect(onboardingHeading(page)).toHaveText("Welcome to Taida");
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 2: Upload Resume
    await expect(onboardingHeading(page)).toHaveText(/Upload Your Resume/i);
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 3: Review Your Profile
    await expect(onboardingHeading(page)).toHaveText(/Review Your Profile/i);
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 4: Configure AI
    await expect(onboardingHeading(page)).toHaveText(/Configure AI/i);
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 5: All Set (last step)
    await expect(onboardingHeading(page)).toHaveText(/All Set|You're All Set/i);
  });

  test("should allow skipping onboarding", async ({ page }) => {
    await page.getByRole("button", { name: "Skip setup" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
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
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 2000 });
  });
});
