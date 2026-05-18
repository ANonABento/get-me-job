import db from "./legacy";
import { generateId } from "@/lib/utils";
import type { ParsedResumeV2Result } from "@/lib/ingest/types";

export const DOCUMENT_PARSE_RUN_PARSER_VERSION = "resume-v2-basic-v1";

export type DocumentParseRunMode = "basic" | "ai" | "hybrid";
export type DocumentParseRunStatus = "ready" | "failed";

export interface ParseWarning {
  code: string;
  message: string;
  sourceSpanIds?: string[];
  severity: "info" | "warning" | "error";
}

export interface DocumentParseRun {
  id: string;
  documentId: string;
  artifactId: string;
  userId: string;
  mode: DocumentParseRunMode;
  parserVersion: string;
  status: DocumentParseRunStatus;
  failureReason?: string;
  confidence: number;
  warnings: ParseWarning[];
  structured: ParsedResumeV2Result | Record<string, unknown>;
  createdAt: string;
}

export interface SaveDocumentParseRunInput {
  id?: string;
  documentId: string;
  artifactId: string;
  userId: string;
  mode?: DocumentParseRunMode;
  parserVersion?: string;
  status?: DocumentParseRunStatus;
  failureReason?: string;
  confidence?: number;
  warnings?: ParseWarning[];
  structured?: ParsedResumeV2Result | Record<string, unknown>;
  createdAt?: string;
}

interface DocumentParseRunRow {
  id: string;
  document_id: string;
  artifact_id: string;
  user_id: string;
  mode: string;
  parser_version: string;
  status: string;
  failure_reason: string | null;
  confidence: number;
  warnings_json: string;
  structured_json: string;
  created_at: string;
}

let ensured = false;

export function ensureDocumentParseRunsSchema(): void {
  if (ensured) return;

  db.prepare(
    `CREATE TABLE IF NOT EXISTS document_parse_runs (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      parser_version TEXT NOT NULL,
      status TEXT NOT NULL,
      failure_reason TEXT,
      confidence REAL NOT NULL DEFAULT 0,
      warnings_json TEXT NOT NULL DEFAULT '[]',
      structured_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_document_parse_runs_document_created
       ON document_parse_runs(user_id, document_id, created_at)`,
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_document_parse_runs_artifact_created
       ON document_parse_runs(user_id, artifact_id, created_at)`,
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_document_parse_runs_user_status
       ON document_parse_runs(user_id, status)`,
  ).run();

  ensured = true;
}

function modeFromRow(value: string): DocumentParseRunMode {
  return value === "ai" || value === "hybrid" ? value : "basic";
}

function statusFromRow(value: string): DocumentParseRunStatus {
  return value === "failed" ? "failed" : "ready";
}

function mapParseRunRow(row: DocumentParseRunRow): DocumentParseRun {
  return {
    id: row.id,
    documentId: row.document_id,
    artifactId: row.artifact_id,
    userId: row.user_id,
    mode: modeFromRow(row.mode),
    parserVersion: row.parser_version,
    status: statusFromRow(row.status),
    failureReason: row.failure_reason ?? undefined,
    confidence: row.confidence,
    warnings: JSON.parse(row.warnings_json || "[]") as ParseWarning[],
    structured: JSON.parse(row.structured_json || "{}") as
      | ParsedResumeV2Result
      | Record<string, unknown>,
    createdAt: row.created_at,
  };
}

export function saveDocumentParseRun(
  input: SaveDocumentParseRunInput,
): DocumentParseRun {
  ensureDocumentParseRunsSchema();

  const run: DocumentParseRun = {
    id: input.id ?? generateId(),
    documentId: input.documentId,
    artifactId: input.artifactId,
    userId: input.userId,
    mode: input.mode ?? "basic",
    parserVersion: input.parserVersion ?? DOCUMENT_PARSE_RUN_PARSER_VERSION,
    status: input.status ?? "ready",
    failureReason: input.failureReason,
    confidence: input.confidence ?? 0,
    warnings: input.warnings ?? [],
    structured: input.structured ?? {},
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO document_parse_runs (
      id, document_id, artifact_id, user_id, mode, parser_version, status,
      failure_reason, confidence, warnings_json, structured_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    run.id,
    run.documentId,
    run.artifactId,
    run.userId,
    run.mode,
    run.parserVersion,
    run.status,
    run.failureReason ?? null,
    run.confidence,
    JSON.stringify(run.warnings),
    JSON.stringify(run.structured),
    run.createdAt,
  );

  return run;
}

export function getDocumentParseRun(
  id: string,
  documentId: string,
  userId: string,
): DocumentParseRun | null {
  ensureDocumentParseRunsSchema();
  const row = db
    .prepare(
      `SELECT * FROM document_parse_runs
       WHERE id = ? AND document_id = ? AND user_id = ?`,
    )
    .get(id, documentId, userId) as DocumentParseRunRow | undefined;
  return row ? mapParseRunRow(row) : null;
}

export function getDocumentParseRunById(
  id: string,
  userId: string,
): DocumentParseRun | null {
  ensureDocumentParseRunsSchema();
  const row = db
    .prepare(
      `SELECT * FROM document_parse_runs
       WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId) as DocumentParseRunRow | undefined;
  return row ? mapParseRunRow(row) : null;
}

export function listDocumentParseRuns(
  documentId: string,
  userId: string,
): DocumentParseRun[] {
  ensureDocumentParseRunsSchema();
  const rows = db
    .prepare(
      `SELECT * FROM document_parse_runs
       WHERE document_id = ? AND user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`,
    )
    .all(documentId, userId) as DocumentParseRunRow[];
  return rows.map(mapParseRunRow);
}
