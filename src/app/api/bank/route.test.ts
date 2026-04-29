import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  getBankEntries: vi.fn(),
  getBankEntriesByCategory: vi.fn(),
  insertBankEntry: vi.fn(),
  searchBankEntries: vi.fn(),
  searchBankEntriesByCategory: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/profile-bank", () => ({
  getBankEntries: mocks.getBankEntries,
  getBankEntriesByCategory: mocks.getBankEntriesByCategory,
  insertBankEntry: mocks.insertBankEntry,
  searchBankEntries: mocks.searchBankEntries,
  searchBankEntriesByCategory: mocks.searchBankEntriesByCategory,
}));

import { GET, POST } from "./route";

function bankRequest(path = "/api/bank") {
  return new NextRequest(`http://localhost${path}`);
}

function createRequest(body: unknown) {
  return new NextRequest("http://localhost/api/bank", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("bank route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.getBankEntries.mockReturnValue([]);
    mocks.getBankEntriesByCategory.mockReturnValue([]);
    mocks.searchBankEntries.mockReturnValue([]);
    mocks.searchBankEntriesByCategory.mockReturnValue([]);
    mocks.insertBankEntry.mockReturnValue("entry-1");
  });

  it("maps type=hackathon to the hackathon category filter", async () => {
    const response = await GET(bankRequest("/api/bank?type=hackathon"));

    expect(response.status).toBe(200);
    expect(mocks.getBankEntriesByCategory).toHaveBeenCalledWith(
      "hackathon",
      "user-1"
    );
    expect(mocks.getBankEntries).not.toHaveBeenCalled();
  });

  it("searches within hackathons when q and type=hackathon are provided", async () => {
    await GET(bankRequest("/api/bank?q=ai&type=hackathon"));

    expect(mocks.searchBankEntriesByCategory).toHaveBeenCalledWith(
      "ai",
      "hackathon",
      "user-1"
    );
    expect(mocks.searchBankEntries).not.toHaveBeenCalled();
  });

  it("accepts hackathon entries on create", async () => {
    const response = await POST(
      createRequest({
        category: "hackathon",
        content: { name: "AI Build Weekend", prizes: ["Best AI App"] },
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.insertBankEntry).toHaveBeenCalledWith(
      {
        category: "hackathon",
        content: { name: "AI Build Weekend", prizes: ["Best AI App"] },
        confidenceScore: 1.0,
      },
      "user-1"
    );
    await expect(response.json()).resolves.toEqual({
      success: true,
      id: "entry-1",
    });
  });
});
