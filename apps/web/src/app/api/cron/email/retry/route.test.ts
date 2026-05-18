import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/cron/email-retry", () => ({
  runEmailRetryCron: vi.fn(async () => ({
    ok: true,
    scanned: 2,
    retried: 2,
    sent: 1,
    failed: 1,
    durationMs: 11,
    outcomes: [{ error: "rate limited" }],
  })),
}));

vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import { runEmailRetryCron } from "@/lib/cron/email-retry";
import { recordCronRun } from "@/lib/db/cron-runs";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/email/retry route contract", () => {
  beforeEach(() => {
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    vi.mocked(runEmailRetryCron).mockResolvedValue({
      ok: true,
      scanned: 2,
      retried: 2,
      sent: 2,
      failed: 0,
      durationMs: 11,
      outcomes: [],
    });
    vi.mocked(recordCronRun).mockClear();
  });

  it("retries failed app emails when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/email/retry"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      cron: "email.retry",
      scanned: 2,
      retried: 2,
      sent: 2,
      failed: 0,
    });
    expect(recordCronRun).toHaveBeenCalledWith(
      expect.objectContaining({
        cron: "email.retry",
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
      getRequest("http://localhost/api/cron/email/retry"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
