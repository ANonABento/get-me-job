import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("@/lib/utils", () => ({
  generateId: () => "test-chunk-id",
}));

import db from "./schema";
import {
  insertChunk,
  insertChunkVector,
  searchChunks,
  getChunksByType,
  findDuplicateByHash,
  supersedChunk,
} from "./knowledge-bank";

describe("Knowledge Bank DB Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("insertChunk", () => {
    it("should insert a chunk and return its id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const id = insertChunk(
        {
          content: "Built REST APIs with Node.js",
          sectionType: "experience",
          sourceFile: "resume.pdf",
          metadata: { company: "Acme" },
          hash: "abc123hash",
        },
        "default"
      );

      expect(id).toBe("test-chunk-id");
      expect(mockRun).toHaveBeenCalledWith(
        "test-chunk-id",
        "default",
        "Built REST APIs with Node.js",
        "experience",
        "resume.pdf",
        JSON.stringify({ company: "Acme" }),
        "abc123hash"
      );
    });

    it("should handle null metadata and source_file", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      insertChunk(
        { content: "React expert", sectionType: "skills", sourceFile: null, metadata: null, hash: "hash456" },
        "default"
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-chunk-id",
        "default",
        "React expert",
        "skills",
        null,
        null,
        "hash456"
      );
    });
  });

  describe("insertChunkVector", () => {
    it("should insert embedding for a chunk", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const embedding = [0.1, 0.2, 0.3];
      insertChunkVector("chunk-1", embedding);

      expect(mockRun).toHaveBeenCalledWith(
        "chunk-1",
        new Float32Array(embedding)
      );
    });
  });

  describe("searchChunks", () => {
    it("should return chunks sorted by distance", () => {
      const mockRows = [
        {
          id: "chunk-1",
          user_id: "default",
          content: "Node.js backend",
          section_type: "experience",
          source_file: "resume.pdf",
          metadata: '{"company":"Acme"}',
          confidence_score: 0.9,
          superseded_by: null,
          hash: "hash1",
          created_at: "2024-01-15T10:00:00.000Z",
          distance: 0.15,
        },
        {
          id: "chunk-2",
          user_id: "default",
          content: "React frontend",
          section_type: "skills",
          source_file: null,
          metadata: null,
          confidence_score: 0.8,
          superseded_by: null,
          hash: "hash2",
          created_at: "2024-01-15T11:00:00.000Z",
          distance: 0.45,
        },
      ];
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const results = searchChunks("default", [0.1, 0.2, 0.3], 5);

      expect(results).toHaveLength(2);
      expect(results[0].distance).toBe(0.15);
      expect(results[0].id).toBe("chunk-1");
      expect(results[0].metadata).toEqual({ company: "Acme" });
      expect(results[1].distance).toBe(0.45);
      expect(results[1].metadata).toBeNull();
    });

    it("should return empty array when no matches", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const results = searchChunks("default", [0.1, 0.2], 10);
      expect(results).toEqual([]);
    });

    it("should default limit to 10", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      searchChunks("default", [0.1]);

      expect(mockAll).toHaveBeenCalledWith(
        new Float32Array([0.1]),
        "default",
        10
      );
    });
  });

  describe("getChunksByType", () => {
    it("should return chunks filtered by section type", () => {
      const mockRows = [
        {
          id: "chunk-1",
          user_id: "default",
          content: "5 years at Acme",
          section_type: "experience",
          source_file: "resume.pdf",
          metadata: null,
          confidence_score: 0.9,
          superseded_by: null,
          hash: "hash1",
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];
      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getChunksByType("default", "experience");

      expect(result).toHaveLength(1);
      expect(result[0].sectionType).toBe("experience");
      expect(mockAll).toHaveBeenCalledWith("default", "experience");
    });

    it("should return empty array when no chunks of type", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getChunksByType("default", "certification");
      expect(result).toEqual([]);
    });
  });

  describe("findDuplicateByHash", () => {
    it("should return chunk when hash matches", () => {
      const mockRow = {
        id: "chunk-1",
        user_id: "default",
        content: "React expert",
        section_type: "skills",
        source_file: null,
        metadata: null,
        confidence_score: 0.8,
        superseded_by: null,
        hash: "abc123",
        created_at: "2024-01-15T10:00:00.000Z",
      };
      const mockGet = vi.fn().mockReturnValue(mockRow);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = findDuplicateByHash("default", "abc123");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("chunk-1");
      expect(result?.hash).toBe("abc123");
      expect(mockGet).toHaveBeenCalledWith("default", "abc123");
    });

    it("should return null when no hash match", () => {
      (db.prepare as Mock).mockReturnValue({ get: vi.fn().mockReturnValue(undefined) });

      const result = findDuplicateByHash("default", "nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("supersedChunk", () => {
    it("should soft delete by setting superseded_by", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      supersedChunk("chunk-old", "chunk-new");

      expect(mockRun).toHaveBeenCalledWith("chunk-new", "chunk-old");
    });
  });
});
