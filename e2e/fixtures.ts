import { test as base, expect } from "@playwright/test";

// Extend base test with custom fixtures
export const test = base.extend({
  // Auto-dismiss onboarding dialog if present
  page: async ({ page }, use) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if onboarding dialog is visible and dismiss it
    const onboardingDialog = page.getByRole("dialog");
    if (await onboardingDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Try to find and click skip or close button
      const skipButton = page.getByRole("button", { name: /skip|close|later/i });
      if (await skipButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await skipButton.click();
      }
    }

    await use(page);
  },
});

// Common test data
export const testJob = {
  title: "Software Engineer",
  company: "Test Company Inc",
  description: "We are looking for a skilled software engineer to join our team.",
  requirements: ["JavaScript", "React", "Node.js"],
  location: "Remote",
  type: "full-time",
  remote: true,
};

export const testProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  summary: "Experienced software engineer with 5+ years in full-stack development.",
};

// Re-export expect for convenience
export { expect };
