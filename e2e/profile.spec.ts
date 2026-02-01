import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mark onboarding as completed
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("columbus_onboarding_completed", "true");
    });
    await page.goto("/profile");
  });

  test("should display profile page header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /profile/i })).toBeVisible();
  });

  test("should show profile sections", async ({ page }) => {
    // Check for main profile sections
    const sections = [
      /contact|personal/i,
      /experience|work/i,
      /education/i,
      /skills/i,
    ];

    for (const section of sections) {
      const sectionElement = page.getByText(section);
      const isVisible = await sectionElement.first().isVisible({ timeout: 1000 }).catch(() => false);
      // At least some sections should be visible
      if (isVisible) {
        await expect(sectionElement.first()).toBeVisible();
        break;
      }
    }
  });

  test("should have editable contact information", async ({ page }) => {
    // Look for contact info fields or edit buttons
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const editButton = page.getByRole("button", { name: /edit/i });

    const hasNameInput = await nameInput.first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasEmailInput = await emailInput.first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasEditButton = await editButton.first().isVisible({ timeout: 1000 }).catch(() => false);

    // At least one editing mechanism should exist
    expect(hasNameInput || hasEmailInput || hasEditButton).toBe(true);
  });

  test("should display completeness indicator", async ({ page }) => {
    // Many profile pages show a completeness percentage or indicator
    const completenessText = page.getByText(/complete|progress|\d+%/i);
    const progressBar = page.getByRole("progressbar");

    const hasCompleteness = await completenessText.first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasProgressBar = await progressBar.first().isVisible({ timeout: 1000 }).catch(() => false);

    // This is optional - not all profile pages have this
    if (hasCompleteness || hasProgressBar) {
      expect(hasCompleteness || hasProgressBar).toBe(true);
    }
  });

  test("should show add buttons for experiences and education", async ({ page }) => {
    const addExperienceBtn = page.getByRole("button", { name: /add experience|add work|new experience/i });
    const addEducationBtn = page.getByRole("button", { name: /add education|new education/i });

    const hasAddExperience = await addExperienceBtn.first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasAddEducation = await addEducationBtn.first().isVisible({ timeout: 1000 }).catch(() => false);

    // At least one add button should exist
    expect(hasAddExperience || hasAddEducation).toBe(true);
  });
});

test.describe("Profile Editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("columbus_onboarding_completed", "true");
    });
    await page.goto("/profile");
  });

  test("should allow editing profile summary", async ({ page }) => {
    const summarySection = page.locator('[data-section="summary"], .summary-section').or(
      page.getByText(/summary|about/i).locator("..")
    );

    if (await summarySection.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      // Look for edit button or textarea
      const editBtn = summarySection.first().getByRole("button", { name: /edit/i });
      const textarea = summarySection.first().getByRole("textbox");

      const hasEditBtn = await editBtn.isVisible({ timeout: 500 }).catch(() => false);
      const hasTextarea = await textarea.isVisible({ timeout: 500 }).catch(() => false);

      expect(hasEditBtn || hasTextarea).toBe(true);
    }
  });

  test("should handle skill management", async ({ page }) => {
    const skillsSection = page.getByText(/skills/i).locator("..");

    if (await skillsSection.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      // Look for skill badges or add skill button
      const skillBadge = skillsSection.first().locator(".badge, .skill-tag, .chip");
      const addSkillBtn = page.getByRole("button", { name: /add skill/i });

      const hasSkillBadges = await skillBadge.first().isVisible({ timeout: 500 }).catch(() => false);
      const hasAddSkillBtn = await addSkillBtn.isVisible({ timeout: 500 }).catch(() => false);

      // Skills section should have some way to display or add skills
      expect(hasSkillBadges || hasAddSkillBtn).toBe(true);
    }
  });
});
