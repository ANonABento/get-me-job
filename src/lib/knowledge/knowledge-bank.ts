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

/** Convert a BankEntry's content to a searchable text string */
export function bankEntryToText(entry: BankEntry): string {
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
}
