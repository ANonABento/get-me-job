import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  listOpportunities: vi.fn(),
  createJob: vi.fn(),
  getJobs: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/opportunities", () => ({
  getJobStatusForOpportunityStatus: (status: string) =>
    status === "offer" ? "offered" : status,
  jobToOpportunity: (job: unknown) => job,
  listOpportunities: mocks.listOpportunities,
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: mocks.createJob,
  getJobs: mocks.getJobs,
}));

vi.mock("@/lib/db", () => ({
  getLLMConfig: vi.fn(() => null),
}));

import { GET, POST } from "./route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/opportunities", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("opportunities route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.listOpportunities.mockReturnValue([]);
    mocks.getJobs.mockReturnValue([]);
  });

  it("lists opportunities for the authenticated user with parsed filters", async () => {
    const request = new NextRequest(
      "http://localhost/api/opportunities?status=saved",
    );

    const response = await GET(request);

    expect(mocks.listOpportunities).toHaveBeenCalledWith("user-1", ["saved"]);
    await expect(response.json()).resolves.toEqual({ jobs: [], opportunities: [] });
  });

  it("creates an opportunity after validating the request body", async () => {
    const job = {
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build user interfaces.",
      status: "pending",
      createdAt: "2026-04-29T12:00:00.000Z",
    };
    mocks.createJob.mockReturnValueOnce(job);

    const response = await POST(
      jsonRequest({
        type: "job",
        title: "Frontend Engineer",
        company: "Acme",
        source: "manual",
        summary: "Build user interfaces.",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build user interfaces.",
        status: "pending",
      }),
      "user-1",
    );
    await expect(response.json()).resolves.toEqual({ job, opportunity: job });
  });

  it("maps opportunity create fields onto the tracked job record", async () => {
    const job = {
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build user interfaces.",
      status: "offered",
      createdAt: "2026-04-29T12:00:00.000Z",
    };
    mocks.createJob.mockReturnValueOnce(job);

    const response = await POST(
      jsonRequest({
        type: "job",
        title: "Frontend Engineer",
        company: "Acme",
        source: "manual",
        sourceUrl: "https://example.com/job",
        city: "Toronto",
        province: "ON",
        country: "Canada",
        remoteType: "remote",
        jobType: "co-op",
        summary: "Build user interfaces.",
        requiredSkills: ["React"],
        techStack: ["TypeScript"],
        tags: ["frontend"],
        salaryMin: 100000,
        salaryMax: 120000,
        status: "offer",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Toronto, ON, Canada",
        remote: true,
        type: "internship",
        keywords: ["TypeScript", "frontend"],
        requirements: ["React"],
        salary: "100000 - 120000",
        status: "offered",
        url: "https://example.com/job",
      }),
      "user-1",
    );
  });

  it("rejects invalid create payloads", async () => {
    const response = await POST(jsonRequest({ title: "Missing fields" }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error.fieldErrors).toBeDefined();
    expect(mocks.createJob).not.toHaveBeenCalled();
  });
});
