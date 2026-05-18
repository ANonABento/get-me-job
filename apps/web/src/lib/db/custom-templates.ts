import db from "./legacy";
import { generateId } from "@/lib/utils";
import type { AnalyzedTemplate } from "@/lib/resume/template-analyzer";

import { nowIso } from "@/lib/format/time";
import type { TemplateSourceType } from "@/lib/templates/import";

export interface CustomTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sourceDocumentId: string | null;
  sourceFilename: string | null;
  sourceType: TemplateSourceType | null;
  analyzedStyles: AnalyzedTemplate;
  createdAt: string;
  updatedAt: string;
}

interface CustomTemplateRow {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  source_document_id: string | null;
  source_filename?: string | null;
  source_type?: string | null;
  analyzed_styles: string;
  created_at: string;
  updated_at?: string | null;
}

function rowToCustomTemplate(row: CustomTemplateRow): CustomTemplate {
  const sourceType = isTemplateSourceType(row.source_type)
    ? row.source_type
    : null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? null,
    sourceDocumentId: row.source_document_id,
    sourceFilename: row.source_filename ?? null,
    sourceType,
    analyzedStyles: JSON.parse(row.analyzed_styles) as AnalyzedTemplate,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export function ensureCustomTemplatesSourceColumns(): void {
  try {
    const columns = db
      .prepare("PRAGMA table_info(custom_templates)")
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has("source_filename")) {
      db.prepare(
        "ALTER TABLE custom_templates ADD COLUMN source_filename text",
      ).run();
    }
    if (!columnNames.has("source_type")) {
      db.prepare(
        "ALTER TABLE custom_templates ADD COLUMN source_type text",
      ).run();
    }
    if (!columnNames.has("description")) {
      db.prepare(
        "ALTER TABLE custom_templates ADD COLUMN description text",
      ).run();
    }
    if (!columnNames.has("updated_at")) {
      db.prepare(
        "ALTER TABLE custom_templates ADD COLUMN updated_at text",
      ).run();
      db.prepare(
        "UPDATE custom_templates SET updated_at = created_at WHERE updated_at IS NULL",
      ).run();
    }
  } catch {
    // Tests and first-boot environments may not have the table available yet.
  }
}

interface CustomTemplateSource {
  filename: string;
  type: TemplateSourceType;
}

function isTemplateSourceType(value: unknown): value is TemplateSourceType {
  return value === "pdf" || value === "docx" || value === "tex";
}

export function saveCustomTemplate(
  name: string,
  analyzedStyles: AnalyzedTemplate,
  sourceDocumentId: string | undefined,
  userId: string,
  source?: CustomTemplateSource,
  description?: string | null,
): CustomTemplate {
  ensureCustomTemplatesSourceColumns();
  const id = generateId();
  const now = nowIso();

  const stmt = db.prepare(`
    INSERT INTO custom_templates (id, user_id, name, description, source_document_id, source_filename, source_type, analyzed_styles, created_at, updated_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ${sourceDocumentId ? "WHERE EXISTS (SELECT 1 FROM documents WHERE id = ? AND user_id = ?)" : ""}
  `);

  const args = [
    id,
    userId,
    name,
    description?.trim() || null,
    sourceDocumentId || null,
    source?.filename ?? null,
    source?.type ?? null,
    JSON.stringify(analyzedStyles),
    now,
    now,
  ];
  if (sourceDocumentId) {
    args.push(sourceDocumentId, userId);
  }

  const result = stmt.run(...args);
  if (result.changes === 0) {
    throw new Error("Source document not found");
  }

  return {
    id,
    userId,
    name,
    description: description?.trim() || null,
    sourceDocumentId: sourceDocumentId || null,
    sourceFilename: source?.filename ?? null,
    sourceType: source?.type ?? null,
    analyzedStyles,
    createdAt: now,
    updatedAt: now,
  };
}

export function getCustomTemplates(userId: string): CustomTemplate[] {
  ensureCustomTemplatesSourceColumns();
  const stmt = db.prepare(`
    SELECT id, user_id, name, description, source_document_id, source_filename, source_type, analyzed_styles, created_at, updated_at
    FROM custom_templates
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(userId) as CustomTemplateRow[];
  return rows.map(rowToCustomTemplate);
}

export function getCustomTemplate(
  id: string,
  userId: string,
): CustomTemplate | null {
  ensureCustomTemplatesSourceColumns();
  const stmt = db.prepare(`
    SELECT id, user_id, name, description, source_document_id, source_filename, source_type, analyzed_styles, created_at, updated_at
    FROM custom_templates
    WHERE id = ? AND user_id = ?
  `);

  const row = stmt.get(id, userId) as CustomTemplateRow | undefined;
  if (!row) return null;

  return rowToCustomTemplate(row);
}

export function deleteCustomTemplate(id: string, userId: string): boolean {
  ensureCustomTemplatesSourceColumns();
  const stmt = db.prepare(
    "DELETE FROM custom_templates WHERE id = ? AND user_id = ?",
  );
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export function updateCustomTemplateName(
  id: string,
  name: string,
  userId: string,
): boolean {
  ensureCustomTemplatesSourceColumns();
  const stmt = db.prepare(
    "UPDATE custom_templates SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?",
  );
  const result = stmt.run(name, nowIso(), id, userId);
  return result.changes > 0;
}

export function updateCustomTemplateMetadata(
  id: string,
  metadata: { name?: string; description?: string | null },
  userId: string,
): boolean {
  ensureCustomTemplatesSourceColumns();
  const updates: string[] = [];
  const values: Array<string | null> = [];

  if (metadata.name !== undefined) {
    updates.push("name = ?");
    values.push(metadata.name);
  }

  if (metadata.description !== undefined) {
    updates.push("description = ?");
    values.push(metadata.description?.trim() || null);
  }

  if (updates.length === 0) return false;

  updates.push("updated_at = ?");
  values.push(nowIso());
  values.push(id, userId);

  const stmt = db.prepare(
    `UPDATE custom_templates SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
  );
  const result = stmt.run(...values);
  return result.changes > 0;
}
