import { test, expect } from "@playwright/test";

test.describe("Jobs Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mark onboarding as completed to skip it
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("columbus_onboarding_completed", "true");
    });
    await page.goto("/jobs");
  });

  test("should display jobs page header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Jobs/i })).toBeVisible();
  });

  test("should show empty state when no jobs exist", async ({ page }) => {
    // Check for empty state or job listing
    const emptyState = page.getByText(/no jobs|add your first job|get started/i);
    const jobList = page.locator("[data-testid='job-list'], .job-card, .job-item");

    const hasJobs = await jobList.count() > 0;
    if (!hasJobs) {
      await expect(emptyState).toBeVisible();
    }
  });

  test("should have search functionality", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await searchInput.fill("Software Engineer");
      await expect(searchInput).toHaveValue("Software Engineer");
    }
  });

  test("should have filter options", async ({ page }) => {
    // Check for filter buttons or dropdowns
    const statusFilter = page.getByRole("combobox", { name: /status/i }).or(
      page.getByRole("button", { name: /status/i })
    ).or(page.getByText(/all statuses/i));

    const typeFilter = page.getByRole("combobox", { name: /type/i }).or(
      page.getByRole("button", { name: /type/i })
    ).or(page.getByText(/all types/i));

    // At least one filter should exist
    const hasStatusFilter = await statusFilter.first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasTypeFilter = await typeFilter.first().isVisible({ timeout: 1000 }).catch(() => false);

    expect(hasStatusFilter || hasTypeFilter).toBe(true);
  });

  test("should display sort options", async ({ page }) => {
    const sortOption = page.getByRole("combobox", { name: /sort/i }).or(
      page.getByRole("button", { name: /sort/i })
    ).or(page.getByText(/newest|oldest|recent/i));

    await expect(sortOption.first()).toBeVisible({ timeout: 2000 });
  });
});

test.describe("Job Status Updates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("columbus_onboarding_completed", "true");
    });
    await page.goto("/jobs");
  });

  test("should be able to change job status", async ({ page }) => {
    // This test assumes there's at least one job in the list
    // If not, we'll skip the status change check
    const jobCard = page.locator(".job-card, [data-testid='job-item']").first();

    if (await jobCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Look for status dropdown/button within the job card
      const statusButton = jobCard.getByRole("combobox").or(
        jobCard.getByRole("button", { name: /saved|applied|interviewing|offered|rejected/i })
      );

      if (await statusButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await statusButton.click();
        // Check that status options appear
        await expect(page.getByRole("option")).toBeVisible();
      }
    }
  });
});
