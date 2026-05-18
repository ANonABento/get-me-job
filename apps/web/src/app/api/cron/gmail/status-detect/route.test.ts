import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/email/gmail-status-detect", () => ({
  runGmailStatusDetectionForEnabledUsers: vi.fn(async () => ({
    processed: 1,
    scanned: 5,
    matched: 4,
    updated: 3,
    skipped: 2,
    errors: 0,
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

describe("/api/cron/gmail/status-detect route contract", () => {
  beforeEach(() => {
    vi.mocked(requireCronAuth).mockResolvedValue(null);
  });

  it("runs Gmail status detection when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/gmail/status-detect"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      cron: "gmail.status-detect",
      processed: 1,
      scanned: 5,
      matched: 4,
      updated: 3,
      skipped: 2,
      errors: 0,
    });
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/gmail/status-detect"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
