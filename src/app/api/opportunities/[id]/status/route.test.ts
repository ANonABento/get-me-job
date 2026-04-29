import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  changeOpportunityStatus: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/opportunities", () => ({
  changeOpportunityStatus: mocks.changeOpportunityStatus,
}));

import { PATCH } from "./route";

const routeContext = { params: { id: "opportunity-1" } };

function jsonRequest(body: unknown) {
  return new NextRequest(
    "http://localhost/api/opportunities/opportunity-1/status",
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }
  );
}

describe("opportunity status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
  });

  it("changes an opportunity status for the authenticated user", async () => {
    mocks.changeOpportunityStatus.mockReturnValueOnce({
      id: "opportunity-1",
      status: "applied",
    });

    const response = await PATCH(jsonRequest({ status: "applied" }), routeContext);

    expect(mocks.changeOpportunityStatus).toHaveBeenCalledWith(
      "opportunity-1",
      "applied",
      "user-1"
    );
    await expect(response.json()).resolves.toEqual({
      opportunity: { id: "opportunity-1", status: "applied" },
    });
  });

  it("rejects unsupported statuses", async () => {
    const response = await PATCH(jsonRequest({ status: "offered" }), routeContext);

    expect(response.status).toBe(400);
    expect(mocks.changeOpportunityStatus).not.toHaveBeenCalled();
  });

  it("returns 404 when the opportunity does not exist", async () => {
    mocks.changeOpportunityStatus.mockReturnValueOnce(null);

    const response = await PATCH(jsonRequest({ status: "saved" }), routeContext);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Opportunity not found",
    });
  });
});
