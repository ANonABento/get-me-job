import { describe, expect, it, vi, afterEach } from "vitest";
import {
  LOCAL_DEV_CLEAN_SLATE_SETTING,
  buildLocalDevCleanSlateStatements,
  runLocalDevCleanSlateMigration,
  shouldRunLocalDevCleanSlate,
} from "./local-clean-slate";

describe("shouldRunLocalDevCleanSlate", () => {
  it("runs only in localhost mode without Clerk", () => {
    expect(shouldRunLocalDevCleanSlate({ NODE_ENV: "development" })).toBe(true);
  });

  it("does not run during tests", () => {
    expect(shouldRunLocalDevCleanSlate({ NODE_ENV: "test" })).toBe(false);
  });

  it("does not run outside development", () => {
    expect(shouldRunLocalDevCleanSlate({ NODE_ENV: "production" })).toBe(false);
    expect(shouldRunLocalDevCleanSlate({})).toBe(false);
  });

  it("does not run when Clerk is configured", () => {
    expect(
      shouldRunLocalDevCleanSlate({
        NODE_ENV: "development",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
        CLERK_SECRET_KEY: "sk_test_123",
      })
    ).toBe(false);
  });

  it("can be skipped explicitly", () => {
    expect(
      shouldRunLocalDevCleanSlate({
        NODE_ENV: "development",
        GET_ME_JOB_SKIP_LOCAL_CLEAN_SLATE: "true",
      })
    ).toBe(false);
  });
});

describe("buildLocalDevCleanSlateStatements", () => {
  it("clears local default user content without clearing global settings", () => {
    const statements = buildLocalDevCleanSlateStatements("default");
    const sql = statements.map((statement) => statement.sql);

    expect(sql).toContain("DELETE FROM documents WHERE user_id = ?");
    expect(sql).toContain("DELETE FROM jobs WHERE user_id = ?");
    expect(sql).toContain("DELETE FROM profile WHERE id = ?");
    expect(sql).toContain("DELETE FROM knowledge_chunks WHERE user_id = ?");
    expect(sql).not.toContain("DELETE FROM settings");
    expect(statements.every((statement) => statement.params?.[0] === "default")).toBe(true);
  });

  it("deletes job-owned rows before jobs", () => {
    const sql = buildLocalDevCleanSlateStatements().map((statement) => statement.sql);

    expect(sql.indexOf("DELETE FROM generated_resumes WHERE profile_id = ?")).toBeLessThan(
      sql.indexOf("DELETE FROM jobs WHERE user_id = ?")
    );
    expect(
      sql.indexOf("DELETE FROM reminders WHERE job_id IN (SELECT id FROM jobs WHERE user_id = ?)")
    ).toBeLessThan(sql.indexOf("DELETE FROM jobs WHERE user_id = ?"));
    expect(
      sql.indexOf("DELETE FROM chunks_vec WHERE rowid IN (SELECT rowid FROM chunks WHERE user_id = ?)")
    ).toBeLessThan(sql.indexOf("DELETE FROM chunks WHERE user_id = ?"));
  });
});

describe("runLocalDevCleanSlateMigration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not run when the migration setting already exists", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");

    const run = vi.fn();
    const db = {
      prepare: vi.fn((sql: string) => ({
        get: vi.fn().mockReturnValue(
          sql.includes("SELECT value FROM settings")
            ? { value: "true" }
            : undefined
        ),
        run,
      })),
      transaction: vi.fn((fn) => fn),
    };

    runLocalDevCleanSlateMigration(db);

    expect(run).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("clears data and records completion once", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");

    const run = vi.fn();
    const db = {
      prepare: vi.fn((sql: string) => ({
        get: vi.fn().mockReturnValue(undefined),
        run: (...args: unknown[]) => run(sql, ...args),
      })),
      transaction: vi.fn((fn) => fn),
    };

    runLocalDevCleanSlateMigration(db);

    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM documents"),
      "default"
    );
    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("INSERT OR REPLACE INTO settings"),
      LOCAL_DEV_CLEAN_SLATE_SETTING,
      "true"
    );
  });

  it("deletes optional knowledge tables when they exist", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");

    const run = vi.fn();
    const db = {
      prepare: vi.fn((sql: string) => ({
        get: vi.fn((tableName: string) => {
          if (sql.includes("SELECT value FROM settings")) return undefined;
          if (sql.includes("sqlite_master") && tableName === "knowledge_chunks") {
            return { name: "knowledge_chunks" };
          }
          return undefined;
        }),
        run: (...args: unknown[]) => run(sql, ...args),
      })),
      transaction: vi.fn((fn) => fn),
    };

    runLocalDevCleanSlateMigration(db);

    expect(run).toHaveBeenCalledWith(
      "DELETE FROM knowledge_chunks WHERE user_id = ?",
      "default"
    );
    expect(run).not.toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM chunks_vec"),
      "default"
    );
  });
});
