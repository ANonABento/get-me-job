import { test, expect } from "@playwright/test";

const VALID_CRITIQUE = {
  scores: { fit: 8, specificity: 7, hook: 6, ask: 9 },
  overall: 7.5,
  rationale_per_axis: {
    fit: "Mentions the company directly.",
    specificity: "Uses concrete details.",
    hook: "Opening could be sharper.",
    ask: "Closes with a clear ask.",
  },
  suggested_rewrites: [
    {
      range_in_letter: "I built reliable systems.",
      suggestion: "I improved reliability for customer workflows.",
      why: "Adds clearer impact.",
    },
    {
      range_in_letter: "I would love to talk.",
      suggestion: "I would welcome a conversation about the role.",
      why: "Makes the ask more direct.",
    },
  ],
};

test.describe("Cover Letter Critique", () => {
  test("renders scored critique after clicking Critique", async ({ page }) => {
    await page.route("**/api/settings/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ configured: true, provider: "openai" }),
      });
    });

    await page.route("**/api/ai/critique-cover-letter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, critique: VALID_CRITIQUE }),
      });
    });

    await page.goto("/studio");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /^cover letter$/i }).click();

    const editor = page.locator(".ProseMirror").first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.click();
    await page.keyboard.type("Dear Acme,");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("I built reliable systems.");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("I would love to talk.");

    await page
      .getByLabel("Job description")
      .fill(
        "Acme needs a product engineer to improve developer tooling and reliability.",
      );

    await page.getByRole("button", { name: /^critique$/i }).click();

    const critiqueRegion = page.getByRole("region", {
      name: "Cover letter critique",
    });
    await expect(critiqueRegion).toBeVisible({ timeout: 10000 });
    await expect(critiqueRegion.getByText("7.5/10")).toBeVisible();
    await expect(critiqueRegion.getByText("Company fit")).toBeVisible();
    await expect(
      critiqueRegion.getByRole("button", {
        name: /I improved reliability for customer workflows/i,
      }),
    ).toBeVisible();
  });
});
