import { describe, expect, it, vi } from "vitest";

import { extractDocumentSourceMap } from "./extract-document";

vi.mock("@/lib/parse/pdf-positions", () => ({
  extractPdfPositions: vi.fn(async () => ({
    items: [
      {
        text: "Kevin Jiang Portfolio",
        page: 1,
        x0: 72,
        y0: 48,
        x1: 180,
        y1: 60,
      },
    ],
    links: [
      {
        url: "https://example.com/portfolio",
        page: 1,
        x0: 72,
        y0: 48,
        x1: 180,
        y1: 60,
      },
    ],
    pageDimensions: [{ page: 1, width: 612, height: 792 }],
  })),
}));

describe("extractDocumentSourceMap", () => {
  it("preserves PDF link annotations on parser-v2 artifacts", async () => {
    const result = await extractDocumentSourceMap({
      buffer: Buffer.from("%PDF"),
      filename: "resume.pdf",
      mimeType: "application/pdf",
    });

    expect(result.sourceMap.rawText).toBe("Kevin Jiang Portfolio");
    expect(result.sourceMap.links).toEqual([
      {
        url: "https://example.com/portfolio",
        page: 1,
        bbox: [1, 72, 48, 180, 60],
      },
    ]);
    expect(result.links).toEqual([
      {
        url: "https://example.com/portfolio",
        page: 1,
        bbox: [1, 72, 48, 180, 60],
      },
    ]);
  });
});
