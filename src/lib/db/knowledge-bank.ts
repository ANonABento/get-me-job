import db from "./schema";
import { generateId } from "@/lib/utils";

export type ChunkSectionType =
  | "experience"
  | "education"
  | "skills"
  | "project"
  | "certification"
  | "summary";

interface ChunkRow {
  id: string;
  user_id: string;
  content: string;
  section_type: string;
  source_file: string | null;
  metadata: string | null;
  confidence_score: number;
  superseded_by: string | null;
  hash: string;
  created_at: string;
}

export interface Chunk {
  id: string;
  userId: string;
  content: string;
  sectionType: ChunkSectionType;
  sourceFile: string | null;
  metadata: Record<string, unknown> | null;
  confidenceScore: number;
  supersededBy: string | null;
  hash: string;
  createdAt: string;
}

export interface ChunkSearchResult extends Chunk {
  distance: number;
}

function rowToChunk(row: ChunkRow): Chunk {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    sectionType: row.section_type as ChunkSectionType,
    sourceFile: row.source_file,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    confidenceScore: row.confidence_score,
    supersededBy: row.superseded_by,
    hash: row.hash,
    createdAt: row.created_at,
  };
}

export interface InsertChunk {
  content: string;
  sectionType: ChunkSectionType;
  sourceFile: string | null;
  metadata: Record<string, unknown> | null;
  hash: string;
}

export function insertChunk(chunk: InsertChunk, userId: string = "default"): string {
  const id = generateId();
  db.prepare(`
    INSERT INTO chunks (id, user_id, content, section_type, source_file, metadata, hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    chunk.content,
    chunk.sectionType,
    chunk.sourceFile,
    chunk.metadata ? JSON.stringify(chunk.metadata) : null,
    chunk.hash
  );
  return id;
}

export function insertChunkVector(chunkId: string, embedding: number[]): void {
  db.prepare(`
    INSERT INTO chunks_vec (rowid, embedding)
    VALUES ((SELECT rowid FROM chunks WHERE id = ?), ?)
  `).run(chunkId, new Float32Array(embedding));
}

export function searchChunks(
  userId: string,
  queryEmbedding: number[],
  limit: number = 10
): ChunkSearchResult[] {
  const rows = db.prepare(`
    SELECT c.*, cv.distance
    FROM chunks c
    JOIN chunks_vec cv ON cv.rowid = c.rowid
    WHERE cv.embedding MATCH ?
      AND c.user_id = ?
      AND c.superseded_by IS NULL
    ORDER BY cv.distance
    LIMIT ?
  `).all(new Float32Array(queryEmbedding), userId, limit) as (ChunkRow & { distance: number })[];

  return rows.map((row) => ({
    ...rowToChunk(row),
    distance: row.distance,
  }));
}

export function getChunksByType(
  userId: string,
  sectionType: ChunkSectionType
): Chunk[] {
  const rows = db.prepare(`
    SELECT * FROM chunks
    WHERE user_id = ? AND section_type = ? AND superseded_by IS NULL
    ORDER BY created_at DESC
  `).all(userId, sectionType) as ChunkRow[];

  return rows.map(rowToChunk);
}

export function findDuplicateByHash(
  userId: string,
  hash: string
): Chunk | null {
  const row = db.prepare(`
    SELECT * FROM chunks WHERE user_id = ? AND hash = ?
  `).get(userId, hash) as ChunkRow | undefined;

  return row ? rowToChunk(row) : null;
}

export function supersedChunk(id: string, supersededBy: string): void {
  db.prepare(`
    UPDATE chunks SET superseded_by = ? WHERE id = ?
  `).run(supersededBy, id);
}
