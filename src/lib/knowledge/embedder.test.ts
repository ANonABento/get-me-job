import { describe, it, expect } from "vitest";
import {
  tokenize,
  removeStopWords,
  similarityScore,
  rankBySimilarity,
} from "./embedder";

describe("tokenize", () => {
  it("should lowercase and split text into words", () => {
    const tokens = tokenize("Hello World");
    expect(tokens).toEqual(["hello", "world"]);
  });

  it("should strip punctuation", () => {
    const tokens = tokenize("React.js, TypeScript & Node.js!");
    expect(tokens).toContain("react");
    expect(tokens).toContain("typescript");
    expect(tokens).toContain("node");
  });

  it("should filter single-character tokens", () => {
    const tokens = tokenize("I am a developer");
    expect(tokens).not.toContain("i");
    expect(tokens).not.toContain("a");
    expect(tokens).toContain("am");
    expect(tokens).toContain("developer");
  });

  it("should handle empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("should preserve hyphenated words", () => {
    const tokens = tokenize("full-stack developer");
    expect(tokens).toContain("full-stack");
  });
});

describe("removeStopWords", () => {
  it("should remove common stop words", () => {
    const tokens = ["the", "developer", "is", "working", "on", "react"];
    const filtered = removeStopWords(tokens);
    expect(filtered).toEqual(["developer", "working", "react"]);
  });

  it("should return empty array for all stop words", () => {
    const tokens = ["the", "is", "and", "or"];
    expect(removeStopWords(tokens)).toEqual([]);
  });

  it("should preserve technical terms", () => {
    const tokens = ["python", "machine", "learning", "aws"];
    const filtered = removeStopWords(tokens);
    expect(filtered).toEqual(["python", "machine", "learning", "aws"]);
  });
});

describe("similarityScore", () => {
  it("should return 0 for completely unrelated texts", () => {
    const score = similarityScore(
      "underwater basket weaving",
      "quantum physics research laboratory"
    );
    expect(score).toBe(0);
  });

  it("should return positive score for related texts", () => {
    const score = similarityScore(
      "React TypeScript developer",
      "Senior React and TypeScript engineer with 5 years experience"
    );
    expect(score).toBeGreaterThan(0);
  });

  it("should score exact matches higher than partial", () => {
    const exact = similarityScore(
      "React TypeScript Node.js",
      "React TypeScript Node.js developer"
    );
    const partial = similarityScore(
      "React TypeScript Node.js",
      "React developer with Python experience"
    );
    expect(exact).toBeGreaterThan(partial);
  });

  it("should return 0 for empty inputs", () => {
    expect(similarityScore("", "some text")).toBe(0);
    expect(similarityScore("some text", "")).toBe(0);
    expect(similarityScore("", "")).toBe(0);
  });

  it("should give bonus for bigram matches", () => {
    const withBigram = similarityScore(
      "machine learning engineer",
      "machine learning engineer with deep experience"
    );
    const withoutBigram = similarityScore(
      "machine learning engineer",
      "machine engineer learning separately applied"
    );
    expect(withBigram).toBeGreaterThan(withoutBigram);
  });
});

describe("rankBySimilarity", () => {
  const items = [
    { id: 1, text: "Senior React developer with TypeScript" },
    { id: 2, text: "Python data scientist machine learning" },
    { id: 3, text: "React and Node.js full stack engineer" },
    { id: 4, text: "Underwater basket weaving instructor" },
  ];

  it("should rank items by similarity to query", () => {
    const ranked = rankBySimilarity(
      "React developer",
      items,
      (item) => item.text,
      10
    );

    expect(ranked.length).toBeGreaterThan(0);
    // React items should be ranked first
    expect(ranked[0].item.id).toBe(1);
  });

  it("should respect limit parameter", () => {
    const ranked = rankBySimilarity(
      "developer engineer",
      items,
      (item) => item.text,
      2
    );

    expect(ranked.length).toBeLessThanOrEqual(2);
  });

  it("should exclude items with score 0", () => {
    const ranked = rankBySimilarity(
      "quantum physics",
      items,
      (item) => item.text,
      10
    );

    for (const r of ranked) {
      expect(r.score).toBeGreaterThan(0);
    }
  });

  it("should return empty array for no matches", () => {
    const ranked = rankBySimilarity(
      "xyzabc nonexistent",
      items,
      (item) => item.text,
      10
    );

    expect(ranked).toEqual([]);
import { cosineSimilarity, embeddingToBuffer, bufferToEmbedding } from "./embedder";

describe("cosineSimilarity", () => {
  it("should return 1 for identical vectors", () => {
    const a = new Float32Array([1, 2, 3]);
    const b = new Float32Array([1, 2, 3]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0);
  });

  it("should return 0 for orthogonal vectors", () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([0, 1, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0);
  });

  it("should return -1 for opposite vectors", () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([-1, 0, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1.0);
  });

  it("should handle scaled vectors", () => {
    const a = new Float32Array([1, 2, 3]);
    const b = new Float32Array([2, 4, 6]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0);
  });

  it("should throw on dimension mismatch", () => {
    const a = new Float32Array([1, 2]);
    const b = new Float32Array([1, 2, 3]);
    expect(() => cosineSimilarity(a, b)).toThrow("dimension mismatch");
  });

  it("should return 0 for zero vectors", () => {
    const a = new Float32Array([0, 0, 0]);
    const b = new Float32Array([1, 2, 3]);
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});

describe("embeddingToBuffer / bufferToEmbedding", () => {
  it("should roundtrip Float32Array through Buffer", () => {
    const original = new Float32Array([0.1, 0.5, -0.3, 1.0]);
    const buf = embeddingToBuffer(original);
    const restored = bufferToEmbedding(buf);

    expect(restored.length).toBe(original.length);
    for (let i = 0; i < original.length; i++) {
      expect(restored[i]).toBeCloseTo(original[i]);
    }
  });

  it("should produce buffer of correct size", () => {
    const arr = new Float32Array([1, 2, 3]);
    const buf = embeddingToBuffer(arr);
    expect(buf.length).toBe(3 * 4); // 3 floats * 4 bytes
  });
});
