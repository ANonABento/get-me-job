import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  createJob: vi.fn(),
  countJobsByStatus: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: mocks.createJob,
  countJobsByStatus: mocks.countJobsByStatus,
}));

vi.mock("@/lib/db/notifications", () => ({
  createNotification: mocks.createNotification,
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
    mocks.requireExtensionAuth.mockReturnValue({ success: true, userId: "user-1" });
    mocks.countJobsByStatus.mockReturnValue(4);
  });

  it("creates a pending opportunity and notification for a single scraped job", async () => {
    mocks.createJob.mockReturnValueOnce({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
    });

    const response = await POST(jsonRequest({
      title: "Frontend Engineer",
      company: "Acme",
      description: "Build UI",
      source: "linkedin",
    }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      imported: 1,
      opportunityIds: ["job-1"],
      pendingCount: 4,
    });
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
        status: "pending",
        notes: "Source: linkedin",
      }),
      "user-1"
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        title: "New opportunity waiting for review",
        link: "/jobs",
      }),
      "user-1"
    );
  });

  it("accepts existing extension batch shape", async () => {
    mocks.createJob
      .mockReturnValueOnce({ id: "job-1", title: "Frontend Engineer", company: "Acme" })
      .mockReturnValueOnce({ id: "job-2", title: "Backend Engineer", company: "Beta" });

    const response = await POST(jsonRequest({
      jobs: [
        { title: "Frontend Engineer", company: "Acme" },
        { title: "Backend Engineer", company: "Beta" },
      ],
    }));

    await expect(response.json()).resolves.toEqual({
      imported: 2,
      opportunityIds: ["job-1", "job-2"],
      pendingCount: 4,
    });
    expect(mocks.createJob).toHaveBeenCalledTimes(2);
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "2 new opportunities waiting for review",
        message: "4 pending opportunities are ready to review.",
      }),
      "user-1"
    );
  });

  it("returns auth failures from extension auth", async () => {
    const authResponse = Response.json({ error: "Invalid token" }, { status: 401 });
    mocks.requireExtensionAuth.mockReturnValueOnce({ success: false, response: authResponse });

    const response = await POST(jsonRequest({ title: "Frontend Engineer", company: "Acme" }));

    expect(response.status).toBe(401);
    expect(mocks.createJob).not.toHaveBeenCalled();
  });

  it("rejects invalid scraped job payloads", async () => {
    const response = await POST(jsonRequest({ title: "Frontend Engineer" }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(mocks.createJob).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await POST(rawRequest("{not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON payload" });
    expect(mocks.createJob).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
  });
});
