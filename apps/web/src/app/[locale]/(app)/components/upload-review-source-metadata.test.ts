import { describe, expect, it } from "vitest";
import type { BankEntry } from "@/types";
import {
  compareReviewSourceOrder,
  getReviewPreviewBboxes,
  getReviewSourceState,
} from "./upload-review-source-metadata";

function entry(overrides: Partial<BankEntry>): BankEntry {
  return {
    id: overrides.id ?? "entry",
    userId: "user-1",
    category: overrides.category ?? "project",
    content: overrides.content ?? {},
    confidenceScore: 0.9,
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("upload review source metadata", () => {
  it("sorts by sourceOrder before bbox page/y/x", () => {
    const entries = [
      entry({
        id: "bbox-first",
        sourceOrder: 2,
        sourceBbox: [[1, 10, 10, 20, 20]],
      }),
      entry({
        id: "source-first",
        sourceOrder: 1,
        sourceBbox: [[3, 10, 300, 20, 320]],
      }),
    ].sort(compareReviewSourceOrder);

    expect(entries.map((item) => item.id)).toEqual([
      "source-first",
      "bbox-first",
    ]);
  });

  it("falls back to sourceHeaderBbox, then sourceBbox ordering", () => {
    const entries = [
      entry({
        id: "source-bbox",
        sourceBbox: [[1, 10, 50, 20, 60]],
      }),
      entry({
        id: "header-bbox",
        sourceHeaderBbox: [[1, 10, 40, 20, 50]],
        sourceBbox: [[1, 10, 80, 20, 90]],
      }),
    ].sort(compareReviewSourceOrder);

    expect(entries.map((item) => item.id)).toEqual([
      "header-bbox",
      "source-bbox",
    ]);
  });

  it("uses sourceHeaderBbox for root preview and sourceBbox for bullets", () => {
    const root = entry({
      sourceHeaderBbox: [[1, 1, 2, 3, 4]],
      sourceBbox: [[1, 10, 20, 30, 40]],
    });
    const bullet = entry({
      category: "bullet",
      sourceHeaderBbox: [[1, 1, 2, 3, 4]],
      sourceBbox: [[1, 10, 20, 30, 40]],
    });

    expect(getReviewPreviewBboxes(root, true)).toEqual([[1, 1, 2, 3, 4]]);
    expect(getReviewPreviewBboxes(bullet, false)).toEqual([
      [1, 10, 20, 30, 40],
    ]);
  });

  it("reports compact source availability states", () => {
    expect(
      getReviewSourceState(
        entry({ sourceHeaderBbox: [[1, 1, 2, 3, 4]] }),
        true,
      ),
    ).toBe("located");
    expect(
      getReviewSourceState(entry({ sourceBbox: [[1, 1, 2, 3, 4]] }), true),
    ).toBe("partially located");
    expect(getReviewSourceState(entry({}), true)).toBe("not located");
  });
});
