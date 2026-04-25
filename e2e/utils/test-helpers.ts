import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Test data for creating jobs
 */
export interface TestJobData {
  title: string;
  company: string;
  description: string;
  url?: string;
}

/**
 * Creates a job via the UI and returns the job's title for later reference.
 * This helper opens the Add Job dialog, fills in the form, and submits.
 */
export async function createTestJob(
  page: Page,
  data: TestJobData
): Promise<void> {
  // Click "Add Job" button
  await page.getByRole("button", { name: /add job/i }).click();

  // Wait for dialog to appear
  await expect(page.getByRole("dialog")).toBeVisible();

  // Fill in the form fields
  await page.getByLabel(/job title/i).fill(data.title);
  await page.getByLabel(/company/i).fill(data.company);
  await page.getByLabel(/job description/i).fill(data.description);

  if (data.url) {
    await page.getByLabel(/job url/i).fill(data.url);
  }

  // Submit the form - use the button inside the dialog
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^add job$/i })
    .click();

  // Wait for dialog to close (indicates success)
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
}

/**
 * Finds a job card by title and returns locator for further actions.
 */
export function getJobCard(page: Page, title: string) {
  // Job cards contain the title as an h3
  return page.locator(".group").filter({ hasText: title });
}

/**
 * Verifies a job exists in the list by checking for its title.
 */
export async function expectJobExists(
  page: Page,
  title: string
): Promise<void> {
  const jobCard = getJobCard(page, title);
  await expect(jobCard).toBeVisible();
}

/**
 * Verifies a job does NOT exist in the list.
 */
export async function expectJobNotExists(
  page: Page,
  title: string
): Promise<void> {
  const jobCard = getJobCard(page, title);
  await expect(jobCard).not.toBeVisible();
}

/**
 * Updates a job's status via the status dropdown.
 */
export async function updateJobStatus(
  page: Page,
  jobTitle: string,
  newStatus: "saved" | "applied" | "interviewing" | "offered" | "rejected"
): Promise<void> {
  const jobCard = getJobCard(page, jobTitle);

  // Click the status dropdown within the job card
  await jobCard.getByRole("combobox").first().click();

  // Select the new status from dropdown
  await page.getByRole("option", { name: new RegExp(newStatus, "i") }).click();
}

/**
 * Deletes a job via the trash icon button.
 */
export async function deleteJob(page: Page, jobTitle: string): Promise<void> {
  const jobCard = getJobCard(page, jobTitle);

  // Click the delete button (trash icon)
  await jobCard.getByRole("button").filter({ has: page.locator("svg.lucide-trash-2") }).click();
}

/**
 * Gets the displayed status badge text for a job.
 */
export async function getJobStatus(
  page: Page,
  jobTitle: string
): Promise<string> {
  const jobCard = getJobCard(page, jobTitle);
  const statusDropdown = jobCard.getByRole("combobox").first();
  return (await statusDropdown.textContent()) || "";
}

/**
 * Navigates to the jobs page and waits for it to load.
 */
export async function navigateToJobs(page: Page): Promise<void> {
  await page.goto("/jobs");
  await page.waitForLoadState("networkidle");
}

/**
 * Navigates to the profile page and waits for it to load.
 */
export async function navigateToProfile(page: Page): Promise<void> {
  await page.goto("/profile");
  await page.waitForLoadState("networkidle");
}

/**
 * Dismisses the onboarding dialog if present.
 */
export async function dismissOnboarding(page: Page): Promise<void> {
  const onboardingDialog = page.getByRole("dialog");
  if (await onboardingDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
    const skipButton = page.getByRole("button", { name: /skip|close|later/i });
    if (await skipButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipButton.click();
    }
  }
}

/**
 * Clears all local storage and reloads to get a fresh state.
 */
export async function resetAppState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
}

/**
 * Sets up the app state to skip onboarding (marks it as completed).
 */
export async function skipOnboardingSetup(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("get_me_job_onboarding_completed", "true");
  });
}

/**
 * Navigates to the bank (documents) page and waits for it to load.
 */
export async function navigateToBank(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("get_me_job_onboarding_completed", "true");
  });
  await page.goto("/bank");
  await page.waitForLoadState("networkidle");
}

/**
 * Generates unique test data with timestamp suffix to avoid conflicts.
 */
export function generateUniqueJobData(baseName = "Test"): TestJobData {
  const timestamp = Date.now();
  return {
    title: `${baseName} Engineer ${timestamp}`,
    company: `${baseName} Company ${timestamp}`,
    description: `This is a test job description for ${baseName} position created at ${timestamp}. Requires JavaScript, React, Node.js skills.`,
  };
}
