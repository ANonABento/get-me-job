import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGithubEnrichment, parseGithubRepos } from "./github";

const SAMPLE_REPOS = [
  {
    name: "alpha",
    html_url: "https://github.com/acme/alpha",
    description: "alpha repo",
    stargazers_count: 1200,
    language: "TypeScript",
    pushed_at: "2026-04-01T00:00:00Z",
    fork: false,
    archived: false,
  },
  {
    name: "beta",
    html_url: "https://github.com/acme/beta",
    description: null,
    stargazers_count: 300,
    language: "Go",
    pushed_at: "2026-03-15T00:00:00Z",
    fork: false,
    archived: false,
  },
  {
    name: "fork-of-something",
    html_url: "https://github.com/acme/fork-of-something",
    description: null,
    stargazers_count: 9999,
    language: "TypeScript",
    pushed_at: "2026-04-10T00:00:00Z",
    fork: true,
    archived: false,
  },
];

describe("parseGithubRepos", () => {
  it("ignores forks/archived and aggregates active repos", () => {
    const result = parseGithubRepos(SAMPLE_REPOS);

    expect(result.publicRepoCount).toBe(2);
    expect(result.totalStars).toBe(1500);
    expect(result.topLanguages[0]).toBe("TypeScript");
    expect(result.topRepos.map((r) => r.name)).toEqual(["alpha", "beta"]);
    expect(result.recentActivityAt).toBe("2026-04-01T00:00:00Z");
  });

  it("returns empty stats when no active repos exist", () => {
    const result = parseGithubRepos([
      { ...SAMPLE_REPOS[0], fork: true },
    ]);
    expect(result.publicRepoCount).toBe(0);
    expect(result.totalStars).toBe(0);
    expect(result.topRepos).toEqual([]);
    expect(result.recentActivityAt).toBeNull();
  });
});

describe("fetchGithubEnrichment", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns ok with parsed data", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(SAMPLE_REPOS), { status: 200 }),
    );

    const result = await fetchGithubEnrichment("acme");

    expect(result.status).toBe("ok");
    expect(result.data?.org).toBe("acme");
    expect(result.data?.url).toBe("https://github.com/acme");
    expect(result.data?.publicRepoCount).toBe(2);
  });

  it("treats 404 as no_data", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 404 }));
    const result = await fetchGithubEnrichment("missing");
    expect(result.status).toBe("no_data");
    expect(result.data).toBeNull();
  });

  it("returns error when API responds non-2xx", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    const result = await fetchGithubEnrichment("acme");
    expect(result.status).toBe("error");
    expect(result.error).toContain("500");
  });

  it("returns no_data for empty repo list", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("[]", { status: 200 }),
    );
    const result = await fetchGithubEnrichment("empty");
    expect(result.status).toBe("no_data");
  });

  it("returns no_data for empty org slug", async () => {
    const result = await fetchGithubEnrichment("");
    expect(result.status).toBe("no_data");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("captures network errors", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("ECONNRESET"));
    const result = await fetchGithubEnrichment("acme");
    expect(result.status).toBe("error");
    expect(result.error).toContain("ECONNRESET");
  });
});
