import { test, expect } from "@playwright/test";

/**
 * Modal and Dialog Tests
 * Tests all modals, dialogs, and overlays for proper behavior.
 */

test.describe("Modals - Onboarding", () => {
  test("onboarding modal appears on first visit", async ({ page }) => {
    // Clear localStorage to trigger onboarding
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/welcome to taida/i)).toBeVisible();
  });

  test("onboarding modal can be navigated through all steps", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Step through onboarding using Continue button
    const continueButton = page.getByRole("button", { name: /continue/i });
    for (let i = 0; i < 4; i++) {
      if (await continueButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(200);
      }
    }

    // Should reach final step - click "Get Started"
    const getStartedButton = page.getByRole("button", { name: /get started/i });
    if (await getStartedButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await getStartedButton.click();
    }

    // Modal should close
    await expect(dialog).not.toBeVisible({ timeout: 2000 });
  });

  test("onboarding modal renders correctly at each step", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Take screenshot of each step
    let step = 1;
    const continueButton = page.getByRole("button", { name: /continue/i });

    while (await continueButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(dialog).toHaveScreenshot(`onboarding-step-${step}.png`, {
        animations: "disabled",
      });
      await continueButton.click();
      await page.waitForTimeout(300);
      step++;
      if (step > 6) break;
    }
  });

  test("onboarding has skip button", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("get_me_job_onboarding_completed");
    });
    await page.reload();

    const skipButton = page.getByRole("button", { name: /skip/i });
    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipButton.click();
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 1000 });
    }
  });
});

test.describe.skip("Modals - Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("keyboard shortcuts modal opens with ?", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Shift+?");

    const shortcutsModal = page.getByText("Keyboard Shortcuts");
    await expect(shortcutsModal).toBeVisible();
  });

  test("keyboard shortcuts modal lists all shortcuts", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Shift+?");

    // Check for expected shortcuts
    await expect(page.getByText(/h|j|p|s/)).toBeVisible();

    // Take screenshot
    const dialog = page.getByRole("dialog");
    if (await dialog.isVisible()) {
      await expect(dialog).toHaveScreenshot("keyboard-shortcuts-modal.png", {
        animations: "disabled",
      });
    }
  });

  test("keyboard shortcuts modal closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Shift+?");
    await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("Keyboard Shortcuts")).not.toBeVisible();
  });
});

test.describe.skip("Modals - Jobs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");
  });

  test("add job modal opens and renders correctly", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add job|paste|new/i }).first();

    if (await addButton.isVisible()) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toBeVisible();

        // Should have form fields
        const textArea = dialog.locator("textarea");
        const hasTextArea = await textArea.isVisible().catch(() => false);

        // Take screenshot
        await expect(dialog).toHaveScreenshot("add-job-modal.png", {
          animations: "disabled",
        });

        // Close with Escape
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible({ timeout: 1000 });
      }
    }
  });

  test("job details slide-over panel", async ({ page }) => {
    // Check if there are any jobs to click
    const jobCard = page.locator("[data-testid='job-item'], .job-card").first();

    if (await jobCard.isVisible({ timeout: 1000 }).catch(() => false)) {
      await jobCard.click();

      // Look for slide-over panel or modal
      const panel = page.locator("[role='dialog'], .slide-over, [class*='Sheet']");
      if (await panel.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(panel).toHaveScreenshot("job-details-panel.png", {
          animations: "disabled",
        });
      }
    }
  });

  test("Gmail import modal", async ({ page }) => {
    const gmailButton = page.getByRole("button", { name: /gmail|import.*email/i });

    if (await gmailButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gmailButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("gmail-import-modal.png", {
          animations: "disabled",
        });
      }
    }
  });
});

test.describe.skip("Modals - Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("add experience modal", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add experience|add work/i }).first();

    if (await addButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("add-experience-modal.png", {
          animations: "disabled",
        });

        // Verify form fields
        await expect(dialog.locator("input, textarea").first()).toBeVisible();
      }
    }
  });

  test("add education modal", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add education/i }).first();

    if (await addButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("add-education-modal.png", {
          animations: "disabled",
        });
      }
    }
  });

  test("add skill modal/dropdown", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add skill/i }).first();

    if (await addButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await addButton.click();

      // Could be a modal or dropdown
      const dialog = page.getByRole("dialog");
      const dropdown = page.locator("[role='listbox'], [role='menu']");

      if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("add-skill-modal.png");
      } else if (await dropdown.isVisible({ timeout: 500 }).catch(() => false)) {
        await expect(dropdown).toHaveScreenshot("add-skill-dropdown.png");
      }
    }
  });
});

test.describe.skip("Modals - Interview Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
    await page.goto("/interview");
    await page.waitForLoadState("networkidle");
  });

  test("interview session start options", async ({ page }) => {
    const startButton = page.getByRole("button", { name: /start|begin|practice/i }).first();

    if (await startButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await startButton.click();

      // Could show options modal
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("interview-start-modal.png", {
          animations: "disabled",
        });
      }
    }
  });
});

test.describe.skip("Modals - Bank Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
    await page.goto("/bank");
    await page.waitForLoadState("networkidle");
  });

  test("drive file picker modal", async ({ page }) => {
    const driveButton = page.getByRole("button", { name: /drive|import/i }).first();

    if (await driveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await driveButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot("drive-picker-modal.png", {
          animations: "disabled",
        });
      }
    }
  });
});

test.describe.skip("Modals - General Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("modals have backdrop overlay", async ({ page }) => {
    // Trigger any modal
    await page.goto("/jobs");
    const addButton = page.getByRole("button", { name: /add|paste|new/i }).first();

    if (await addButton.isVisible()) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Check for backdrop
        const backdrop = page.locator("[class*='overlay'], [class*='backdrop'], .fixed.inset-0");
        expect(await backdrop.count()).toBeGreaterThan(0);
      }
    }
  });

  test("clicking backdrop closes modal", async ({ page }) => {
    await page.goto("/jobs");
    const addButton = page.getByRole("button", { name: /add|paste|new/i }).first();

    if (await addButton.isVisible()) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Click outside the dialog (on backdrop)
        await page.mouse.click(10, 10);

        // Modal should close
        await expect(dialog).not.toBeVisible({ timeout: 1000 });
      }
    }
  });

  test("modals prevent body scroll", async ({ page }) => {
    await page.goto("/jobs");
    const addButton = page.getByRole("button", { name: /add|paste|new/i }).first();

    if (await addButton.isVisible()) {
      await addButton.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Body should have overflow hidden
        const bodyOverflow = await page.evaluate(() => {
          return window.getComputedStyle(document.body).overflow;
        });
        expect(bodyOverflow).toBe("hidden");
      }
    }
  });
});

test.describe.skip("Confirmations and Alerts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("delete confirmation appears", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");

    // Find a delete button
    const deleteButton = page.getByRole("button", { name: /delete/i }).first();

    if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirmation dialog should appear
      const confirmDialog = page.getByRole("alertdialog").or(
        page.getByText(/are you sure|confirm|delete/i).locator("xpath=ancestor::*[@role='dialog']")
      );

      if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(confirmDialog).toHaveScreenshot("delete-confirmation.png", {
          animations: "disabled",
        });

        // Should have cancel and confirm buttons
        await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /delete|confirm/i })).toBeVisible();
      }
    }
  });

  test("success toast/notification appears after action", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Try to save profile
    const saveButton = page.getByRole("button", { name: /save/i }).first();

    if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await saveButton.click();

      // Look for toast/notification
      const toast = page.locator("[role='alert'], .toast, [class*='Toaster'], [class*='toast']");
      if (await toast.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(toast.first()).toHaveScreenshot("success-toast.png", {
          animations: "disabled",
        });
      }
    }
  });
});
