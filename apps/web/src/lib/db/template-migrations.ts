import db from "./legacy";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";
import type { DocumentTemplateV2 } from "@/lib/resume/template-v2";
import {
  assessTemplateMigrationFidelity,
  type TemplateMigrationFidelityReport,
} from "@/lib/resume/template-migration-fidelity";
import type {
  SourceDocumentIR,
  TemplateMigrationDraft,
} from "@/lib/resume/template-migration";
import type { TailoredResume } from "@/lib/resume/generator";
import type { TemplateSourceType } from "@/lib/templates/import";

interface DraftRow {
  id: string;
  user_id: string;
  status: "reviewing" | "committed";
  source_filename: string;
  source_type: TemplateSourceType;
  source_ir_json: string;
  resume_json: string;
  template_json: string;
  fidelity_report_json?: string | null;
  warnings_json: string;
  confidence: "high" | "medium" | "low";
  committed_template_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplateRow {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  source_filename?: string | null;
  source_type?: TemplateSourceType | null;
  template_json: string;
  created_at: string;
  updated_at: string;
}

export interface SavedDocumentTemplateV2 {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sourceFilename: string | null;
  sourceType: TemplateSourceType | null;
  template: DocumentTemplateV2;
  createdAt: string;
  updatedAt: string;
}

export function ensureTemplateMigrationTables(): void {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS template_migration_drafts (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      status text NOT NULL,
      source_filename text NOT NULL,
      source_type text NOT NULL,
      source_ir_json text NOT NULL,
      resume_json text NOT NULL,
      template_json text NOT NULL,
      warnings_json text NOT NULL,
      confidence text NOT NULL,
      committed_template_id text,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )`,
  ).run();
  ensureColumn("template_migration_drafts", "fidelity_report_json", "text");
  db.prepare(
    `CREATE TABLE IF NOT EXISTS document_templates_v2 (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      name text NOT NULL,
      description text,
      source_filename text,
      source_type text,
      template_json text NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL
    )`,
  ).run();
}

export function saveTemplateMigrationDraft(
  draft: TemplateMigrationDraft,
): TemplateMigrationDraft {
  ensureTemplateMigrationTables();
  db.prepare(
    `INSERT INTO template_migration_drafts (
      id, user_id, status, source_filename, source_type, source_ir_json,
      resume_json, template_json, fidelity_report_json, warnings_json, confidence,
      committed_template_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    draft.id,
    draft.userId,
    draft.status,
    draft.sourceFilename,
    draft.sourceType,
    JSON.stringify(draft.source),
    JSON.stringify(draft.resume),
    JSON.stringify(draft.template),
    JSON.stringify(draft.fidelity),
    JSON.stringify(draft.warnings),
    draft.confidence,
    draft.committedTemplateId ?? null,
    draft.createdAt,
    draft.updatedAt,
  );
  return draft;
}

export function getTemplateMigrationDraft(
  id: string,
  userId: string,
): TemplateMigrationDraft | null {
  ensureTemplateMigrationTables();
  const row = db
    .prepare(
      `SELECT id, user_id, status, source_filename, source_type, source_ir_json,
        resume_json, template_json, fidelity_report_json, warnings_json, confidence,
        committed_template_id, created_at, updated_at
       FROM template_migration_drafts
       WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId) as DraftRow | undefined;
  return row ? rowToDraft(row) : null;
}

export function updateTemplateMigrationDraft(
  id: string,
  userId: string,
  updates: {
    source?: SourceDocumentIR;
    resume?: TailoredResume;
    template?: DocumentTemplateV2;
    fidelity?: TemplateMigrationFidelityReport;
    warnings?: string[];
    status?: TemplateMigrationDraft["status"];
    committedTemplateId?: string | null;
  },
): TemplateMigrationDraft | null {
  const existing = getTemplateMigrationDraft(id, userId);
  if (!existing) return null;
  const next: TemplateMigrationDraft = {
    ...existing,
    source: updates.source ?? existing.source,
    resume: updates.resume ?? existing.resume,
    template: updates.template ?? existing.template,
    fidelity:
      updates.fidelity ??
      assessTemplateMigrationFidelity(
        updates.source ?? existing.source,
        updates.template ?? existing.template,
      ),
    warnings: updates.warnings ?? existing.warnings,
    status: updates.status ?? existing.status,
    committedTemplateId:
      updates.committedTemplateId !== undefined
        ? updates.committedTemplateId
        : existing.committedTemplateId,
    updatedAt: nowIso(),
  };
  db.prepare(
    `UPDATE template_migration_drafts
     SET status = ?, source_ir_json = ?, resume_json = ?, template_json = ?,
       fidelity_report_json = ?, warnings_json = ?,
       committed_template_id = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    next.status,
    JSON.stringify(next.source),
    JSON.stringify(next.resume),
    JSON.stringify(next.template),
    JSON.stringify(next.fidelity),
    JSON.stringify(next.warnings),
    next.committedTemplateId ?? null,
    next.updatedAt,
    id,
    userId,
  );
  return next;
}

export function saveDocumentTemplateV2(
  userId: string,
  template: DocumentTemplateV2,
): SavedDocumentTemplateV2 {
  ensureTemplateMigrationTables();
  const now = nowIso();
  const id = template.id || generateId();
  const savedTemplate = { ...template, id };
  const existing = getDocumentTemplateV2(id, userId);
  if (existing) {
    db.prepare(
      `UPDATE document_templates_v2
       SET name = ?, description = ?, source_filename = ?, source_type = ?,
         template_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    ).run(
      savedTemplate.name,
      savedTemplate.description ?? null,
      savedTemplate.source?.filename ?? null,
      savedTemplate.source?.type ?? null,
      JSON.stringify(savedTemplate),
      now,
      id,
      userId,
    );
  } else {
    db.prepare(
      `INSERT INTO document_templates_v2 (
        id, user_id, name, description, source_filename, source_type,
        template_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      userId,
      savedTemplate.name,
      savedTemplate.description ?? null,
      savedTemplate.source?.filename ?? null,
      savedTemplate.source?.type ?? null,
      JSON.stringify(savedTemplate),
      now,
      now,
    );
  }
  return {
    id,
    userId,
    name: savedTemplate.name,
    description: savedTemplate.description ?? null,
    sourceFilename: savedTemplate.source?.filename ?? null,
    sourceType: savedTemplate.source?.type ?? null,
    template: savedTemplate,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getDocumentTemplateV2(
  id: string,
  userId: string,
): SavedDocumentTemplateV2 | null {
  ensureTemplateMigrationTables();
  const row = db
    .prepare(
      `SELECT id, user_id, name, description, source_filename, source_type,
        template_json, created_at, updated_at
       FROM document_templates_v2
       WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId) as TemplateRow | undefined;
  return row ? rowToTemplate(row) : null;
}

export function listDocumentTemplatesV2(
  userId: string,
): SavedDocumentTemplateV2[] {
  ensureTemplateMigrationTables();
  const rows = db
    .prepare(
      `SELECT id, user_id, name, description, source_filename, source_type,
        template_json, created_at, updated_at
       FROM document_templates_v2
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
    )
    .all(userId) as TemplateRow[];
  return rows.map(rowToTemplate);
}

export function updateDocumentTemplateV2Metadata(
  id: string,
  userId: string,
  updates: { name?: string; description?: string | null },
): SavedDocumentTemplateV2 | null {
  const existing = getDocumentTemplateV2(id, userId);
  if (!existing) return null;
  const now = nowIso();
  const template: DocumentTemplateV2 = {
    ...existing.template,
    name: updates.name ?? existing.template.name,
    description:
      updates.description !== undefined
        ? (updates.description ?? undefined)
        : existing.template.description,
  };
  db.prepare(
    `UPDATE document_templates_v2
     SET name = ?, description = ?, template_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    template.name,
    template.description ?? null,
    JSON.stringify(template),
    now,
    id,
    userId,
  );
  return {
    ...existing,
    name: template.name,
    description: template.description ?? null,
    template,
    updatedAt: now,
  };
}

export function deleteDocumentTemplateV2(id: string, userId: string): boolean {
  ensureTemplateMigrationTables();
  const result = db
    .prepare(`DELETE FROM document_templates_v2 WHERE id = ? AND user_id = ?`)
    .run(id, userId);
  return result.changes > 0;
}

function rowToDraft(row: DraftRow): TemplateMigrationDraft {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    sourceFilename: row.source_filename,
    sourceType: row.source_type,
    source: JSON.parse(row.source_ir_json) as SourceDocumentIR,
    resume: JSON.parse(row.resume_json) as TailoredResume,
    template: JSON.parse(row.template_json) as DocumentTemplateV2,
    fidelity: row.fidelity_report_json
      ? (JSON.parse(
          row.fidelity_report_json,
        ) as TemplateMigrationFidelityReport)
      : assessTemplateMigrationFidelity(
          JSON.parse(row.source_ir_json) as SourceDocumentIR,
          JSON.parse(row.template_json) as DocumentTemplateV2,
        ),
    warnings: JSON.parse(row.warnings_json) as string[],
    confidence: row.confidence,
    committedTemplateId: row.committed_template_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function ensureColumn(table: string, column: string, type: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  if (columns.some((entry) => entry.name === column)) return;
  db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
}

function rowToTemplate(row: TemplateRow): SavedDocumentTemplateV2 {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? null,
    sourceFilename: row.source_filename ?? null,
    sourceType: row.source_type ?? null,
    template: JSON.parse(row.template_json) as DocumentTemplateV2,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
