import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  createJob: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: mocks.createJob,
}));

vi.mock("@/lib/db/notifications", () => ({
  createNotification: mocks.createNotification,
}));

import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/extension/applications", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function rawRequest(body: string) {
  return new NextRequest("http://localhost/api/extension/applications", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}

describe("extension applications route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({ success: true, userId: "user-1" });
    mocks.createJob.mockReturnValue({
      id: "job-1",
      title: "Frontend Engineer",
      company: "Acme",
      status: "applied",
      appliedAt: "2026-04-30T12:00:00.000Z",
    });
  });

  it("creates an applied application and notification", async () => {
    const response = await POST(
      jsonRequest({
        title: "Frontend Engineer",
        company: "Acme",
        description: "Build UI",
        source: "linkedin",
        submittedAt: "2026-04-30T12:00:00.000Z",
        detectionMethod: "linkedin-confirmation-text",
      })
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      applicationId: "job-1",
      status: "applied",
      appliedAt: "2026-04-30T12:00:00.000Z",
    });
    expect(mocks.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Frontend Engineer",
        company: "Acme",
        status: "applied",
        appliedAt: "2026-04-30T12:00:00.000Z",
        notes: expect.stringContaining("Detected by: linkedin-confirmation-text"),
      }),
      "user-1"
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "application_update",
        title: "Application logged",
        link: "/opportunities",
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

  it("rejects invalid application payloads", async () => {
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
  });
});
