import { describe, expect, it } from "vitest";
import { filterAndSortJobs, hasActiveJobFilters } from "./utils";
import type { JobDescription } from "@/types";

const jobs: JobDescription[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Acme",
    description: "React and TypeScript role",
    requirements: [],
    responsibilities: [],
    keywords: ["react", "typescript"],
    status: "saved",
    createdAt: "2026-04-09T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "Beta",
    description: "PostgreSQL and Node role",
    requirements: [],
    responsibilities: [],
    keywords: ["node", "postgresql"],
    remote: true,
    status: "applied",
    createdAt: "2026-04-08T10:00:00.000Z",
  },
];

describe("filterAndSortJobs", () => {
  it("filters by search query across title, company, and keywords", () => {
    const result = filterAndSortJobs(jobs, {
      searchQuery: "postgres",
      statusFilter: "all",
      typeFilter: "all",
      remoteFilter: "all",
      sortBy: "newest",
    });

    expect(result.map((job) => job.id)).toEqual(["2"]);
  });

  it("filters by status and remote flag", () => {
    const result = filterAndSortJobs(jobs, {
      searchQuery: "",
      statusFilter: "applied",
      typeFilter: "all",
      remoteFilter: "remote",
      sortBy: "newest",
    });

    expect(result.map((job) => job.id)).toEqual(["2"]);
  });

  it("sorts by company name", () => {
    const result = filterAndSortJobs(jobs, {
      searchQuery: "",
      statusFilter: "all",
      typeFilter: "all",
      remoteFilter: "all",
      sortBy: "company",
    });

    expect(result.map((job) => job.company)).toEqual(["Acme", "Beta"]);
  });
});

describe("hasActiveJobFilters", () => {
  it("returns false for the default filter state", () => {
    expect(
      hasActiveJobFilters({
        searchQuery: "",
        statusFilter: "all",
        typeFilter: "all",
        remoteFilter: "all",
        sortBy: "newest",
      })
    ).toBe(false);
  });

  it("returns true when any filter is applied", () => {
    expect(
      hasActiveJobFilters({
        searchQuery: "react",
        statusFilter: "all",
        typeFilter: "all",
        remoteFilter: "all",
        sortBy: "newest",
      })
    ).toBe(true);
  });
});
