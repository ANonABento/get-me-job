import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./legacy", () => {
  const mockDb = {
    prepare: vi.fn(),
    transaction: vi.fn((fn) => fn),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-id",
}));

import db from "./legacy";
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
  getDeduplicationKey,
  updateBankEntry,
  updateBankEntryPositions,
  deleteBankEntry,
  getSourceDocuments,
  deleteSourceDocument,
  deleteSourceDocuments,
} from "./profile-bank";

const TEST_USER_ID = "test-user";

describe("Profile Bank DB Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insertBankEntry", () => {
    it("should insert a bank entry and return its id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const id = insertBankEntry(
        {
          category: "experience",
          content: { company: "Acme", title: "Engineer" },
          sourceDocumentId: "doc-1",
          confidenceScore: 0.9,
        },
        TEST_USER_ID,
      );

      expect(id).toBe("test-id");
      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        TEST_USER_ID,
        "experience",
        JSON.stringify({ company: "Acme", title: "Engineer" }),
        "doc-1",
        null,
        "experience",
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0.9,
      );
    });

    it("should use default confidence when not provided", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertBankEntry(
        {
          category: "skill",
          content: { name: "React" },
        },
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        TEST_USER_ID,
        "skill",
        JSON.stringify({ name: "React" }),
        null,
        null,
        "skill",
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0.8,
      );
    });

    it("persists parent hierarchy metadata as first-class columns", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertBankEntry(
        {
          category: "bullet",
          content: {
            description: "Built parser",
            parentId: "parent-1",
            parentType: "experience",
            order: 2,
            sourceSection: "experience",
          },
        },
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        TEST_USER_ID,
        "bullet",
        JSON.stringify({
          description: "Built parser",
          parentId: "parent-1",
          parentType: "experience",
          order: 2,
          sourceSection: "experience",
        }),
        null,
        "parent-1",
        "experience",
        2,
        "experience",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0.8,
      );
    });

    it("persists source preview citation metadata", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertBankEntry(
        {
          category: "project",
          content: { name: "Portfolio" },
          sourceOrder: 7,
          sourceHeaderBbox: [[1, 72, 120, 180, 132]],
          sourceLinks: [
            {
              url: "https://example.com",
              text: "Portfolio",
              page: 1,
              bbox: [1, 180, 120, 220, 132],
            },
          ],
        },
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        TEST_USER_ID,
        "project",
        JSON.stringify({ name: "Portfolio" }),
        null,
        null,
        "project",
        0,
        null,
        null,
        null,
        7,
        JSON.stringify([[1, 72, 120, 180, 132]]),
        JSON.stringify([
          {
            url: "https://example.com",
            text: "Portfolio",
            page: 1,
            bbox: [1, 180, 120, 220, 132],
          },
        ]),
        null,
        null,
        null,
        null,
        null,
        0.8,
      );
    });

    it("persists parser-v2 source refs as first-class columns", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertBankEntry(
        {
          category: "education",
          content: { institution: "Southwestern University" },
          sourceDocumentId: "doc-1",
          sourcePage: 1,
          sourceBbox: [[1, 10, 20, 200, 34]],
          sourceArtifactId: "artifact-1",
          sourceParseRunId: "run-1",
          sourceSpanIds: ["p1-l004"],
          sourceQuality: "exact",
          matchMethod: "parser-v2",
        },
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-id",
        TEST_USER_ID,
        "education",
        JSON.stringify({ institution: "Southwestern University" }),
        "doc-1",
        null,
        "education",
        0,
        null,
        1,
        JSON.stringify([[1, 10, 20, 200, 34]]),
        null,
        null,
        null,
        "artifact-1",
        "run-1",
        JSON.stringify(["p1-l004"]),
        "exact",
        "parser-v2",
        0.8,
      );
    });
  });

  describe("insertBankEntries", () => {
    it("should insert multiple entries in a transaction", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });
      (db.transaction as Mock).mockImplementation((fn) => fn);

      const ids = insertBankEntries(
        [
          { category: "skill", content: { name: "React" } },
          { category: "skill", content: { name: "TypeScript" } },
        ],
        TEST_USER_ID,
      );

      expect(ids).toHaveLength(2);
      expect(db.transaction).toHaveBeenCalled();
    });
  });

  describe("getBankEntries", () => {
    it("should return all entries for a user", () => {
      const mockRows = [
        {
          id: "entry-1",
          user_id: TEST_USER_ID,
          category: "skill",
          content: '{"name":"React"}',
          source_document_id: "doc-1",
          source_order: 4,
          source_bbox: JSON.stringify([[2, 10, 20, 30, 40]]),
          source_header_bbox: JSON.stringify([[2, 10, 20, 30, 28]]),
          source_links: JSON.stringify([
            { url: "https://example.com", page: 2 },
          ]),
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = getBankEntries(TEST_USER_ID);

      expect(result).toEqual([
        {
          id: "entry-1",
          userId: TEST_USER_ID,
          category: "skill",
          content: { name: "React" },
          sourceDocumentId: "doc-1",
          sourcePage: undefined,
          sourceBbox: [[2, 10, 20, 30, 40]],
          sourceOrder: 4,
          sourceHeaderBbox: [[2, 10, 20, 30, 28]],
          sourceLinks: [{ url: "https://example.com", page: 2 }],
          confidenceScore: 0.9,
          createdAt: "2024-01-15T10:00:00.000Z",
        },
      ]);
    });

    it("maps legacy rows without source preview citation metadata", () => {
      const mockRows = [
        {
          id: "entry-legacy",
          user_id: TEST_USER_ID,
          category: "skill",
          content: '{"name":"React"}',
          source_document_id: null,
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = getBankEntries(TEST_USER_ID);

      expect(result[0]).toMatchObject({
        id: "entry-legacy",
        sourceBbox: undefined,
        sourceOrder: undefined,
        sourceHeaderBbox: undefined,
        sourceLinks: undefined,
      });
    });

    it("hydrates hierarchy metadata from first-class columns", () => {
      const mockRows = [
        {
          id: "entry-1",
          user_id: TEST_USER_ID,
          category: "achievement",
          content: '{"description":"Built parser"}',
          source_document_id: "doc-1",
          parent_id: "parent-1",
          component_type: "experience",
          component_order: 3,
          source_section: "experience",
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = getBankEntries(TEST_USER_ID);

      expect(result[0].content).toEqual({
        description: "Built parser",
        parentId: "parent-1",
        componentType: "experience",
        order: 3,
        sourceSection: "experience",
      });
    });

    it("rolls up child counts onto parent entries", () => {
      const parentRows = [
        {
          id: "parent-1",
          user_id: TEST_USER_ID,
          category: "experience",
          content: '{"title":"Engineer","company":"Acme","childCount":0}',
          source_document_id: null,
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
        {
          id: "parent-2",
          user_id: TEST_USER_ID,
          category: "project",
          content: '{"name":"Portfolio"}',
          source_document_id: null,
          confidence_score: 0.85,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock)
        .mockReturnValueOnce({
          all: vi.fn().mockReturnValue(parentRows),
        })
        .mockReturnValueOnce({
          all: vi
            .fn()
            .mockReturnValue([{ parent_id: "parent-1", child_count: 3 }]),
        });

      const result = getBankEntries(TEST_USER_ID);

      expect(result[0].content.childCount).toBe(3);
      expect(result[1].content.childCount).toBe(0);
    });

    it("should return empty array when no entries", () => {
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      });

      const result = getBankEntries(TEST_USER_ID);
      expect(result).toEqual([]);
    });
  });

  describe("getBankEntriesByCategory", () => {
    it("should filter by category", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getBankEntriesByCategory("skill", TEST_USER_ID);

      expect(mockAll).toHaveBeenCalledWith(TEST_USER_ID, "skill");
    });

    it("rolls up child counts when filtering to parent categories", () => {
      const mockCategoryAll = vi.fn().mockReturnValue([
        {
          id: "parent-1",
          user_id: TEST_USER_ID,
          category: "experience",
          content: '{"title":"Engineer","company":"Acme"}',
          source_document_id: null,
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ]);
      const mockCountAll = vi
        .fn()
        .mockReturnValue([{ parent_id: "parent-1", child_count: 2 }]);
      (db.prepare as Mock)
        .mockReturnValueOnce({ all: mockCategoryAll })
        .mockReturnValueOnce({ all: mockCountAll });

      const result = getBankEntriesByCategory("experience", TEST_USER_ID);

      expect(mockCategoryAll).toHaveBeenCalledWith(TEST_USER_ID, "experience");
      expect(mockCountAll).toHaveBeenCalledWith(TEST_USER_ID);
      expect(result[0].content.childCount).toBe(2);
    });
  });

  describe("getGroupedBankEntries", () => {
    it("should group entries by category", () => {
      const mockRows = [
        {
          id: "e1",
          user_id: TEST_USER_ID,
          category: "skill",
          content: '{"name":"React"}',
          source_document_id: null,
          confidence_score: 0.9,
          created_at: "2024-01-15T10:00:00.000Z",
        },
        {
          id: "e2",
          user_id: TEST_USER_ID,
          category: "experience",
          content: '{"company":"Acme"}',
          source_document_id: null,
          confidence_score: 0.85,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = getGroupedBankEntries(TEST_USER_ID);

      expect(result.skill).toHaveLength(1);
      expect(result.experience).toHaveLength(1);
      expect(result.project).toHaveLength(0);
      expect(result.hackathon).toHaveLength(0);
      expect(result.education).toHaveLength(0);
      expect(result.bullet).toHaveLength(0);
      expect(result.achievement).toHaveLength(0);
      expect(result.certification).toHaveLength(0);
    });
  });

  describe("searchBankEntries", () => {
    it("should search with LIKE pattern", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      searchBankEntries("react", TEST_USER_ID);

      expect(mockAll).toHaveBeenCalledWith(TEST_USER_ID, "%react%");
    });

    it("rolls up child counts for parent search results", () => {
      (db.prepare as Mock)
        .mockReturnValueOnce({
          all: vi.fn().mockReturnValue([
            {
              id: "project-1",
              user_id: TEST_USER_ID,
              category: "project",
              content: '{"name":"Portfolio"}',
              source_document_id: null,
              confidence_score: 0.9,
              created_at: "2024-01-15T10:00:00.000Z",
            },
          ]),
        })
        .mockReturnValueOnce({
          all: vi
            .fn()
            .mockReturnValue([{ parent_id: "project-1", child_count: 4 }]),
        });

      const result = searchBankEntries("portfolio", TEST_USER_ID);

      expect(result[0].content.childCount).toBe(4);
    });
  });

  describe("deleteBankEntriesBySource", () => {
    it("should delete entries by source document id", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 3 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const count = deleteBankEntriesBySource("doc-1", TEST_USER_ID);

      expect(count).toBe(3);
      expect(mockRun).toHaveBeenCalledWith(TEST_USER_ID, "doc-1");
    });
  });

  describe("clearBankEntries", () => {
    it("should delete all entries for a user", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      clearBankEntries(TEST_USER_ID);

      expect(mockRun).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });

  describe("findDuplicateEntry", () => {
    it("should return entry when duplicate found", () => {
      const mockRow = {
        id: "existing-1",
        user_id: TEST_USER_ID,
        category: "skill",
        content: '{"name":"React"}',
        source_document_id: null,
        confidence_score: 0.8,
        created_at: "2024-01-15T10:00:00.000Z",
      };
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([mockRow]),
      });

      const result = findDuplicateEntry("skill", "react", TEST_USER_ID);

      expect(result).not.toBeNull();
      expect(result?.id).toBe("existing-1");
    });

    it("should return null when no duplicate found", () => {
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      });

      const result = findDuplicateEntry("skill", "unknown-skill", TEST_USER_ID);

      expect(result).toBeNull();
    });
  });

  describe("getDeduplicationKey", () => {
    it("uses hackathon name and submission URL for duplicate detection", () => {
      expect(
        getDeduplicationKey("hackathon", {
          name: "AI Build Weekend",
          submissionUrl: "https://example.devpost.com/submissions/1",
        }),
      ).toBe("ai build weekend|https://example.devpost.com/submissions/1");
    });
  });

  describe("updateBankEntry", () => {
    it("should update content and confidence score", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntry(
        "entry-1",
        { name: "React", proficiency: "expert" },
        0.95,
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        JSON.stringify({ name: "React", proficiency: "expert" }),
        null,
        null,
        0,
        null,
        0.95,
        "entry-1",
        TEST_USER_ID,
      );
    });

    it("should scope updates to the provided user", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntry("entry-1", { name: "React" }, 0.95, "user-123");

      expect(mockRun).toHaveBeenCalledWith(
        JSON.stringify({ name: "React" }),
        null,
        null,
        0,
        null,
        0.95,
        "entry-1",
        "user-123",
      );
    });
  });

  describe("deleteBankEntry", () => {
    it("cascades child bullet and legacy achievement entries before deleting the parent", () => {
      const childRun = vi.fn().mockReturnValue({ changes: 2 });
      const parentRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock)
        .mockReturnValueOnce({ run: childRun })
        .mockReturnValueOnce({ run: parentRun });

      const deleted = deleteBankEntry("parent-1", "user-123");

      expect(deleted).toBe(true);
      expect(childRun).toHaveBeenCalledWith("user-123", "parent-1", "parent-1");
      expect(parentRun).toHaveBeenCalledWith("parent-1", "user-123");
    });
  });

  describe("updateBankEntryPositions", () => {
    it("updates legacy source bbox fields and additive citation metadata", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntryPositions("entry-1", "user-123", {
        page: 2,
        bboxes: [[2, 10, 20, 30, 40]],
        sourceOrder: 5,
        headerBboxes: [[2, 10, 20, 30, 28]],
        sourceLinks: [
          {
            url: "https://example.com",
            text: "Portfolio",
            page: 2,
            bbox: [2, 30, 20, 60, 28],
          },
        ],
      });

      expect(mockRun).toHaveBeenCalledWith(
        2,
        JSON.stringify([[2, 10, 20, 30, 40]]),
        5,
        JSON.stringify([[2, 10, 20, 30, 28]]),
        JSON.stringify([
          {
            url: "https://example.com",
            text: "Portfolio",
            page: 2,
            bbox: [2, 30, 20, 60, 28],
          },
        ]),
        "fuzzy",
        "entry-1",
        "user-123",
      );
    });

    it("preserves existing additive metadata when only sourceBbox is updated", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      updateBankEntryPositions("entry-1", "user-123", {
        page: 1,
        bboxes: [[1, 1, 2, 3, 4]],
        matchMethod: "fuzzy",
      });

      expect(mockRun).toHaveBeenCalledWith(
        1,
        JSON.stringify([[1, 1, 2, 3, 4]]),
        null,
        null,
        null,
        "fuzzy",
        "entry-1",
        "user-123",
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
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue(mockRows),
      });

      const result = getSourceDocuments(TEST_USER_ID);

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
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      });

      const result = getSourceDocuments(TEST_USER_ID);
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

      const count = deleteSourceDocument("doc-1", TEST_USER_ID);

      expect(count).toBe(3);
      // First call: delete from profile_bank
      expect(mockRun).toHaveBeenCalledWith("doc-1", TEST_USER_ID);
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
      const result = deleteSourceDocuments([], TEST_USER_ID);

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

      const result = deleteSourceDocuments(
        ["doc-1", "doc-2", "doc-1"],
        "user-123",
      );

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
