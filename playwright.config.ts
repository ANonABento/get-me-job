import { defineConfig, devices } from "@playwright/test";

const playwrightPort = process.env.PORT || "8888";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${playwrightPort}`;

const e2eUserHeader = (projectName: string) => ({
  "x-get-me-job-e2e-user": `e2e-${projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`,
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Snapshot settings for visual regression
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  snapshotDir: "./e2e/snapshots",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: e2eUserHeader("chromium"),
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        extraHTTPHeaders: e2eUserHeader("firefox"),
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        extraHTTPHeaders: e2eUserHeader("webkit"),
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        extraHTTPHeaders: e2eUserHeader("Mobile Chrome"),
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        extraHTTPHeaders: e2eUserHeader("Mobile Safari"),
      },
    },
  ],
  webServer: {
    command: "node e2e/playwright-web-server.cjs",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180 * 1000,
  },
});
