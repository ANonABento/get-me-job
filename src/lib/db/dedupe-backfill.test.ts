import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  revertDedupeBackfillMigration,
  runDedupeBackfillMigration,
  summaryHashForContent,
} from "./dedupe-backfill";

let db: Database.Database;
let tempDir: string;

function createSchema({ withCustomTemplates = false }: { withCustomTemplates?: boolean } = {}) {
  db.exec(`
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      filename TEXT NOT NULL,
      type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      extracted_text TEXT,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE profile_bank (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      source_document_id TEXT,
      confidence_score REAL DEFAULT 0.8,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (withCustomTemplates) {
    db.exec(`
      CREATE TABLE custom_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        source_document_id TEXT,
        analyzed_styles TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

function insertDocument(
  id: string,
  filePath: string,
  uploadedAt: string,
  filename: string = "test-resume.pdf",
  userId: string = "user-1"
) {
  db.prepare(
    `INSERT INTO documents
      (id, user_id, filename, type, mime_type, size, path, extracted_text, uploaded_at)
     VALUES (?, ?, ?, 'resume', 'application/pdf', 10, ?, 'text', ?)`
  ).run(id, userId, filename, filePath, uploadedAt);
}

function insertExperience(
  id: string,
  sourceDocumentId: string,
  createdAt: string,
  content: Record<string, unknown> = {
    company: "Acme Corp",
    title: "Senior Developer",
    startDate: "2020",
    endDate: "2024",
  },
  userId: string = "user-1"
) {
  db.prepare(
    `INSERT INTO profile_bank
      (id, user_id, category, content, source_document_id, confidence_score, created_at)
     VALUES (?, ?, 'experience', ?, ?, 0.9, ?)`
  ).run(id, userId, JSON.stringify(content), sourceDocumentId, createdAt);
}

function insertCustomTemplate(id: string, sourceDocumentId: string, userId: string = "user-1") {
  db.prepare(
    `INSERT INTO custom_templates
      (id, user_id, name, source_document_id, analyzed_styles)
     VALUES (?, ?, 'tpl', ?, '{}')`
  ).run(id, userId, sourceDocumentId);
}

function writeFile(name: string, contents: string): string {
  const filePath = path.join(tempDir, name);
  fs.writeFileSync(filePath, contents);
  return filePath;
}

describe("runDedupeBackfillMigration", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-backfill-"));
    db = new Database(":memory:");
    createSchema();
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("dedupes source files and bank entries and is idempotent", () => {
    const fileA = writeFile("a.pdf", "same bytes");
    const fileB = writeFile("b.pdf", "same bytes");

    insertDocument("doc-old", fileA, "2024-01-01T09:00:00.000Z");
    insertDocument("doc-new", fileB, "2024-01-01T10:00:00.000Z");
    insertExperience("entry-1", "doc-old", "2024-01-01T09:01:00.000Z");
    insertExperience("entry-2", "doc-old", "2024-01-01T09:02:00.000Z");
    insertExperience("entry-3", "doc-new", "2024-01-01T10:01:00.000Z");

    const logger = { log: vi.fn() };
    const firstResult = runDedupeBackfillMigration(db, logger);

    expect(firstResult).toEqual({
      duplicateSourceFilesRemoved: 1,
      duplicateBankEntriesRemoved: 2,
    });
    expect(db.prepare("SELECT id FROM documents ORDER BY id").all()).toEqual([{ id: "doc-old" }]);
    expect(
      db.prepare("SELECT id, source_document_id FROM profile_bank ORDER BY id").all()
    ).toEqual([{ id: "entry-1", source_document_id: "doc-old" }]);

    const secondResult = runDedupeBackfillMigration(db, logger);

    expect(secondResult).toEqual({
      duplicateSourceFilesRemoved: 0,
      duplicateBankEntriesRemoved: 0,
    });
  });

  it("collapses 10x duplicate documents and 14x duplicate bank entries to one each", () => {
    const docPaths = Array.from({ length: 10 }, (_, i) => writeFile(`r${i}.pdf`, "shared bytes"));
    docPaths.forEach((p, i) => {
      const ts = `2024-01-${String(i + 1).padStart(2, "0")}T10:00:00.000Z`;
      insertDocument(`doc-${i}`, p, ts);
    });

    Array.from({ length: 14 }).forEach((_, i) => {
      const ts = `2024-02-${String(i + 1).padStart(2, "0")}T10:00:00.000Z`;
      insertExperience(`entry-${i}`, `doc-${i % 10}`, ts);
    });

    const result = runDedupeBackfillMigration(db, { log: vi.fn() });

    expect(result.duplicateSourceFilesRemoved).toBe(9);

    const remainingDocs = db.prepare("SELECT id FROM documents").all() as Array<{ id: string }>;
    expect(remainingDocs).toEqual([{ id: "doc-0" }]);

    const remainingEntries = db
      .prepare("SELECT id, source_document_id FROM profile_bank ORDER BY id")
      .all() as Array<{ id: string; source_document_id: string }>;
    expect(remainingEntries).toHaveLength(1);
    expect(remainingEntries[0]?.source_document_id).toBe("doc-0");
    expect(result.duplicateBankEntriesRemoved).toBe(13);
  });

  it("returns zero counts on a clean database", () => {
    const result = runDedupeBackfillMigration(db, { log: vi.fn() });
    expect(result).toEqual({
      duplicateSourceFilesRemoved: 0,
      duplicateBankEntriesRemoved: 0,
    });
  });

  it("repoints custom_templates FK references when removing duplicate documents", () => {
    db.close();
    db = new Database(":memory:");
    createSchema({ withCustomTemplates: true });

    const fileA = writeFile("a.pdf", "shared");
    const fileB = writeFile("b.pdf", "shared");
    insertDocument("doc-old", fileA, "2024-01-01T09:00:00.000Z");
    insertDocument("doc-new", fileB, "2024-01-01T10:00:00.000Z");
    insertCustomTemplate("tpl-1", "doc-new");

    runDedupeBackfillMigration(db, { log: vi.fn() });

    const tpl = db
      .prepare("SELECT source_document_id FROM custom_templates WHERE id = 'tpl-1'")
      .get() as { source_document_id: string };
    expect(tpl.source_document_id).toBe("doc-old");

    const orphans = db
      .prepare(
        `SELECT t.id FROM custom_templates t
         LEFT JOIN documents d ON d.id = t.source_document_id
         WHERE t.source_document_id IS NOT NULL AND d.id IS NULL`
      )
      .all();
    expect(orphans).toEqual([]);
  });

  it("scopes dedupe per user_id", () => {
    const fileA = writeFile("a.pdf", "shared");
    const fileB = writeFile("b.pdf", "shared");
    insertDocument("doc-u1-1", fileA, "2024-01-01T09:00:00.000Z", "test-resume.pdf", "user-1");
    insertDocument("doc-u2-1", fileB, "2024-01-01T10:00:00.000Z", "test-resume.pdf", "user-2");

    const result = runDedupeBackfillMigration(db, { log: vi.fn() });

    expect(result.duplicateSourceFilesRemoved).toBe(0);
    expect(db.prepare("SELECT COUNT(*) AS c FROM documents").get()).toEqual({ c: 2 });
  });

  it("does not delete bank entries with same title/company but different summary content", () => {
    const fileA = writeFile("a.pdf", "shared");
    insertDocument("doc-1", fileA, "2024-01-01T09:00:00.000Z");

    insertExperience("entry-1", "doc-1", "2024-01-01T09:01:00.000Z", {
      company: "Acme Corp",
      title: "Senior Developer",
      startDate: "2020",
      endDate: "2024",
      summary: "Led migration to microservices",
    });
    insertExperience("entry-2", "doc-1", "2024-01-01T09:02:00.000Z", {
      company: "Acme Corp",
      title: "Senior Developer",
      startDate: "2020",
      endDate: "2024",
      summary: "Owned the analytics rewrite",
    });

    const result = runDedupeBackfillMigration(db, { log: vi.fn() });

    expect(result.duplicateBankEntriesRemoved).toBe(0);
    expect(db.prepare("SELECT COUNT(*) AS c FROM profile_bank").get()).toEqual({ c: 2 });
  });

  it("logs counts in the expected format", () => {
    const fileA = writeFile("a.pdf", "shared");
    const fileB = writeFile("b.pdf", "shared");
    insertDocument("doc-1", fileA, "2024-01-01T09:00:00.000Z");
    insertDocument("doc-2", fileB, "2024-01-01T10:00:00.000Z");

    const log = vi.fn();
    runDedupeBackfillMigration(db, { log });

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("removed 1 duplicate documents, 0 duplicate bank entries")
    );
  });
});

describe("revertDedupeBackfillMigration", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-backfill-revert-"));
    db = new Database(":memory:");
    createSchema();
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("drops dedupe indexes added by the up migration", () => {
    runDedupeBackfillMigration(db, { log: vi.fn() });

    const indexesBefore = (
      db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all() as Array<{
        name: string;
      }>
    ).map((row) => row.name);
    expect(indexesBefore).toContain("idx_documents_user_file_hash");
    expect(indexesBefore).toContain("idx_profile_bank_user_source");

    revertDedupeBackfillMigration(db);

    const indexesAfter = (
      db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all() as Array<{
        name: string;
      }>
    ).map((row) => row.name);
    expect(indexesAfter).not.toContain("idx_documents_user_file_hash");
    expect(indexesAfter).not.toContain("idx_profile_bank_user_source");
  });

  it("is idempotent — safe to call when indexes do not exist", () => {
    expect(() => revertDedupeBackfillMigration(db)).not.toThrow();
    expect(() => revertDedupeBackfillMigration(db)).not.toThrow();
  });
});

describe("summaryHashForContent", () => {
  it("returns the same hash regardless of key order", () => {
    const a = summaryHashForContent({ a: 1, b: 2, c: 3 });
    const b = summaryHashForContent({ c: 3, b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it("returns different hashes for different content", () => {
    const a = summaryHashForContent({ summary: "Led the rewrite" });
    const b = summaryHashForContent({ summary: "Maintained the rewrite" });
    expect(a).not.toBe(b);
  });

  it("ignores undefined fields", () => {
    const a = summaryHashForContent({ title: "Eng", summary: undefined });
    const b = summaryHashForContent({ title: "Eng" });
    expect(a).toBe(b);
  });
});
