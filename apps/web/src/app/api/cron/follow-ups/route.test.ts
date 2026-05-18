import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  ensureWelcomeSeriesSchema: vi.fn(),
  processWelcomeSeriesForUser: vi.fn(),
}));

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/db/legacy", () => ({
  default: { prepare: mocks.prepare },
}));

vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));

vi.mock("@/lib/welcome-series/state", () => ({
  ensureWelcomeSeriesSchema: mocks.ensureWelcomeSeriesSchema,
}));

vi.mock("@/lib/welcome-series/process", () => ({
  processWelcomeSeriesForUser: mocks.processWelcomeSeriesForUser,
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/follow-ups route contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    mocks.prepare.mockReturnValue({
      all: vi.fn(() => [{ id: "user-1" }, { id: "user-2" }]),
    });
    mocks.processWelcomeSeriesForUser
      .mockResolvedValueOnce({
        results: [
          { step: "day1", action: "sent" },
          { step: "day3", action: "not-eligible" },
        ],
      })
      .mockResolvedValueOnce({
        results: [
          { step: "day1", action: "already-complete" },
          { step: "day14", action: "error" },
        ],
      });
  });

  it("processes users and returns counters when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/follow-ups"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      cron: "follow-ups",
      processed: 2,
      sent: 1,
      skipped: 1,
      errors: 1,
      durationMs: expect.any(Number),
    });
    expect(mocks.ensureWelcomeSeriesSchema).toHaveBeenCalledTimes(1);
    expect(mocks.processWelcomeSeriesForUser).toHaveBeenNthCalledWith(
      1,
      "user-1",
    );
    expect(mocks.processWelcomeSeriesForUser).toHaveBeenNthCalledWith(
      2,
      "user-2",
    );
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/follow-ups"),
      routeContext(),
    );

    expect(response.status).toBe(401);
    expect(mocks.processWelcomeSeriesForUser).not.toHaveBeenCalled();
  });

  it("returns a 500 response when processing fails", async () => {
    mocks.processWelcomeSeriesForUser.mockReset();
    mocks.processWelcomeSeriesForUser.mockRejectedValueOnce(
      new Error("db unavailable"),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/follow-ups"),
      routeContext(),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "db unavailable",
    });
  });
});
