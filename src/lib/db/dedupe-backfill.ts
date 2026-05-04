import fs from "fs";
import crypto from "crypto";
import type Database from "better-sqlite3";

export interface DedupeBackfillResult {
  duplicateSourceFilesRemoved: number;
  duplicateBankEntriesRemoved: number;
}

interface DocumentRow {
  id: string;
  user_id: string;
  filename: string;
  path: string;
  file_hash: string | null;
  uploaded_at: string | null;
}

interface DuplicateDocumentGroup {
  user_id: string;
  file_hash: string;
}

interface BankEntryRow {
  id: string;
  user_id: string;
  category: string;
  content: string;
  source_document_id: string | null;
  created_at: string | null;
}

const DEDUPE_INDEXES = [
  "idx_documents_user_file_hash",
  "idx_profile_bank_user_source",
] as const;

function hashFile(path: string): string | null {
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function tableExists(db: Database.Database, table: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);
  return Boolean(row);
}

export function ensureDedupeSchema(db: Database.Database): void {
  if (!hasColumn(db, "documents", "file_hash")) {
    db.exec("ALTER TABLE documents ADD COLUMN file_hash TEXT");
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_documents_user_file_hash
      ON documents(user_id, file_hash);
    CREATE INDEX IF NOT EXISTS idx_profile_bank_user_source
      ON profile_bank(user_id, source_document_id);
  `);
}

/**
 * Compute a stable summary hash for a bank entry's content. Two entries with
 * the same canonical fields (regardless of key order or unrelated metadata)
 * will produce the same hash.
 */
export function summaryHashForContent(content: Record<string, unknown>): string {
  const canonical = canonicalize(content);
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function canonicalize(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function entryDedupeKey(row: BankEntryRow): string {
  let content: Record<string, unknown> = {};
  try {
    content = JSON.parse(row.content) as Record<string, unknown>;
  } catch {
    content = { raw: row.content };
  }

  const title = String(content.title ?? content.role ?? content.name ?? "");
  const company = String(content.company ?? content.institution ?? content.issuer ?? "");
  const dateRange = String(
    content.dateRange ??
      content.date_range ??
      [content.startDate ?? content.start_date ?? "", content.endDate ?? content.end_date ?? ""].join("|")
  );
  const summaryHash = summaryHashForContent(content);

  return [
    row.user_id,
    row.source_document_id ?? "",
    row.category,
    title.trim().toLowerCase(),
    company.trim().toLowerCase(),
    dateRange.trim().toLowerCase(),
    summaryHash,
  ].join("");
}

export function runDedupeBackfillMigration(
  db: Database.Database,
  logger: Pick<Console, "log"> = console
): DedupeBackfillResult {
  ensureDedupeSchema(db);

  const hasCustomTemplates = tableExists(db, "custom_templates");

  const result = db.transaction(() => {
    const missingHashDocs = db
      .prepare("SELECT id, path FROM documents WHERE file_hash IS NULL OR file_hash = ''")
      .all() as Array<{ id: string; path: string }>;
    const updateHash = db.prepare("UPDATE documents SET file_hash = ? WHERE id = ?");

    for (const doc of missingHashDocs) {
      const fileHash = hashFile(doc.path);
      if (fileHash) {
        updateHash.run(fileHash, doc.id);
      }
    }

    let duplicateSourceFilesRemoved = 0;
    const duplicateGroups = db
      .prepare(
        `SELECT user_id, file_hash
         FROM documents
         WHERE file_hash IS NOT NULL AND file_hash <> ''
         GROUP BY user_id, file_hash
         HAVING COUNT(*) > 1`
      )
      .all() as DuplicateDocumentGroup[];
    const selectDocsInGroup = db.prepare(
      `SELECT id, user_id, filename, path, file_hash, uploaded_at
       FROM documents
       WHERE user_id = ? AND file_hash = ?
       ORDER BY datetime(uploaded_at) ASC, id ASC`
    );
    const repointEntries = db.prepare(
      "UPDATE profile_bank SET source_document_id = ? WHERE user_id = ? AND source_document_id = ?"
    );
    const repointTemplates = hasCustomTemplates
      ? db.prepare(
          "UPDATE custom_templates SET source_document_id = ? WHERE user_id = ? AND source_document_id = ?"
        )
      : null;
    const deleteDocument = db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?");

    for (const group of duplicateGroups) {
      const docs = selectDocsInGroup.all(group.user_id, group.file_hash) as DocumentRow[];
      const keep = docs[0];
      if (!keep) continue;

      for (const duplicate of docs.slice(1)) {
        repointEntries.run(keep.id, duplicate.user_id, duplicate.id);
        if (repointTemplates) {
          repointTemplates.run(keep.id, duplicate.user_id, duplicate.id);
        }
        duplicateSourceFilesRemoved += deleteDocument.run(duplicate.id, duplicate.user_id).changes;
      }
    }

    const bankEntries = db
      .prepare(
        `SELECT id, user_id, category, content, source_document_id, created_at
         FROM profile_bank
         WHERE source_document_id IS NOT NULL
         ORDER BY datetime(created_at) ASC, id ASC`
      )
      .all() as BankEntryRow[];
    const seen = new Set<string>();
    const duplicateEntryIds: string[] = [];

    for (const row of bankEntries) {
      const key = entryDedupeKey(row);
      if (seen.has(key)) {
        duplicateEntryIds.push(row.id);
      } else {
        seen.add(key);
      }
    }

    const deleteEntry = db.prepare("DELETE FROM profile_bank WHERE id = ?");
    let duplicateBankEntriesRemoved = 0;
    for (const id of duplicateEntryIds) {
      duplicateBankEntriesRemoved += deleteEntry.run(id).changes;
    }

    return { duplicateSourceFilesRemoved, duplicateBankEntriesRemoved };
  })();

  logger.log(
    `[dedupe-backfill] removed ${result.duplicateSourceFilesRemoved} duplicate documents, ${result.duplicateBankEntriesRemoved} duplicate bank entries`
  );

  return result;
}

/**
 * Reverse the schema-level effects of the dedupe backfill migration. The
 * removed duplicate rows themselves cannot be restored — this only removes
 * the dedupe indexes so the database matches its pre-migration shape.
 */
export function revertDedupeBackfillMigration(db: Database.Database): void {
  for (const indexName of DEDUPE_INDEXES) {
    db.exec(`DROP INDEX IF EXISTS ${indexName}`);
  }
}
