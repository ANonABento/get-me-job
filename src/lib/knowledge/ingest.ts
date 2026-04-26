import { createHash } from "crypto";
import type { Profile } from "@/types";
import { chunkProfile } from "./chunker";
import type { ChunkEntry } from "./chunker";
import { embedBatch, embeddingToBuffer, bufferToEmbedding, cosineSimilarity } from "./embedder";
import {
  insertChunks,
  getChunksByHash,
  getAllChunksWithEmbeddings,
} from "./knowledge-bank";

const SEMANTIC_DEDUP_THRESHOLD = 0.95;

export interface IngestResult {
  totalChunks: number;
  newChunks: number;
  skippedExact: number;
  skippedSemantic: number;
  embeddingsGenerated: boolean;
}

export function hashChunkContent(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ").toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

function findSemanticDuplicate(
  embedding: Float32Array,
  existingEmbeddings: Array<{ embedding: Float32Array }>
): boolean {
  for (const existing of existingEmbeddings) {
    const similarity = cosineSimilarity(embedding, existing.embedding);
    if (similarity >= SEMANTIC_DEDUP_THRESHOLD) {
      return true;
    }
  }
  return false;
}

export async function ingestDocument(
  userId: string,
  documentId: string,
  profile: Partial<Profile>
): Promise<IngestResult> {
  // Step 1: Chunk the profile
  const chunks = chunkProfile(profile);
  const totalChunks = chunks.length;

  if (totalChunks === 0) {
    return { totalChunks: 0, newChunks: 0, skippedExact: 0, skippedSemantic: 0, embeddingsGenerated: false };
  }

  // Step 2: Hash each chunk for exact dedup
  const chunksWithHashes = chunks.map((chunk) => ({
    ...chunk,
    hash: hashChunkContent(chunk.content),
  }));

  // Step 3: Check for existing hashes (exact dedup)
  const allHashes = chunksWithHashes.map((c) => c.hash);
  const existingChunks = getChunksByHash(allHashes, userId);
  const existingHashes = new Set(existingChunks.map((c) => c.contentHash));

  const newChunksWithHashes = chunksWithHashes.filter((c) => !existingHashes.has(c.hash));
  const skippedExact = totalChunks - newChunksWithHashes.length;

  if (newChunksWithHashes.length === 0) {
    return { totalChunks, newChunks: 0, skippedExact, skippedSemantic: 0, embeddingsGenerated: false };
  }

  // Step 4: Embed new chunks
  const textsToEmbed = newChunksWithHashes.map((c) => c.content);
  const embeddings = await embedBatch(textsToEmbed, userId);
  const embeddingsGenerated = embeddings !== null;

  // Step 5: Semantic dedup
  let skippedSemantic = 0;
  const chunksToStore: Array<{
    chunk: ChunkEntry;
    hash: string;
    embedding: Float32Array | null;
  }> = [];

  if (embeddings) {
    // Load existing embeddings for semantic comparison
    const existingWithEmbeddings = getAllChunksWithEmbeddings(userId)
      .filter((c) => c.embedding !== null)
      .map((c) => ({ embedding: bufferToEmbedding(c.embedding!) }));

    // Also include already-accepted new chunks for cross-dedup
    const acceptedEmbeddings: Array<{ embedding: Float32Array }> = [...existingWithEmbeddings];

    for (let i = 0; i < newChunksWithHashes.length; i++) {
      const embedding = embeddings[i];
      if (findSemanticDuplicate(embedding, acceptedEmbeddings)) {
        skippedSemantic++;
      } else {
        chunksToStore.push({
          chunk: newChunksWithHashes[i],
          hash: newChunksWithHashes[i].hash,
          embedding,
        });
        acceptedEmbeddings.push({ embedding });
      }
    }
  } else {
    // No embeddings available, store all new chunks without semantic dedup
    for (const c of newChunksWithHashes) {
      chunksToStore.push({ chunk: c, hash: c.hash, embedding: null });
    }
  }

  // Step 6: Store chunks
  if (chunksToStore.length > 0) {
    insertChunks(
      chunksToStore.map((c) => ({
        userId,
        documentId,
        sectionType: c.chunk.sectionType,
        content: c.chunk.content,
        contentHash: c.hash,
        embedding: c.embedding ? embeddingToBuffer(c.embedding) : null,
        metadata: c.chunk.metadata,
      }))
    );
  }

  const newChunks = chunksToStore.length;
  console.log(
    `[ingest] Document ${documentId}: ${totalChunks} chunks, ${newChunks} new, ${skippedExact} exact dupes, ${skippedSemantic} semantic dupes`
  );

  return {
    totalChunks,
    newChunks,
    skippedExact,
    skippedSemantic,
    embeddingsGenerated,
  };
}
