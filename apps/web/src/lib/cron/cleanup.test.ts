import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/db/legacy", () => ({
  default: {
    prepare: vi.fn(),
  },
}));

vi.mock("@/lib/db/shared-resumes", () => ({
  ensureSharedResumesSchema: vi.fn(),
}));

vi.mock("@/lib/db/extension-sessions", () => ({
  ensureExtensionSessionsColumns: vi.fn(),
}));

import db from "@/lib/db/legacy";
import { runCleanupCron } from "./cleanup";

describe("runCleanupCron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes expired shares, sessions, extension tokens, and old cron logs", () => {
    const run = vi
      .fn()
      .mockReturnValueOnce({ changes: 2 })
      .mockReturnValueOnce({ changes: 1 })
      .mockReturnValueOnce({ changes: 3 })
      .mockReturnValueOnce({ changes: 4 })
      .mockReturnValueOnce({ changes: 5 });
    (db.prepare as Mock).mockReturnValue({ run });

    const result = runCleanupCron(Date.parse("2026-05-18T03:00:00.000Z"));

    expect(result).toMatchObject({
      expiredShares: 2,
      expiredAuthSessions: 1,
      expiredVerificationTokens: 3,
      expiredExtensionSessions: 4,
      oldCronRuns: 5,
      errors: [],
    });
    expect(db.prepare).toHaveBeenCalledWith(
      "DELETE FROM shared_resumes WHERE expires_at <= ?",
    );
    expect(db.prepare).toHaveBeenCalledWith(
      "DELETE FROM session WHERE expires <= ?",
    );
    expect(db.prepare).toHaveBeenCalledWith(
      "DELETE FROM extension_sessions WHERE expires_at <= ?",
    );
    expect(db.prepare).toHaveBeenCalledWith(
      "DELETE FROM cron_runs WHERE started_at < ?",
    );
  });

  it("continues when an optional cleanup table is missing", () => {
    const run = vi
      .fn()
      .mockReturnValueOnce({ changes: 1 })
      .mockImplementationOnce(() => {
        throw new Error("no such table: session");
      })
      .mockReturnValue({ changes: 0 });
    (db.prepare as Mock).mockReturnValue({ run });

    const result = runCleanupCron(1_000);

    expect(result.expiredShares).toBe(1);
    expect(result.errors).toEqual([
      "expiredAuthSessions: no such table: session",
    ]);
  });
});
