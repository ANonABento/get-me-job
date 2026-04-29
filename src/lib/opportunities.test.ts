import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";

const mocks = vi.hoisted(() => ({
  getJob: vi.fn(),
  getJobs: vi.fn(),
  updateJob: vi.fn(),
}));

vi.mock("@/lib/db/jobs", () => ({
  getJob: mocks.getJob,
  getJobs: mocks.getJobs,
  updateJob: mocks.updateJob,
}));

import {
  getOpportunity,
  getOpportunityDescription,
  jobToOpportunity,
  linkOpportunityDocument,
  listOpportunities,
} from "./opportunities";

function job(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "job-1",
    title: "Frontend Engineer",
    company: "Acme",
    description: "Build polished product interfaces.",
    requirements: [],
    responsibilities: [],
    keywords: ["React", "TypeScript"],
    status: "saved",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("opportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps existing jobs to opportunity records", () => {
    expect(
      jobToOpportunity(
        job({
          url: "https://example.com/job",
          linkedResumeId: "resume-1",
          linkedCoverLetterId: "cover-1",
        }),
      ),
    ).toEqual({
      id: "job-1",
      type: "job",
      title: "Frontend Engineer",
      company: "Acme",
      source: "manual",
      sourceUrl: "https://example.com/job",
      summary: "Build polished product interfaces.",
      status: "saved",
      deadline: undefined,
      tags: ["React", "TypeScript"],
      notes: undefined,
      linkedResumeId: "resume-1",
      linkedCoverLetterId: "cover-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("lists only requested opportunity statuses", () => {
    mocks.getJobs.mockReturnValue([
      job({ id: "saved", status: "saved" }),
      job({ id: "applied", status: "applied" }),
      job({ id: "rejected", status: "rejected" }),
    ]);

    expect(listOpportunities("user-1", ["saved", "applied"]).map((item) => item.id))
      .toEqual(["saved", "applied"]);
    expect(mocks.getJobs).toHaveBeenCalledWith("user-1");
  });

  it("loads a single opportunity by id", () => {
    mocks.getJob.mockReturnValue(job({ id: "job-2" }));

    expect(getOpportunity("job-2", "user-1")?.id).toBe("job-2");
    expect(mocks.getJob).toHaveBeenCalledWith("job-2", "user-1");
  });

  it("links generated document ids without clearing existing links", () => {
    mocks.getJob
      .mockReturnValueOnce(job({ linkedCoverLetterId: "cover-1" }))
      .mockReturnValueOnce(
        job({ linkedResumeId: "resume-1", linkedCoverLetterId: "cover-1" }),
      );

    const opportunity = linkOpportunityDocument(
      "job-1",
      { resumeId: "resume-1" },
      "user-1",
    );

    expect(mocks.updateJob).toHaveBeenCalledWith(
      "job-1",
      {
        linkedResumeId: "resume-1",
        linkedCoverLetterId: "cover-1",
      },
      "user-1",
    );
    expect(opportunity?.linkedResumeId).toBe("resume-1");
  });

  it("ignores blank document ids when linking", () => {
    mocks.getJob
      .mockReturnValueOnce(
        job({ linkedResumeId: "resume-1", linkedCoverLetterId: "cover-1" }),
      )
      .mockReturnValueOnce(
        job({ linkedResumeId: "resume-1", linkedCoverLetterId: "cover-1" }),
      );

    linkOpportunityDocument(
      "job-1",
      { resumeId: "  ", coverLetterId: "cover-2" },
      "user-1",
    );

    expect(mocks.updateJob).toHaveBeenCalledWith(
      "job-1",
      {
        linkedResumeId: "resume-1",
        linkedCoverLetterId: "cover-2",
      },
      "user-1",
    );
  });

  it("returns trimmed opportunity JD text", () => {
    expect(
      getOpportunityDescription(
        jobToOpportunity(job({ description: "  Write TypeScript.  " })),
      ),
    ).toBe("Write TypeScript.");
  });
});
