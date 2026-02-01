import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to trigger onboarding
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("columbus_onboarding_completed");
    });
    await page.reload();
  });

  test("should show onboarding dialog on first visit", async ({ page }) => {
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Welcome to Columbus")).toBeVisible();
  });

  test("should navigate through onboarding steps", async ({ page }) => {
    // Step 1: Welcome
    await expect(page.getByText("Welcome to Columbus")).toBeVisible();
    await page.getByRole("button", { name: "Get Started" }).click();

    // Step 2: Upload Resume
    await expect(page.getByText(/Upload Your Resume/i)).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    // Step 3: Review Profile
    await expect(page.getByText(/Review Your Profile/i)).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    // Step 4: Add Jobs
    await expect(page.getByText(/Add Jobs/i)).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    // Step 5: Ready
    await expect(page.getByText(/Ready/i)).toBeVisible();
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
    // Complete or skip onboarding
    const skipButton = page.getByRole("button", { name: /skip/i });
    const finishButton = page.getByRole("button", { name: /finish|let's go|start/i });

    // Navigate to end and close
    for (let i = 0; i < 5; i++) {
      const nextButton = page.getByRole("button", { name: /next|get started/i });
      if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(100);
      }
    }

    // Click finish if available
    if (await finishButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await finishButton.click();
    } else if (await skipButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipButton.click();
    }

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 2000 });

    // Reload and verify onboarding doesn't show again
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Dialog should not appear after completion
    await expect(page.getByText("Welcome to Columbus")).not.toBeVisible({ timeout: 2000 });
  });
});
