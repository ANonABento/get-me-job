import db from "./legacy";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";

export interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  interest: string | null;
  createdAt: string;
}

export interface CreateWaitlistEntryInput {
  email: string;
  source?: string;
  interest?: string | null;
}

let schemaReady = false;

export function ensureWaitlistSchema(): void {
  if (schemaReady) return;
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'pricing',
      interest TEXT,
      created_at TEXT NOT NULL
    )
  `,
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created ON waitlist_entries(created_at)",
  ).run();
  schemaReady = true;
}

export function createWaitlistEntry(
  input: CreateWaitlistEntryInput,
): WaitlistEntry {
  ensureWaitlistSchema();

  const email = input.email.trim().toLowerCase();
  const source = input.source?.trim() || "pricing";
  const interest = input.interest?.trim() || null;
  const createdAt = nowIso();
  const id = generateId();

  db.prepare(
    `
    INSERT INTO waitlist_entries (id, email, source, interest, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      source = excluded.source,
      interest = COALESCE(excluded.interest, waitlist_entries.interest)
  `,
  ).run(id, email, source, interest, createdAt);

  const row = db
    .prepare(
      "SELECT id, email, source, interest, created_at FROM waitlist_entries WHERE email = ?",
    )
    .get(email) as
    | {
        id: string;
        email: string;
        source: string;
        interest: string | null;
        created_at: string;
      }
    | undefined;

  if (!row) throw new Error("Failed to create waitlist entry");

  return {
    id: row.id,
    email: row.email,
    source: row.source,
    interest: row.interest,
    createdAt: row.created_at,
  };
}

export function listWaitlistEntries(limit = 100): WaitlistEntry[] {
  ensureWaitlistSchema();
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);
  const rows = db
    .prepare(
      `
      SELECT id, email, source, interest, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(boundedLimit) as Array<{
    id: string;
    email: string;
    source: string;
    interest: string | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    source: row.source,
    interest: row.interest,
    createdAt: row.created_at,
  }));
}
