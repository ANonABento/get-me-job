import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  changeOpportunityStatus: vi.fn(),
  safeTrackActivity: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/opportunities", () => ({
  changeOpportunityStatus: mocks.changeOpportunityStatus,
}));

vi.mock("@/lib/streak/track", () => ({
  safeTrackActivity: mocks.safeTrackActivity,
}));

import { PATCH } from "./route";

const routeContext = { params: { id: "opportunity-1" } };

function jsonRequest(body: unknown) {
  return new NextRequest(
    "http://localhost/api/extension/opportunities/opportunity-1/status",
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("extension opportunity status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({
      success: true,
      userId: "user-1",
    });
    mocks.safeTrackActivity.mockResolvedValue({ unlocked: [] });
  });

  it("changes an opportunity status for the extension-token user", async () => {
    mocks.changeOpportunityStatus.mockReturnValueOnce({
      id: "opportunity-1",
      status: "applied",
    });

    const response = await PATCH(
      jsonRequest({ status: "applied" }),
      routeContext,
    );

    expect(mocks.changeOpportunityStatus).toHaveBeenCalledWith(
      "opportunity-1",
      "applied",
      "user-1",
    );
    await expect(response.json()).resolves.toEqual({
      opportunity: { id: "opportunity-1", status: "applied" },
      unlocked: [],
    });
  });

  it("returns auth failures from extension auth", async () => {
    mocks.requireExtensionAuth.mockReturnValueOnce({
      success: false,
      response: Response.json({ error: "Invalid token" }, { status: 401 }),
    });

    const response = await PATCH(
      jsonRequest({ status: "saved" }),
      routeContext,
    );

    expect(response.status).toBe(401);
    expect(mocks.changeOpportunityStatus).not.toHaveBeenCalled();
  });

  it("rejects unsupported statuses", async () => {
    const response = await PATCH(
      jsonRequest({ status: "offered" }),
      routeContext,
    );

    expect(response.status).toBe(400);
    expect(mocks.changeOpportunityStatus).not.toHaveBeenCalled();
  });
});
