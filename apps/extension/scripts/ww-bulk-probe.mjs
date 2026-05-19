// Diagnostic: load the extension in headed Chromium, serve a synthetic
// WaterlooWorks jobs page that mirrors the live DOM as closely as we can,
// then dump what `WW_GET_PAGE_STATE` and `GET_SURFACE_CONTEXT` actually
// return. Run with `node scripts/ww-bulk-probe.mjs` from apps/extension.

import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(__dirname, "..");
const distChrome = path.join(extensionRoot, "dist");

// Mock WW jobs.htm with the column layout we can read off the user's
// screenshot: checkbox, action icons, ID, Job Title link, org, division,
// openings, city, level, apps. No data-viewer-table class, no
// table__row--body — just the plainest <table><tbody><tr><td>... structure
// because the modern WW UI looks like a vanilla bootstrap-y table.
const MOCK_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>WW jobs mock</title></head>
<body class="nPostingController new-student__posting-search loaded">
<main>
<h1>Jobs / Applications</h1>
<table>
  <thead>
    <tr>
      <th><input type="checkbox"></th>
      <th>ID</th>
      <th>Job Title</th>
      <th>Organization</th>
      <th>Division</th>
      <th>Openings</th>
      <th>City</th>
      <th>Level</th>
      <th>Apps</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input type="checkbox"></td>
      <td>471268</td>
      <td><a href="javascript:void(0)">Verification and Validation</a></td>
      <td>Agfa HealthCare Inc</td>
      <td>Divisional Office</td>
      <td>1</td>
      <td>Waterloo</td>
      <td>Junior, Intermediate</td>
      <td>51</td>
    </tr>
    <tr>
      <td><input type="checkbox"></td>
      <td>471264</td>
      <td><a href="javascript:void(0)">AI Toolchain Software Developer</a></td>
      <td>onsemi</td>
      <td>Industrial Solutions Division</td>
      <td>1</td>
      <td>Waterloo</td>
      <td>Junior, Intermediate</td>
      <td>130</td>
    </tr>
    <tr>
      <td><input type="checkbox"></td>
      <td>471263</td>
      <td><a href="javascript:void(0)">Software Developer</a></td>
      <td>onsemi</td>
      <td>Industrial Solutions Division</td>
      <td>1</td>
      <td>Waterloo</td>
      <td>Junior, Intermediate</td>
      <td>184</td>
    </tr>
  </tbody>
</table>
<a class="pagination__link" aria-label="Go to next page" href="javascript:void(0)">Next</a>
</main>
</body></html>`;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(MOCK_HTML);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
// Note: we route this through page.route() in the browser because the
// content_script match patterns are URL-scoped. We can't make Chromium
// believe http://127.0.0.1 is waterlooworks.uwaterloo.ca without rewriting
// requests there.
const TARGET_URL =
  "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";

const profileDir = mkdtempSync(path.join(tmpdir(), "slothing-probe-"));
console.log("launching chromium with extension", distChrome);
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
const extensionId = worker.url().split("/")[2];
console.log("extension id:", extensionId);

const page = await context.newPage();
await page.route(TARGET_URL, (route) =>
  route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: MOCK_HTML,
  }),
);
page.on("console", (m) =>
  console.log(`[page:${m.type()}]`, m.text()),
);
page.on("pageerror", (e) => console.log("[page:error]", e.stack || e));

await page.goto(TARGET_URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1200);

// Quick DOM sanity from the page itself.
const domStats = await page.evaluate(() => ({
  tables: document.querySelectorAll("table").length,
  rowsBasic: document.querySelectorAll("table tbody tr").length,
  rowsBody: document.querySelectorAll(".table__row--body").length,
  rowsRoleRow: document.querySelectorAll('[role="row"]').length,
  hasNext: !!document.querySelector(
    'a.pagination__link[aria-label="Go to next page"]',
  ),
}));
console.log("dom stats:", domStats);

const probe = await worker.evaluate(
  async ({ url }) => {
    const tabs = await chrome.tabs.query({});
    const t = tabs.find((tab) => tab.url === url);
    if (!t?.id) throw new Error("tab not found: " + url);
    const send = (msg) =>
      new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(t.id, msg, (response) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(response);
        });
      });
    let ww, surface, wwErr, surfaceErr;
    try {
      ww = await send({ type: "WW_GET_PAGE_STATE" });
    } catch (e) {
      wwErr = String(e.message || e);
    }
    try {
      surface = await send({ type: "GET_SURFACE_CONTEXT" });
    } catch (e) {
      surfaceErr = String(e.message || e);
    }
    return { ww, wwErr, surface, surfaceErr };
  },
  { url: TARGET_URL },
);
console.log("probe result:", JSON.stringify(probe, null, 2));

// Also render the popup as a regular page and verify the WW bulk card shows.
// We seed `slothing_extension` storage so the popup treats us as
// authenticated and bypasses the connect flow.
await worker.evaluate(() =>
  chrome.storage.local.set({
    slothing_extension: {
      authToken: "test-token",
      apiBaseUrl: "http://localhost:3000",
      cachedProfile: {
        contact: { name: "Test User", email: "test@example.com" },
      },
      tokenExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    },
  }),
);

const popup = await context.newPage();
popup.on("console", (m) => console.log(`[popup:${m.type()}]`, m.text()));
popup.on("pageerror", (e) => console.log("[popup:error]", e.stack || e));
// chrome.tabs.query in a popup respects "active && currentWindow", so we
// need to leave the WW tab as the active one. Switching the popup tab into
// a separate window keeps the WW tab "active" in its own window.
await popup.goto(`chrome-extension://${extensionId}/popup.html`);
await popup.waitForLoadState("domcontentloaded");
await popup.waitForTimeout(2000);

const popupSnapshot = await popup.evaluate(() => ({
  idleTitles: Array.from(document.querySelectorAll(".idle-title")).map((el) =>
    el.textContent?.trim(),
  ),
  statusTitles: Array.from(document.querySelectorAll(".status-title")).map(
    (el) => el.textContent?.trim(),
  ),
  bulkSourceLabels: Array.from(
    document.querySelectorAll("[class*=bulk] h2, [class*=bulk] .source-label"),
  ).map((el) => el.textContent?.trim()),
  // Coarse: print the whole .content text so we can confirm the bulk card.
  contentText: document.querySelector(".content")?.textContent?.trim() || null,
}));
console.log("popup snapshot:", JSON.stringify(popupSnapshot, null, 2));

await context.close();
server.close();
