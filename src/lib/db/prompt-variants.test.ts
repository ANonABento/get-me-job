import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Database from "libsql";

// Use a real in-memory libSQL DB to verify cross-user isolation. Mocking
// db.prepare would let an IDOR regression slip through if the WHERE clause
// were dropped — only a real DB faithfully proves the user_id filter holds.
//
// vi.hoisted runs before module imports so the proxy is wired into the mock
// before prompt-variants.ts is loaded.
const { dbProxy, idCounter } = vi.hoisted(() => {
  const state: { db: unknown } = { db: null };
  const proxy = {
    setDb(db: unknown) {
      state.db = db;
    },
    prepare(sql: string) {
      return (state.db as { prepare: (s: string) => unknown }).prepare(sql);
    },
    exec(sql: string) {
      return (state.db as { exec: (s: string) => unknown }).exec(sql);
    },
    transaction<T>(fn: () => T) {
      return (
        state.db as { transaction: (f: () => T) => () => T }
      ).transaction(fn);
    },
    pragma(s: string) {
      return (state.db as { pragma: (s: string) => unknown }).pragma(s);
    },
  };
  return { dbProxy: proxy, idCounter: { value: 0 } };
});

vi.mock("./legacy", () => ({
  default: dbProxy,
}));

vi.mock("@/lib/utils", () => ({
  generateId: () => `id-${++idCounter.value}`,
}));

let memDb: Database.Database;

import {
  DEFAULT_PROMPT_CONTENT,
  seedDefaultPromptVariant,
  getAllPromptVariants,
  getActivePromptVariant,
  getPromptVariantById,
  createPromptVariant,
  setActivePromptVariant,
  updatePromptVariant,
  deletePromptVariant,
  logPromptVariantResult,
  getPromptVariantResults,
  getPromptVariantStats,
} from "./prompt-variants";

function createSchema(db: Database.Database) {
  // Intentionally start without user_id columns so we exercise the runtime
  // schema migration in `ensurePromptVariantsUserSchema`.
  db.exec(`
    CREATE TABLE prompt_variants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE prompt_variant_results (
      id TEXT PRIMARY KEY,
      prompt_variant_id TEXT NOT NULL,
      job_id TEXT,
      resume_id TEXT,
      match_score REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

describe("prompt-variants DB module", () => {
  beforeEach(() => {
    idCounter.value = 0;
    memDb = new Database(":memory:");
    createSchema(memDb);
    dbProxy.setDb(memDb);
  });

  afterEach(() => {
    memDb.close();
  });

  describe("DEFAULT_PROMPT_CONTENT", () => {
    it("is a non-empty string", () => {
      expect(typeof DEFAULT_PROMPT_CONTENT).toBe("string");
      expect(DEFAULT_PROMPT_CONTENT.length).toBeGreaterThan(0);
    });
  });

  describe("schema migration", () => {
    it("backfills user_id columns when calling any function", () => {
      seedDefaultPromptVariant("user-A");

      const variantCols = (
        memDb.prepare("PRAGMA table_info(prompt_variants)").all() as Array<{
          name: string;
        }>
      ).map((c) => c.name);
      const resultCols = (
        memDb
          .prepare("PRAGMA table_info(prompt_variant_results)")
          .all() as Array<{ name: string }>
      ).map((c) => c.name);

      expect(variantCols).toContain("user_id");
      expect(resultCols).toContain("user_id");
    });
  });

  describe("seedDefaultPromptVariant", () => {
    it("inserts default variant for user when none exists", () => {
      const id = seedDefaultPromptVariant("user-A");
      expect(id).toBeTruthy();

      const variants = getAllPromptVariants("user-A");
      expect(variants).toHaveLength(1);
      expect(variants[0].name).toBe("Default");
      expect(variants[0].active).toBe(true);
    });

    it("returns null when the user already has a variant", () => {
      seedDefaultPromptVariant("user-A");
      expect(seedDefaultPromptVariant("user-A")).toBeNull();
    });

    it("seeds independently per user", () => {
      seedDefaultPromptVariant("user-A");
      seedDefaultPromptVariant("user-B");

      expect(getAllPromptVariants("user-A")).toHaveLength(1);
      expect(getAllPromptVariants("user-B")).toHaveLength(1);
      expect(getAllPromptVariants("user-A")[0].id).not.toBe(
        getAllPromptVariants("user-B")[0].id,
      );
    });
  });

  describe("multi-user isolation (IDOR regression test)", () => {
    it("getPromptVariantById refuses to return another user's variant", () => {
      seedDefaultPromptVariant("user-A");
      seedDefaultPromptVariant("user-B");
      const aVariant = getAllPromptVariants("user-A")[0];

      // user-B trying to read user-A's variant by guessing id
      expect(getPromptVariantById(aVariant.id, "user-B")).toBeNull();
      // and user-A can still read their own
      expect(getPromptVariantById(aVariant.id, "user-A")).not.toBeNull();
    });

    it("updatePromptVariant cannot rewrite another user's variant", () => {
      seedDefaultPromptVariant("user-A");
      seedDefaultPromptVariant("user-B");
      const aVariant = getAllPromptVariants("user-A")[0];

      const result = updatePromptVariant(aVariant.id, "user-B", {
        name: "Hacked",
      });
      expect(result).toBeNull();

      // verify user-A's variant unchanged
      const after = getPromptVariantById(aVariant.id, "user-A");
      expect(after?.name).toBe("Default");
    });

    it("deletePromptVariant cannot remove another user's variant", () => {
      seedDefaultPromptVariant("user-A");
      // create an inactive variant for A so deletion is allowed
      const created = createPromptVariant("user-A", "v2", "content");
      seedDefaultPromptVariant("user-B");

      expect(deletePromptVariant(created.id, "user-B")).toBe(false);
      expect(getPromptVariantById(created.id, "user-A")).not.toBeNull();
    });

    it("setActivePromptVariant cannot toggle another user's variant", () => {
      seedDefaultPromptVariant("user-A");
      const aSecond = createPromptVariant("user-A", "second", "content");
      seedDefaultPromptVariant("user-B");

      expect(setActivePromptVariant(aSecond.id, "user-B")).toBe(false);

      // A's variants: original Default still active, second still inactive
      const aVariants = getAllPromptVariants("user-A");
      const stillActive = aVariants.find((v) => v.active);
      expect(stillActive?.name).toBe("Default");
    });

    it("getAllPromptVariants only returns the calling user's variants", () => {
      seedDefaultPromptVariant("user-A");
      createPromptVariant("user-A", "a-v2", "content");
      seedDefaultPromptVariant("user-B");

      expect(getAllPromptVariants("user-A")).toHaveLength(2);
      expect(getAllPromptVariants("user-B")).toHaveLength(1);
    });

    it("getPromptVariantResults filters by user_id", () => {
      seedDefaultPromptVariant("user-A");
      const aVariant = getAllPromptVariants("user-A")[0];
      logPromptVariantResult("user-A", aVariant.id, "job-A", "resume-A", 90);
      seedDefaultPromptVariant("user-B");

      // user-B passing user-A's variant id sees nothing
      expect(getPromptVariantResults(aVariant.id, "user-B")).toEqual([]);
      expect(getPromptVariantResults(aVariant.id, "user-A")).toHaveLength(1);
    });

    it("getPromptVariantStats only includes the calling user's variants", () => {
      seedDefaultPromptVariant("user-A");
      seedDefaultPromptVariant("user-B");

      const aStats = getPromptVariantStats("user-A");
      const bStats = getPromptVariantStats("user-B");
      expect(aStats).toHaveLength(1);
      expect(bStats).toHaveLength(1);
      expect(aStats[0].variantId).not.toBe(bStats[0].variantId);
    });
  });

  describe("getActivePromptVariant", () => {
    it("returns the active variant scoped to user", () => {
      seedDefaultPromptVariant("user-A");
      const result = getActivePromptVariant("user-A");
      expect(result?.name).toBe("Default");
      expect(result?.active).toBe(true);
    });

    it("seeds default for first-time user", () => {
      const result = getActivePromptVariant("brand-new-user");
      expect(result?.name).toBe("Default");
    });
  });

  describe("createPromptVariant", () => {
    it("auto-increments version per user", () => {
      seedDefaultPromptVariant("user-A");
      const created = createPromptVariant("user-A", "v2", "instructions");
      expect(created.version).toBe(2);
      expect(created.active).toBe(false);
    });

    it("accepts explicit version", () => {
      const created = createPromptVariant("user-A", "v5", "content", 5);
      expect(created.version).toBe(5);
    });
  });

  describe("setActivePromptVariant", () => {
    it("deactivates the previous active variant for the same user", () => {
      seedDefaultPromptVariant("user-A");
      const second = createPromptVariant("user-A", "second", "content");

      expect(setActivePromptVariant(second.id, "user-A")).toBe(true);

      const variants = getAllPromptVariants("user-A");
      const active = variants.filter((v) => v.active);
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(second.id);
    });

    it("returns false when variant not found", () => {
      expect(setActivePromptVariant("missing", "user-A")).toBe(false);
    });
  });

  describe("updatePromptVariant", () => {
    it("updates name and content", () => {
      seedDefaultPromptVariant("user-A");
      const variants = getAllPromptVariants("user-A");
      const result = updatePromptVariant(variants[0].id, "user-A", {
        name: "Updated",
      });
      expect(result?.name).toBe("Updated");
    });

    it("returns null when variant not found", () => {
      expect(updatePromptVariant("missing", "user-A", { name: "x" })).toBeNull();
    });
  });

  describe("deletePromptVariant", () => {
    it("deletes inactive variant", () => {
      seedDefaultPromptVariant("user-A");
      const inactive = createPromptVariant("user-A", "v2", "content");

      expect(deletePromptVariant(inactive.id, "user-A")).toBe(true);
      expect(getPromptVariantById(inactive.id, "user-A")).toBeNull();
    });

    it("refuses to delete the active variant", () => {
      seedDefaultPromptVariant("user-A");
      const active = getAllPromptVariants("user-A")[0];
      expect(deletePromptVariant(active.id, "user-A")).toBe(false);
    });

    it("returns false when variant not found", () => {
      expect(deletePromptVariant("missing", "user-A")).toBe(false);
    });
  });

  describe("logPromptVariantResult", () => {
    it("inserts a result record and returns it", () => {
      seedDefaultPromptVariant("user-A");
      const variant = getAllPromptVariants("user-A")[0];

      const result = logPromptVariantResult(
        "user-A",
        variant.id,
        "job-1",
        "resume-1",
        85.5,
      );
      expect(result.promptVariantId).toBe(variant.id);
      expect(result.matchScore).toBe(85.5);
      expect(result.jobId).toBe("job-1");
    });

    it("allows optional fields to be omitted", () => {
      seedDefaultPromptVariant("user-A");
      const variant = getAllPromptVariants("user-A")[0];

      const result = logPromptVariantResult("user-A", variant.id);
      expect(result.jobId).toBeNull();
      expect(result.resumeId).toBeNull();
      expect(result.matchScore).toBeNull();
    });
  });

  describe("getPromptVariantStats", () => {
    it("returns stats with boolean active field and result counts", () => {
      seedDefaultPromptVariant("user-A");
      const variant = getAllPromptVariants("user-A")[0];
      logPromptVariantResult("user-A", variant.id, "job-1", "resume-1", 70);
      logPromptVariantResult("user-A", variant.id, "job-2", "resume-2", 80);

      const stats = getPromptVariantStats("user-A");
      expect(stats).toHaveLength(1);
      expect(stats[0].active).toBe(true);
      expect(stats[0].resultCount).toBe(2);
      expect(stats[0].avgMatchScore).toBe(75);
    });
  });
});
