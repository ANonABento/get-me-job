import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getActivationFunnelCounts: vi.fn(),
  trackActivationEvent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/product-analytics", () => ({
  getActivationFunnelCounts: mocks.getActivationFunnelCounts,
  trackActivationEvent: mocks.trackActivationEvent,
}));

import { GET, POST } from "./route";

function post(body: unknown) {
  return new NextRequest("http://localhost/api/product-analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/product-analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockImplementation((value) => value instanceof Response);
    mocks.getActivationFunnelCounts.mockReturnValue({
      waitlist_joined: 1,
      opportunity_created: 2,
      resume_uploaded: 0,
      resume_tailored: 1,
      extension_connected: 1,
    });
    mocks.trackActivationEvent.mockReturnValue({
      id: "evt-1",
      event: "opportunity_created",
      userId: "user-1",
    });
  });

  it("returns authenticated funnel counts", async () => {
    const response = await GET();

    expect(mocks.getActivationFunnelCounts).toHaveBeenCalledWith("user-1");
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      funnel: { opportunity_created: 2 },
    });
  });

  it("records authenticated activation events", async () => {
    const response = await POST(
      post({ event: "opportunity_created", source: "test" }),
    );

    expect(response.status).toBe(201);
    expect(mocks.trackActivationEvent).toHaveBeenCalledWith({
      event: "opportunity_created",
      source: "test",
      userId: "user-1",
    });
  });

  it("returns auth failures", async () => {
    mocks.requireAuth.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
