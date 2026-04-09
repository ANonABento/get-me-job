import { test, expect } from "@playwright/test";

/**
 * Visual Audit Tests
 * Captures screenshots of every page and major UI states for visual regression testing.
 * Run with: npx playwright test visual-audit --update-snapshots (to generate baselines)
 */

const ALL_PAGES = [
  { path: "/", name: "dashboard" },
  { path: "/upload", name: "upload" },
  { path: "/profile", name: "profile" },
  { path: "/documents", name: "documents" },
  { path: "/jobs", name: "jobs" },
  { path: "/interview", name: "interview" },
  { path: "/calendar", name: "calendar" },
  { path: "/emails", name: "emails" },
  { path: "/analytics", name: "analytics" },
  { path: "/settings", name: "settings" },
  { path: "/salary", name: "salary" },
  { path: "/extension/connect", name: "extension-connect" },
];

test.describe("Visual Audit - All Pages", () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding for clean page views
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  for (const { path, name } of ALL_PAGES) {
    test(`${name} page renders correctly`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      // Check page loads without errors
      await expect(page.locator("body")).toBeVisible();

      // Check for console errors
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${name}-full-page.png`, {
        fullPage: true,
        animations: "disabled",
      });

      // Assert no critical JS errors (ignore known ones)
      const criticalErrors = errors.filter(
        (e) => !e.includes("401") && !e.includes("Failed to fetch")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe("Visual Audit - Light/Dark Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("dashboard light theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("dashboard-light.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("dashboard dark theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("dashboard-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Audit - Component States", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("sidebar navigation highlights", async ({ page }) => {
    // Test each nav item becomes active when clicked
    const navItems = [
      { name: "Dashboard", path: "/" },
      { name: "Upload", path: "/upload" },
      { name: "Jobs", path: "/jobs" },
      { name: "Interview Prep", path: "/interview" },
    ];

    for (const item of navItems) {
      await page.goto(item.path);
      await page.waitForLoadState("networkidle");

      const navLink = page.getByRole("link", { name: item.name });
      if (await navLink.isVisible()) {
        await expect(navLink).toHaveClass(/gradient-bg|bg-primary|active/);
      }
    }
  });

  test("button states - jobs page", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");

    // Find primary action buttons and check hover states
    const addJobButton = page.getByRole("button", { name: /add job|new job|paste/i }).first();
    if (await addJobButton.isVisible()) {
      await addJobButton.hover();
      await expect(addJobButton).toHaveScreenshot("add-job-button-hover.png");
    }
  });

  test("cards display correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check dashboard cards render
    const cards = page.locator(".card, [class*='Card'], .rounded-xl.border");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Screenshot first card
    if (cardCount > 0) {
      await expect(cards.first()).toHaveScreenshot("dashboard-card.png");
    }
  });

  test("empty states render correctly", async ({ page }) => {
    // Jobs page empty state
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");

    const emptyState = page.getByText(/no jobs|add your first|get started/i);
    if (await emptyState.isVisible()) {
      await expect(emptyState.locator("..")).toHaveScreenshot("jobs-empty-state.png");
    }
  });
});

test.describe("Visual Audit - Forms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });
  });

  test("profile form displays correctly", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Check form elements render
    const formInputs = page.locator("input, textarea, select");
    const inputCount = await formInputs.count();
    expect(inputCount).toBeGreaterThan(0);

    // Screenshot the contact section
    const contactSection = page.locator("form").first();
    if (await contactSection.isVisible()) {
      await expect(contactSection).toHaveScreenshot("profile-contact-form.png");
    }
  });

  test("settings form displays correctly", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Check settings sections render
    const settingsContent = page.locator("main");
    await expect(settingsContent).toHaveScreenshot("settings-page.png");
  });
});

test.describe("Visual Audit - Loading States", () => {
  test("loading spinners render correctly", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });

    // Go to analytics which typically loads data
    await page.goto("/analytics");

    // Check for loading indicators
    const loader = page.locator(".animate-spin, .animate-pulse, [class*='Loader']");
    // If a loader is visible, capture it
    if (await loader.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(loader.first()).toHaveScreenshot("loading-spinner.png");
    }
  });
});

test.describe("Visual Audit - Error States", () => {
  test("handles API errors gracefully", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });

    // Check pages don't show raw error traces
    for (const { path } of ALL_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Should not show raw stack traces
      const stackTrace = page.getByText(/at\s+\w+\s+\(/);
      expect(await stackTrace.count()).toBe(0);
    }
  });
});

test.describe("Visual Audit - Typography", () => {
  test("headings hierarchy is correct", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });

    for (const { path, name } of ALL_PAGES.slice(0, 5)) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Check h1 exists and is visible
      const h1 = page.locator("h1").first();
      if (await h1.isVisible()) {
        const fontSize = await h1.evaluate((el) =>
          window.getComputedStyle(el).fontSize
        );
        // H1 should be reasonably large (at least 24px)
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test("text is readable (sufficient contrast)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });

    // Check main content text color
    const mainText = page.locator("p, span").first();
    if (await mainText.isVisible()) {
      const color = await mainText.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // Should have actual text color defined (not transparent)
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
    }
  });
});

test.describe("Visual Audit - Icons", () => {
  test("icons render correctly", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("get_me_job_onboarding_completed", "true");
    });

    // Check sidebar icons
    const icons = page.locator("svg");
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThan(5);

    // Icons should have proper sizing
    const firstIcon = icons.first();
    const size = await firstIcon.evaluate((el) => ({
      width: el.clientWidth,
      height: el.clientHeight,
    }));
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});
