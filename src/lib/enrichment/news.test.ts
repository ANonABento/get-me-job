import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildGoogleNewsUrl, fetchNewsEnrichment, parseNewsRss } from "./news";

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Acme launches a thing]]></title>
      <link>https://news.example.com/acme-launches</link>
      <pubDate>Mon, 04 May 2026 12:00:00 GMT</pubDate>
      <source url="https://example.com">Example News</source>
    </item>
    <item>
      <title>Acme hires CFO</title>
      <link>https://news.example.com/acme-cfo</link>
      <pubDate>Tue, 05 May 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("parseNewsRss", () => {
  it("parses item titles, links, sources, and dates", () => {
    const headlines = parseNewsRss(SAMPLE_RSS);
    expect(headlines).toHaveLength(2);

    expect(headlines[0]).toEqual({
      title: "Acme launches a thing",
      link: "https://news.example.com/acme-launches",
      source: "Example News",
      publishedAt: new Date("Mon, 04 May 2026 12:00:00 GMT").toISOString(),
    });
    expect(headlines[1].source).toBeNull();
  });

  it("skips items missing title or link", () => {
    const xml = `<rss><channel><item><title>only title</title></item></channel></rss>`;
    expect(parseNewsRss(xml)).toEqual([]);
  });

  it("returns null publishedAt for unparseable pubDate without dropping the item", () => {
    const xml = `
      <rss><channel>
        <item>
          <title>Acme thing</title>
          <link>https://news.example.com/x</link>
          <pubDate>not-a-real-date</pubDate>
        </item>
      </channel></rss>
    `;
    const headlines = parseNewsRss(xml);
    expect(headlines).toHaveLength(1);
    expect(headlines[0].publishedAt).toBeNull();
  });

  it("caps headlines at 5", () => {
    const items = Array.from({ length: 8 }, (_, index) =>
      `<item><title>Headline ${index}</title><link>https://x.test/${index}</link></item>`,
    ).join("");
    const headlines = parseNewsRss(`<rss><channel>${items}</channel></rss>`);
    expect(headlines).toHaveLength(5);
  });
});

describe("buildGoogleNewsUrl", () => {
  it("encodes the company name and 7d window", () => {
    const url = buildGoogleNewsUrl("Acme & Co");
    expect(url).toContain("news.google.com");
    expect(url).toContain(encodeURIComponent("Acme & Co when:7d"));
  });
});

describe("fetchNewsEnrichment", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });
  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns ok when RSS contains items", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(SAMPLE_RSS, { status: 200 }));
    const result = await fetchNewsEnrichment("Acme");
    expect(result.status).toBe("ok");
    expect(result.data?.headlines).toHaveLength(2);
  });

  it("returns no_data when RSS has no items", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("<rss><channel></channel></rss>", { status: 200 }),
    );
    const result = await fetchNewsEnrichment("Acme");
    expect(result.status).toBe("no_data");
  });

  it("returns error on non-2xx response", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 503 }));
    const result = await fetchNewsEnrichment("Acme");
    expect(result.status).toBe("error");
  });

  it("captures network failure", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("blocked"));
    const result = await fetchNewsEnrichment("Acme");
    expect(result.status).toBe("error");
    expect(result.error).toContain("blocked");
  });
});
