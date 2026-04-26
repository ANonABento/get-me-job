import db from "./schema";
import { generateId } from "@/lib/utils";
import type { AnalyzedTemplate } from "@/lib/resume/template-analyzer";

export interface CustomTemplate {
  id: string;
  userId: string;
  name: string;
  sourceDocumentId: string | null;
  analyzedStyles: AnalyzedTemplate;
  createdAt: string;
}

interface CustomTemplateRow {
  id: string;
  user_id: string;
  name: string;
  source_document_id: string | null;
  analyzed_styles: string;
  created_at: string;
}

function rowToCustomTemplate(row: CustomTemplateRow): CustomTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sourceDocumentId: row.source_document_id,
    analyzedStyles: JSON.parse(row.analyzed_styles) as AnalyzedTemplate,
    createdAt: row.created_at,
  };
}

export function saveCustomTemplate(
  name: string,
  analyzedStyles: AnalyzedTemplate,
  sourceDocumentId?: string,
  userId: string = "default"
): CustomTemplate {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO custom_templates (id, user_id, name, source_document_id, analyzed_styles, created_at)
    SELECT ?, ?, ?, ?, ?, ?
    ${sourceDocumentId ? "WHERE EXISTS (SELECT 1 FROM documents WHERE id = ? AND user_id = ?)" : ""}
  `);

  const args = [id, userId, name, sourceDocumentId || null, JSON.stringify(analyzedStyles), now];
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
    sourceDocumentId: sourceDocumentId || null,
    analyzedStyles,
    createdAt: now,
  };
}

export function getCustomTemplates(userId: string = "default"): CustomTemplate[] {
  const stmt = db.prepare(`
    SELECT id, user_id, name, source_document_id, analyzed_styles, created_at
    FROM custom_templates
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(userId) as CustomTemplateRow[];
  return rows.map(rowToCustomTemplate);
}

export function getCustomTemplate(id: string, userId: string = "default"): CustomTemplate | null {
  const stmt = db.prepare(`
    SELECT id, user_id, name, source_document_id, analyzed_styles, created_at
    FROM custom_templates
    WHERE id = ? AND user_id = ?
  `);

  const row = stmt.get(id, userId) as CustomTemplateRow | undefined;
  if (!row) return null;

  return rowToCustomTemplate(row);
}

export function deleteCustomTemplate(id: string, userId: string = "default"): boolean {
  const stmt = db.prepare("DELETE FROM custom_templates WHERE id = ? AND user_id = ?");
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export function updateCustomTemplateName(
  id: string,
  name: string,
  userId: string = "default"
): boolean {
  const stmt = db.prepare("UPDATE custom_templates SET name = ? WHERE id = ? AND user_id = ?");
  const result = stmt.run(name, id, userId);
  return result.changes > 0;
}
