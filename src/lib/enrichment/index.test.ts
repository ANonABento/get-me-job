import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./github", () => ({
  fetchGithubEnrichment: vi.fn(),
}));
vi.mock("./news", () => ({
  fetchNewsEnrichment: vi.fn(),
}));
vi.mock("./levels", () => ({
  fetchLevelsEnrichment: vi.fn(),
}));
vi.mock("./blog", () => ({
  fetchBlogEnrichment: vi.fn(),
}));
vi.mock("./hn", () => ({
  fetchHnEnrichment: vi.fn(),
}));

import { enrichCompany } from ".";
import { fetchGithubEnrichment } from "./github";
import { fetchNewsEnrichment } from "./news";
import { fetchLevelsEnrichment } from "./levels";
import { fetchBlogEnrichment } from "./blog";
import { fetchHnEnrichment } from "./hn";

const mocks = {
  github: fetchGithubEnrichment as unknown as ReturnType<typeof vi.fn>,
  news: fetchNewsEnrichment as unknown as ReturnType<typeof vi.fn>,
  levels: fetchLevelsEnrichment as unknown as ReturnType<typeof vi.fn>,
  blog: fetchBlogEnrichment as unknown as ReturnType<typeof vi.fn>,
  hn: fetchHnEnrichment as unknown as ReturnType<typeof vi.fn>,
};

describe("enrichCompany", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("invokes all five sources in parallel and aggregates results", async () => {
    mocks.github.mockResolvedValue({ status: "ok", data: { org: "acme" } });
    mocks.news.mockResolvedValue({ status: "ok", data: { headlines: [] } });
    mocks.levels.mockResolvedValue({ status: "no_data", data: null });
    mocks.blog.mockResolvedValue({ status: "no_data", data: null });
    mocks.hn.mockResolvedValue({ status: "ok", data: { mentions: [] } });

    const result = await enrichCompany({
      company: "Acme",
      sourceUrl: "https://acme.com/jobs/1",
    });

    expect(result.company).toBe("Acme");
    expect(result.github.status).toBe("ok");
    expect(result.levels.status).toBe("no_data");
    expect(mocks.github).toHaveBeenCalledTimes(1);
    expect(mocks.news).toHaveBeenCalledWith("Acme");
  });

  it("survives a thrown error in any source", async () => {
    mocks.github.mockRejectedValue(new Error("boom"));
    mocks.news.mockResolvedValue({ status: "no_data", data: null });
    mocks.levels.mockResolvedValue({ status: "no_data", data: null });
    mocks.blog.mockResolvedValue({ status: "no_data", data: null });
    mocks.hn.mockResolvedValue({ status: "no_data", data: null });

    const result = await enrichCompany({ company: "Acme" });
    expect(result.github.status).toBe("error");
    expect(result.github.error).toContain("boom");
    expect(result.news.status).toBe("no_data");
  });

  it("uses provided githubOrg when explicit", async () => {
    Object.values(mocks).forEach((mock) =>
      mock.mockResolvedValue({ status: "no_data", data: null }),
    );
    await enrichCompany({ company: "Acme", githubOrg: "explicit-org" });
    expect(mocks.github).toHaveBeenCalledWith("explicit-org");
  });
});
