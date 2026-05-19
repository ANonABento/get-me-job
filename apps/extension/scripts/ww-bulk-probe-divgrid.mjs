// Same as ww-bulk-probe.mjs but serves a div-based row layout (no <table>),
// to confirm the broadened row-ancestor fallback picks up modern WW-style
// grid markup.

import { chromium } from "@playwright/test";
import { tmpdir } from "node:os";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(__dirname, "..");
const distChrome = path.join(extensionRoot, "dist");

const MOCK_HTML = `<!doctype html>
<html><body class="nPostingController new-student__posting-search loaded">
<main>
  <div class="postings-list">
    <div class="posting-row">
      <span>471268</span>
      <a href="javascript:void(0)">Verification and Validation</a>
      <span>Agfa</span>
      <span>Waterloo</span>
    </div>
    <div class="posting-row">
      <span>471264</span>
      <a href="javascript:void(0)">AI Toolchain Software Developer</a>
      <span>onsemi</span>
      <span>Waterloo</span>
    </div>
    <div class="posting-row">
      <span>471263</span>
      <a href="javascript:void(0)">Software Developer</a>
      <span>onsemi</span>
      <span>Waterloo</span>
    </div>
  </div>
</main>
</body></html>`;

const TARGET_URL =
  "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";
const profileDir = mkdtempSync(path.join(tmpdir(), "slothing-probe-"));
const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${distChrome}`,
    `--load-extension=${distChrome}`,
    "--no-sandbox",
    "--headless=new",
  ],
});

let [worker] = context.serviceWorkers();
if (!worker) {
  worker = await context.waitForEvent("serviceworker", { timeout: 15_000 });
}

const page = await context.newPage();
await page.route(TARGET_URL, (route) =>
  route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: MOCK_HTML,
  }),
);
page.on("console", (m) => console.log(`[page:${m.type()}]`, m.text()));
await page.goto(TARGET_URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1000);

const probe = await worker.evaluate(
  async ({ url }) => {
    const tabs = await chrome.tabs.query({});
    const t = tabs.find((tab) => tab.url === url);
    if (!t?.id) throw new Error("tab not found");
    const send = (msg) =>
      new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(t.id, msg, (response) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(response);
        });
      });
    return await send({ type: "WW_GET_PAGE_STATE" });
  },
  { url: TARGET_URL },
);
console.log("div-grid probe:", JSON.stringify(probe));

await context.close();
