import { describe, expect, it } from "vitest";

import { resolveSourceSpanIds } from "./source-spans";
import type { DocumentSourceMap } from "./types";

function sourceMap(): DocumentSourceMap {
  return {
    pages: [{ page: 1, width: 612, height: 792, lineIds: ["p1-l001"] }],
    rawText: "Jake Ryan",
    lines: [
      {
        id: "p1-l001",
        page: 1,
        text: "Jake Ryan",
        tokenIds: ["p1-l001-t001"],
        bbox: { page: 1, x0: 10, y0: 20, x1: 100, y1: 32 },
        tokens: [
          {
            id: "p1-l001-t001",
            page: 1,
            lineId: "p1-l001",
            text: "Jake",
            bbox: { page: 1, x0: 10, y0: 20, x1: 40, y1: 32 },
          },
        ],
      },
    ],
  };
}

describe("resolveSourceSpanIds", () => {
  it("resolves line and token source ids to text and bboxes", () => {
    const resolved = resolveSourceSpanIds(sourceMap(), [
      "p1-l001",
      "p1-l001-t001",
    ]);

    expect(resolved.sourceQuality).toBe("exact");
    expect(resolved.missingIds).toEqual([]);
    expect(resolved.spans).toMatchObject([
      {
        id: "p1-l001",
        text: "Jake Ryan",
        bbox: { page: 1, x0: 10, y0: 20, x1: 100, y1: 32 },
        tokenIds: ["p1-l001-t001"],
      },
      {
        id: "p1-l001-t001",
        text: "Jake",
        bbox: { page: 1, x0: 10, y0: 20, x1: 40, y1: 32 },
        tokenIds: ["p1-l001-t001"],
      },
    ]);
  });

  it("classifies partial and missing source ids", () => {
    expect(
      resolveSourceSpanIds(sourceMap(), ["p1-l001", "missing"]).sourceQuality,
    ).toBe("partial");
    expect(resolveSourceSpanIds(sourceMap(), ["missing"]).sourceQuality).toBe(
      "missing",
    );
  });
});
