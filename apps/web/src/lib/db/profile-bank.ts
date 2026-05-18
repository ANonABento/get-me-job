import db from "./legacy";
import { generateId } from "@/lib/utils";
import type {
  BankEntry,
  BankCategory,
  GroupedBankEntries,
  SourceBbox,
  SourceLinkMetadata,
} from "@/types";

interface BankEntryRow {
  id: string;
  user_id: string;
  category: string;
  content: string;
  source_document_id: string | null;
  parent_id?: string | null;
  component_type?: string | null;
  component_order?: number | null;
  source_section?: string | null;
  source_page?: number | null;
  source_bbox?: string | null;
  source_order?: number | null;
  source_header_bbox?: string | null;
  source_links?: string | null;
  source_artifact_id?: string | null;
  source_parse_run_id?: string | null;
  source_span_ids?: string | null;
  source_quality?: string | null;
  match_method?: string | null;
  confidence_score: number;
  created_at: string;
}

export interface BankEntryCursor {
  lastId: string;
  lastCreatedAt: string;
}

export interface ListBankEntriesPaginatedParams {
  userId: string;
  query?: string | null;
  category?: BankCategory | null;
  sourceDocumentId?: string | null;
  cursor?: BankEntryCursor | null;
  limit: number;
}

function readContent(row: BankEntryRow): Record<string, unknown> {
  const content = JSON.parse(row.content) as Record<string, unknown>;
  if (row.parent_id && !content.parentId) content.parentId = row.parent_id;
  if (row.component_type && !content.componentType) {
    content.componentType = row.component_type;
  }
  if (typeof row.component_order === "number" && content.order === undefined) {
    content.order = row.component_order;
  }
  if (row.source_section && !content.sourceSection) {
    content.sourceSection = row.source_section;
  }
  return content;
}

function parseBboxJson(
  value: string | null | undefined,
): SourceBbox[] | undefined {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Ignore malformed JSON — degrade to "no bbox" rather than fail.
    }
  }
  return undefined;
}

function parseSourceLinksJson(
  value: string | null | undefined,
): SourceLinkMetadata[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    const links = parsed.filter(
      (link): link is SourceLinkMetadata =>
        typeof link === "object" &&
        link !== null &&
        typeof (link as SourceLinkMetadata).url === "string",
    );
    return links.length > 0 ? links : undefined;
  } catch {
    return undefined;
  }
}

function parseStringArrayJson(
  value: string | null | undefined,
): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    const strings = parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    return strings.length > 0 ? strings : undefined;
  } catch {
    return undefined;
  }
}

function sourceQualityValue(
  value: string | null | undefined,
): BankEntry["sourceQuality"] | undefined {
  if (
    value === "exact" ||
    value === "partial" ||
    value === "fuzzy" ||
    value === "missing"
  ) {
    return value;
  }
  return undefined;
}

function rowToEntry(row: BankEntryRow): BankEntry {
  const sourceBbox = parseBboxJson(row.source_bbox);
  const sourceHeaderBbox = parseBboxJson(row.source_header_bbox);
  const sourceLinks = parseSourceLinksJson(row.source_links);
  const sourceSpanIds = parseStringArrayJson(row.source_span_ids);
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as BankCategory,
    content: readContent(row),
    sourceDocumentId: row.source_document_id ?? undefined,
    sourcePage: row.source_page ?? undefined,
    sourceBbox,
    sourceOrder: row.source_order ?? undefined,
    sourceHeaderBbox,
    sourceLinks,
    sourceArtifactId: row.source_artifact_id ?? undefined,
    sourceParseRunId: row.source_parse_run_id ?? undefined,
    sourceSpanIds,
    sourceQuality: sourceQualityValue(row.source_quality),
    matchMethod: row.match_method ?? undefined,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at,
  };
}

function supportsChildCount(entry: BankEntry): boolean {
  return entry.category === "experience" || entry.category === "project";
}

function attachChildCounts(entries: BankEntry[], userId: string): BankEntry[] {
  if (!entries.some(supportsChildCount)) return entries;

  const rows = db
    .prepare(
      `SELECT parent_id, COUNT(*) AS child_count
       FROM profile_bank
       WHERE user_id = ? AND parent_id IS NOT NULL
       GROUP BY parent_id`,
    )
    .all(userId) as { parent_id: string; child_count: number }[];
  const childCounts = new Map(
    rows.map((row) => [row.parent_id, Number(row.child_count)]),
  );

  return entries.map((entry) => {
    if (!supportsChildCount(entry)) return entry;
    return {
      ...entry,
      content: {
        ...entry.content,
        childCount: childCounts.get(entry.id) ?? 0,
      },
    };
  });
}

let profileBankHierarchySchemaEnsured = false;

export function ensureProfileBankHierarchySchema(): void {
  if (profileBankHierarchySchemaEnsured) return;

  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec !== "function") {
    profileBankHierarchySchemaEnsured = true;
    return;
  }

  const statements = [
    "ALTER TABLE profile_bank ADD COLUMN parent_id TEXT",
    "ALTER TABLE profile_bank ADD COLUMN component_type TEXT",
    "ALTER TABLE profile_bank ADD COLUMN component_order INTEGER DEFAULT 0",
    "ALTER TABLE profile_bank ADD COLUMN source_section TEXT",
    // PF.2 — positional metadata for review-modal document preview.
    // `source_page` is 1-indexed (pdfjs convention); `source_bbox` is a JSON
    // array of tuples `[page, x0, y0, x1, y1]` so a single entry can span
    // multiple text items or pages. Both are NULL for legacy entries and for
    // entries that have no PDF source (manual, Drive doc, etc.).
    "ALTER TABLE profile_bank ADD COLUMN source_page INTEGER",
    "ALTER TABLE profile_bank ADD COLUMN source_bbox TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_order INTEGER",
    "ALTER TABLE profile_bank ADD COLUMN source_header_bbox TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_links TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_artifact_id TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_parse_run_id TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_span_ids TEXT",
    "ALTER TABLE profile_bank ADD COLUMN source_quality TEXT",
    // Preview-match cascade P2.2 — records which tier of the cascade
    // resolved this entry's position. `null` for legacy rows + entries
    // with no PDF source; `"fuzzy"` for any free-tier deterministic
    // match. Reserved values for the followup premium spec:
    // `"embedding"`, `"llm-citation"`, `"document-ai"`.
    "ALTER TABLE profile_bank ADD COLUMN match_method TEXT",
    "CREATE INDEX IF NOT EXISTS idx_profile_bank_parent ON profile_bank(user_id, parent_id)",
    "CREATE INDEX IF NOT EXISTS idx_profile_bank_component_type ON profile_bank(user_id, component_type)",
    "CREATE INDEX IF NOT EXISTS idx_profile_bank_parse_run ON profile_bank(user_id, source_parse_run_id)",
    "CREATE INDEX IF NOT EXISTS idx_profile_bank_artifact ON profile_bank(user_id, source_artifact_id)",
  ];

  for (const statement of statements) {
    try {
      exec.call(db, statement);
    } catch (error) {
      const message = (error as Error).message.toLowerCase();
      if (!message.includes("duplicate column")) throw error;
    }
  }

  profileBankHierarchySchemaEnsured = true;
}

export interface InsertBankEntry {
  id?: string;
  category: BankCategory;
  content: Record<string, unknown>;
  sourceDocumentId?: string;
  parentId?: string;
  componentType?: string;
  componentOrder?: number;
  sourceSection?: string;
  sourcePage?: number;
  sourceBbox?: SourceBbox[];
  sourceOrder?: number;
  sourceHeaderBbox?: SourceBbox[];
  sourceLinks?: SourceLinkMetadata[];
  sourceArtifactId?: string;
  sourceParseRunId?: string;
  sourceSpanIds?: string[];
  sourceQuality?: BankEntry["sourceQuality"];
  matchMethod?: string;
  confidenceScore?: number;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function entryParentId(entry: InsertBankEntry): string | null {
  return entry.parentId ?? stringValue(entry.content.parentId) ?? null;
}

function entryComponentType(entry: InsertBankEntry): string {
  return (
    entry.componentType ??
    stringValue(entry.content.componentType) ??
    stringValue(entry.content.parentType) ??
    entry.category
  );
}

function entryComponentOrder(entry: InsertBankEntry): number {
  return entry.componentOrder ?? numberValue(entry.content.order) ?? 0;
}

function entrySourceSection(entry: InsertBankEntry): string | null {
  return (
    entry.sourceSection ?? stringValue(entry.content.sourceSection) ?? null
  );
}

function entrySourceOrder(entry: InsertBankEntry): number | null {
  return entry.sourceOrder ?? numberValue(entry.content.sourceOrder) ?? null;
}

function serializeJsonMetadata(value: unknown[] | undefined): string | null {
  return value ? JSON.stringify(value) : null;
}

export function insertBankEntry(
  entry: InsertBankEntry,
  userId: string,
): string {
  ensureProfileBankHierarchySchema();
  const id = entry.id ?? generateId();
  db.prepare(
    `
    INSERT INTO profile_bank (
      id, user_id, category, content, source_document_id,
      parent_id, component_type, component_order, source_section,
      source_page, source_bbox, source_order, source_header_bbox, source_links,
      source_artifact_id, source_parse_run_id, source_span_ids, source_quality,
      match_method,
      confidence_score
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    userId,
    entry.category,
    JSON.stringify(entry.content),
    entry.sourceDocumentId ?? null,
    entryParentId(entry),
    entryComponentType(entry),
    entryComponentOrder(entry),
    entrySourceSection(entry),
    entry.sourcePage ?? null,
    serializeJsonMetadata(entry.sourceBbox),
    entrySourceOrder(entry),
    serializeJsonMetadata(entry.sourceHeaderBbox),
    serializeJsonMetadata(entry.sourceLinks),
    entry.sourceArtifactId ?? null,
    entry.sourceParseRunId ?? null,
    entry.sourceSpanIds ? JSON.stringify(entry.sourceSpanIds) : null,
    entry.sourceQuality ?? null,
    entry.matchMethod ?? null,
    entry.confidenceScore ?? 0.8,
  );
  return id;
}

export function insertBankEntries(
  entries: InsertBankEntry[],
  userId: string,
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

export function getBankEntries(userId: string): BankEntry[] {
  ensureProfileBankHierarchySchema();
  const rows = db
    .prepare(
      "SELECT * FROM profile_bank WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(userId) as BankEntryRow[];
  return attachChildCounts(rows.map(rowToEntry), userId);
}

export function getBankEntriesByCategory(
  category: BankCategory,
  userId: string,
): BankEntry[] {
  ensureProfileBankHierarchySchema();
  const rows = db
    .prepare(
      "SELECT * FROM profile_bank WHERE user_id = ? AND category = ? ORDER BY created_at DESC",
    )
    .all(userId, category) as BankEntryRow[];
  return attachChildCounts(rows.map(rowToEntry), userId);
}

export function getGroupedBankEntries(userId: string): GroupedBankEntries {
  const all = getBankEntries(userId);
  const grouped: GroupedBankEntries = {
    experience: [],
    skill: [],
    project: [],
    hackathon: [],
    education: [],
    paragraph: [],
    bullet: [],
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

export function searchBankEntries(query: string, userId: string): BankEntry[] {
  ensureProfileBankHierarchySchema();
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      "SELECT * FROM profile_bank WHERE user_id = ? AND content LIKE ? ORDER BY confidence_score DESC, created_at DESC",
    )
    .all(userId, pattern) as BankEntryRow[];
  return attachChildCounts(rows.map(rowToEntry), userId);
}

export function searchBankEntriesByCategory(
  query: string,
  category: BankCategory,
  userId: string,
): BankEntry[] {
  ensureProfileBankHierarchySchema();
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      `SELECT * FROM profile_bank
       WHERE user_id = ? AND category = ? AND content LIKE ?
       ORDER BY confidence_score DESC, created_at DESC`,
    )
    .all(userId, category, pattern) as BankEntryRow[];
  return attachChildCounts(rows.map(rowToEntry), userId);
}

export function listBankEntriesPaginated({
  userId,
  query,
  category,
  sourceDocumentId,
  cursor,
  limit,
}: ListBankEntriesPaginatedParams): BankEntry[] {
  ensureProfileBankHierarchySchema();
  const whereClauses = ["user_id = ?"];
  const params: Array<string | number> = [userId];

  if (category) {
    whereClauses.push("category = ?");
    params.push(category);
  }

  if (sourceDocumentId) {
    whereClauses.push("source_document_id = ?");
    params.push(sourceDocumentId);
  }

  if (query?.trim()) {
    whereClauses.push("content LIKE ?");
    params.push(`%${query.trim()}%`);
  }

  if (cursor) {
    whereClauses.push("(created_at < ? OR (created_at = ? AND id < ?))");
    params.push(cursor.lastCreatedAt, cursor.lastCreatedAt, cursor.lastId);
  }

  params.push(limit + 1);

  const rows = db
    .prepare(
      `SELECT * FROM profile_bank
       WHERE ${whereClauses.join(" AND ")}
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .all(...params) as BankEntryRow[];
  return attachChildCounts(rows.map(rowToEntry), userId);
}

export function deleteBankEntriesBySource(
  sourceDocumentId: string,
  userId: string,
): number {
  ensureProfileBankHierarchySchema();
  const result = db
    .prepare(
      "DELETE FROM profile_bank WHERE user_id = ? AND source_document_id = ?",
    )
    .run(userId, sourceDocumentId);
  return result.changes;
}

interface SourceDocumentRow {
  id: string;
  filename: string;
  size: number;
  uploaded_at: string;
  chunk_count: number;
}

export interface SourceDocument {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  chunkCount: number;
}

function rowToSourceDocument(row: SourceDocumentRow): SourceDocument {
  return {
    id: row.id,
    filename: row.filename,
    size: row.size,
    uploadedAt: row.uploaded_at,
    chunkCount: row.chunk_count,
  };
}

export function getSourceDocuments(userId: string): SourceDocument[] {
  const rows = db
    .prepare(
      `SELECT d.id, d.filename, d.size, d.uploaded_at,
              COUNT(pb.id) AS chunk_count
       FROM documents d
       LEFT JOIN profile_bank pb ON pb.source_document_id = d.id AND pb.user_id = d.user_id
       WHERE d.user_id = ?
       GROUP BY d.id
       ORDER BY d.uploaded_at DESC`,
    )
    .all(userId) as SourceDocumentRow[];
  return rows.map(rowToSourceDocument);
}

export interface DeleteSourceDocumentsResult {
  documentsDeleted: number;
  chunksDeleted: number;
}

export function deleteSourceDocument(
  documentId: string,
  userId: string,
): number {
  return deleteSourceDocuments([documentId], userId).chunksDeleted;
}

export function deleteSourceDocuments(
  documentIds: string[],
  userId: string,
): DeleteSourceDocumentsResult {
  if (documentIds.length === 0) {
    return { documentsDeleted: 0, chunksDeleted: 0 };
  }

  const uniqueDocumentIds = Array.from(new Set(documentIds));
  const deleteEntries = db.prepare(
    "DELETE FROM profile_bank WHERE source_document_id = ? AND user_id = ?",
  );
  const deleteDoc = db.prepare(
    "DELETE FROM documents WHERE id = ? AND user_id = ?",
  );

  const transaction = db.transaction(() => {
    let chunksDeleted = 0;
    let documentsDeleted = 0;

    for (const documentId of uniqueDocumentIds) {
      chunksDeleted += deleteEntries.run(documentId, userId).changes;
      documentsDeleted += deleteDoc.run(documentId, userId).changes;
    }

    return { documentsDeleted, chunksDeleted };
  });

  return transaction();
}

export function clearBankEntries(userId: string): void {
  db.prepare("DELETE FROM profile_bank WHERE user_id = ?").run(userId);
}

/**
 * Generate a deduplication key for a bank entry.
 * Used to detect if an equivalent entry already exists.
 */
export function getDeduplicationKey(
  category: BankCategory,
  content: Record<string, unknown>,
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
    case "paragraph":
      return `${content.text || content.description}`
        .toLowerCase()
        .slice(0, 160);
    case "hackathon":
      return `${content.name}|${content.submissionUrl || content.eventUrl}`.toLowerCase();
    case "certification":
      return `${content.name}|${content.issuer}`.toLowerCase();
    case "bullet":
      return `${content.description}`.toLowerCase().slice(0, 100);
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
  userId: string,
): BankEntry | null {
  ensureProfileBankHierarchySchema();
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
  confidenceScore: number,
  userId: string,
): void {
  ensureProfileBankHierarchySchema();
  const metadata = {
    parentId: stringValue(content.parentId) ?? null,
    componentType:
      stringValue(content.componentType) ??
      stringValue(content.parentType) ??
      null,
    componentOrder: numberValue(content.order) ?? 0,
    sourceSection: stringValue(content.sourceSection) ?? null,
  };
  db.prepare(
    `UPDATE profile_bank
     SET content = ?,
         parent_id = ?,
         component_type = coalesce(?, component_type),
         component_order = ?,
         source_section = ?,
         confidence_score = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    JSON.stringify(content),
    metadata.parentId,
    metadata.componentType,
    metadata.componentOrder,
    metadata.sourceSection,
    confidenceScore,
    id,
    userId,
  );
}

/**
 * Persist positional metadata for a bank entry (PF.1 + PF.2). Called from
 * the upload pipeline after fuzzy-matching the parsed entry's text back to
 * the source PDF's text-item positions. Safe to call repeatedly — overwrites
 * whatever was there.
 */
export function updateBankEntryPositions(
  id: string,
  userId: string,
  positions: {
    page: number;
    bboxes: SourceBbox[];
    sourceOrder?: number;
    headerBboxes?: SourceBbox[];
    sourceLinks?: SourceLinkMetadata[];
    /**
     * Match-cascade tier that produced these bboxes. Defaults to
     * `"fuzzy"` for free-tier matches. Premium tiers (when implemented)
     * pass `"embedding"`, `"llm-citation"`, or `"document-ai"`.
     */
    matchMethod?: string;
  },
): void {
  ensureProfileBankHierarchySchema();
  db.prepare(
    `UPDATE profile_bank
     SET source_page = ?,
         source_bbox = ?,
         source_order = coalesce(?, source_order),
         source_header_bbox = coalesce(?, source_header_bbox),
         source_links = coalesce(?, source_links),
         match_method = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    positions.page,
    JSON.stringify(positions.bboxes),
    positions.sourceOrder ?? null,
    serializeJsonMetadata(positions.headerBboxes),
    serializeJsonMetadata(positions.sourceLinks),
    positions.matchMethod ?? "fuzzy",
    id,
    userId,
  );
}

export function updateBankEntryForUser(
  id: string,
  userId: string,
  content: Record<string, unknown>,
  confidenceScore: number,
): boolean {
  ensureProfileBankHierarchySchema();
  const metadata = {
    parentId: stringValue(content.parentId) ?? null,
    componentType:
      stringValue(content.componentType) ??
      stringValue(content.parentType) ??
      null,
    componentOrder: numberValue(content.order) ?? 0,
    sourceSection: stringValue(content.sourceSection) ?? null,
  };
  const result = db
    .prepare(
      `UPDATE profile_bank
       SET content = ?,
           parent_id = ?,
           component_type = coalesce(?, component_type),
           component_order = ?,
           source_section = ?,
           confidence_score = ?
       WHERE id = ? AND user_id = ?`,
    )
    .run(
      JSON.stringify(content),
      metadata.parentId,
      metadata.componentType,
      metadata.componentOrder,
      metadata.sourceSection,
      confidenceScore,
      id,
      userId,
    );
  return result.changes > 0;
}

/**
 * Delete a single bank entry. Returns true if the entry existed and was deleted.
 */
export function deleteBankEntry(id: string, userId: string): boolean {
  ensureProfileBankHierarchySchema();
  db.prepare(
    `DELETE FROM profile_bank
     WHERE user_id = ?
       AND category IN ('bullet', 'achievement')
       AND (
         parent_id = ?
         OR json_extract(content, '$.parentId') = ?
       )`,
  ).run(userId, id, id);

  const result = db
    .prepare("DELETE FROM profile_bank WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}
