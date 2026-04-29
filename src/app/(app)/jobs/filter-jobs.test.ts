import { describe, expect, it } from "vitest";
import type { JobDescription } from "@/types";
import { DEFAULT_JOB_FILTERS, filterJobs, getJobStatusValue, hasActiveJobFilters } from "./filter-jobs";

const jobs: JobDescription[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    company: "Acme",
    description: "Build product experiences",
    requirements: [],
    responsibilities: [],
    keywords: ["React", "TypeScript"],
    status: "saved",
    type: "full-time",
    remote: true,
    createdAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "4",
    title: "Product Engineer",
    company: "Delta",
    description: "Scraped from extension",
    requirements: [],
    responsibilities: [],
    keywords: ["React"],
    status: "pending",
    type: "full-time",
    remote: true,
    createdAt: "2026-04-23T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Platform Engineer",
    company: "Beta Corp",
    description: "Own infrastructure",
    requirements: [],
    responsibilities: [],
    keywords: ["Go", "Kubernetes"],
    status: "applied",
    type: "contract",
    remote: false,
    createdAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Data Engineer",
    company: "Gamma Labs",
    description: "Ship pipelines",
    requirements: [],
    responsibilities: [],
    keywords: ["Python", "Airflow"],
    createdAt: "2026-04-20T00:00:00.000Z",
  },
];

describe("filterJobs", () => {
  it("returns all jobs for default filters", () => {
    expect(filterJobs(jobs, DEFAULT_JOB_FILTERS)).toHaveLength(4);
  });

  it("search matches title", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, searchQuery: "frontend" }).map((job) => job.id)).toEqual(["1"]);
  });

  it("search matches company", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, searchQuery: "beta" }).map((job) => job.id)).toEqual(["2"]);
  });

  it("search matches keywords", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, searchQuery: "airflow" }).map((job) => job.id)).toEqual(["3"]);
  });

  it("search is case-insensitive", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, searchQuery: "TYPESCRIPT" }).map((job) => job.id)).toEqual(["1"]);
  });

  it("missing keyword arrays do not throw", () => {
    const jobsWithoutKeywords = [{ ...jobs[0], id: "4", keywords: undefined as unknown as string[] }];
    expect(() => filterJobs(jobsWithoutKeywords, { ...DEFAULT_JOB_FILTERS, searchQuery: "react" })).not.toThrow();
  });

  it("status filter treats missing job.status as saved", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, statusFilter: "saved" }).map((job) => job.id)).toEqual(["1", "3"]);
  });

  it("status filter can show pending extension opportunities", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, statusFilter: "pending" }).map((job) => job.id)).toEqual(["4"]);
  });

  it("type filter excludes undefined types when a specific type is selected", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, typeFilter: "contract" }).map((job) => job.id)).toEqual(["2"]);
  });

  it("remote and onsite filters behave correctly", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, remoteFilter: "remote" }).map((job) => job.id)).toEqual(["4", "1"]);
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, remoteFilter: "onsite" }).map((job) => job.id)).toEqual(["2", "3"]);
  });

  it("sorts by newest", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, sortBy: "newest" }).map((job) => job.id)).toEqual(["4", "2", "1", "3"]);
  });

  it("sorts by oldest", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, sortBy: "oldest" }).map((job) => job.id)).toEqual(["3", "1", "2", "4"]);
  });

  it("sorts by company", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, sortBy: "company" }).map((job) => job.id)).toEqual(["1", "2", "4", "3"]);
  });

  it("sorts by title", () => {
    expect(filterJobs(jobs, { ...DEFAULT_JOB_FILTERS, sortBy: "title" }).map((job) => job.id)).toEqual(["3", "1", "2", "4"]);
  });
});

describe("hasActiveJobFilters", () => {
  it("returns false only for the full default state", () => {
    expect(hasActiveJobFilters(DEFAULT_JOB_FILTERS)).toBe(false);
    expect(hasActiveJobFilters({ ...DEFAULT_JOB_FILTERS, searchQuery: "acme" })).toBe(true);
    expect(hasActiveJobFilters({ ...DEFAULT_JOB_FILTERS, statusFilter: "applied" })).toBe(true);
    expect(hasActiveJobFilters({ ...DEFAULT_JOB_FILTERS, typeFilter: "full-time" })).toBe(true);
    expect(hasActiveJobFilters({ ...DEFAULT_JOB_FILTERS, remoteFilter: "remote" })).toBe(true);
  });
});

describe("getJobStatusValue", () => {
  it("defaults missing status to saved", () => {
    expect(getJobStatusValue({ status: undefined })).toBe("saved");
  });
});
