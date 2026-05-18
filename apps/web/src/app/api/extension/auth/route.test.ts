import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXTENSION_TOKEN_TTL_LOCALSTORAGE_MS,
  EXTENSION_TOKEN_TTL_RUNTIME_MS,
} from "@/lib/db/extension-sessions";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  isAuthError: vi.fn(),
  prepare: vi.fn(),
  nowEpoch: vi.fn(),
  ensureExtensionSessionsColumns: vi.fn(),
  trackActivationEvent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: mocks.isAuthError,
}));

vi.mock("@/lib/db/legacy", () => ({
  default: {
    prepare: mocks.prepare,
  },
}));

vi.mock("@/lib/format/time", () => ({
  nowEpoch: mocks.nowEpoch,
  toIso: (date: Date) => date.toISOString(),
}));

vi.mock("@/lib/db/extension-sessions", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/db/extension-sessions")>();
  return {
    ...actual,
    ensureExtensionSessionsColumns: mocks.ensureExtensionSessionsColumns,
  };
});

vi.mock("@/lib/db/product-analytics", () => ({
  trackActivationEvent: mocks.trackActivationEvent,
}));

import { POST } from "./route";

describe("extension auth route", () => {
  const run = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "user-1" });
    mocks.isAuthError.mockReturnValue(false);
    mocks.prepare.mockReturnValue({ run });
    mocks.nowEpoch.mockReturnValue(Date.UTC(2026, 4, 9, 12, 0, 0));
  });

  it("creates a runtime token with the long TTL and stores both device labels", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/extension/auth", {
        method: "POST",
        body: JSON.stringify({
          deviceInfo: "Chrome 121 on macOS",
          userAgent: "raw user agent",
          transport: "runtime",
        }),
      }),
    );
    const body = await response.json();

    expect(body.expiresAt).toBe(
      new Date(
        Date.UTC(2026, 4, 9, 12, 0, 0) + EXTENSION_TOKEN_TTL_RUNTIME_MS,
      ).toISOString(),
    );
    expect(mocks.ensureExtensionSessionsColumns).toHaveBeenCalled();
    expect(run).toHaveBeenCalledWith(
      expect.any(String),
      "user-1",
      body.token,
      "Chrome 121 on macOS",
      "raw user agent",
      body.expiresAt,
    );
  });

  it("creates a localStorage token with the short TTL", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/extension/auth", {
        method: "POST",
        body: JSON.stringify({
          transport: "localstorage",
        }),
      }),
    );
    const body = await response.json();

    expect(body.expiresAt).toBe(
      new Date(
        Date.UTC(2026, 4, 9, 12, 0, 0) + EXTENSION_TOKEN_TTL_LOCALSTORAGE_MS,
      ).toISOString(),
    );
    expect(run).toHaveBeenCalledWith(
      expect.any(String),
      "user-1",
      body.token,
      null,
      null,
      body.expiresAt,
    );
  });
});
