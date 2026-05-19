// Screenshot harness for P2/#35 — inline answer-bank popover.
//
// Spins up a one-shot HTTP server on port 3000 that serves a fixture HTML
// page with a long essay textarea. Launches Chromium with the Slothing
// extension loaded, opens the fixture, and captures two screenshots:
//   - /tmp/slothing-screenshots/p2-35-button.png — affordance visible
//   - /tmp/slothing-screenshots/p2-35-popover.png — popover open with 3 mocked
//                                                  answers
//
// Why mock the API: dev installs usually have an empty answer_bank table, so
// `GET /api/answer-bank/match` would return zero results. We Route-intercept
// the request and return three plausible matches so the screenshot has real
// content to show.
//
// Run from the repo root or from apps/extension:
//   node apps/extension/demo/_screenshot-p2-35.mjs
//
// Cleans up after itself — the HTTP server is closed and the browser exits.

import { chromium } from "/home/anonabento/slothing/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs";
import { writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import os from "node:os";

const SCREENSHOT_DIR = "/tmp/slothing-screenshots";
const EXT_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "dist",
);
const PROFILE = path.join(os.tmpdir(), "slothing-p2-35-harness");
const PORT = 3000;

const log = (...a) =>
  console.log(new Date().toISOString().slice(11, 19), ...a);

// Three mock matches used by the route interceptor.
const MOCK_MATCHES = [
  {
    id: "ab_1",
    question: "Why are you interested in this role?",
    answer:
      "I'm interested in this role because it sits at the intersection of distributed systems and product impact — the team is shipping infrastructure that customers feel directly, and I want to be part of that loop. Past work on observability and queueing primes me for the kind of latency and reliability problems described in the JD.",
    score: 0.83,
    category: "interest",
  },
  {
    id: "ab_2",
    question: "Why this company over others you're considering?",
    answer:
      "Two reasons: the engineering culture is unusually disciplined (postmortems are public, ownership is explicit, tooling is invested in) and the product is something I'd use even if I didn't work here. The combination is rare.",
    score: 0.71,
    category: "company-fit",
  },
  {
    id: "ab_3",
    question: "What motivates you in your work?",
    answer:
      "Two things: hard, well-scoped problems with measurable outcomes, and tight feedback loops with engineers I respect. I'm at my best when the cost of being wrong is low enough to iterate but high enough to matter.",
    score: 0.62,
    category: "motivation",
  },
];

// Fixture HTML — a long essay textarea on a fake job application form.
// The label text is intentionally one of the painful patterns in the regex so
// the decorator picks it up.
const FIXTURE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Demo: Senior Software Engineer — Acme Corp</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    background: #fafafa;
    color: #1a1a1a;
    max-width: 760px;
    margin: 32px auto;
    padding: 0 24px;
    line-height: 1.5;
  }
  header { margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 6px; color: #1a1530; }
  .meta { color: #5b6770; font-size: 13px; }
  form {
    background: white;
    border: 1px solid #e6e6e6;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  textarea {
    width: 100%;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    padding: 12px;
    font: inherit;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    min-height: 140px;
  }
  .hint { color: #5b6770; font-size: 12px; margin-top: 4px; }
  .field + .field { margin-top: 20px; }
  input[type="text"], input[type="email"] {
    width: 100%;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    padding: 8px 12px;
    font: inherit;
  }
</style>
</head>
<body>
<header>
  <h1>Apply: Senior Software Engineer</h1>
  <p class="meta">Acme Corp · San Francisco / Remote · Full-time</p>
</header>
<form>
  <div class="field">
    <label for="full-name">Full name</label>
    <input id="full-name" type="text" />
  </div>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" type="email" />
  </div>
  <div class="field">
    <label for="interest-essay">Why are you interested in this role?</label>
    <textarea
      id="interest-essay"
      rows="6"
      maxlength="2000"
      placeholder="Tell us in 200 words or fewer what draws you to this team."
    ></textarea>
    <p class="hint">Up to 2000 characters.</p>
  </div>
  <div class="field">
    <label for="short-note">Anything else we should know?</label>
    <textarea id="short-note" rows="3" maxlength="200"></textarea>
    <p class="hint">Short answer — won't be decorated.</p>
  </div>
</form>
</body>
</html>`;

function startFixtureServer() {
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 200;
    res.end(FIXTURE_HTML);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", () => {
      log(`fixture server listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function run() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const server = await startFixtureServer();

  log("launching chromium with extension");
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
    ],
    viewport: { width: 900, height: 720 },
  });

  // Plant a fake extension auth token so the api-client doesn't bail with
  // "Not authenticated" when the popover fetches matches.
  let sw = ctx.serviceWorkers()[0];
  if (!sw) {
    sw = await ctx.waitForEvent("serviceworker", { timeout: 15000 });
  }
  log("service worker:", sw.url());
  await sw.evaluate(
    ({ token, expiresAt, apiBaseUrl }) =>
      new Promise((res) =>
        chrome.storage.local.set(
          {
            slothing_extension: {
              authToken: token,
              tokenExpiry: expiresAt,
              apiBaseUrl,
              settings: {
                autoFillEnabled: true,
                showConfidenceIndicators: true,
                minimumConfidence: 0.5,
                learnFromAnswers: true,
                notifyOnJobDetected: true,
                autoTrackApplicationsEnabled: true,
                captureScreenshotEnabled: false,
              },
            },
          },
          res,
        ),
      ),
    {
      token: "fake-screenshot-token",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      apiBaseUrl: `http://localhost:${PORT}`,
    },
  );
  log("planted fake auth token");

  const page = await ctx.newPage();

  // Intercept the answer-bank match request so we return the three mock
  // candidates rather than hitting a real server. The api-client fetch
  // happens inside the background service worker (NOT the page), so we have
  // to add the route at the *context* level — page.route() only sees
  // page-context requests.
  await ctx.route("**/api/answer-bank/match*", (route) => {
    log("intercepted /api/answer-bank/match");
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: MOCK_MATCHES }),
    });
  });
  await ctx.route("**/api/extension/auth/verify", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  // Catch-all for any other extension API call the background might make
  // while resolving auth / settings — fail soft so the popover still renders.
  await ctx.route("**/api/extension/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  log("navigating to fixture");
  await page.goto(`http://localhost:${PORT}/`);
  // Wait for the content script to mount the decoration. The MutationObserver
  // + scanPage debounce means a small delay is reasonable.
  await page.waitForTimeout(1200);

  // Verify the decoration host is present.
  const hostsBefore = await page.evaluate(() =>
    document.querySelectorAll(".slothing-ab-host").length,
  );
  log("decorations mounted:", hostsBefore);
  if (hostsBefore < 1) {
    throw new Error("decoration host not found — content script may not have run");
  }

  const buttonShotPath = path.join(SCREENSHOT_DIR, "p2-35-button.png");
  await page.screenshot({ path: buttonShotPath, fullPage: false });
  log("📸 wrote", buttonShotPath);

  // Click the bulb to open the popover. The button lives inside a shadow root
  // attached to the .slothing-ab-host element.
  await page.evaluate(() => {
    const host = document.querySelector(".slothing-ab-host");
    if (!host?.shadowRoot) throw new Error("no shadowRoot on host");
    const btn = host.shadowRoot.querySelector("button.slothing-ab-button");
    if (!btn) throw new Error("no slothing-ab-button in shadow root");
    btn.click();
  });
  // Wait for the popover to render + matches to load (mocked, but still async).
  await page.waitForTimeout(800);

  const popoverShotPath = path.join(SCREENSHOT_DIR, "p2-35-popover.png");
  await page.screenshot({ path: popoverShotPath, fullPage: false });
  log("📸 wrote", popoverShotPath);

  await ctx.close().catch(() => {});
  server.close();
  log("done");
}

try {
  await run();
  process.exit(0);
} catch (err) {
  console.error("[p2-35 screenshot]", err);
  process.exit(1);
}
