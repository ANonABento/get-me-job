import { describe, expect, it } from "vitest";
import type { Opportunity } from "@/types/opportunity";
import { getSortOption, sortOpportunities, SORT_OPTIONS } from "./sort";

function makeJob(overrides: Partial<Opportunity>): Opportunity {
  return {
    id: overrides.id ?? "opp-1",
    type: "job",
    title: "Senior Engineer",
    company: "Acme",
    source: "manual",
    summary: "",
    status: "saved",
    tags: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("sortOpportunities", () => {
  it("most-recent puts newest createdAt first", () => {
    const list = [
      makeJob({ id: "a", createdAt: "2026-01-01T00:00:00Z" }),
      makeJob({ id: "b", createdAt: "2026-03-01T00:00:00Z" }),
      makeJob({ id: "c", createdAt: "2026-02-01T00:00:00Z" }),
    ];
    expect(sortOpportunities(list, "most-recent").map((o) => o.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("soonest-deadline puts soonest first, undefined deadlines last", () => {
    const list = [
      makeJob({ id: "no-deadline" }),
      makeJob({ id: "late", deadline: "2026-12-01T00:00:00Z" }),
      makeJob({ id: "soon", deadline: "2026-06-01T00:00:00Z" }),
    ];
    expect(
      sortOpportunities(list, "soonest-deadline").map((o) => o.id),
    ).toEqual(["soon", "late", "no-deadline"]);
  });

  it("highest-pay uses midpoint when both bounds present", () => {
    const list = [
      makeJob({ id: "low", salaryMin: 50_000, salaryMax: 60_000 }),
      makeJob({ id: "high", salaryMin: 100_000, salaryMax: 140_000 }),
      makeJob({ id: "mid", salaryMin: 80_000, salaryMax: 90_000 }),
      makeJob({ id: "no-salary" }),
    ];
    expect(sortOpportunities(list, "highest-pay").map((o) => o.id)).toEqual([
      "high", // midpoint 120k
      "mid", // midpoint 85k
      "low", // midpoint 55k
      "no-salary",
    ]);
  });

  it("highest-pay converts currencies before comparing when ctx provides rates", () => {
    // CAD 130k/yr * 0.735 ≈ 95.5k USD — lower than the USD 100k posting
    // even though the raw CAD number is bigger.
    const rates = {
      USD: { CAD: 1.36, USD: 1 },
      CAD: { USD: 0.735, CAD: 1 },
    };
    const list = [
      makeJob({
        id: "cad-130k",
        inferredPayUnit: "annual",
        inferredPayMin: 130_000,
        inferredPayCurrency: "CAD",
      }),
      makeJob({
        id: "usd-100k",
        inferredPayUnit: "annual",
        inferredPayMin: 100_000,
        inferredPayCurrency: "USD",
      }),
    ];
    expect(
      sortOpportunities(list, "highest-pay", {
        payTargetCurrency: "USD",
        currencyRates: rates,
      }).map((o) => o.id),
    ).toEqual(["usd-100k", "cad-130k"]);
  });

  it("highest-pay normalizes hourly via 2080 hr/yr when inferred fields present", () => {
    // "$60/hr" → 124.8k/yr should outrank a $100k/yr annual posting.
    const list = [
      makeJob({
        id: "annual-100k",
        inferredPayUnit: "annual",
        inferredPayMin: 100_000,
        inferredPayCurrency: "USD",
      }),
      makeJob({
        id: "hourly-60",
        inferredPayUnit: "hourly",
        inferredPayMin: 60,
        inferredPayCurrency: "USD",
      }),
      makeJob({
        id: "monthly-7k",
        inferredPayUnit: "monthly",
        inferredPayMin: 7_000,
        inferredPayCurrency: "USD",
      }),
    ];
    expect(sortOpportunities(list, "highest-pay").map((o) => o.id)).toEqual([
      "hourly-60", // 124,800/yr
      "annual-100k", // 100,000/yr
      "monthly-7k", // 84,000/yr
    ]);
  });

  it("lowest-pay is the inverse and still puts no-salary last", () => {
    const list = [
      makeJob({ id: "high", salaryMin: 100_000 }),
      makeJob({ id: "no-salary" }),
      makeJob({ id: "low", salaryMin: 50_000 }),
    ];
    expect(sortOpportunities(list, "lowest-pay").map((o) => o.id)).toEqual([
      "low",
      "high",
      "no-salary",
    ]);
  });

  it("lowest-applicants ranks by applicant count ascending", () => {
    const list = [
      makeJob({ id: "popular", applicants: 200 }),
      makeJob({ id: "gem", applicants: 8 }),
      makeJob({ id: "unknown" }),
      makeJob({ id: "medium", applicants: 60 }),
    ];
    expect(
      sortOpportunities(list, "lowest-applicants").map((o) => o.id),
    ).toEqual(["gem", "medium", "popular", "unknown"]);
  });

  it("best-applicant-ratio: 50 applicants / 5 openings beats 50 / 1", () => {
    const list = [
      makeJob({ id: "tight", applicants: 50, openings: 1 }), // ratio 50
      makeJob({ id: "spacious", applicants: 50, openings: 5 }), // ratio 10
      makeJob({ id: "tiny", applicants: 3, openings: 1 }), // ratio 3
      makeJob({ id: "no-applicants", openings: 10 }),
    ];
    expect(
      sortOpportunities(list, "best-applicant-ratio").map((o) => o.id),
    ).toEqual(["tiny", "spacious", "tight", "no-applicants"]);
  });

  it("treats missing openings as 1 for applicant-ratio", () => {
    const list = [
      makeJob({ id: "explicit", applicants: 10, openings: 1 }),
      makeJob({ id: "implicit", applicants: 10 }),
    ];
    // Both should have the same ratio of 10 and tie — stable sort keeps
    // their original order (explicit, implicit).
    expect(
      sortOpportunities(list, "best-applicant-ratio").map((o) => o.id),
    ).toEqual(["explicit", "implicit"]);
  });

  it("ai-recommended falls back to most-recent when no scores are provided", () => {
    const list = [
      makeJob({ id: "old", createdAt: "2026-01-01T00:00:00Z" }),
      makeJob({ id: "new", createdAt: "2026-06-01T00:00:00Z" }),
    ];
    expect(sortOpportunities(list, "ai-recommended").map((o) => o.id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("ai-recommended ranks by score desc when scores are provided", () => {
    const list = [
      makeJob({ id: "low-fit" }),
      makeJob({ id: "best-fit" }),
      makeJob({ id: "no-score" }),
    ];
    const sorted = sortOpportunities(list, "ai-recommended", {
      recommendationScores: { "low-fit": 0.2, "best-fit": 0.95 },
    });
    expect(sorted.map((o) => o.id)).toEqual([
      "best-fit",
      "low-fit",
      "no-score",
    ]);
  });

  it("closest-to-location falls back when userLocation is missing", () => {
    const list = [
      makeJob({ id: "old", createdAt: "2026-01-01T00:00:00Z" }),
      makeJob({ id: "new", createdAt: "2026-06-01T00:00:00Z" }),
    ];
    // No userLocation in ctx → falls back to most-recent.
    expect(
      sortOpportunities(list, "closest-to-location").map((o) => o.id),
    ).toEqual(["new", "old"]);
  });

  it("returns a new array, never mutates input", () => {
    const list = [makeJob({ id: "a" }), makeJob({ id: "b" })];
    const beforeIds = list.map((o) => o.id);
    sortOpportunities(list, "most-recent");
    expect(list.map((o) => o.id)).toEqual(beforeIds);
  });

  it("unknown sort id falls back to most-recent", () => {
    const list = [
      makeJob({ id: "old", createdAt: "2026-01-01T00:00:00Z" }),
      makeJob({ id: "new", createdAt: "2026-06-01T00:00:00Z" }),
    ];
    // Cast through unknown so we can exercise the runtime fallback path
    // without losing the type contract elsewhere.
    expect(
      sortOpportunities(list, "not-a-real-sort" as unknown as never).map(
        (o) => o.id,
      ),
    ).toEqual(["new", "old"]);
  });
});

describe("SORT_OPTIONS", () => {
  it("flags ai-recommended + closest-to-location as unavailable by default", () => {
    expect(getSortOption("ai-recommended")?.isAvailable({})).toBe(false);
    expect(getSortOption("closest-to-location")?.isAvailable({})).toBe(false);
  });

  it("exposes every OPPORTUNITY_SORT_IDS member exactly once", () => {
    const ids = SORT_OPTIONS.map((opt) => opt.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
