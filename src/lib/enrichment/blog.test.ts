import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractBlogCandidates,
  extractFirstParagraph,
  fetchBlogEnrichment,
} from "./blog";

const LISTING_HTML = `
<html>
  <body>
    <a href="/blog/intro-to-rust-2026-04-01">Intro to Rust at Acme</a>
    <a href="/about">About</a>
    <a href="/blog/scaling-postgres-2026-03-22">Scaling Postgres at Acme</a>
    <a href="/blog/another-post-2026-02-01">Another deep dive about caching</a>
    <a href="/blog/short">Short</a>
  </body>
</html>
`;

describe("extractBlogCandidates", () => {
  it("returns up to 3 unique slug-like absolute URLs", () => {
    const posts = extractBlogCandidates(LISTING_HTML, "https://acme.com/blog");
    expect(posts).toHaveLength(3);
    expect(posts.map((p) => p.title)).toEqual([
      "Intro to Rust at Acme",
      "Scaling Postgres at Acme",
      "Another deep dive about caching",
    ]);
    expect(posts[0].url).toBe(
      "https://acme.com/blog/intro-to-rust-2026-04-01",
    );
  });

  it("skips cross-domain anchors", () => {
    const html = `<a href="https://other.com/blog/foo-bar-baz-qux">Other Co</a>`;
    expect(extractBlogCandidates(html, "https://acme.com/blog")).toEqual([]);
  });
});

describe("extractFirstParagraph", () => {
  it("returns the inner text of the first <p>", () => {
    const html = `<article><h1>Title</h1><p>This is <em>the</em> first paragraph.</p><p>second</p></article>`;
    expect(extractFirstParagraph(html)).toBe("This is the first paragraph.");
  });

  it("truncates very long paragraphs", () => {
    const long = "x".repeat(500);
    const html = `<p>${long}</p>`;
    const out = extractFirstParagraph(html);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThan(long.length);
  });

  it("returns empty string when no paragraph exists", () => {
    expect(extractFirstParagraph("<div>no paragraphs</div>")).toBe("");
  });
});

describe("fetchBlogEnrichment", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });
  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns no_data when no source URL is provided", async () => {
    const result = await fetchBlogEnrichment(null);
    expect(result.status).toBe("no_data");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("aggregates posts from a /blog index", async () => {
    fetchSpy.mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === "https://acme.com/blog") {
        return new Response(LISTING_HTML, { status: 200 });
      }
      if (url.startsWith("https://acme.com/blog/")) {
        return new Response(`<p>Excerpt for ${url}</p>`, { status: 200 });
      }
      return new Response("", { status: 404 });
    });

    const result = await fetchBlogEnrichment("https://acme.com/careers");
    expect(result.status).toBe("ok");
    expect(result.data?.posts.length).toBeGreaterThan(0);
    expect(result.data?.posts[0].excerpt).toContain("Excerpt for");
  });

  it("returns no_data when listing page has no candidates", async () => {
    fetchSpy.mockImplementation(async () =>
      new Response("<html><body>no posts</body></html>", { status: 200 }),
    );
    const result = await fetchBlogEnrichment("https://acme.com/careers");
    expect(result.status).toBe("no_data");
  });

  it("returns error when blog endpoint fails", async () => {
    fetchSpy.mockImplementation(async () => new Response("", { status: 500 }));
    const result = await fetchBlogEnrichment("https://acme.com");
    expect(result.status).toBe("error");
  });
});
