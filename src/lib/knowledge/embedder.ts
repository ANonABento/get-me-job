/**
 * Text similarity scoring for knowledge bank retrieval.
 *
 * Uses TF-IDF-inspired keyword overlap scoring since we don't have
 * a dedicated embedding model. This is fast, deterministic, and works
 * well for matching job requirements against profile bank entries.
 */

/** Tokenize text into lowercase words, stripping punctuation */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/** Common English stop words to ignore during scoring */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "this", "that", "these",
  "those", "it", "its", "not", "no", "from", "as", "we", "they", "them",
  "their", "our", "my", "your", "he", "she", "his", "her", "who", "what",
  "which", "when", "where", "how", "all", "each", "every", "both", "few",
  "more", "most", "other", "some", "such", "than", "too", "very", "just",
  "about", "above", "after", "again", "also", "any", "because", "before",
  "between", "during", "into", "through", "up", "out", "over",
]);

/** Remove stop words from token list */
export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((t) => !STOP_WORDS.has(t));
}

/**
 * Compute similarity score between a query and a document.
 *
 * Returns a value between 0 and 1 based on weighted keyword overlap.
 * Longer matching n-grams (bigrams) get bonus weight since they
 * represent more specific matches (e.g. "machine learning" > "machine").
 */
export function similarityScore(query: string, document: string): number {
  const queryTokens = removeStopWords(tokenize(query));
  const docTokens = removeStopWords(tokenize(document));

  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const docSet = new Set(docTokens);
  const docText = document.toLowerCase();

  let matchScore = 0;
  let totalWeight = 0;

  // Unigram matching
  for (const token of queryTokens) {
    totalWeight += 1;
    if (docSet.has(token)) {
      matchScore += 1;
    }
  }

  // Bigram matching (bonus for multi-word matches)
  const queryBigrams = buildBigrams(queryTokens);
  const docBigrams = new Set(buildBigrams(docTokens));

  for (const bigram of queryBigrams) {
    totalWeight += 1.5;
    if (docBigrams.has(bigram)) {
      matchScore += 1.5;
    }
  }

  // Substring matching bonus for technical terms (e.g. "TypeScript" in doc)
  for (const token of queryTokens) {
    if (token.length >= 4 && docText.includes(token)) {
      matchScore += 0.5;
      totalWeight += 0.5;
    }
  }

  return totalWeight > 0 ? matchScore / totalWeight : 0;
}

/** Build bigrams from a token array */
function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

export interface ScoredItem<T> {
  item: T;
  score: number;
}

/**
 * Rank items by similarity to query, returning top K results.
 * Items scoring 0 are excluded.
 */
export function rankBySimilarity<T>(
  query: string,
  items: T[],
  toText: (item: T) => string,
  limit: number
): ScoredItem<T>[] {
  const scored = items
    .map((item) => ({
      item,
      score: similarityScore(query, toText(item)),
    }))
    .filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
import { getLLMConfig } from "@/lib/db";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";
function getOpenAIKey(): string | null {
  const config = getLLMConfig();
  if (config?.provider === "openai" && config.apiKey) {
    return config.apiKey;
  }
  return process.env.OPENAI_API_KEY ?? null;
}

function float32ArrayToBuffer(arr: Float32Array): Buffer {
  return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
}

function arrayToFloat32Array(arr: number[]): Float32Array {
  return new Float32Array(arr);
}

export async function embedBatch(texts: string[]): Promise<Float32Array[] | null> {
  if (texts.length === 0) return [];

  const apiKey = getOpenAIKey();
  if (!apiKey) {
    console.warn("[embedder] No OpenAI API key configured, skipping embeddings");
    return null;
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[embedder] OpenAI embeddings API error:", error);
    return null;
  }

  const data = await response.json() as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // Sort by index to maintain order
  const sorted = data.data.sort((a, b) => a.index - b.index);
  return sorted.map((item) => arrayToFloat32Array(item.embedding));
}

export function embeddingToBuffer(embedding: Float32Array): Buffer {
  return float32ArrayToBuffer(embedding);
}

export function bufferToEmbedding(buf: Buffer): Float32Array {
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

