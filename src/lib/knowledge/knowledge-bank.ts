/**
 * Knowledge bank search layer.
 *
 * Wraps the profile_bank database with similarity-based search,
 * returning ranked chunks for the retrieval pipeline.
 */

import type { BankEntry, BankCategory } from "@/types";
import { getBankEntries, getBankEntriesByCategory } from "@/lib/db/profile-bank";
import { rankBySimilarity, type ScoredItem } from "./embedder";

/** A bank entry with its relevance score */
export interface RankedChunk {
  id: string;
  category: BankCategory;
  content: Record<string, unknown>;
  score: number;
  sourceDocumentId?: string;
}

/** Convert a bank entry's content to a searchable text string */
export function bankEntryToText(entry: Pick<BankEntry, "category" | "content">): string {
  const parts: string[] = [];
  const c = entry.content;

  // Extract known fields by category
  switch (entry.category) {
    case "experience":
      if (c.company) parts.push(String(c.company));
      if (c.title) parts.push(String(c.title));
      if (c.description) parts.push(String(c.description));
      if (Array.isArray(c.highlights)) {
        parts.push(c.highlights.map(String).join(" "));
      }
      if (Array.isArray(c.skills)) {
        parts.push(c.skills.map(String).join(" "));
      }
      break;
    case "skill":
      if (c.name) parts.push(String(c.name));
      if (c.category) parts.push(String(c.category));
      if (c.proficiency) parts.push(String(c.proficiency));
      break;
    case "project":
      if (c.name) parts.push(String(c.name));
      if (c.description) parts.push(String(c.description));
      if (Array.isArray(c.technologies)) {
        parts.push(c.technologies.map(String).join(" "));
      }
      if (Array.isArray(c.highlights)) {
        parts.push(c.highlights.map(String).join(" "));
      }
      break;
    case "education":
      if (c.institution) parts.push(String(c.institution));
      if (c.degree) parts.push(String(c.degree));
      if (c.field) parts.push(String(c.field));
      break;
    case "certification":
      if (c.name) parts.push(String(c.name));
      if (c.issuer) parts.push(String(c.issuer));
      break;
    case "achievement":
      if (c.description) parts.push(String(c.description));
      break;
  }

  // Fallback: serialize any remaining string values
  if (parts.length === 0) {
    for (const value of Object.values(c)) {
      if (typeof value === "string") {
        parts.push(value);
      }
    }
  }

  return parts.join(" ");
}

/**
 * Search the knowledge bank for chunks relevant to a query.
 *
 * @param query - Search query text
 * @param userId - User ID to search within
 * @param limit - Maximum results to return (default 20)
 * @param category - Optional category filter
 */
export function searchKnowledgeBank(
  query: string,
  userId: string = "default",
  limit: number = 20,
  category?: BankCategory
): RankedChunk[] {
  const entries = category
    ? getBankEntriesByCategory(category, userId)
    : getBankEntries(userId);

  const ranked: ScoredItem<BankEntry>[] = rankBySimilarity(
    query,
    entries,
    bankEntryToText,
    limit
  );

  return ranked.map((r) => ({
    id: r.item.id,
    category: r.item.category,
    content: r.item.content,
    score: r.score,
    sourceDocumentId: r.item.sourceDocumentId,
  }));
}

/**
 * Search with multiple queries, union results, deduplicate by chunk ID,
 * and keep the highest score for each chunk.
 */
export function multiQuerySearch(
  queries: string[],
  userId: string = "default",
  limitPerQuery: number = 20
): RankedChunk[] {
  const chunkMap = new Map<string, RankedChunk>();

  for (const query of queries) {
    const results = searchKnowledgeBank(query, userId, limitPerQuery);
    for (const chunk of results) {
      const existing = chunkMap.get(chunk.id);
      if (!existing || chunk.score > existing.score) {
        chunkMap.set(chunk.id, chunk);
      }
    }
  }

  const merged = Array.from(chunkMap.values());
  merged.sort((a, b) => b.score - a.score);
  return merged;
import db from "@/lib/db/schema";
import { generateId } from "@/lib/utils";

export interface KnowledgeChunk {
  id: string;
  userId: string;
  documentId: string;
  sectionType: string;
  content: string;
  contentHash: string;
  embedding: Buffer | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface KnowledgeChunkRow {
  id: string;
  user_id: string;
  document_id: string;
  section_type: string;
  content: string;
  content_hash: string;
  embedding: Buffer | null;
  metadata_json: string;
  created_at: string;
}

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    document_id TEXT NOT NULL,
    section_type TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    embedding BLOB,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_user ON knowledge_chunks(user_id);
  CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON knowledge_chunks(document_id);
  CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_hash ON knowledge_chunks(content_hash);
  CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_section ON knowledge_chunks(user_id, section_type);
`);

function rowToChunk(row: KnowledgeChunkRow): KnowledgeChunk {
  return {
    id: row.id,
    userId: row.user_id,
    documentId: row.document_id,
    sectionType: row.section_type,
    content: row.content,
    contentHash: row.content_hash,
    embedding: row.embedding,
    metadata: JSON.parse(row.metadata_json || "{}"),
    createdAt: row.created_at,
  };
}

export function insertChunks(chunks: Array<{
  userId?: string;
  documentId: string;
  sectionType: string;
  content: string;
  contentHash: string;
  embedding?: Buffer | null;
  metadata?: Record<string, unknown>;
}>): string[] {
  const stmt = db.prepare(`
    INSERT INTO knowledge_chunks (id, user_id, document_id, section_type, content, content_hash, embedding, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ids: string[] = [];
  const insertAll = db.transaction(() => {
    for (const chunk of chunks) {
      const id = generateId();
      stmt.run(
        id,
        chunk.userId ?? "default",
        chunk.documentId,
        chunk.sectionType,
        chunk.content,
        chunk.contentHash,
        chunk.embedding ?? null,
        JSON.stringify(chunk.metadata ?? {})
      );
      ids.push(id);
    }
  });
  insertAll();
  return ids;
}

export function getChunksByHash(hashes: string[], userId: string = "default"): KnowledgeChunk[] {
  if (hashes.length === 0) return [];
  const placeholders = hashes.map(() => "?").join(",");
  const rows = db.prepare(`
    SELECT * FROM knowledge_chunks WHERE user_id = ? AND content_hash IN (${placeholders})
  `).all(userId, ...hashes) as KnowledgeChunkRow[];
  return rows.map(rowToChunk);
}

export function getChunksByDocument(documentId: string, userId: string = "default"): KnowledgeChunk[] {
  const rows = db.prepare(`
    SELECT * FROM knowledge_chunks WHERE user_id = ? AND document_id = ?
  `).all(userId, documentId) as KnowledgeChunkRow[];
  return rows.map(rowToChunk);
}

export function getAllChunksWithEmbeddings(userId: string = "default"): KnowledgeChunk[] {
  const rows = db.prepare(`
    SELECT * FROM knowledge_chunks WHERE user_id = ? AND embedding IS NOT NULL
  `).all(userId) as KnowledgeChunkRow[];
  return rows.map(rowToChunk);
}

export function deleteChunksByDocument(documentId: string, userId: string = "default"): number {
  const result = db.prepare(`
    DELETE FROM knowledge_chunks WHERE user_id = ? AND document_id = ?
  `).run(userId, documentId);
  return result.changes;
}
