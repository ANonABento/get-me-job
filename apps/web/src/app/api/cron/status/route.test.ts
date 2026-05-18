import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireUserAuth: vi.fn(async () => ({ userId: "user-1" })),
  isAuthError: (value: unknown) => value instanceof NextResponse,
}));

vi.mock("@/lib/db/cron-runs", () => ({
  listRecentCronRuns: vi.fn(() => [
    {
      id: 1,
      cron: "cleanup",
      status: "success",
      startedAt: "2026-05-18T03:00:00.000Z",
      finishedAt: "2026-05-18T03:00:01.000Z",
      durationMs: 1000,
      summary: { expiredShares: 2 },
      error: null,
    },
  ]),
}));

import { GET } from "./route";
import { requireUserAuth } from "@/lib/auth";
import { listRecentCronRuns } from "@/lib/db/cron-runs";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/status route contract", () => {
  beforeEach(() => {
    vi.mocked(requireUserAuth).mockResolvedValue({ userId: "user-1" });
    vi.mocked(listRecentCronRuns).mockClear();
  });

  it("returns recent cron runs for authenticated users", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/status?limit=10"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      health: {
        ok: expect.any(Boolean),
        targets: expect.any(Array),
      },
      runs: [{ cron: "cleanup", status: "success" }],
    });
    expect(listRecentCronRuns).toHaveBeenCalledWith(10);
  });

  it("propagates auth failures", async () => {
    vi.mocked(requireUserAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/status"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
