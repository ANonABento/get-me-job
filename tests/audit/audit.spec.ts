import { test, chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.resolve(__dirname, "../../../.audit/screenshots");

const ROUTES = [
  { path: "/", name: "landing" },
  { path: "/dashboard", name: "dashboard" },
  { path: "/studio", name: "studio" },
  { path: "/jobs", name: "jobs" },
  { path: "/opportunities", name: "opportunities" },
  { path: "/profile", name: "profile" },
  { path: "/upload", name: "upload" },
  { path: "/analytics", name: "analytics" },
  { path: "/interview", name: "interview" },
  { path: "/calendar", name: "calendar" },
  { path: "/settings", name: "settings" },
  { path: "/emails", name: "emails" },
  { path: "/documents", name: "documents" },
  { path: "/salary", name: "salary" },
  { path: "/bank", name: "bank" },
  { path: "/extension/connect", name: "extension-connect" },
];

const DESKTOP = { width: 1920, height: 1080 };
const MOBILE = { width: 375, height: 812 };

async function captureRoute(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  viewport: { width: number; height: number },
  route: { path: string; name: string },
  suffix: string
): Promise<void> {
  const context = await browser.newContext({
    viewport,
    userAgent:
      suffix === "mobile"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        : undefined,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(
      SCREENSHOTS_DIR,
      `${route.name}-${suffix}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[${suffix}] ${route.path} → ${screenshotPath}`);
  } catch (err) {
    console.error(`[${suffix}] FAILED ${route.path}: ${err}`);
  } finally {
    await context.close();
  }
}

test.setTimeout(300000);

test("capture all screenshots", async () => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch();

  for (const route of ROUTES) {
    await captureRoute(browser, DESKTOP, route, "desktop");
    await captureRoute(browser, MOBILE, route, "mobile");
  }

  await browser.close();
});
