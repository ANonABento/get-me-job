import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  createJob: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/db/drizzle/queries/jobs", () => ({
  createJob: mocks.createJob,
}));

import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/extension/jobs", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("extension jobs route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({ success: true, userId: "user-1" });
  });

  it("creates a single job through the Drizzle query layer", async () => {
    mocks.createJob.mockResolvedValueOnce({ id: "job-1" });

    const response = await POST(jsonRequest({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build UI",
    }));

    await expect(response.json()).resolves.toEqual({ jobId: "job-1" });
    expect(mocks.createJob).toHaveBeenCalledWith("user-1", expect.objectContaining({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build UI",
      status: "saved",
    }));
  });

  it("accepts batch imports without requiring top-level job fields", async () => {
    mocks.createJob
      .mockResolvedValueOnce({ id: "job-1" })
      .mockResolvedValueOnce({ id: "job-2" });

    const response = await POST(jsonRequest({
      jobs: [
        { title: "Frontend Engineer", company: "Acme" },
        { title: "Missing Company" },
        { title: "Backend Engineer", company: "Beta" },
      ],
    }));

    await expect(response.json()).resolves.toEqual({
      imported: 2,
      jobIds: ["job-1", "job-2"],
    });
    expect(mocks.createJob).toHaveBeenCalledTimes(2);
    expect(mocks.createJob).toHaveBeenNthCalledWith(
      1,
      "user-1",
      expect.objectContaining({ title: "Frontend Engineer", company: "Acme" })
    );
    expect(mocks.createJob).toHaveBeenNthCalledWith(
      2,
      "user-1",
      expect.objectContaining({ title: "Backend Engineer", company: "Beta" })
    );
  });

  it("rejects a single job missing required fields", async () => {
    const response = await POST(jsonRequest({ title: "Frontend Engineer" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title and company are required",
    });
    expect(mocks.createJob).not.toHaveBeenCalled();
  });
});
