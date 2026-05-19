import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  createJob: vi.fn(),
  countJobsByStatus: vi.fn(),
  getJobByUrl: vi.fn(),
  getJobBySource: vi.fn(),
  updateJob: vi.fn(),
  updateJobStatus: vi.fn(),
  createNotification: vi.fn(),
  getViewPreferences: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: mocks.createJob,
  countJobsByStatus: mocks.countJobsByStatus,
  getJobByUrl: mocks.getJobByUrl,
  getJobBySource: mocks.getJobBySource,
  updateJob: mocks.updateJob,
  updateJobStatus: mocks.updateJobStatus,
}));

vi.mock("@/lib/db/notifications", () => ({
  createNotification: mocks.createNotification,
}));

vi.mock("@/lib/db/opportunity-view-preferences", () => ({
  getViewPreferences: mocks.getViewPreferences,
}));

import { POST } from "./route";

function jsonRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/opportunities/from-extension", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });
}

function rawRequest(body: string) {
  return new NextRequest("http://localhost/api/opportunities/from-extension", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}

describe("opportunities from-extension route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({
      success: true,
      userId: "user-1",
    });
    mocks.countJobsByStatus.mockReturnValue(4);
    mocks.getJobByUrl.mockReturnValue(null);
    mocks.getJobBySource.mockReturnValue(null);
    mocks.getViewPreferences.mockReturnValue(null);
  });

  it("creates a pending opportunity and notification for a single scraped job", async () => {
    mocks.createJob.mockReturnValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
    });

    const response = await POST(
      jsonRequest({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
        source: "linkedin",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      imported: 1,
      opportunityIds: ["job-1"],
      pendingCount: 4,
      dedupedIds: [],
      failed: [],
    });
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
        status: "pending",
        notes: "Source: linkedin",
      }),
      "user-1",
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        title: "New opportunity waiting for review",
        link: "/opportunities/review",
      }),
      "user-1",
    );
  });

  it("accepts existing extension batch shape", async () => {
    mocks.createJob
      .mockReturnValueOnce({
        id: "job-1",
        title: "Frontend Engineer",
        company: "Acme",
      })
      .mockReturnValueOnce({
        id: "job-2",
        title: "Backend Engineer",
        company: "Beta",
      });

    const response = await POST(
      jsonRequest({
        jobs: [
          { title: "Frontend Engineer", company: "Acme" },
          { title: "Backend Engineer", company: "Beta" },
        ],
      }),
    );

    await expect(response.json()).resolves.toEqual({
      imported: 2,
      opportunityIds: ["job-1", "job-2"],
      pendingCount: 4,
      dedupedIds: [],
      failed: [],
    });
    expect(mocks.createJob).toHaveBeenCalledTimes(2);
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "2 new opportunities waiting for review",
        message: "4 pending opportunities are ready to review.",
      }),
      "user-1",
    );
  });

  it("returns auth failures from extension auth", async () => {
    const authResponse = Response.json(
      { error: "Invalid token" },
      { status: 401 },
    );
    mocks.requireExtensionAuth.mockReturnValueOnce({
      success: false,
      response: authResponse,
    });

    const response = await POST(
      jsonRequest({ title: "Frontend Engineer", company: "Acme" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.createJob).not.toHaveBeenCalled();
  });

  it("reports invalid rows in the failed[] array without rejecting the batch", async () => {
    // Per-row validation (RCA #56): a single row missing `company` should
    // come back in `failed[]`, not cause a 400. The batch can still
    // import other rows if any were valid.
    const response = await POST(jsonRequest({ title: "Frontend Engineer" }));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.imported).toBe(0);
    expect(body.failed).toHaveLength(1);
    expect(body.failed[0]).toMatchObject({
      index: 0,
      title: "Frontend Engineer",
      errors: expect.arrayContaining([
        expect.objectContaining({ field: "company" }),
      ]),
    });
    expect(mocks.createJob).not.toHaveBeenCalled();
  });

  it("imports the good rows in a mixed-validity batch", async () => {
    mocks.getJobByUrl.mockReturnValue(null);
    mocks.getJobBySource.mockReturnValue(null);
    mocks.countJobsByStatus.mockReturnValue(4);
    mocks.createJob.mockImplementation((job: { title: string }) => ({
      ...job,
      id: `job-${job.title}`,
    }));

    const response = await POST(
      jsonRequest({
        jobs: [
          { title: "Good Job", company: "Acme" },
          { title: "", company: "Bad Co" }, // empty title
          { title: "Another Good", company: "Beta" },
        ],
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.imported).toBe(2);
    expect(body.failed).toHaveLength(1);
    expect(body.failed[0]).toMatchObject({ index: 1, company: "Bad Co" });
    expect(mocks.createJob).toHaveBeenCalledTimes(2);
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await POST(rawRequest("{not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON payload",
    });
    expect(mocks.createJob).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
  });

  it("promotes an existing URL match to applied without creating a duplicate", async () => {
    mocks.getJobByUrl.mockReturnValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      url: "https://example.com/jobs/frontend",
    });
    mocks.updateJobStatus.mockReturnValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      status: "applied",
    });

    const response = await POST(
      jsonRequest({
        title: "Frontend Engineer",
        company: "Acme",
        url: "https://example.com/jobs/frontend",
        status: "applied",
        appliedAt: "2026-05-10T12:00:00.000Z",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      imported: 1,
      opportunityIds: ["job-1"],
      pendingCount: 4,
      dedupedIds: ["job-1"],
      failed: [],
    });
    expect(mocks.createJob).not.toHaveBeenCalled();
    expect(mocks.updateJobStatus).toHaveBeenCalledWith(
      "job-1",
      "applied",
      "2026-05-10T12:00:00.000Z",
      "user-1",
    );
  });

  it("creates an applied opportunity when no URL duplicate exists", async () => {
    mocks.createJob.mockReturnValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      status: "applied",
    });

    const response = await POST(
      jsonRequest({
        title: "Frontend Engineer",
        company: "Acme",
        url: "https://example.com/jobs/frontend",
        status: "applied",
        appliedAt: "2026-05-10T12:00:00.000Z",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      imported: 1,
      opportunityIds: ["job-1"],
      pendingCount: 4,
      dedupedIds: [],
      failed: [],
    });
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "applied",
        appliedAt: "2026-05-10T12:00:00.000Z",
      }),
      "user-1",
    );
  });
});
