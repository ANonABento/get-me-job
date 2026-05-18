import { randomBytes } from "crypto";
import db from "./legacy";
import { nowEpoch } from "@/lib/format/time";

/**
 * View-only resume share links.
 *
 * Tokens (the public `id`) are URL-safe base64 of 16 random bytes — 22
 * characters, ~128 bits of entropy. Never `Math.random` — see CLAUDE.md.
 *
 * Snapshots store the resume HTML inline at share-time. Editing the original
 * resume after a share is created MUST NOT mutate what the shared URL serves.
 */

export const DEFAULT_SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SHARE_TOKEN_BYTES = 16;
export const MAX_SHARE_HTML_BYTES = 2 * 1024 * 1024; // 2 MB safety cap
export const MAX_SHARE_TITLE_LENGTH = 200;

export interface SharedResume {
  id: string;
  userId: string;
  documentHtml: string;
  documentTitle: string;
  createdAt: number;
  expiresAt: number;
  viewCount: number;
}

export interface SharedResumeSummary {
  id: string;
  documentTitle: string;
  createdAt: number;
  expiresAt: number;
  viewCount: number;
}

interface SharedResumeRow {
  id: string;
  user_id: string;
  document_html: string;
  document_title: string;
  created_at: number;
  expires_at: number;
  view_count: number;
}

let sharedResumesSchemaEnsured = false;

/**
 * Idempotent additive bootstrap. Follows the same `PRAGMA table_info` +
 * `CREATE TABLE IF NOT EXISTS` pattern as other tables (see
 * `opportunity-contacts-schema.ts`, `company-research.ts`). Safe to call on
 * every read/write — short-circuits after first success.
 */
export function ensureSharedResumesSchema(): void {
  if (sharedResumesSchemaEnsured) return;

  try {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS shared_resumes (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default',
        document_html TEXT NOT NULL,
        document_title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        view_count INTEGER NOT NULL DEFAULT 0
      )`,
    ).run();

    db.prepare(
      "CREATE INDEX IF NOT EXISTS idx_shared_resumes_user_id ON shared_resumes(user_id)",
    ).run();
    db.prepare(
      "CREATE INDEX IF NOT EXISTS idx_shared_resumes_user_created ON shared_resumes(user_id, created_at)",
    ).run();

    sharedResumesSchemaEnsured = true;
  } catch {
    // First boot / mocked test envs may not expose `prepare`. Callers should
    // already have mocked behavior; swallow here to match the rest of the
    // `ensure*Schema` family.
  }
}

/**
 * Generate a URL-safe base64 token. 16 random bytes → 22 chars (no padding).
 * Never use `Math.random` — see CLAUDE.md.
 */
export function generateShareToken(bytes = SHARE_TOKEN_BYTES): string {
  return randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function rowToSharedResume(row: SharedResumeRow): SharedResume {
  return {
    id: row.id,
    userId: row.user_id,
    documentHtml: row.document_html,
    documentTitle: row.document_title,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    viewCount: row.view_count,
  };
}

export interface CreateShareInput {
  userId: string;
  html: string;
  title: string;
  ttlMs?: number;
  now?: number;
}

export function createShare(input: CreateShareInput): SharedResume {
  ensureSharedResumesSchema();

  const now = input.now ?? nowEpoch();
  const ttl = input.ttlMs ?? DEFAULT_SHARE_TTL_MS;
  if (ttl <= 0) {
    throw new Error("Share TTL must be positive");
  }

  const html = input.html ?? "";
  if (!html.trim()) {
    throw new Error("Cannot share an empty document");
  }
  if (Buffer.byteLength(html, "utf8") > MAX_SHARE_HTML_BYTES) {
    throw new Error("Snapshot exceeds maximum share size");
  }

  const title = (input.title ?? "").trim().slice(0, MAX_SHARE_TITLE_LENGTH);
  const id = generateShareToken();
  const expiresAt = now + ttl;

  db.prepare(
    `INSERT INTO shared_resumes
       (id, user_id, document_html, document_title, created_at, expires_at, view_count)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
  ).run(id, input.userId, html, title || "Untitled resume", now, expiresAt);

  return {
    id,
    userId: input.userId,
    documentHtml: html,
    documentTitle: title || "Untitled resume",
    createdAt: now,
    expiresAt,
    viewCount: 0,
  };
}

/**
 * Fetch a share by token. Returns `null` when not found OR when expired —
 * callers can't distinguish the two so an expired link looks like a missing
 * link, which is what we want for the public viewer.
 */
export function getShareByToken(
  token: string,
  now: number = nowEpoch(),
): SharedResume | null {
  ensureSharedResumesSchema();

  const row = db
    .prepare("SELECT * FROM shared_resumes WHERE id = ?")
    .get(token) as SharedResumeRow | undefined;

  if (!row) return null;
  if (row.expires_at <= now) return null;

  return rowToSharedResume(row);
}

export function incrementViewCount(
  token: string,
  now: number = nowEpoch(),
): number {
  ensureSharedResumesSchema();
  const result = db
    .prepare(
      "UPDATE shared_resumes SET view_count = view_count + 1 WHERE id = ? AND expires_at > ?",
    )
    .run(token, now) as { changes?: number } | undefined;
  return result?.changes ?? 0;
}

export function listSharesForUser(userId: string): SharedResumeSummary[] {
  ensureSharedResumesSchema();

  const rows = db
    .prepare(
      `SELECT id, document_title, created_at, expires_at, view_count
         FROM shared_resumes
        WHERE user_id = ?
        ORDER BY created_at DESC`,
    )
    .all(userId) as Array<
    Pick<
      SharedResumeRow,
      "id" | "document_title" | "created_at" | "expires_at" | "view_count"
    >
  >;

  return rows.map((row) => ({
    id: row.id,
    documentTitle: row.document_title,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    viewCount: row.view_count,
  }));
}

export function deleteShare(token: string, userId: string): boolean {
  ensureSharedResumesSchema();
  const result = db
    .prepare("DELETE FROM shared_resumes WHERE id = ? AND user_id = ?")
    .run(token, userId);
  return (result?.changes ?? 0) > 0;
}
