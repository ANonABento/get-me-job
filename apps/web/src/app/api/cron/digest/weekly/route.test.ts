import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cron-auth", () => ({
  requireCronAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/db/cron-runs", () => ({
  recordCronRun: vi.fn(),
}));

import { GET } from "./route";
import { requireCronAuth } from "@/lib/cron-auth";
import { recordCronRun } from "@/lib/db/cron-runs";
import {
  expectRouteResponseContract,
  getRequest,
  invokeRouteHandler,
  routeContext,
} from "@/test/contract";

describe("/api/cron/digest/weekly route contract", () => {
  beforeEach(() => {
    vi.mocked(requireCronAuth).mockResolvedValue(null);
    vi.mocked(recordCronRun).mockClear();
  });

  it("returns an intentional disabled response when auth passes", async () => {
    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/digest/weekly"),
      routeContext(),
    );

    await expectRouteResponseContract(response.clone());
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      cron: "digest.weekly",
      disabled: true,
    });
    expect(recordCronRun).toHaveBeenCalledWith(
      expect.objectContaining({
        cron: "digest.weekly",
        status: "disabled",
      }),
    );
  });

  it("propagates cron auth failures", async () => {
    vi.mocked(requireCronAuth).mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await invokeRouteHandler(
      GET,
      getRequest("http://localhost/api/cron/digest/weekly"),
      routeContext(),
    );

    expect(response.status).toBe(401);
  });
});
