import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  createJob: vi.fn(),
  listJobsPaginated: vi.fn(),
  safeTrackActivity: vi.fn(),
  trackActivationEvent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/opportunities", () => ({
  // After F2.1 the storage layer and the canonical UI vocabulary share one
  // `OpportunityStatus` union — `getJobStatusForOpportunityStatus` is the
  // identity passthrough kept for backwards compatibility.
  getJobStatusForOpportunityStatus: (status: string) => status,
  jobToOpportunity: (job: unknown) => job,
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: mocks.createJob,
  listJobsPaginated: mocks.listJobsPaginated,
}));

vi.mock("@/lib/enrichment", () => ({
  enrichCompany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getLLMConfig: vi.fn(() => null),
}));

vi.mock("@/lib/streak/track", () => ({
  safeTrackActivity: mocks.safeTrackActivity,
}));

vi.mock("@/lib/db/product-analytics", () => ({
  trackActivationEvent: mocks.trackActivationEvent,
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
    mocks.listJobsPaginated.mockReturnValue([]);
    mocks.safeTrackActivity.mockResolvedValue({ unlocked: [] });
  });

  it("lists opportunities for the authenticated user with parsed filters", async () => {
    const request = new NextRequest(
      "http://localhost/api/opportunities?status=saved",
    );

    const response = await GET(request);

    expect(mocks.listJobsPaginated).toHaveBeenCalledWith({
      userId: "user-1",
      statuses: ["saved"],
      cursor: null,
      limit: 50,
    });
    await expect(response.json()).resolves.toEqual({
      jobs: [],
      opportunities: [],
      items: [],
      nextCursor: null,
      hasMore: false,
    });
  });

  it("lists opportunities without status predicates when no filter is present", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/opportunities"),
    );

    expect(mocks.listJobsPaginated).toHaveBeenCalledWith({
      userId: "user-1",
      statuses: undefined,
      cursor: null,
      limit: 50,
    });
    expect(response.status).toBe(200);
  });

  it("normalizes comma-delimited status filters", async () => {
    await GET(
      new NextRequest(
        "http://localhost/api/opportunities?status=applied,interviewing,offered",
      ),
    );

    // Legacy URL value `offered` is rewritten to canonical `offer` so the
    // underlying SQL query targets the migrated rows.
    expect(mocks.listJobsPaginated).toHaveBeenCalledWith({
      userId: "user-1",
      statuses: ["applied", "interviewing", "offer"],
      cursor: null,
      limit: 50,
    });
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
    await expect(response.json()).resolves.toEqual({
      job,
      opportunity: job,
      unlocked: [],
    });
  });

  it("maps opportunity create fields onto the tracked job record", async () => {
    const job = {
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build user interfaces.",
      status: "offer",
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
        // Storage and UI vocabularies now match — `offer` is written through
        // unchanged.
        status: "offer",
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

  it("uses basic keyword extraction for legacy job bodies without a provider", async () => {
    const job = {
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build React and TypeScript interfaces.",
      status: "saved",
      createdAt: "2026-04-29T12:00:00.000Z",
    };
    mocks.createJob.mockReturnValueOnce(job);

    const response = await POST(
      jsonRequest({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build React and TypeScript interfaces.",
        status: "saved",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: expect.arrayContaining(["react", "typescript"]),
      }),
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      usedLLM: false,
      fallbackUsed: true,
      fallbackReason: "provider_not_configured",
    });
  });
});
