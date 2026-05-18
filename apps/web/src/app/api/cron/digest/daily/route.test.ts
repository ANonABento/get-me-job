import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/digest/daily", () => ({
  runDailyDigest: vi.fn(async () => ({
    ok: true,
    sent: 1,
    skipped: 2,
    errors: 0,
    duration_ms: 12,
    outcomes: [],
  })),
}));

vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/digest/daily route contract", () => {
  beforeEach(() => {
    vi.mocked(requireCronAuth).mockResolvedValue(null);
  });

  it("runs the daily digest when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/digest/daily"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      cron: "digest.daily",
      sent: 1,
      skipped: 2,
      errors: 0,
      duration_ms: 12,
    });
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/digest/daily"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
