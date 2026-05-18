import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/cron/cleanup", () => ({
  runCleanupCron: vi.fn(() => ({
    expiredShares: 2,
    expiredAuthSessions: 1,
    expiredVerificationTokens: 0,
    expiredExtensionSessions: 3,
    oldCronRuns: 4,
    errors: [],
  })),
}));

vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import { runCleanupCron } from "@/lib/cron/cleanup";
import { recordCronRun } from "@/lib/db/cron-runs";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/cleanup route contract", () => {
  beforeEach(() => {
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    vi.mocked(runCleanupCron).mockReturnValue({
      expiredShares: 2,
      expiredAuthSessions: 1,
      expiredVerificationTokens: 0,
      expiredExtensionSessions: 3,
      oldCronRuns: 4,
      errors: [],
    });
    vi.mocked(recordCronRun).mockClear();
  });

  it("runs cleanup work and records the cron run when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/cleanup"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      cron: "cleanup",
      expiredShares: 2,
      expiredAuthSessions: 1,
      expiredExtensionSessions: 3,
      oldCronRuns: 4,
    });
    expect(recordCronRun).toHaveBeenCalledWith(
      expect.objectContaining({
        cron: "cleanup",
        status: "success",
      }),
    );
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/cleanup"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
