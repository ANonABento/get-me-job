import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildHnUrl, fetchHnEnrichment, parseHnHits } from "./hn";

const HITS = [
  {
    objectID: "1",
    title: "Acme open-sources X",
    url: "https://acme.com/blog/x",
    points: 200,
    num_comments: 50,
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    objectID: "2",
    title: null,
    url: null,
    points: 0,
    num_comments: 0,
    created_at: "2026-04-02T00:00:00Z",
  },
  {
    objectID: "3",
    title: "Acme raises Series C",
    url: null,
    points: 80,
    num_comments: 20,
    created_at: "2026-04-03T00:00:00Z",
  },
];

describe("parseHnHits", () => {
  it("filters titleless hits and builds HN urls", () => {
    const mentions = parseHnHits(HITS);
    expect(mentions).toHaveLength(2);
    expect(mentions[0]).toEqual({
      title: "Acme open-sources X",
      url: "https://acme.com/blog/x",
      hnUrl: "https://news.ycombinator.com/item?id=1",
      points: 200,
      numComments: 50,
      createdAt: "2026-04-01T00:00:00Z",
    });
    expect(mentions[1].url).toBeNull();
  });
});

describe("buildHnUrl", () => {
  it("includes a 30d numeric filter and story tag", () => {
    const url = buildHnUrl("Acme");
    expect(url).toContain("hn.algolia.com");
    expect(url).toContain("query=Acme");
    expect(url).toContain("tags=story");
    expect(url).toContain("numericFilters=created_at_i");
  });
});

describe("fetchHnEnrichment", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });
  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns ok with parsed mentions", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ hits: HITS }), { status: 200 }),
    );
    const result = await fetchHnEnrichment("Acme");
    expect(result.status).toBe("ok");
    expect(result.data?.mentions).toHaveLength(2);
  });

  it("returns no_data when no hits", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ hits: [] }), { status: 200 }),
    );
    const result = await fetchHnEnrichment("Acme");
    expect(result.status).toBe("no_data");
  });

  it("returns error on non-2xx", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 500 }));
    const result = await fetchHnEnrichment("Acme");
    expect(result.status).toBe("error");
  });

  it("captures network errors", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("dns"));
    const result = await fetchHnEnrichment("Acme");
    expect(result.status).toBe("error");
    expect(result.error).toContain("dns");
  });

  it("returns no_data for empty company", async () => {
    const result = await fetchHnEnrichment("");
    expect(result.status).toBe("no_data");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
