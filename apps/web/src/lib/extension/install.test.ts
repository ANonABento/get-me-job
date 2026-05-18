import { describe, expect, it } from "vitest";
import {
  EXTENSION_STORES,
  detectBrowserFromUserAgent,
  getExtensionLaunchCopy,
  getExtensionLaunchState,
  getExtensionStoresForBrowser,
} from "./install";

describe("detectBrowserFromUserAgent", () => {
  it.each([
    [
      "chrome",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ],
    [
      "edge",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    ],
    [
      "firefox",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
    ],
    [
      "safari",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    ],
    ["unknown", "curl/8.0"],
  ] as const)("detects %s", (browser, userAgent) => {
    expect(detectBrowserFromUserAgent(userAgent)).toBe(browser);
  });
});

describe("extension launch state", () => {
  it("defaults to local install when no marketplace URL is configured", () => {
    expect(getExtensionLaunchState({})).toBe("local");
    expect(getExtensionLaunchCopy("local").description).toMatch(
      /Store listings are not live/i,
    );
  });

  it("allows a launch-state feature flag to override URL inference", () => {
    expect(
      getExtensionLaunchState({
        NEXT_PUBLIC_EXTENSION_LAUNCH_STATE: "store_review",
        NEXT_PUBLIC_CHROME_EXTENSION_URL: "https://example.com/chrome",
      }),
    ).toBe("store_review");
  });
});

describe("getExtensionStoresForBrowser", () => {
  it("hides unpublished store listings", () => {
    expect(EXTENSION_STORES).toEqual([]);
    expect(getExtensionStoresForBrowser("firefox")).toEqual([]);
  });

  it("does not expose disabled marketplace URLs as install links", () => {
    const stores = getExtensionStoresForBrowser("unknown");

    for (const store of stores) {
      expect(store.url).toBeTruthy();
      expect(store.disabled).not.toBe(true);
    }
  });
});
