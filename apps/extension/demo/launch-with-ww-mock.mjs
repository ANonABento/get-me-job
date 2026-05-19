// Launches Chromium with the Slothing extension and a mock WaterlooWorks
// jobs page. The mock is intercepted at the real waterlooworks.uwaterloo.ca
// URL so the content-script match patterns fire. Use this to iterate on the
// row selectors against an HTML structure that mirrors the live layout.
//
//   node demo/launch-with-ww-mock.mjs            # default fake DOM
//   node demo/launch-with-ww-mock.mjs <file>     # custom mock HTML to serve

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, "..", "dist");
const userDataDir = path.resolve(__dirname, ".user-data-dir-ww");
const mockHtmlFile =
  process.argv[2] || path.resolve(__dirname, "waterlooworks-jobs.html");
const mockHtml = readFileSync(mockHtmlFile, "utf8");
const TARGET_URL =
  "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";

console.log("Launching Chromium with Slothing + mock WaterlooWorks");
console.log("  extension:", extensionPath);
console.log("  user data:", userDataDir);
console.log("  mock html:", mockHtmlFile);
console.log("  target  :", TARGET_URL);
console.log();

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
  viewport: { width: 1440, height: 900 },
});

let worker = context.serviceWorkers()[0];
if (!worker) {
  worker = await context.waitForEvent("serviceworker", { timeout: 15000 });
}
const extensionId = worker.url().split("/")[2];
console.log("extension id:", extensionId);

const page = context.pages()[0] ?? (await context.newPage());

// Route the WW URL so the mock HTML is served from waterlooworks.uwaterloo.ca,
// which is what the manifest match patterns watch. The content script will
// inject as if this were the real site.
await page.route(TARGET_URL, (route) =>
  route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: mockHtml,
  }),
);

page.on("console", (m) => console.log(`[ww-page:${m.type()}]`, m.text()));
page.on("pageerror", (e) => console.log("[ww-page:error]", e.stack || e));

await page.goto(TARGET_URL);
console.log();
console.log("Open the Slothing icon in the toolbar to see the popup.");
console.log("Edit", path.relative(process.cwd(), mockHtmlFile), "and reload");
console.log("the WW tab to test selector changes against new DOM.");
console.log();
console.log("Ctrl+C to close.");

await new Promise(() => {});
