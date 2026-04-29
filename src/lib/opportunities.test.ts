import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateOpportunityInput, Opportunity } from "@/types/opportunity";

const mocks = vi.hoisted(() => ({
  generateId: vi.fn(() => "opportunity-1"),
}));

vi.mock("@/lib/utils", () => ({
  generateId: mocks.generateId,
}));

import {
  changeOpportunityStatus,
  clearOpportunitiesForUser,
  createOpportunity,
  deleteOpportunity,
  filterOpportunities,
  getOpportunity,
  listOpportunities,
  OPPORTUNITIES_STORAGE_KEY,
  parseOpportunityFilters,
  updateOpportunity,
  type OpportunityClock,
  type OpportunityStorage,
} from "./opportunities";

function createMemoryStorage(): OpportunityStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

const fixedClock: OpportunityClock = {
  now: () => new Date("2026-04-29T12:00:00.000Z"),
};

function validOpportunity(
  overrides: Partial<CreateOpportunityInput> = {}
): CreateOpportunityInput {
  return {
    type: "job",
    title: "Frontend Engineer",
    company: "Acme",
    source: "manual",
    summary: "Build customer-facing React and TypeScript interfaces.",
    ...overrides,
  };
}

function storedOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opportunity-1",
    type: "job",
    title: "Frontend Engineer",
    company: "Acme",
    source: "manual",
    summary: "Build React interfaces.",
    status: "pending",
    tags: ["frontend"],
    createdAt: "2026-04-29T12:00:00.000Z",
    updatedAt: "2026-04-29T12:00:00.000Z",
    ...overrides,
  };
}

describe("opportunity repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateId.mockReturnValue("opportunity-1");
  });

  it("creates opportunities with defaults and user-scoped local storage", () => {
    const storage = createMemoryStorage();

    const opportunity = createOpportunity(
      validOpportunity(),
      "user-1",
      storage,
      fixedClock
    );

    expect(opportunity).toEqual({
      id: "opportunity-1",
      type: "job",
      title: "Frontend Engineer",
      company: "Acme",
      source: "manual",
      summary: "Build customer-facing React and TypeScript interfaces.",
      status: "pending",
      tags: [],
      createdAt: "2026-04-29T12:00:00.000Z",
      updatedAt: "2026-04-29T12:00:00.000Z",
    });
    expect(listOpportunities("user-1", {}, storage)).toEqual([opportunity]);
    expect(listOpportunities("user-2", {}, storage)).toEqual([]);
  });

  it("records status timestamps when an opportunity is saved or applied", () => {
    const storage = createMemoryStorage();
    const saved = createOpportunity(
      validOpportunity({ status: "saved" }),
      "user-1",
      storage,
      fixedClock
    );

    expect(saved.savedAt).toBe("2026-04-29T12:00:00.000Z");

    const applied = changeOpportunityStatus(
      saved.id,
      "applied",
      "user-1",
      storage,
      fixedClock
    );

    expect(applied?.appliedAt).toBe("2026-04-29T12:00:00.000Z");
    expect(applied?.savedAt).toBe("2026-04-29T12:00:00.000Z");
  });

  it("updates an existing opportunity without changing its created timestamp", () => {
    const storage = createMemoryStorage();
    const opportunity = createOpportunity(
      validOpportunity(),
      "user-1",
      storage,
      fixedClock
    );

    const nextClock: OpportunityClock = {
      now: () => new Date("2026-04-30T09:15:00.000Z"),
    };
    const updated = changeOpportunityStatus(
      opportunity.id,
      "interviewing",
      "user-1",
      storage,
      nextClock
    );

    expect(updated).toMatchObject({
      id: opportunity.id,
      status: "interviewing",
      createdAt: "2026-04-29T12:00:00.000Z",
      updatedAt: "2026-04-30T09:15:00.000Z",
    });
  });

  it("deletes opportunities and reports missing records", () => {
    const storage = createMemoryStorage();
    const opportunity = createOpportunity(
      validOpportunity(),
      "user-1",
      storage,
      fixedClock
    );

    expect(deleteOpportunity("missing", "user-1", storage)).toBe(false);
    expect(deleteOpportunity(opportunity.id, "user-1", storage)).toBe(true);
    expect(getOpportunity(opportunity.id, "user-1", storage)).toBeNull();
  });

  it("validates salary ranges after partial updates are merged", () => {
    const storage = createMemoryStorage();
    const opportunity = createOpportunity(
      validOpportunity({ salaryMax: 100_000 }),
      "user-1",
      storage,
      fixedClock
    );

    expect(() =>
      updateOpportunity(
        opportunity.id,
        { salaryMin: 120_000 },
        "user-1",
        storage,
        fixedClock
      )
    ).toThrow("Minimum salary must be less than or equal to maximum salary");

    const stored = getOpportunity(opportunity.id, "user-1", storage);
    expect(stored?.salaryMax).toBe(100_000);
    expect(stored?.salaryMin).toBeUndefined();
  });

  it("filters out malformed stored records instead of returning invalid data", () => {
    const storage = createMemoryStorage();
    const valid = storedOpportunity();
    storage.setItem(
      `${OPPORTUNITIES_STORAGE_KEY}:user-1`,
      JSON.stringify([
        valid,
        {
          id: "bad-record",
          title: "Missing required fields",
        },
      ])
    );

    expect(listOpportunities("user-1", {}, storage)).toEqual([valid]);
  });

  it("clears opportunities for a single user", () => {
    const storage = createMemoryStorage();
    createOpportunity(validOpportunity(), "user-1", storage, fixedClock);
    createOpportunity(validOpportunity(), "user-2", storage, fixedClock);

    clearOpportunitiesForUser("user-1", storage);

    expect(listOpportunities("user-1", {}, storage)).toEqual([]);
    expect(listOpportunities("user-2", {}, storage)).toHaveLength(1);
  });

  it("filters by type, status, source, tags, and full-text search", () => {
    const opportunities = [
      storedOpportunity({
        id: "job-1",
        type: "job",
        title: "Frontend Engineer",
        company: "Acme",
        source: "linkedin",
        status: "saved",
        tags: ["React", "Remote"],
        summary: "Build dashboards with TypeScript.",
      }),
      storedOpportunity({
        id: "hackathon-1",
        type: "hackathon",
        title: "AI Builder Sprint",
        company: "DevPost",
        source: "devpost",
        status: "pending",
        tags: ["AI"],
        summary: "Prototype an agent workflow.",
      }),
    ];

    expect(
      filterOpportunities(opportunities, {
        type: "job",
        status: "saved",
        source: "linkedin",
        tags: ["remote"],
        search: "typescript",
      })
    ).toEqual([opportunities[0]]);
    expect(filterOpportunities(opportunities, { search: "devpost" })).toEqual([
      opportunities[1],
    ]);
  });

  it("parses query filters and validates enum values", () => {
    expect(
      parseOpportunityFilters(
        new URLSearchParams(
          "type=job&status=saved&source=manual&tags=react,remote&q=acme"
        )
      )
    ).toEqual({
      type: "job",
      status: "saved",
      source: "manual",
      tags: ["react", "remote"],
      search: "acme",
    });

    expect(() =>
      parseOpportunityFilters(new URLSearchParams("status=offered"))
    ).toThrow();
  });
});
