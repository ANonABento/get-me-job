import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
    transaction: vi.fn((fn: () => unknown) => fn),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-id",
}));

import db from "./schema";
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

const mockVariantRow = {
  id: "variant-1",
  name: "Default",
  version: 1,
  content: DEFAULT_PROMPT_CONTENT,
  active: 1,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const expectedVariant = {
  id: "variant-1",
  name: "Default",
  version: 1,
  content: DEFAULT_PROMPT_CONTENT,
  active: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

function makeStmt(overrides: Record<string, unknown> = {}) {
  return {
    run: vi.fn().mockReturnValue({ changes: 1 }),
    get: vi.fn().mockReturnValue(mockVariantRow),
    all: vi.fn().mockReturnValue([mockVariantRow]),
    ...overrides,
  };
}

describe("prompt-variants DB module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_PROMPT_CONTENT", () => {
    it("is a non-empty string", () => {
      expect(typeof DEFAULT_PROMPT_CONTENT).toBe("string");
      expect(DEFAULT_PROMPT_CONTENT.length).toBeGreaterThan(0);
    });
  });

  describe("seedDefaultPromptVariant", () => {
    it("inserts default variant when table is empty", () => {
      const stmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      const insertStmt = makeStmt();
      (db.prepare as Mock)
        .mockReturnValueOnce(stmt) // SELECT id check
        .mockReturnValueOnce(insertStmt); // INSERT

      const id = seedDefaultPromptVariant();
      expect(id).toBe("test-id");
      expect(insertStmt.run).toHaveBeenCalledWith(
        "test-id",
        "Default",
        DEFAULT_PROMPT_CONTENT,
        expect.any(String),
        expect.any(String)
      );
    });

    it("returns null when variants already exist", () => {
      const stmt = makeStmt({ get: vi.fn().mockReturnValue({ id: "existing" }) });
      (db.prepare as Mock).mockReturnValue(stmt);

      const id = seedDefaultPromptVariant();
      expect(id).toBeNull();
    });
  });

  describe("getAllPromptVariants", () => {
    it("returns all variants mapped from DB rows", () => {
      const stmt = makeStmt();
      (db.prepare as Mock).mockReturnValue(stmt);

      const result = getAllPromptVariants();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedVariant);
    });

    it("returns empty array when no variants", () => {
      const stmt = makeStmt({ all: vi.fn().mockReturnValue([]) });
      (db.prepare as Mock).mockReturnValue(stmt);

      expect(getAllPromptVariants()).toEqual([]);
    });
  });

  describe("getActivePromptVariant", () => {
    it("returns active variant", () => {
      // seedDefaultPromptVariant call (table not empty)
      const checkStmt = makeStmt({ get: vi.fn().mockReturnValue({ id: "variant-1" }) });
      const activeStmt = makeStmt({ get: vi.fn().mockReturnValue(mockVariantRow) });
      (db.prepare as Mock)
        .mockReturnValueOnce(checkStmt)
        .mockReturnValueOnce(activeStmt);

      const result = getActivePromptVariant();
      expect(result).toEqual(expectedVariant);
    });

    it("returns null when no active variant exists", () => {
      const checkStmt = makeStmt({ get: vi.fn().mockReturnValue({ id: "variant-1" }) });
      const activeStmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      (db.prepare as Mock)
        .mockReturnValueOnce(checkStmt)
        .mockReturnValueOnce(activeStmt);

      expect(getActivePromptVariant()).toBeNull();
    });
  });

  describe("getPromptVariantById", () => {
    it("returns variant when found", () => {
      const stmt = makeStmt({ get: vi.fn().mockReturnValue(mockVariantRow) });
      (db.prepare as Mock).mockReturnValue(stmt);

      expect(getPromptVariantById("variant-1")).toEqual(expectedVariant);
    });

    it("returns null when not found", () => {
      const stmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      (db.prepare as Mock).mockReturnValue(stmt);

      expect(getPromptVariantById("nope")).toBeNull();
    });
  });

  describe("createPromptVariant", () => {
    it("inserts new variant with auto-incremented version", () => {
      const maxVersionStmt = makeStmt({ get: vi.fn().mockReturnValue({ max_v: 1 }) });
      const insertStmt = makeStmt();
      const selectStmt = makeStmt({ get: vi.fn().mockReturnValue({ ...mockVariantRow, id: "test-id", version: 2, active: 0 }) });

      (db.prepare as Mock)
        .mockReturnValueOnce(maxVersionStmt)
        .mockReturnValueOnce(insertStmt)
        .mockReturnValueOnce(selectStmt);

      const result = createPromptVariant("v2", "new instructions");
      expect(insertStmt.run).toHaveBeenCalledWith(
        "test-id",
        "v2",
        2,
        "new instructions",
        expect.any(String),
        expect.any(String)
      );
      expect(result.id).toBe("test-id");
    });

    it("accepts explicit version", () => {
      const insertStmt = makeStmt();
      const selectStmt = makeStmt({ get: vi.fn().mockReturnValue({ ...mockVariantRow, version: 5 }) });

      (db.prepare as Mock)
        .mockReturnValueOnce(insertStmt)
        .mockReturnValueOnce(selectStmt);

      createPromptVariant("v5", "content", 5);
      expect(insertStmt.run).toHaveBeenCalledWith(
        "test-id",
        "v5",
        5,
        "content",
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe("setActivePromptVariant", () => {
    it("deactivates all and activates the target", () => {
      // getPromptVariantById call
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(mockVariantRow) });
      const deactivateAllStmt = makeStmt();
      const activateStmt = makeStmt({ run: vi.fn().mockReturnValue({ changes: 1 }) });

      (db.prepare as Mock)
        .mockReturnValueOnce(getStmt)
        .mockReturnValueOnce(deactivateAllStmt)
        .mockReturnValueOnce(activateStmt);

      const result = setActivePromptVariant("variant-1");
      expect(result).toBe(true);
      expect(deactivateAllStmt.run).toHaveBeenCalled();
      expect(activateStmt.run).toHaveBeenCalledWith(expect.any(String), "variant-1");
    });

    it("returns false when variant not found", () => {
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      (db.prepare as Mock).mockReturnValue(getStmt);

      expect(setActivePromptVariant("missing")).toBe(false);
    });
  });

  describe("updatePromptVariant", () => {
    it("updates name and content", () => {
      const getStmt1 = makeStmt({ get: vi.fn().mockReturnValue(mockVariantRow) });
      const updateStmt = makeStmt();
      const getStmt2 = makeStmt({ get: vi.fn().mockReturnValue({ ...mockVariantRow, name: "Updated" }) });

      (db.prepare as Mock)
        .mockReturnValueOnce(getStmt1)
        .mockReturnValueOnce(updateStmt)
        .mockReturnValueOnce(getStmt2);

      const result = updatePromptVariant("variant-1", { name: "Updated" });
      expect(updateStmt.run).toHaveBeenCalledWith(
        "Updated",
        DEFAULT_PROMPT_CONTENT,
        expect.any(String),
        "variant-1"
      );
      expect(result?.name).toBe("Updated");
    });

    it("returns null when variant not found", () => {
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      (db.prepare as Mock).mockReturnValue(getStmt);

      expect(updatePromptVariant("missing", { name: "x" })).toBeNull();
    });
  });

  describe("deletePromptVariant", () => {
    it("deletes inactive variant", () => {
      const inactiveRow = { ...mockVariantRow, active: 0 };
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(inactiveRow) });
      const deleteStmt = makeStmt({ run: vi.fn().mockReturnValue({ changes: 1 }) });

      (db.prepare as Mock)
        .mockReturnValueOnce(getStmt)
        .mockReturnValueOnce(deleteStmt);

      expect(deletePromptVariant("variant-1")).toBe(true);
    });

    it("refuses to delete the active variant", () => {
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(mockVariantRow) }); // active=1
      (db.prepare as Mock).mockReturnValue(getStmt);

      expect(deletePromptVariant("variant-1")).toBe(false);
    });

    it("returns false when variant not found", () => {
      const getStmt = makeStmt({ get: vi.fn().mockReturnValue(undefined) });
      (db.prepare as Mock).mockReturnValue(getStmt);

      expect(deletePromptVariant("missing")).toBe(false);
    });
  });

  describe("logPromptVariantResult", () => {
    it("inserts a result record and returns it", () => {
      const resultRow = {
        id: "test-id",
        prompt_variant_id: "variant-1",
        job_id: "job-1",
        resume_id: "resume-1",
        match_score: 85.5,
        created_at: "2024-01-01T00:00:00.000Z",
      };
      const insertStmt = makeStmt();
      const selectStmt = makeStmt({ get: vi.fn().mockReturnValue(resultRow) });

      (db.prepare as Mock)
        .mockReturnValueOnce(insertStmt)
        .mockReturnValueOnce(selectStmt);

      const result = logPromptVariantResult("variant-1", "job-1", "resume-1", 85.5);
      expect(result.id).toBe("test-id");
      expect(result.promptVariantId).toBe("variant-1");
      expect(result.matchScore).toBe(85.5);
    });

    it("allows optional fields to be omitted", () => {
      const resultRow = {
        id: "test-id",
        prompt_variant_id: "variant-1",
        job_id: null,
        resume_id: null,
        match_score: null,
        created_at: "2024-01-01T00:00:00.000Z",
      };
      const insertStmt = makeStmt();
      const selectStmt = makeStmt({ get: vi.fn().mockReturnValue(resultRow) });

      (db.prepare as Mock)
        .mockReturnValueOnce(insertStmt)
        .mockReturnValueOnce(selectStmt);

      const result = logPromptVariantResult("variant-1");
      expect(insertStmt.run).toHaveBeenCalledWith(
        "test-id",
        "variant-1",
        null,
        null,
        null,
        expect.any(String)
      );
      expect(result.jobId).toBeNull();
    });
  });

  describe("getPromptVariantResults", () => {
    it("returns mapped result rows", () => {
      const rows = [
        {
          id: "r1",
          prompt_variant_id: "variant-1",
          job_id: "j1",
          resume_id: "res1",
          match_score: 70,
          created_at: "2024-01-01",
        },
      ];
      const stmt = makeStmt({ all: vi.fn().mockReturnValue(rows) });
      (db.prepare as Mock).mockReturnValue(stmt);

      const results = getPromptVariantResults("variant-1");
      expect(results).toHaveLength(1);
      expect(results[0].promptVariantId).toBe("variant-1");
      expect(results[0].matchScore).toBe(70);
    });
  });

  describe("getPromptVariantStats", () => {
    it("returns stats with boolean active field", () => {
      const statsRows = [
        {
          variant_id: "variant-1",
          variant_name: "Default",
          version: 1,
          active: 1,
          result_count: 5,
          avg_match_score: 75.2,
        },
        {
          variant_id: "variant-2",
          variant_name: "v2",
          version: 2,
          active: 0,
          result_count: 0,
          avg_match_score: null,
        },
      ];
      const stmt = makeStmt({ all: vi.fn().mockReturnValue(statsRows) });
      (db.prepare as Mock).mockReturnValue(stmt);

      const stats = getPromptVariantStats();
      expect(stats).toHaveLength(2);
      expect(stats[0].active).toBe(true);
      expect(stats[0].resultCount).toBe(5);
      expect(stats[0].avgMatchScore).toBe(75.2);
      expect(stats[1].active).toBe(false);
      expect(stats[1].avgMatchScore).toBeNull();
    });
  });
});
