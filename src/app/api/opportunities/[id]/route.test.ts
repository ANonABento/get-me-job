import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  deleteOpportunity: vi.fn(),
  getOpportunity: vi.fn(),
  updateOpportunity: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/opportunities", () => ({
  deleteOpportunity: mocks.deleteOpportunity,
  getOpportunity: mocks.getOpportunity,
  updateOpportunity: mocks.updateOpportunity,
}));

import { DELETE, GET, PATCH } from "./route";

const routeContext = { params: { id: "opportunity-1" } };

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

  it("returns a single opportunity for the authenticated user", async () => {
    mocks.getOpportunity.mockReturnValueOnce({ id: "opportunity-1" });

    const response = await GET(
      new NextRequest("http://localhost/api/opportunities/opportunity-1"),
      routeContext
    );

    expect(mocks.getOpportunity).toHaveBeenCalledWith("opportunity-1", "user-1");
    await expect(response.json()).resolves.toEqual({
      opportunity: { id: "opportunity-1" },
    });
  });

  it("validates and updates an opportunity", async () => {
    mocks.updateOpportunity.mockReturnValueOnce({
      id: "opportunity-1",
      status: "saved",
    });

    const response = await PATCH(jsonRequest({ status: "saved" }), routeContext);

    expect(mocks.updateOpportunity).toHaveBeenCalledWith(
      "opportunity-1",
      { status: "saved" },
      "user-1"
    );
    await expect(response.json()).resolves.toEqual({
      opportunity: { id: "opportunity-1", status: "saved" },
    });
  });

  it("rejects invalid update payloads", async () => {
    const response = await PATCH(
      jsonRequest({ status: "offered" }),
      routeContext
    );

    expect(response.status).toBe(400);
    expect(mocks.updateOpportunity).not.toHaveBeenCalled();
  });

  it("returns 404 for missing records on delete", async () => {
    mocks.deleteOpportunity.mockReturnValueOnce(false);

    const response = await DELETE(
      new NextRequest("http://localhost/api/opportunities/opportunity-1"),
      routeContext
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Opportunity not found",
    });
  });
});
