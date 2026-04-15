import db from "./schema";
import { generateId } from "@/lib/utils";
import type { BankEntry, BankCategory, GroupedBankEntries } from "@/types";

interface BankEntryRow {
  id: string;
  user_id: string;
  category: string;
  content: string;
  source_document_id: string | null;
  confidence_score: number;
  created_at: string;
}

function rowToEntry(row: BankEntryRow): BankEntry {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as BankCategory,
    content: JSON.parse(row.content),
    sourceDocumentId: row.source_document_id ?? undefined,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
  };
}

export interface InsertBankEntry {
  category: BankCategory;
  content: Record<string, unknown>;
  sourceDocumentId?: string;
  confidenceScore?: number;
}

export function insertBankEntry(
  entry: InsertBankEntry,
  userId: string = "default"
): string {
  const id = generateId();
  db.prepare(`
    INSERT INTO profile_bank (id, user_id, category, content, source_document_id, confidence_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    entry.category,
    JSON.stringify(entry.content),
    entry.sourceDocumentId ?? null,
    entry.confidenceScore ?? 0.8
  );
  return id;
}

export function insertBankEntries(
  entries: InsertBankEntry[],
  userId: string = "default"
): string[] {
  const ids: string[] = [];
  const insert = db.transaction(() => {
    for (const entry of entries) {
      ids.push(insertBankEntry(entry, userId));
    }
  });
  insert();
  return ids;
}

export function getBankEntries(userId: string = "default"): BankEntry[] {
  const rows = db
    .prepare("SELECT * FROM profile_bank WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as BankEntryRow[];
  return rows.map(rowToEntry);
}

export function getBankEntriesByCategory(
  category: BankCategory,
  userId: string = "default"
): BankEntry[] {
  const rows = db
    .prepare("SELECT * FROM profile_bank WHERE user_id = ? AND category = ? ORDER BY created_at DESC")
    .all(userId, category) as BankEntryRow[];
  return rows.map(rowToEntry);
}

export function getGroupedBankEntries(userId: string = "default"): GroupedBankEntries {
  const all = getBankEntries(userId);
  const grouped: GroupedBankEntries = {
    experience: [],
    skill: [],
    project: [],
    education: [],
    achievement: [],
    certification: [],
  };
  for (const entry of all) {
    if (entry.category in grouped) {
      grouped[entry.category].push(entry);
    }
  }
  return grouped;
}

export function searchBankEntries(
  query: string,
  userId: string = "default"
): BankEntry[] {
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      "SELECT * FROM profile_bank WHERE user_id = ? AND content LIKE ? ORDER BY confidence_score DESC, created_at DESC"
    )
    .all(userId, pattern) as BankEntryRow[];
  return rows.map(rowToEntry);
}

export function deleteBankEntriesBySource(
  sourceDocumentId: string,
  userId: string = "default"
): number {
  const result = db
    .prepare("DELETE FROM profile_bank WHERE user_id = ? AND source_document_id = ?")
    .run(userId, sourceDocumentId);
  return result.changes;
}

export function clearBankEntries(userId: string = "default"): void {
  db.prepare("DELETE FROM profile_bank WHERE user_id = ?").run(userId);
}

/**
 * Generate a deduplication key for a bank entry.
 * Used to detect if an equivalent entry already exists.
 */
export function getDeduplicationKey(
  category: BankCategory,
  content: Record<string, unknown>
): string {
  switch (category) {
    case "experience":
      return `${content.company}|${content.title}`.toLowerCase();
    case "skill":
      return `${content.name}`.toLowerCase();
    case "education":
      return `${content.institution}|${content.degree}`.toLowerCase();
    case "project":
      return `${content.name}`.toLowerCase();
    case "certification":
      return `${content.name}|${content.issuer}`.toLowerCase();
    case "achievement":
      return `${content.description}`.toLowerCase().slice(0, 100);
    default:
      return JSON.stringify(content).toLowerCase().slice(0, 100);
  }
}

/**
 * Find a duplicate entry by computing the dedup key for all entries in the
 * category and doing an exact comparison. Avoids false positives from LIKE
 * substring matching (e.g. "java" matching "javascript").
 */
export function findDuplicateEntry(
  category: BankCategory,
  contentKey: string,
  userId: string = "default"
): BankEntry | null {
  const rows = db
    .prepare("SELECT * FROM profile_bank WHERE user_id = ? AND category = ?")
    .all(userId, category) as BankEntryRow[];

  const normalizedKey = contentKey.toLowerCase();
  const match = rows.find((row) => {
    const content = JSON.parse(row.content) as Record<string, unknown>;
    return getDeduplicationKey(category, content) === normalizedKey;
  });

  return match ? rowToEntry(match) : null;
}

/**
 * Update an existing bank entry's content and confidence score.
 */
export function updateBankEntry(
  id: string,
  content: Record<string, unknown>,
  confidenceScore: number
): void {
  db.prepare(
    "UPDATE profile_bank SET content = ?, confidence_score = ? WHERE id = ?"
  ).run(JSON.stringify(content), confidenceScore, id);
}
