import { describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";
import {
  JOBS_VIEW_STORAGE_KEY,
  formatJobDeadline,
  getKanbanStatusValue,
  groupJobsByKanbanStatus,
  parseJobsViewMode,
  readJobsViewMode,
  writeJobsViewMode,
} from "./job-kanban-utils";

const baseJob: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  description: "Build product experiences",
  requirements: [],
  responsibilities: [],
  keywords: [],
  createdAt: "2026-04-29T00:00:00.000Z",
};

function createJob(overrides: Partial<JobDescription>): JobDescription {
  return { ...baseJob, ...overrides };
}

describe("jobs view mode storage", () => {
  it("parses only the kanban value as kanban", () => {
    expect(parseJobsViewMode("kanban")).toBe("kanban");
    expect(parseJobsViewMode("list")).toBe("list");
    expect(parseJobsViewMode("unknown")).toBe("list");
    expect(parseJobsViewMode(null)).toBe("list");
  });

  it("reads the persisted view mode", () => {
    expect(readJobsViewMode({ getItem: vi.fn().mockReturnValue("kanban") })).toBe("kanban");
  });

  it("falls back to list when storage reads fail", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    };

    expect(readJobsViewMode(storage)).toBe("list");
  });

  it("writes the selected view mode when storage is available", () => {
    const storage = { setItem: vi.fn() };

    writeJobsViewMode(storage, "kanban");

    expect(storage.setItem).toHaveBeenCalledWith(JOBS_VIEW_STORAGE_KEY, "kanban");
  });
});

describe("getKanbanStatusValue", () => {
  it("uses pending when the job is pending", () => {
    expect(getKanbanStatusValue({ status: "pending" })).toBe("pending");
  });

  it("defaults missing or unsupported statuses to saved", () => {
    expect(getKanbanStatusValue({ status: undefined })).toBe("saved");
    expect(getKanbanStatusValue({ status: "withdrawn" })).toBe("saved");
  });
});

describe("groupJobsByKanbanStatus", () => {
  it("groups jobs into every kanban status column", () => {
    const grouped = groupJobsByKanbanStatus([
      createJob({ id: "pending", status: "pending" }),
      createJob({ id: "saved", status: "saved" }),
      createJob({ id: "applied", status: "applied" }),
      createJob({ id: "interviewing", status: "interviewing" }),
      createJob({ id: "offered", status: "offered" }),
      createJob({ id: "rejected", status: "rejected" }),
      createJob({ id: "missing-status" }),
    ]);

    expect(grouped.pending.map((job) => job.id)).toEqual(["pending"]);
    expect(grouped.saved.map((job) => job.id)).toEqual(["saved", "missing-status"]);
    expect(grouped.applied.map((job) => job.id)).toEqual(["applied"]);
    expect(grouped.interviewing.map((job) => job.id)).toEqual(["interviewing"]);
    expect(grouped.offered.map((job) => job.id)).toEqual(["offered"]);
    expect(grouped.rejected.map((job) => job.id)).toEqual(["rejected"]);
  });
});

describe("formatJobDeadline", () => {
  it("formats date-only deadlines without timezone drift", () => {
    expect(formatJobDeadline("2026-04-30")).toBe("Due Apr 30");
  });

  it("returns null for missing or invalid deadlines", () => {
    expect(formatJobDeadline(undefined)).toBeNull();
    expect(formatJobDeadline("not-a-date")).toBeNull();
  });
});
