import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  createOpportunity: vi.fn(),
  listOpportunities: vi.fn(),
  parseOpportunityFilters: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/opportunities", () => ({
  createOpportunity: mocks.createOpportunity,
  listOpportunities: mocks.listOpportunities,
  parseOpportunityFilters: mocks.parseOpportunityFilters,
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
    mocks.parseOpportunityFilters.mockReturnValue({ status: "saved" });
    mocks.listOpportunities.mockReturnValue([]);
  });

  it("lists opportunities for the authenticated user with parsed filters", async () => {
    const request = new NextRequest(
      "http://localhost/api/opportunities?status=saved"
    );

    const response = await GET(request);

    expect(mocks.parseOpportunityFilters).toHaveBeenCalledWith(
      request.nextUrl.searchParams
    );
    expect(mocks.listOpportunities).toHaveBeenCalledWith("user-1", {
      status: "saved",
    });
    await expect(response.json()).resolves.toEqual({ opportunities: [] });
  });

  it("creates an opportunity after validating the request body", async () => {
    const opportunity = {
      id: "opportunity-1",
      type: "job",
      title: "Frontend Engineer",
      company: "Acme",
      source: "manual",
      summary: "Build user interfaces.",
      status: "pending",
      tags: [],
      createdAt: "2026-04-29T12:00:00.000Z",
      updatedAt: "2026-04-29T12:00:00.000Z",
    };
    mocks.createOpportunity.mockReturnValueOnce(opportunity);

    const response = await POST(
      jsonRequest({
        type: "job",
        title: "Frontend Engineer",
        company: "Acme",
        source: "manual",
        summary: "Build user interfaces.",
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.createOpportunity).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "job",
        title: "Frontend Engineer",
        status: "pending",
        tags: [],
      }),
      "user-1"
    );
    await expect(response.json()).resolves.toEqual({ opportunity });
  });

  it("rejects invalid create payloads", async () => {
    const response = await POST(jsonRequest({ title: "Missing fields" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
    });
    expect(mocks.createOpportunity).not.toHaveBeenCalled();
  });
});
