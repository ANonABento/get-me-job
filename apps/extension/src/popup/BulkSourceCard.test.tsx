// @vitest-environment jsdom
//
// P3/#39 — Unit tests for the generic <BulkSourceCard>. We render with
// react-dom/client + act() (matching the rest of the extension's React-in-jsdom
// patterns; no @testing-library/react dependency required) and inspect the
// rendered DOM directly.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { BulkSourceCard } from "./BulkSourceCard";

// Enable React 18+ act() in jsdom (silences the "current testing environment
// is not configured to support act(...)" warning).
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(node: React.ReactElement) {
  act(() => {
    root.render(node);
  });
}

describe("BulkSourceCard", () => {
  it("renders the source label and pluralised row count", () => {
    render(
      <BulkSourceCard
        sourceLabel="Greenhouse"
        detectedCount={23}
        busy={null}
        lastResult={null}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );
    expect(container.querySelector(".card-title")?.textContent).toBe(
      "Greenhouse",
    );
    expect(container.querySelector(".badge")?.textContent?.trim()).toBe(
      "23 rows",
    );
  });

  it("uses the singular form when there is exactly one row", () => {
    render(
      <BulkSourceCard
        sourceLabel="Lever"
        detectedCount={1}
        busy={null}
        lastResult={null}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );
    expect(container.querySelector(".badge")?.textContent?.trim()).toBe(
      "1 row",
    );
  });

  it("disables both buttons when detectedCount is 0", () => {
    render(
      <BulkSourceCard
        sourceLabel="Workday"
        detectedCount={0}
        busy={null}
        lastResult={null}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it("disables both buttons while a scrape is in flight", () => {
    render(
      <BulkSourceCard
        sourceLabel="Greenhouse"
        detectedCount={10}
        busy="visible"
        lastResult={null}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[0].textContent).toContain("Scraping visible");
  });

  it("calls onScrapeVisible when the primary button is clicked", () => {
    const onScrapeVisible = vi.fn();
    render(
      <BulkSourceCard
        sourceLabel="Lever"
        detectedCount={5}
        busy={null}
        lastResult={null}
        lastError={null}
        onScrapeVisible={onScrapeVisible}
        onScrapePaginated={vi.fn()}
      />,
    );
    const primary = container.querySelector<HTMLButtonElement>(".btn.primary");
    expect(primary?.textContent).toContain("Scrape 5 visible");
    act(() => {
      primary?.click();
    });
    expect(onScrapeVisible).toHaveBeenCalledTimes(1);
  });

  it("calls onScrapePaginated when the secondary button is clicked", () => {
    const onScrapePaginated = vi.fn();
    render(
      <BulkSourceCard
        sourceLabel="Workday"
        detectedCount={5}
        busy={null}
        lastResult={null}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={onScrapePaginated}
      />,
    );
    const secondary = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => b.textContent?.includes("Scrape all"));
    expect(secondary).toBeDefined();
    act(() => {
      secondary?.click();
    });
    expect(onScrapePaginated).toHaveBeenCalledTimes(1);
  });

  it("renders the imported/attempted summary and the View tracker link", () => {
    const onViewTracker = vi.fn();
    render(
      <BulkSourceCard
        sourceLabel="Greenhouse"
        detectedCount={10}
        busy={null}
        lastResult={{
          imported: 7,
          attempted: 10,
          pages: 2,
          errors: ["row 3: missing title"],
        }}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
        onViewTracker={onViewTracker}
      />,
    );
    const note = container.querySelector(".inline-note");
    expect(note?.textContent).toContain("Imported 7/10");
    expect(note?.textContent).toContain("2 pages");
    expect(note?.textContent).toContain("1 errors");
    const link = container.querySelector<HTMLButtonElement>(".success-link");
    expect(link?.textContent).toContain("View tracker");
    act(() => {
      link?.click();
    });
    expect(onViewTracker).toHaveBeenCalledTimes(1);
  });

  it("renders duplicate counts and deduped row identities when present", () => {
    render(
      <BulkSourceCard
        sourceLabel="Greenhouse"
        detectedCount={3}
        busy={null}
        lastResult={{
          imported: 2,
          attempted: 3,
          pages: 1,
          duplicateCount: 1,
          dedupedIds: ["gh-duplicate-1"],
          errors: [],
        }}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );

    const note = container.querySelector(".inline-note");
    expect(note?.textContent).toContain("Imported 2/3");
    expect(note?.textContent).toContain("1 duplicates");
    expect(container.querySelector(".bulk-duplicates")?.textContent).toContain(
      "gh-duplicate-1",
    );
  });

  it("renders the error message when lastError is set", () => {
    render(
      <BulkSourceCard
        sourceLabel="Greenhouse"
        detectedCount={10}
        busy={null}
        lastResult={null}
        lastError="Network failure"
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
      />,
    );
    expect(container.querySelector(".inline-error")?.textContent).toBe(
      "Network failure",
    );
  });

  it("does not render the View tracker link when imported is 0", () => {
    render(
      <BulkSourceCard
        sourceLabel="Lever"
        detectedCount={10}
        busy={null}
        lastResult={{ imported: 0, attempted: 10, pages: 1, errors: [] }}
        lastError={null}
        onScrapeVisible={vi.fn()}
        onScrapePaginated={vi.fn()}
        onViewTracker={vi.fn()}
      />,
    );
    expect(container.querySelector(".success-link")).toBeNull();
  });
});
