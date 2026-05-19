// Firefox's `chrome.*` compat is callback-based, so `await chrome.tabs.query(...)`
// resolves to `undefined` and downstream code throws. Aliasing global `chrome`
// to the polyfilled `browser` makes every existing `chrome.*` call Promise-
// returning on both Firefox and Chrome with no call-site changes.
import browser from "webextension-polyfill";
if (typeof globalThis !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).chrome = browser;
}

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
