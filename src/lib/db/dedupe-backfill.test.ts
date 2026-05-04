import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runDedupeBackfillMigration } from "./dedupe-backfill";

let db: Database.Database;
let tempDir: string;

function createSchema() {
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
}

function insertDocument(id: string, filePath: string, uploadedAt: string) {
  db.prepare(
    `INSERT INTO documents
      (id, user_id, filename, type, mime_type, size, path, extracted_text, uploaded_at)
     VALUES (?, 'user-1', 'test-resume.pdf', 'resume', 'application/pdf', 10, ?, 'text', ?)`
  ).run(id, filePath, uploadedAt);
}

function insertExperience(id: string, sourceDocumentId: string, createdAt: string) {
  db.prepare(
    `INSERT INTO profile_bank
      (id, user_id, category, content, source_document_id, confidence_score, created_at)
     VALUES (?, 'user-1', 'experience', ?, ?, 0.9, ?)`
  ).run(
    id,
    JSON.stringify({
      company: "Acme Corp",
      title: "Senior Developer",
      startDate: "2020",
      endDate: "2024",
    }),
    sourceDocumentId,
    createdAt
  );
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
    const fileA = path.join(tempDir, "a.pdf");
    const fileB = path.join(tempDir, "b.pdf");
    fs.writeFileSync(fileA, "same bytes");
    fs.writeFileSync(fileB, "same bytes");

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
    expect(
      db.prepare("SELECT id FROM documents ORDER BY id").all()
    ).toEqual([{ id: "doc-old" }]);
    expect(
      db.prepare("SELECT id, source_document_id FROM profile_bank ORDER BY id").all()
    ).toEqual([{ id: "entry-1", source_document_id: "doc-old" }]);

    const secondResult = runDedupeBackfillMigration(db, logger);

    expect(secondResult).toEqual({
      duplicateSourceFilesRemoved: 0,
      duplicateBankEntriesRemoved: 0,
    });
  });
});
