import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => ({
  default: { prepare: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => "enrich-id",
}));

import db from "./schema";
import {
  getCompanyEnrichment,
  isEnrichmentFresh,
  saveCompanyEnrichment,
} from "./company-enrichment";

const sampleEnrichment = {
  company: "Acme",
  github: { status: "no_data" as const, data: null },
  news: { status: "no_data" as const, data: null },
  levels: { status: "no_data" as const, data: null },
  blog: { status: "no_data" as const, data: null },
  hn: { status: "no_data" as const, data: null },
};

describe("company enrichment DB", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes company name when fetching", () => {
    const mockGet = vi.fn().mockReturnValue({
      id: "row-id",
      user_id: "u-1",
      company_name: "acme",
      enrichment_json: JSON.stringify(sampleEnrichment),
      enriched_at: "2026-05-04T12:00:00.000Z",
    });
    (db.prepare as Mock).mockReturnValue({ get: mockGet });

    const result = getCompanyEnrichment(" Acme ", "u-1");

    expect(db.prepare).toHaveBeenCalledWith(
      "SELECT * FROM company_enrichment WHERE user_id = ? AND LOWER(company_name) = ?",
    );
    expect(mockGet).toHaveBeenCalledWith("u-1", "acme");
    expect(result?.companyName).toBe("acme");
    expect(result?.enrichment.company).toBe("Acme");
  });

  it("returns null when no row found", () => {
    (db.prepare as Mock).mockReturnValue({ get: vi.fn().mockReturnValue(undefined) });
    expect(getCompanyEnrichment("missing", "u-1")).toBeNull();
  });

  it("upserts on save and returns the persisted row", () => {
    const mockRun = vi.fn();
    const mockGet = vi.fn().mockReturnValue({
      id: "row-id",
      user_id: "u-1",
      company_name: "acme",
      enrichment_json: JSON.stringify(sampleEnrichment),
      enriched_at: "2026-05-04T12:00:00.000Z",
    });
    (db.prepare as Mock).mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO company_enrichment")) {
        return { run: mockRun };
      }
      return { get: mockGet };
    });

    const saved = saveCompanyEnrichment("Acme", sampleEnrichment, "u-1");
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun.mock.calls[0].slice(0, 3)).toEqual(["enrich-id", "u-1", "acme"]);
    expect(saved.companyName).toBe("acme");
  });

  it("considers enrichment fresh inside the TTL", () => {
    const now = new Date("2026-05-04T12:00:00.000Z");
    const recent = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    expect(isEnrichmentFresh(recent, undefined, now)).toBe(true);
  });

  it("considers enrichment stale outside the TTL", () => {
    const now = new Date("2026-05-04T12:00:00.000Z");
    const old = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
    expect(isEnrichmentFresh(old, undefined, now)).toBe(false);
  });

  it("returns false for unparseable timestamps", () => {
    expect(isEnrichmentFresh("not-a-date")).toBe(false);
  });
});
