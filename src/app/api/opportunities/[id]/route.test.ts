import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getJob: vi.fn(),
  updateJob: vi.fn(),
  deleteJob: vi.fn(),
  recordJobStatusChange: vi.fn(),
  jobToOpportunity: vi.fn((job) => ({ id: job.id, status: job.status })),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/jobs", () => ({
  getJob: mocks.getJob,
  updateJob: mocks.updateJob,
  deleteJob: mocks.deleteJob,
}));

vi.mock("@/lib/db/analytics", () => ({
  recordJobStatusChange: mocks.recordJobStatusChange,
}));

vi.mock("@/lib/opportunities", () => ({
  jobToOpportunity: mocks.jobToOpportunity,
}));

import { DELETE, GET, PATCH } from "./route";

const routeContext = { params: { id: "opportunity-1" } };
const baseJob = {
  id: "opportunity-1",
  title: "Frontend Engineer",
  company: "Acme",
  description: "Build UI",
  status: "saved",
};

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/opportunities/opportunity-1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("opportunity detail route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("returns the underlying job and opportunity view for the authenticated user", async () => {
    mocks.getJob.mockReturnValueOnce(baseJob);

    const response = await GET(
      new NextRequest("http://localhost/api/opportunities/opportunity-1"),
      routeContext,
    );

    expect(mocks.getJob).toHaveBeenCalledWith("opportunity-1", "user-1");
    await expect(response.json()).resolves.toEqual({
      job: baseJob,
      opportunity: { id: "opportunity-1", status: "saved" },
    });
  });

  it("validates and patches an opportunity through the job record", async () => {
    mocks.getJob.mockReturnValueOnce(baseJob).mockReturnValueOnce({
      ...baseJob,
      company: "Globex",
    });

    const response = await PATCH(jsonRequest({ company: "Globex" }), routeContext);

    expect(response.status).toBe(200);
    expect(mocks.updateJob).toHaveBeenCalledWith(
      "opportunity-1",
      { company: "Globex" },
      "user-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      job: { company: "Globex" },
      opportunity: { id: "opportunity-1", status: "saved" },
    });
  });

  it("records status changes and stamps appliedAt when applying", async () => {
    mocks.getJob.mockReturnValueOnce(baseJob).mockReturnValueOnce({
      ...baseJob,
      status: "applied",
    });

    await PATCH(jsonRequest({ status: "applied" }), routeContext);

    expect(mocks.updateJob).toHaveBeenCalledWith(
      "opportunity-1",
      expect.objectContaining({ status: "applied", appliedAt: expect.any(String) }),
      "user-1",
    );
    expect(mocks.recordJobStatusChange).toHaveBeenCalledWith(
      "opportunity-1",
      "saved",
      "applied",
      undefined,
      "user-1",
    );
  });

  it("rejects invalid update payloads", async () => {
    mocks.getJob.mockReturnValueOnce(baseJob);

    const response = await PATCH(jsonRequest({ status: "offer" }), routeContext);

    expect(response.status).toBe(400);
    expect(mocks.updateJob).not.toHaveBeenCalled();
  });

  it("returns 404 for missing records on delete", async () => {
    mocks.getJob.mockReturnValueOnce(null);

    const response = await DELETE(
      new NextRequest("http://localhost/api/opportunities/opportunity-1"),
      routeContext,
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Opportunity not found",
    });
  });
});
