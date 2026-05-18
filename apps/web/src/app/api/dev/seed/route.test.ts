import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () =>
  globalThis.__contractRouteMocks!.createAuthModuleMock(),
);

vi.mock("@/lib/dev/clean-slate", () => ({
  runDevCleanSlate: vi.fn(async () => ({
    statementsRun: 1,
    rowsAffected: 0,
    skippedOptionalTables: 0,
  })),
}));

vi.mock("@/lib/db/jobs", () => ({
  createJob: vi.fn((job) => ({
    ...job,
    id: "job-1",
    createdAt: "2026-05-18T00:00:00.000Z",
  })),
}));

vi.mock("@/lib/db/email-drafts", () => ({
  createEmailDraft: vi.fn(),
}));

vi.mock("@/lib/db/profile-bank", () => ({
  insertBankEntries: vi.fn((entries) =>
    entries.map((_: unknown, i: number) => `entry-${i}`),
  ),
}));

vi.mock("@/lib/db", () =>
  globalThis.__contractRouteMocks!.createContractModuleMock("@/lib/db"),
);

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    generateId: vi.fn(() => "generated-id"),
  };
});

import { POST } from "./route";
import {
  jsonRequest,
  resetContractMocks,
  setAuthFailure,
} from "@/test/contract";

describe("/api/dev/seed", () => {
  beforeEach(() => {
    resetContractMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is unavailable outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await POST(
      jsonRequest(
        "http://localhost/api/dev/seed",
        { preset: "empty" },
        "POST",
        { "x-slothing-dev-tools": "enabled" },
      ),
    );

    expect(response.status).toBe(404);
  });

  it("requires the dev tools request header in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = await POST(
      jsonRequest("http://localhost/api/dev/seed", { preset: "empty" }),
    );

    expect(response.status).toBe(403);
  });

  it("returns validation errors for unknown presets", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = await POST(
      jsonRequest(
        "http://localhost/api/dev/seed",
        { preset: "unknown" },
        "POST",
        { "x-slothing-dev-tools": "enabled" },
      ),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Validation failed",
    });
  });

  it("returns the shared auth failure contract before mutating data", async () => {
    vi.stubEnv("NODE_ENV", "development");
    setAuthFailure();

    const response = await POST(
      jsonRequest(
        "http://localhost/api/dev/seed",
        { preset: "empty" },
        "POST",
        { "x-slothing-dev-tools": "enabled" },
      ),
    );

    expect(response.status).toBe(401);
  });

  it("seeds the requested preset", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = await POST(
      jsonRequest(
        "http://localhost/api/dev/seed",
        { preset: "opportunities" },
        "POST",
        { "x-slothing-dev-tools": "enabled" },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      preset: "opportunities",
      seeded: { opportunities: 6 },
    });
  });
});
