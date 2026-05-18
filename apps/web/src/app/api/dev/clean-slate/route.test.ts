import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

import { DELETE } from "./route";
import {
  getRequest,
  resetContractMocks,
  setAuthFailure,
} from "@/test/contract";

describe("/api/dev/clean-slate", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is unavailable outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await DELETE(
      getRequest("http://localhost/api/dev/clean-slate", {
        "x-slothing-dev-tools": "enabled",
      }),
    );

    expect(response.status).toBe(404);
  });

  it("requires the dev tools request header in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = await DELETE(
      getRequest("http://localhost/api/dev/clean-slate"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });

  it("returns the shared auth failure contract before mutating data", async () => {
    vi.stubEnv("NODE_ENV", "development");
    setAuthFailure();

    const response = await DELETE(
      getRequest("http://localhost/api/dev/clean-slate", {
        "x-slothing-dev-tools": "enabled",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });
});
