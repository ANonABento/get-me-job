import db from "./legacy";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";
import type {
  DocumentSourceMap,
  SourceLine,
  SourceLink as SourceMapLink,
  SourceMapPage,
} from "@/lib/ingest/types";

export const DOCUMENT_ARTIFACT_EXTRACTOR_VERSION = "pdf-source-map-v1";

export type DocumentArtifactStatus = "ready" | "failed";

export interface SourceLink {
  url: string;
  text?: string;
  page?: number;
  bbox?: [number, number, number, number, number];
}

export interface DocumentArtifact {
  id: string;
  documentId: string;
  userId: string;
  extractorVersion: string;
  status: DocumentArtifactStatus;
  failureReason?: string;
  rawText: string;
  normalizedText: string;
  sourceMap: DocumentSourceMap;
  links: SourceLink[];
  ocrUsed: boolean;
  createdAt: string;
}

export interface SaveDocumentArtifactInput {
  id?: string;
  documentId: string;
  userId: string;
  extractorVersion?: string;
  status?: DocumentArtifactStatus;
  failureReason?: string;
  sourceMap?: DocumentSourceMap;
  rawText?: string;
  normalizedText?: string;
  links?: SourceLink[];
  ocrUsed?: boolean;
  createdAt?: string;
}

interface StoredSourceMapPage extends SourceMapPage {
  lines: SourceLine[];
}

interface DocumentArtifactRow {
  id: string;
  document_id: string;
  user_id: string;
  extractor_version: string;
  status: string;
  failure_reason: string | null;
  raw_text: string;
  normalized_text: string;
  pages_json: string;
  links_json: string;
  ocr_used: number | boolean;
  created_at: string;
}

let ensured = false;

export function ensureDocumentArtifactsSchema(): void {
  if (ensured) return;

  db.prepare(
    `CREATE TABLE IF NOT EXISTS document_artifacts (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      extractor_version TEXT NOT NULL,
      status TEXT NOT NULL,
      failure_reason TEXT,
      raw_text TEXT NOT NULL DEFAULT '',
      normalized_text TEXT NOT NULL DEFAULT '',
      pages_json TEXT NOT NULL DEFAULT '[]',
      links_json TEXT NOT NULL DEFAULT '[]',
      ocr_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_document_artifacts_document_created
       ON document_artifacts(user_id, document_id, created_at)`,
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_document_artifacts_user_status
       ON document_artifacts(user_id, status)`,
  ).run();

  ensured = true;
}

function normalizeArtifactText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function emptySourceMap(rawText = ""): DocumentSourceMap {
  return { pages: [], lines: [], rawText };
}

function pagesJsonForSourceMap(sourceMap: DocumentSourceMap): string {
  const linesByPage = new Map<number, SourceLine[]>();
  for (const line of sourceMap.lines) {
    const pageLines = linesByPage.get(line.page) ?? [];
    pageLines.push(line);
    linesByPage.set(line.page, pageLines);
  }

  const pages: StoredSourceMapPage[] = sourceMap.pages.map((page) => ({
    ...page,
    lines: linesByPage.get(page.page) ?? [],
  }));
  return JSON.stringify(pages);
}

function sourceMapFromPagesJson(
  pagesJson: string,
  rawText: string,
  links: SourceLink[] = [],
): DocumentSourceMap {
  const storedPages = JSON.parse(pagesJson || "[]") as StoredSourceMapPage[];
  return {
    pages: storedPages.map(({ lines: _lines, ...page }) => page),
    lines: storedPages.flatMap((page) => page.lines ?? []),
    rawText,
    links: sourceMapLinksFromArtifactLinks(links),
  };
}

function sourceMapLinksFromArtifactLinks(links: SourceLink[]): SourceMapLink[] {
  return links.filter(
    (link): link is SourceMapLink =>
      typeof link.page === "number" &&
      Array.isArray(link.bbox) &&
      link.bbox.length === 5,
  );
}

function mapArtifactRow(row: DocumentArtifactRow): DocumentArtifact {
  const links = JSON.parse(row.links_json || "[]") as SourceLink[];
  return {
    id: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    extractorVersion: row.extractor_version,
    status: row.status === "failed" ? "failed" : "ready",
    failureReason: row.failure_reason ?? undefined,
    rawText: row.raw_text,
    normalizedText: row.normalized_text,
    sourceMap: sourceMapFromPagesJson(row.pages_json, row.raw_text, links),
    links,
    ocrUsed: Boolean(row.ocr_used),
    createdAt: row.created_at,
  };
}

export function saveDocumentArtifact(
  input: SaveDocumentArtifactInput,
): DocumentArtifact {
  ensureDocumentArtifactsSchema();

  const sourceMap = input.sourceMap ?? emptySourceMap(input.rawText ?? "");
  const rawText = input.rawText ?? sourceMap.rawText;
  const normalizedText = input.normalizedText ?? normalizeArtifactText(rawText);
  const artifact: DocumentArtifact = {
    id: input.id ?? generateId(),
    documentId: input.documentId,
    userId: input.userId,
    extractorVersion:
      input.extractorVersion ?? DOCUMENT_ARTIFACT_EXTRACTOR_VERSION,
    status: input.status ?? "ready",
    failureReason: input.failureReason,
    rawText,
    normalizedText,
    sourceMap,
    links: input.links ?? [],
    ocrUsed: Boolean(input.ocrUsed),
    createdAt: input.createdAt ?? nowIso(),
  };

  db.prepare(
    `INSERT INTO document_artifacts (
      id, document_id, user_id, extractor_version, status, failure_reason,
      raw_text, normalized_text, pages_json, links_json, ocr_used, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    artifact.id,
    artifact.documentId,
    artifact.userId,
    artifact.extractorVersion,
    artifact.status,
    artifact.failureReason ?? null,
    artifact.rawText,
    artifact.normalizedText,
    pagesJsonForSourceMap(artifact.sourceMap),
    JSON.stringify(artifact.links),
    artifact.ocrUsed ? 1 : 0,
    artifact.createdAt,
  );

  return artifact;
}

export function getDocumentArtifact(
  id: string,
  userId: string,
): DocumentArtifact | null {
  ensureDocumentArtifactsSchema();
  const row = db
    .prepare("SELECT * FROM document_artifacts WHERE id = ? AND user_id = ?")
    .get(id, userId) as DocumentArtifactRow | undefined;
  return row ? mapArtifactRow(row) : null;
}

export function getLatestDocumentArtifact(
  documentId: string,
  userId: string,
): DocumentArtifact | null {
  ensureDocumentArtifactsSchema();
  const row = db
    .prepare(
      `SELECT * FROM document_artifacts
       WHERE document_id = ? AND user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC
       LIMIT 1`,
    )
    .get(documentId, userId) as DocumentArtifactRow | undefined;
  return row ? mapArtifactRow(row) : null;
}

export function listDocumentArtifacts(
  documentId: string,
  userId: string,
): DocumentArtifact[] {
  ensureDocumentArtifactsSchema();
  const rows = db
    .prepare(
      `SELECT * FROM document_artifacts
       WHERE document_id = ? AND user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`,
    )
    .all(documentId, userId) as DocumentArtifactRow[];
  return rows.map(mapArtifactRow);
}

export function deleteDocumentArtifactsByDocumentIds(
  documentIds: string[],
  userId: string,
): number {
  if (documentIds.length === 0) return 0;
  ensureDocumentArtifactsSchema();

  const uniqueDocumentIds = Array.from(new Set(documentIds));
  const deleteArtifact = db.prepare(
    "DELETE FROM document_artifacts WHERE document_id = ? AND user_id = ?",
  );

  const transaction = db.transaction(() => {
    let deleted = 0;
    for (const documentId of uniqueDocumentIds) {
      deleted += deleteArtifact.run(documentId, userId).changes;
    }
    return deleted;
  });

  return transaction();
}
