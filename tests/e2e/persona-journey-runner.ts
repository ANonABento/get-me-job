import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  collectExpectedBankAssertions,
  fixturePathFor,
  formatSkipReason,
  missingFixtureLabels,
  parseTargetOpportunity,
  personaFixtureRequirements,
  personaJourneySteps,
  requiredPersonaFixtures,
  type JourneyStepDefinition,
  type PersonaSlug,
  type PersonaTargetOpportunity,
} from "../../src/lib/persona-journey";

const repoRoot = path.resolve(__dirname, "../..");
const JOURNEY_SCREENSHOT_DIR = path.join(
  repoRoot,
  "tests",
  "journey-screenshots",
);

const VISIBLE_PROBE_TIMEOUT_MS = 1000;
const DIALOG_TIMEOUT_MS = 10_000;
const UPLOAD_TIMEOUT_MS = 120_000;

function existingFixturePaths(slug: PersonaSlug): Set<string> {
  return new Set(
    requiredPersonaFixtures
      .map((requirement) => fixturePathFor(requirement, slug))
      .filter((relativePath) =>
        fs.existsSync(path.join(repoRoot, relativePath)),
      ),
  );
}

function readJsonFixture(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

async function captureStep(
  page: Page,
  testInfo: TestInfo,
  slug: PersonaSlug,
  step: JourneyStepDefinition,
): Promise<void> {
  const screenshotPath = path.join(
    JOURNEY_SCREENSHOT_DIR,
    slug,
    step.screenshotName,
  );
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach(`${slug}-${step.screenshotName}`, {
    path: screenshotPath,
    contentType: "image/png",
  });
  await testInfo.attach(`${slug}-${step.screenshotName}.dom.html`, {
    body: await page.locator("body").evaluate((body) => body.outerHTML),
    contentType: "text/html",
  });
  await testInfo.attach(`${slug}-${step.screenshotName}.expected.txt`, {
    body: step.expected,
    contentType: "text/plain",
  });
}

async function expectReachable(page: Page, pathName: string): Promise<void> {
  await page.goto(pathName);
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("body")).toBeVisible();
}

async function attachApiState(
  page: Page,
  testInfo: TestInfo,
  slug: PersonaSlug,
  stepKey: string,
  endpoint: string,
): Promise<void> {
  const response = await page.request.get(endpoint);
  const body = await response.text();
  await testInfo.attach(`${slug}-${stepKey}-${endpoint.replace(/\W+/g, "-")}`, {
    body,
    contentType:
      response.headers()["content-type"]?.split(";")[0] ??
      "application/octet-stream",
  });
  expect(response.ok()).toBe(true);
}

async function fillIfPresent(
  scope: Page | Locator,
  label: RegExp,
  value?: string,
): Promise<void> {
  if (!value) return;
  const field = scope.getByLabel(label).first();
  if (
    await field.isVisible({ timeout: VISIBLE_PROBE_TIMEOUT_MS }).catch(() => false)
  ) {
    await field.fill(value);
  }
}

async function addTargetOpportunity(
  page: Page,
  opportunity: PersonaTargetOpportunity,
): Promise<void> {
  await page.getByRole("button", { name: /^add opportunity$/i }).click();
  const dialog = page.getByRole("dialog", { name: /add opportunity/i });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel(/^title$/i).fill(opportunity.title);
  await dialog.getByLabel(/^(company|organizer)$/i).fill(opportunity.company);
  await fillIfPresent(dialog, /source url/i, opportunity.url);
  await fillIfPresent(dialog, /^city$/i, opportunity.location);
  await fillIfPresent(dialog, /required skills/i, opportunity.skills.join(", "));
  await dialog.getByLabel(/summary/i).fill(opportunity.summary);

  await Promise.all([
    page
      .waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/opportunities" &&
          response.request().method() === "POST",
      )
      .catch(() => undefined),
    dialog.getByRole("button", { name: /^add opportunity$/i }).click(),
  ]);

  await expect(dialog).not.toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
  await expect(page.getByText(opportunity.title, { exact: false })).toBeVisible(
    { timeout: DIALOG_TIMEOUT_MS },
  );
}

export function createPersonaJourneySpec(slug: PersonaSlug): void {
  test.describe(`persona journey - ${slug}`, () => {
    test(`walks the full app journey for ${slug}`, async ({
      page,
    }, testInfo) => {
      const missing = missingFixtureLabels(slug, existingFixturePaths(slug));
      test.skip(missing.length > 0, formatSkipReason(slug, missing));

      await page.setExtraHTTPHeaders({
        "x-get-me-job-e2e-user": `persona-${slug}`,
      });

      const email = `${slug}@test.example.com`;
      const expectedBankFixture = readJsonFixture(
        fixturePathFor(personaFixtureRequirements.expectedBankEntries, slug),
      );
      const targetOpportunity = parseTargetOpportunity(
        readJsonFixture(
          fixturePathFor(personaFixtureRequirements.targetOpportunity, slug),
        ),
      );

      await test.step(personaJourneySteps.signUp.label, async () => {
        await expectReachable(page, "/sign-up");
        await page
          .getByLabel(/email/i)
          .fill(email)
          .catch(() => undefined);
        await captureStep(page, testInfo, slug, personaJourneySteps.signUp);
      });

      await test.step(personaJourneySteps.onboarding.label, async () => {
        await expectReachable(page, "/dashboard");
        const skip = page.getByRole("button", { name: /skip|later|close/i });
        if (
          await skip
            .isVisible({ timeout: VISIBLE_PROBE_TIMEOUT_MS })
            .catch(() => false)
        ) {
          await skip.click();
        }
        await captureStep(page, testInfo, slug, personaJourneySteps.onboarding);
      });

      await test.step(personaJourneySteps.uploadResume.label, async () => {
        await expectReachable(page, "/bank");
        const resumePath = path.join(
          repoRoot,
          fixturePathFor(personaFixtureRequirements.resumePdf, slug),
        );
        const fileInput = page.locator('input[type="file"]').first();
        await Promise.all([
          page.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === "/api/upload" &&
              response.request().method() === "POST",
            { timeout: UPLOAD_TIMEOUT_MS },
          ),
          fileInput.setInputFiles(resumePath),
        ]);
        await attachApiState(page, testInfo, slug, "upload-resume", "/api/bank");
        await captureStep(
          page,
          testInfo,
          slug,
          personaJourneySteps.uploadResume,
        );
      });

      const expectedBankAssertions =
        collectExpectedBankAssertions(expectedBankFixture);

      await test.step(personaJourneySteps.verifyBank.label, async () => {
        await expectReachable(page, "/bank");
        expect(
          expectedBankAssertions.length,
          "expected.json must include rendered bank values to compare",
        ).toBeGreaterThan(0);
        for (const expectedText of expectedBankAssertions) {
          await expect(page.locator("body")).toContainText(expectedText);
        }
        await captureStep(page, testInfo, slug, personaJourneySteps.verifyBank);
      });

      await test.step(personaJourneySteps.addOpportunity.label, async () => {
        await expectReachable(page, "/opportunities");
        await addTargetOpportunity(page, targetOpportunity);
        await attachApiState(
          page,
          testInfo,
          slug,
          "add-opportunity",
          "/api/opportunities",
        );
        await captureStep(
          page,
          testInfo,
          slug,
          personaJourneySteps.addOpportunity,
        );
      });

      await test.step(personaJourneySteps.tailorResume.label, async () => {
        await expectReachable(page, "/studio");
        await expect(page.locator("body")).toContainText(
          /studio|resume|document/i,
        );
        await expect(page.locator("body")).toContainText(
          new RegExp(
            targetOpportunity.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        );
        await captureStep(
          page,
          testInfo,
          slug,
          personaJourneySteps.tailorResume,
        );
      });

      await test.step(personaJourneySteps.coverLetter.label, async () => {
        await expectReachable(page, "/cover-letter");
        await expect(page.locator("body")).toContainText(/cover letter|letter/i);
        await captureStep(page, testInfo, slug, personaJourneySteps.coverLetter);
      });

      await test.step(personaJourneySteps.atsScan.label, async () => {
        await expectReachable(page, "/ats-scanner");
        await expect(page.locator("body")).toContainText(/ats|scan|score/i);
        await fillIfPresent(page, /resume/i, expectedBankAssertions.join("\n"));
        await fillIfPresent(
          page,
          /job description|description/i,
          targetOpportunity.summary,
        );
        await captureStep(page, testInfo, slug, personaJourneySteps.atsScan);
      });

      await test.step(personaJourneySteps.analytics.label, async () => {
        await expectReachable(page, "/analytics");
        await expect(page.locator("body")).toContainText(
          /analytics|funnel|application/i,
        );
        await attachApiState(page, testInfo, slug, "analytics", "/api/analytics");
        await captureStep(page, testInfo, slug, personaJourneySteps.analytics);
      });
    });
  });
}
