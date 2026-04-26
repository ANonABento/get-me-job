import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
    transaction: vi.fn((fn) => fn),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-id",
}));

import db from "./schema";
import {
  insertBankEntry,
  insertBankEntries,
  getBankEntries,
  getBankEntriesByCategory,
  getGroupedBankEntries,
  searchBankEntries,
  deleteBankEntriesBySource,
  clearBankEntries,
  findDuplicateEntry,
  updateBankEntry,
  getSourceDocuments,
  deleteSourceDocument,
  deleteSourceDocuments,
} from "./profile-bank";

describe("Profile Bank DB Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insertBankEntry", () => {
    it("should insert a bank entry and return its id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const id = insertBankEntry({
        category: "experience",
        content: { company: "Acme", title: "Engineer" },
        sourceDocumentId: "doc-1",
        confidenceScore: 0.9,
      });

      expect(id).toBe("test-id");
      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        "default",
        "experience",
        JSON.stringify({ company: "Acme", title: "Engineer" }),
        "doc-1",
        0.9
      );
    });

    it("should use default confidence when not provided", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertBankEntry({
        category: "skill",
        content: { name: "React" },
      });

      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        "default",
        "skill",
        JSON.stringify({ name: "React" }),
        null,
        0.8
      );
    });
  });

  describe("insertBankEntries", () => {
    it("should insert multiple entries in a transaction", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      const ids = insertBankEntries([
        { category: "skill", content: { name: "React" } },
        { category: "skill", content: { name: "TypeScript" } },
      ]);

      expect(ids).toHaveLength(2);
      expect(db.transaction).toHaveBeenCalled();
    });
  });

  describe("getBankEntries", () => {
    it("should return all entries for a user", () => {
      const mockRows = [
        {
          id: "entry-1",
          user_id: "default",
          category: "skill",
          content: '{"name":"React"}',
          source_document_id: "doc-1",
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getBankEntries();

      expect(result).toEqual([
        {
          id: "entry-1",
          userId: "default",
          category: "skill",
          content: { name: "React" },
          sourceDocumentId: "doc-1",
          confidenceScore: 0.9,
          createdAt: "2024-01-15T10:00:00.000Z",
        },
      ]);
    });

    it("should return empty array when no entries", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getBankEntries();
      expect(result).toEqual([]);
    });
  });

  describe("getBankEntriesByCategory", () => {
    it("should filter by category", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getBankEntriesByCategory("skill");

      expect(mockAll).toHaveBeenCalledWith("default", "skill");
    });
  });

  describe("getGroupedBankEntries", () => {
    it("should group entries by category", () => {
      const mockRows = [
        {
          id: "e1",
          user_id: "default",
          category: "skill",
          content: '{"name":"React"}',
          source_document_id: null,
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
        {
          id: "e2",
          user_id: "default",
          category: "experience",
          content: '{"company":"Acme"}',
          source_document_id: null,
          confidence_score: 0.85,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getGroupedBankEntries();

      expect(result.skill).toHaveLength(1);
      expect(result.experience).toHaveLength(1);
      expect(result.project).toHaveLength(0);
      expect(result.education).toHaveLength(0);
      expect(result.achievement).toHaveLength(0);
      expect(result.certification).toHaveLength(0);
    });
  });

  describe("searchBankEntries", () => {
    it("should search with LIKE pattern", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      searchBankEntries("react");

      expect(mockAll).toHaveBeenCalledWith("default", "%react%");
    });
  });

  describe("deleteBankEntriesBySource", () => {
    it("should delete entries by source document id", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 3 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const count = deleteBankEntriesBySource("doc-1");

      expect(count).toBe(3);
      expect(mockRun).toHaveBeenCalledWith("default", "doc-1");
    });
  });

  describe("clearBankEntries", () => {
    it("should delete all entries for a user", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      clearBankEntries();

      expect(mockRun).toHaveBeenCalledWith("default");
    });
  });

  describe("findDuplicateEntry", () => {
    it("should return entry when duplicate found", () => {
      const mockRow = {
        id: "existing-1",
        user_id: "default",
        category: "skill",
        content: '{"name":"React"}',
        source_document_id: null,
        confidence_score: 0.8,
        created_at: "2024-01-15T10:00:00.000Z",
      };
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([mockRow]) });

      const result = findDuplicateEntry("skill", "react");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("existing-1");
    });

    it("should return null when no duplicate found", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = findDuplicateEntry("skill", "unknown-skill");

      expect(result).toBeNull();
    });
  });

  describe("updateBankEntry", () => {
    it("should update content and confidence score", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntry("entry-1", { name: "React", proficiency: "expert" }, 0.95);

      expect(mockRun).toHaveBeenCalledWith(
        JSON.stringify({ name: "React", proficiency: "expert" }),
        0.95,
        "entry-1",
        "default"
      );
    });

    it("should scope updates to the provided user", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntry("entry-1", { name: "React" }, 0.95, "user-123");

      expect(db.prepare).toHaveBeenCalledWith(
        "UPDATE profile_bank SET content = ?, confidence_score = ? WHERE id = ? AND user_id = ?"
      );
      expect(mockRun).toHaveBeenCalledWith(
        JSON.stringify({ name: "React" }),
        0.95,
        "entry-1",
        "user-123"
      );
    });
  });

  describe("getSourceDocuments", () => {
    it("should return source documents with chunk counts", () => {
      const mockRows = [
        {
          id: "doc-1",
          filename: "resume.pdf",
          size: 12345,
          uploaded_at: "2024-01-15T10:00:00.000Z",
          chunk_count: 5,
        },
      ];
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getSourceDocuments();

      expect(result).toEqual([
        {
          id: "doc-1",
          filename: "resume.pdf",
          size: 12345,
          uploadedAt: "2024-01-15T10:00:00.000Z",
          chunkCount: 5,
        },
      ]);
    });

    it("should return empty array when no source documents", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getSourceDocuments();
      expect(result).toEqual([]);
    });

    it("should pass userId to query", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getSourceDocuments("user-123");

      expect(mockAll).toHaveBeenCalledWith("user-123");
    });
  });

  describe("deleteSourceDocument", () => {
    it("should delete bank entries and document in a transaction", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 3 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      const count = deleteSourceDocument("doc-1");

      expect(count).toBe(3);
      // First call: delete from profile_bank
      expect(mockRun).toHaveBeenCalledWith("doc-1", "default");
      // Second call: delete from documents
      expect(mockRun).toHaveBeenCalledTimes(2);
    });

    it("should pass userId to both queries", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      deleteSourceDocument("doc-1", "user-123");

      expect(mockRun).toHaveBeenCalledWith("doc-1", "user-123");
    });
  });

  describe("deleteSourceDocuments", () => {
    it("should return zero counts when no document ids are provided", () => {
      const result = deleteSourceDocuments([]);

      expect(result).toEqual({ documentsDeleted: 0, chunksDeleted: 0 });
      expect(db.prepare).not.toHaveBeenCalled();
    });

    it("should delete unique documents and bank entries in a transaction", () => {
      const entryRun = vi
        .fn()
        .mockReturnValueOnce({ changes: 3 })
        .mockReturnValueOnce({ changes: 2 });
      const docRun = vi
        .fn()
        .mockReturnValueOnce({ changes: 1 })
        .mockReturnValueOnce({ changes: 1 });
      (db.prepare as Mock)
        .mockReturnValueOnce({ run: entryRun })
        .mockReturnValueOnce({ run: docRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      const result = deleteSourceDocuments(["doc-1", "doc-2", "doc-1"], "user-123");

      expect(result).toEqual({ documentsDeleted: 2, chunksDeleted: 5 });
      expect(entryRun).toHaveBeenCalledTimes(2);
      expect(docRun).toHaveBeenCalledTimes(2);
      expect(entryRun).toHaveBeenNthCalledWith(1, "doc-1", "user-123");
      expect(entryRun).toHaveBeenNthCalledWith(2, "doc-2", "user-123");
      expect(docRun).toHaveBeenNthCalledWith(1, "doc-1", "user-123");
      expect(docRun).toHaveBeenNthCalledWith(2, "doc-2", "user-123");
    });
  });
});
