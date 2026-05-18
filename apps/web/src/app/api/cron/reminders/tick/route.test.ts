import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fireDueReminders: vi.fn(),
}));

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/reminders/fire-due", () => ({
  fireDueReminders: mocks.fireDueReminders,
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

describe("/api/cron/reminders/tick route contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    mocks.fireDueReminders.mockResolvedValue({
      fired: 1,
      errors: 0,
      results: [],
    });
  });

  it("fires due reminders when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/reminders/tick"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      cron: "reminders.tick",
      fired: 1,
      errors: 0,
      durationMs: expect.any(Number),
    });
    expect(mocks.fireDueReminders).toHaveBeenCalledTimes(1);
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/reminders/tick"),
      routeContext(),
    );

    expect(response.status).toBe(401);
    expect(mocks.fireDueReminders).not.toHaveBeenCalled();
  });

  it("returns a 500 body when firing throws", async () => {
    mocks.fireDueReminders.mockRejectedValueOnce(new Error("db unavailable"));

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/reminders/tick"),
      routeContext(),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "db unavailable",
    });
  });
});
