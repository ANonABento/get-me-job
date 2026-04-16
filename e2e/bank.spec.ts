import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import path from "path";
import { navigateToBank } from "./utils/test-helpers";

const TEST_PDF = path.join(__dirname, "fixtures", "test-resume.pdf");
const TEST_FILENAME = path.basename(TEST_PDF);

const bankApiResponse = (resp: { url: () => string; status: () => number }) =>
  resp.url().includes("/api/bank") && resp.status() === 200;

async function uploadFixture(page: Page): Promise<void> {
  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles(TEST_PDF);
  await expect(
    page.getByRole("button", { name: /^upload$/i })
  ).toBeVisible({ timeout: 30000 });
}

test.describe("Bank Page - Layout & Empty State", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToBank(page);
  });

  test("displays page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /documents/i })
    ).toBeVisible();
  });

  test("shows empty state message when no documents uploaded", async ({
    page,
  }) => {
    const emptyHeading = page.getByText("No documents yet");
    const entryCards = page.locator(".grid .rounded-lg");
    const hasEntries = (await entryCards.count()) > 0;

    if (!hasEntries) {
      await expect(emptyHeading).toBeVisible();
      await expect(
        page.getByRole("button", { name: /upload document/i })
      ).toBeVisible();
    }
  });

  test("displays search bar", async ({ page }) => {
    await expect(
      page.getByPlaceholder(/search your knowledge bank/i)
    ).toBeVisible();
  });

  test("displays category filter chips", async ({ page }) => {
    // Anchored patterns avoid matching chunk card buttons whose accessible
    // names also contain category words (e.g. "Uploaded Resume at Kevin Experience…").
    await expect(page.getByRole("button", { name: /^all \(/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^experience \(/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^skills \(/i })
    ).toBeVisible();
  });

  test("displays sort dropdown", async ({ page }) => {
    const sortSelect = page.locator("select");
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue("date");
  });
});

test.describe("Bank Page - Upload Button", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToBank(page);
  });

  test("has upload button in header", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /^upload$/i })
    ).toBeVisible();
  });

  test("upload button triggers hidden file input", async ({ page }) => {
    const fileInput = page.locator("input[type='file']");
    await expect(fileInput).toBeAttached();
    await expect(fileInput).toHaveAttribute("accept", ".pdf,.txt,.docx");
  });

  test("has From Drive button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /from drive/i })
    ).toBeVisible();
  });
});

test.describe("Bank Page - File Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToBank(page);
  });

  test("uploads a PDF and shows entries in the bank", async ({ page }) => {
    await uploadFixture(page);

    // Uploading spinner should appear then resolve
    await expect(
      page.getByRole("button", { name: /uploading/i })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole("button", { name: /^upload$/i })
    ).toBeVisible({ timeout: 30000 });

    await expect(page.getByText("No documents yet")).not.toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Bank Page - Search & Filter", () => {
  // Serial mode: parallel uploads from concurrent beforeEach calls can leave
  // the DB in an unpredictable state.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await navigateToBank(page);

    const emptyState = page.getByText("No documents yet");
    if (await emptyState.isVisible({ timeout: 2000 }).catch(() => false)) {
      await uploadFixture(page);
      await expect(emptyState).not.toBeVisible({ timeout: 10000 });
    }
  });

  test("search filters entries by query", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search your knowledge bank/i);

    await searchInput.fill("zzz_nonexistent_term_zzz");
    await page.waitForResponse(bankApiResponse);
    await expect(page.getByText("No matching entries")).toBeVisible({
      timeout: 5000,
    });

    await searchInput.fill("");
    await page.waitForResponse(bankApiResponse);
    await expect(page.getByText("No matching entries")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("category filter chips narrow results", async ({ page }) => {
    const experienceChip = page.getByRole("button", { name: /^experience \(/i });

    // waitForResponse instead of networkidle: networkidle can fire before the
    // response is fully processed by the React state update.
    await Promise.all([
      page.waitForResponse(bankApiResponse),
      experienceChip.click(),
    ]);

    const experienceHeading = page.getByRole("heading", {
      name: /experience/i,
    });
    const noMatching = page.getByText("No matching entries");
    await expect(experienceHeading.or(noMatching)).toBeVisible({
      timeout: 5000,
    });

    await Promise.all([
      page.waitForResponse(bankApiResponse),
      page.getByRole("button", { name: /^all \(/i }).click(),
    ]);
  });
});

test.describe("Bank Page - Source Documents Section", () => {
  // Serial mode: parallel beforeEach calls would each see the filename absent
  // within the short timeout and all kick off simultaneous uploads.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await navigateToBank(page);

    // Check by filename rather than empty state — the DB may already contain
    // documents from a prior run with a different fixture.
    const alreadyPresent = await page
      .getByText(TEST_FILENAME, { exact: true })
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!alreadyPresent) {
      await uploadFixture(page);
      await expect(
        page.getByText(TEST_FILENAME, { exact: true }).first()
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("shows Source Files heading after upload", async ({ page }) => {
    await expect(page.getByText("Source Files")).toBeVisible({ timeout: 5000 });
  });

  test("shows uploaded filename in source documents", async ({ page }) => {
    // .first() guards against duplicates left by prior runs in the SQLite DB
    await expect(page.getByText(TEST_FILENAME).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("source document card shows file metadata", async ({ page }) => {
    const filenameEl = page.getByText(TEST_FILENAME, { exact: true }).first();
    await expect(filenameEl).toBeVisible({ timeout: 5000 });

    // The metadata <p class="text-xs"> is a sibling inside div.min-w-0
    const metadataText = filenameEl.locator("..").locator(".text-xs");
    await expect(metadataText).toBeVisible();
    const text = await metadataText.textContent();
    expect(text).toMatch(/\d+.*chunk/);
  });

  test("source document has delete button", async ({ page }) => {
    const filenameEl = page.getByText(TEST_FILENAME, { exact: true }).first();
    await expect(filenameEl).toBeVisible({ timeout: 5000 });
    // p.text-sm → div.min-w-0 → card div
    const card = filenameEl.locator("../..");
    await expect(card.getByRole("button")).toBeVisible();
  });
});
