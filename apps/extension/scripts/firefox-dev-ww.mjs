// Headed Firefox + Slothing extension dev session focused on debugging the
// WaterlooWorks bulk-card path. Launches Firefox via web-ext (so the
// temporary add-on loads, no signing needed), opens a BiDi WebSocket to
// stream every page console message + every Slothing log line back to this
// terminal, and exposes a `dump` REPL command that asks the WW tab's content
// script what it sees right now.
//
// Run from apps/extension:
//   node scripts/firefox-dev-ww.mjs
//
// The browser opens. Log in to WaterlooWorks, navigate to /jobs.htm. Watch
// this terminal for `[Slothing][WW] rows matched` / `row-scan fallback`
// lines, or type `dump` to query state on demand.

import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(extensionRoot, "../..");
const distFirefox = path.join(extensionRoot, "dist-firefox");

const firefoxBinary =
  process.env.FIREFOX_BIN || "/home/anonabento/.local/bin/firefox";
const startUrl =
  process.argv[2] ||
  "https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm";

if (!existsSync(path.join(distFirefox, "manifest.json"))) {
  throw new Error(
    "Missing dist-firefox/manifest.json. Run `pnpm build:firefox` first.",
  );
}
if (!existsSync(firefoxBinary)) {
  throw new Error(`Firefox binary not found: ${firefoxBinary}`);
}

const remotePort = await getFreePort();
// Stable profile dir so Duo / CAS login state survives across restarts.
// Override with SLOTHING_FF_PROFILE_DIR if you need a clean room.
const profileDir =
  process.env.SLOTHING_FF_PROFILE_DIR ||
  path.join(tmpdir(), "slothing-firefox-dev-stable");
await mkdir(profileDir, { recursive: true });
console.log(`[dev] firefox      ${firefoxBinary}`);
console.log(`[dev] extension    ${distFirefox}`);
console.log(`[dev] profile      ${profileDir}`);
console.log(`[dev] bidi port    ${remotePort}`);
console.log(`[dev] start url    ${startUrl}`);
console.log();

const webExt = spawn(
  "pnpm",
  [
    "dlx",
    "web-ext@latest",
    "run",
    "-s",
    distFirefox,
    "--firefox",
    firefoxBinary,
    "--firefox-profile",
    profileDir,
    "--keep-profile-changes",
    "--no-input",
    "--no-reload",
    "--browser-console",
    "--start-url",
    startUrl,
    `--arg=--remote-debugging-port=${remotePort}`,
    "--arg=--remote-allow-hosts=localhost,127.0.0.1",
  ],
  { cwd: repoRoot, detached: true, stdio: ["ignore", "pipe", "pipe"] },
);
webExt.stdout.on("data", (chunk) =>
  process.stdout.write(`[web-ext] ${chunk}`),
);
webExt.stderr.on("data", (chunk) =>
  process.stderr.write(`[web-ext] ${chunk}`),
);
webExt.on("exit", (code) => {
  console.log(`[dev] web-ext exited code=${code}`);
  process.exit(code ?? 0);
});

console.log("[dev] waiting for BiDi endpoint ...");
const bidi = await waitForBidi(remotePort);
console.log("[dev] connected BiDi");

let nextId = 0;
const pending = new Map();
bidi.on("message", (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
    return;
  }
  if (message.method === "log.entryAdded") {
    const e = message.params;
    const text = (e.args || []).map(stringifyRemoteValue).join(" ");
    if (
      e.level === "error" ||
      e.level === "warn" ||
      /\[Slothing\]/.test(text) ||
      /slothing/i.test(text)
    ) {
      const url = (e.source?.url || "").split("/").slice(-1)[0] || "?";
      console.log(`[fx:${e.level}:${url}] ${text}`);
    }
    return;
  }
  if (message.method === "browsingContext.navigationStarted") {
    console.log(`[fx:nav] -> ${message.params.url}`);
    // Auto-dump shortly after landing on the WW jobs list, so we don't
    // depend on the popup ever being opened. Gives the SPA a moment to
    // render the table before we snapshot.
    if (/waterlooworks[-.a-z0-9]*\.uwaterloo\.ca.*jobs\.htm/i.test(
      message.params.url || "",
    )) {
      setTimeout(() => {
        dump().catch((err) =>
          console.log("[dev:dump:error]", err.message),
        );
        triggerWwProbe().catch((err) =>
          console.log("[dev:probe:error]", err.message),
        );
      }, 2500);
    }
  }
});

// Heartbeat dump every 8s while a WW jobs tab is active. Lets us see what
// changes as the SPA re-renders, without manual input.
let heartbeatPaused = false;
setInterval(() => {
  if (heartbeatPaused) return;
  heartbeatPaused = true;
  dump()
    .catch((err) => console.log("[dev:dump:error]", err.message))
    .finally(() => {
      heartbeatPaused = false;
    });
}, 8000);

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, (response) => {
      if (response.type === "error") {
        reject(
          new Error(
            `${method}: ${response.error} ${response.message || ""}`,
          ),
        );
        return;
      }
      resolve(response.result);
    });
    bidi.send(JSON.stringify({ id, method, params }));
  });
}

await send("session.new", { capabilities: { alwaysMatch: {} } });
await send("session.subscribe", {
  events: ["log.entryAdded", "browsingContext.navigationStarted"],
});

async function findWwContext() {
  const tree = await send("browsingContext.getTree");
  // Recursively search the tree for a WW URL — top-level OR a child frame.
  const stack = [...tree.contexts];
  while (stack.length) {
    const ctx = stack.shift();
    if (
      ctx.url &&
      /waterlooworks[-.a-z0-9]*\.uwaterloo\.ca/i.test(ctx.url) &&
      /\/jobs\.htm/.test(ctx.url)
    ) {
      return ctx;
    }
    if (ctx.children) stack.push(...ctx.children);
  }
  return null;
}

// Asks the content script to run `getWwPageState()` by injecting a message
// to itself — uses the extension's own runtime so the existing orchestrator
// row-scan diagnostics print. The content script's onMessage listener is
// what we want to exercise.
async function triggerWwProbe() {
  const ctx = await findWwContext();
  if (!ctx) return;
  const expr = `(async () => {
    // Content scripts can't directly use chrome.runtime here in BiDi's
    // page context, so we dispatch a custom event the content script can't
    // hear either. Fallback: synthesize the same logic inline.
    const rows = (function () {
      const sels = [
        "table.data-viewer-table tbody tr.table__row--body",
        "table.data-viewer-table tbody tr",
        ".data-viewer-table [role='row']",
        "table tbody tr.table__row--body",
        "table tbody tr",
        "[role='rowgroup'] [role='row']",
        "[role='table'] [role='row']",
        ".table__row--body",
        ".table__row",
      ];
      for (const s of sels) {
        const n = document.querySelectorAll(s).length;
        if (n > 0) return { sel: s, n };
      }
      return { sel: null, n: 0 };
    })();
    return JSON.stringify({
      url: location.href,
      firstHitSelector: rows.sel,
      firstHitCount: rows.n,
      hasDetailPanel: !!document.querySelector(
        ".dashboard-header__posting-title",
      ),
    });
  })()`;
  const r = await send("script.evaluate", {
    target: { context: ctx.context },
    expression: expr,
    awaitPromise: true,
    resultOwnership: "none",
  });
  if (r.type === "success") {
    console.log("[dev:probe]", r.result.value);
  } else {
    console.log("[dev:probe:err]", r.exceptionDetails?.text);
  }
}

async function dump() {
  const ctx = await findWwContext();
  if (!ctx) {
    console.log(
      "[dev:dump] no WaterlooWorks /jobs.htm tab open yet — navigate there first",
    );
    return;
  }
  const expression = `(${(() => {
    const url = window.location.href;
    const bodyClass = document.body?.className || null;
    const counts = {
      tables: document.querySelectorAll("table").length,
      tbodyTr: document.querySelectorAll("table tbody tr").length,
      dataViewerTable: document.querySelectorAll("table.data-viewer-table")
        .length,
      tableRowBody: document.querySelectorAll(".table__row--body").length,
      tableRowAny: document.querySelectorAll(".table__row").length,
      roleRow: document.querySelectorAll('[role="row"]').length,
      jsLinks: document.querySelectorAll(
        "a[href='javascript:void(0)']",
      ).length,
      buttons: document.querySelectorAll("button").length,
      dashHeader: document.querySelectorAll(
        ".dashboard-header__posting-title",
      ).length,
      // catch-all: any DOM element whose class string mentions "row"
      classHasRow: document.querySelectorAll('[class*="row" i]').length,
      classHasPosting: document.querySelectorAll('[class*="posting" i]')
        .length,
      classHasJob: document.querySelectorAll('[class*="job" i]').length,
    };
    // Try every individual selector the orchestrator uses
    const probeSelectors = [
      "table.data-viewer-table tbody tr.table__row--body",
      "table.data-viewer-table tbody tr",
      ".data-viewer-table [role='row']",
      "table tbody tr.table__row--body",
      "table tbody tr",
      "[role='rowgroup'] [role='row']",
      "[role='table'] [role='row']",
      ".table__row--body",
      ".table__row",
    ];
    const perSelector = probeSelectors.map((sel) => ({
      sel,
      n: document.querySelectorAll(sel).length,
    }));
    // Sample the first few job-title-ish controls
    const linkSamples = Array.from(
      document.querySelectorAll(
        "a[href='javascript:void(0)'], td a, td button, [role='cell'] a, [role='cell'] button",
      ),
    )
      .slice(0, 6)
      .map((el) => ({
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 60),
        cls: el.className || "",
        parentTag: el.parentElement?.tagName || "",
        parentCls: el.parentElement?.className || "",
        ancestorRow: closestRowDescriptor(el),
      }));
    function closestRowDescriptor(el) {
      const sel =
        "tr, [role='row'], li, .table__row, .table__row--body, [class*='posting-row'], [class*='job-row'], [class*='listing-row']";
      const row = el.closest(sel);
      if (!row) return null;
      return {
        tag: row.tagName,
        cls: row.className || "",
        role: row.getAttribute("role") || "",
        cellCount: row.querySelectorAll("td, [role='cell']").length,
      };
    }
    return JSON.stringify(
      { url, bodyClass, counts, perSelector, linkSamples },
      null,
      2,
    );
  }).toString()})()`;
  const result = await send("script.evaluate", {
    target: { context: ctx.context },
    expression,
    awaitPromise: true,
    resultOwnership: "none",
  });
  if (result.type !== "success") {
    console.log("[dev:dump:error]", result.exceptionDetails?.text);
    return;
  }
  console.log("[dev:dump]", result.result.value);
}

console.log();
console.log("Commands:");
console.log("  dump   — query WaterlooWorks /jobs.htm DOM state");
console.log("  q     — quit (also closes Firefox)");
console.log();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", async (line) => {
  const cmd = line.trim();
  if (cmd === "dump") {
    try {
      await dump();
    } catch (err) {
      console.log("[dev:dump:error]", err.message);
    }
  } else if (cmd === "q" || cmd === "quit") {
    shutdown();
  } else if (cmd) {
    console.log("[dev] unknown command:", cmd);
  }
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("[dev] shutting down");
  try {
    if (webExt.pid) process.kill(-webExt.pid, "SIGTERM");
  } catch {}
  process.exit(0);
}

async function getFreePort() {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForBidi(port) {
  const deadline = Date.now() + 30_000;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const ws = await new Promise((resolve, reject) => {
        const socket = new WebSocket(`ws://127.0.0.1:${port}/session`);
        socket.onopen = () => resolve(socket);
        socket.onerror = (err) => reject(err);
      });
      const listeners = { message: [], close: [] };
      ws.onmessage = (event) =>
        listeners.message.forEach((fn) => fn(event.data));
      ws.onclose = () => listeners.close.forEach((fn) => fn());
      return {
        on(event, fn) {
          (listeners[event] ||= []).push(fn);
        },
        send(payload) {
          ws.send(payload);
        },
        close() {
          ws.close();
        },
      };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error(`BiDi did not come up on ${port}: ${lastErr?.message}`);
}

function stringifyRemoteValue(v) {
  if (!v) return String(v);
  if (Object.hasOwn(v, "value")) {
    const x = v.value;
    if (typeof x === "string") return x;
    try {
      return JSON.stringify(x);
    } catch {
      return String(x);
    }
  }
  if (v.type === "object" || v.type === "array") {
    try {
      return JSON.stringify(v);
    } catch {
      return `[${v.type}]`;
    }
  }
  return v.type || "?";
}
