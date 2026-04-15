import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { hashChunkContent } from "./ingest";

// Mock dependencies before importing
vi.mock("./knowledge-bank", () => ({
  insertChunks: vi.fn(() => ["id-1", "id-2"]),
  getChunksByHash: vi.fn(() => []),
  getAllChunksWithEmbeddings: vi.fn(() => []),
}));

vi.mock("./embedder", () => ({
  embedBatch: vi.fn(() => null),
  embeddingToBuffer: vi.fn((arr: Float32Array) =>
    Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
  ),
  bufferToEmbedding: vi.fn((buf: Buffer) =>
    new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4)
  ),
  cosineSimilarity: vi.fn(() => 0.5),
}));

vi.mock("./chunker", () => ({
  chunkProfile: vi.fn(() => [
    { content: "chunk one", sectionType: "experience", metadata: { company: "Acme" } },
    { content: "chunk two", sectionType: "education", metadata: { institution: "MIT" } },
  ]),
}));

import { ingestDocument } from "./ingest";
import { insertChunks, getChunksByHash, getAllChunksWithEmbeddings } from "./knowledge-bank";
import { embedBatch, cosineSimilarity } from "./embedder";
import { chunkProfile } from "./chunker";

describe("hashChunkContent", () => {
  it("should produce consistent hashes for same content", () => {
    const hash1 = hashChunkContent("hello world");
    const hash2 = hashChunkContent("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should normalize whitespace before hashing", () => {
    const hash1 = hashChunkContent("hello   world");
    const hash2 = hashChunkContent("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should be case-insensitive", () => {
    const hash1 = hashChunkContent("Hello World");
    const hash2 = hashChunkContent("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should trim whitespace", () => {
    const hash1 = hashChunkContent("  hello world  ");
    const hash2 = hashChunkContent("hello world");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different content", () => {
    const hash1 = hashChunkContent("hello");
    const hash2 = hashChunkContent("world");
    expect(hash1).not.toBe(hash2);
  });

  it("should return a hex string", () => {
    const hash = hashChunkContent("test");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("ingestDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset defaults
    (chunkProfile as Mock).mockReturnValue([
      { content: "chunk one", sectionType: "experience", metadata: { company: "Acme" } },
      { content: "chunk two", sectionType: "education", metadata: { institution: "MIT" } },
    ]);
    (getChunksByHash as Mock).mockReturnValue([]);
    (getAllChunksWithEmbeddings as Mock).mockReturnValue([]);
    (embedBatch as Mock).mockResolvedValue(null);
    (insertChunks as Mock).mockReturnValue(["id-1", "id-2"]);
  });

  it("should return zero result for empty profile", async () => {
    (chunkProfile as Mock).mockReturnValue([]);

    const result = await ingestDocument("user-1", "doc-1", {});
    expect(result.totalChunks).toBe(0);
    expect(result.newChunks).toBe(0);
    expect(insertChunks).not.toHaveBeenCalled();
  });

  it("should store chunks without embeddings when API key missing", async () => {
    const result = await ingestDocument("user-1", "doc-1", { summary: "test" });

    expect(result.totalChunks).toBe(2);
    expect(result.newChunks).toBe(2);
    expect(result.embeddingsGenerated).toBe(false);
    expect(result.skippedExact).toBe(0);
    expect(result.skippedSemantic).toBe(0);
    expect(insertChunks).toHaveBeenCalledTimes(1);

    const insertedChunks = (insertChunks as Mock).mock.calls[0][0];
    expect(insertedChunks).toHaveLength(2);
    expect(insertedChunks[0].embedding).toBeNull();
  });

  it("should skip exact duplicates by hash", async () => {
    // Simulate that the first chunk already exists
    const hash = hashChunkContent("chunk one");
    (getChunksByHash as Mock).mockReturnValue([{ contentHash: hash }]);

    const result = await ingestDocument("user-1", "doc-1", { summary: "test" });

    expect(result.totalChunks).toBe(2);
    expect(result.skippedExact).toBe(1);
    expect(result.newChunks).toBe(1);

    const insertedChunks = (insertChunks as Mock).mock.calls[0][0];
    expect(insertedChunks).toHaveLength(1);
    expect(insertedChunks[0].content).toBe("chunk two");
  });

  it("should skip all chunks when all are exact duplicates", async () => {
    const hash1 = hashChunkContent("chunk one");
    const hash2 = hashChunkContent("chunk two");
    (getChunksByHash as Mock).mockReturnValue([
      { contentHash: hash1 },
      { contentHash: hash2 },
    ]);

    const result = await ingestDocument("user-1", "doc-1", { summary: "test" });

    expect(result.totalChunks).toBe(2);
    expect(result.skippedExact).toBe(2);
    expect(result.newChunks).toBe(0);
    expect(insertChunks).not.toHaveBeenCalled();
  });

  it("should store embeddings when available", async () => {
    const emb1 = new Float32Array([0.1, 0.2, 0.3]);
    const emb2 = new Float32Array([0.4, 0.5, 0.6]);
    (embedBatch as Mock).mockResolvedValue([emb1, emb2]);
    (cosineSimilarity as Mock).mockReturnValue(0.5); // below threshold

    const result = await ingestDocument("user-1", "doc-1", { summary: "test" });

    expect(result.embeddingsGenerated).toBe(true);
    expect(result.newChunks).toBe(2);
    expect(insertChunks).toHaveBeenCalledTimes(1);

    const insertedChunks = (insertChunks as Mock).mock.calls[0][0];
    expect(insertedChunks[0].embedding).not.toBeNull();
  });

  it("should skip semantic duplicates above threshold", async () => {
    const emb1 = new Float32Array([0.1, 0.2, 0.3]);
    const emb2 = new Float32Array([0.4, 0.5, 0.6]);
    (embedBatch as Mock).mockResolvedValue([emb1, emb2]);

    // First chunk: no existing embeddings to compare, passes
    // Second chunk: high similarity with first, gets skipped
    let callCount = 0;
    (cosineSimilarity as Mock).mockImplementation(() => {
      callCount++;
      // The second chunk compares against the first accepted one
      // Return high similarity to trigger dedup
      if (callCount >= 1) return 0.96;
      return 0.5;
    });

    const result = await ingestDocument("user-1", "doc-1", { summary: "test" });

    expect(result.skippedSemantic).toBe(1);
    expect(result.newChunks).toBe(1);
  });

  it("should pass correct userId and documentId", async () => {
    await ingestDocument("user-42", "doc-99", { summary: "test" });

    expect(getChunksByHash).toHaveBeenCalledWith(expect.any(Array), "user-42");
    const insertedChunks = (insertChunks as Mock).mock.calls[0][0];
    expect(insertedChunks[0].userId).toBe("user-42");
    expect(insertedChunks[0].documentId).toBe("doc-99");
  });
});
