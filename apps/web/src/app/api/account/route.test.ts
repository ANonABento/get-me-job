import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUserAuth: vi.fn(),
  isAuthError: vi.fn(),
  deleteAccountData: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUserAuth: mocks.requireUserAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/account-deletion", () => ({
  deleteAccountData: mocks.deleteAccountData,
}));

import { DELETE } from "./route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/account", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockImplementation((value) => value instanceof Response);
    mocks.deleteAccountData.mockReturnValue({
      userId: "user-1",
      deletedRows: { jobs: 2 },
      totalDeletedRows: 2,
    });
  });

  it("requires explicit confirmation before deleting account data", async () => {
    const response = await DELETE(request({ confirmation: "delete" }));

    expect(response.status).toBe(400);
    expect(mocks.deleteAccountData).not.toHaveBeenCalled();
  });

  it("deletes data for the authenticated user", async () => {
    const response = await DELETE(request({ confirmation: "DELETE" }));

    expect(response.status).toBe(200);
    expect(mocks.deleteAccountData).toHaveBeenCalledWith("user-1");
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      deleted: { totalDeletedRows: 2 },
    });
  });

  it("returns auth failures", async () => {
    const authResponse = NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mocks.requireUserAuth.mockResolvedValueOnce(authResponse);

    const response = await DELETE(request({ confirmation: "DELETE" }));

    expect(response.status).toBe(401);
  });
});
