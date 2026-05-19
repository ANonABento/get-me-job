import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadParserV2ReviewContext } from "./parser-v2-review-context";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("loadParserV2ReviewContext", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("extracts, parses, then loads source-map context for a document", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ artifact: { id: "artifact-1" } }))
      .mockResolvedValueOnce(jsonResponse({ parseRun: { id: "run-1" } }))
      .mockResolvedValueOnce(
        jsonResponse({
          sourceText: "Jake Ryan",
          sourceRefs: [
            {
              componentId: "exp-1",
              category: "experience",
              sourceSpanIds: ["p1-l001"],
              sourceQuality: "exact",
              sourceText: ["Jake Ryan"],
            },
            {
              componentId: "bad-ref",
              category: "experience",
              sourceSpanIds: [123],
              sourceQuality: "exact",
            },
          ],
          diagnostic: {
            lineCount: 12,
            parsedRoots: {
              education: 2,
              experiences: 3,
              projects: 2,
              skills: 8,
            },
            missingRootSourceSpans: [],
            missingBulletSourceSpans: [],
            partialRootSourceSpans: [],
            partialBulletSourceSpans: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          entries: [
            {
              id: "exp-1",
              userId: "user-1",
              category: "experience",
              content: { title: "Engineer" },
              confidenceScore: 0.9,
              createdAt: "2026-05-18T10:00:00.000Z",
            },
          ],
        }),
      );

    await expect(loadParserV2ReviewContext("doc 1")).resolves.toEqual({
      status: "ready",
      artifactId: "artifact-1",
      parseRunId: "run-1",
      sourceText: "Jake Ryan",
      sourceRefs: [
        {
          componentId: "exp-1",
          category: "experience",
          sourceSpanIds: ["p1-l001"],
          sourceQuality: "exact",
          sourceText: ["Jake Ryan"],
        },
      ],
      diagnostic: expect.objectContaining({ lineCount: 12 }),
      entries: [
        {
          id: "exp-1",
          userId: "user-1",
          category: "experience",
          content: { title: "Engineer" },
          confidenceScore: 0.9,
          createdAt: "2026-05-18T10:00:00.000Z",
        },
      ],
    });

    expect(fetch).toHaveBeenNthCalledWith(1, "/api/documents/doc%201/extract", {
      method: "POST",
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/documents/doc%201/parse-runs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ artifactId: "artifact-1" }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "/api/documents/doc%201/source-map?parseRunId=run-1",
    );
    expect(fetch).toHaveBeenNthCalledWith(4, "/api/bank/imports/run-1/preview");
  });

  it("returns unavailable context when extraction fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "Failed to extract document artifact" }, 422),
    );

    await expect(loadParserV2ReviewContext("doc-1")).resolves.toEqual({
      status: "unavailable",
      error: "Failed to extract document artifact",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to source-map without parseRunId when parse response omits it", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ artifact: { id: "artifact-1" } }))
      .mockResolvedValueOnce(jsonResponse({ parseRun: {} }))
      .mockResolvedValueOnce(jsonResponse({ sourceText: "Raw text" }));

    await expect(loadParserV2ReviewContext("doc-1")).resolves.toMatchObject({
      status: "ready",
      artifactId: "artifact-1",
      sourceText: "Raw text",
      sourceRefs: [],
      diagnostic: null,
      entries: [],
    });
    expect(fetch).toHaveBeenNthCalledWith(3, "/api/documents/doc-1/source-map");
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
