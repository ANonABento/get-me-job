import db from "./schema";
import { generateId } from "@/lib/utils";
import type { EmailTemplateType } from "@/types";

export interface EmailDraft {
  id: string;
  userId: string;
  type: EmailTemplateType;
  jobId?: string;
  subject: string;
  body: string;
  context?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailDraftInput {
  type: EmailTemplateType;
  jobId?: string;
  subject: string;
  body: string;
  context?: Record<string, string>;
}

export interface UpdateEmailDraftInput {
  subject?: string;
  body?: string;
  context?: Record<string, string>;
}

// Get all email drafts for a user
export function getEmailDrafts(userId: string = "default"): EmailDraft[] {
  const stmt = db.prepare(`
    SELECT id, user_id, type, job_id, subject, body, context_json, created_at, updated_at
    FROM email_drafts
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `);

  const rows = stmt.all(userId) as Array<{
    id: string;
    user_id: string;
    type: string;
    job_id: string | null;
    subject: string;
    body: string;
    context_json: string | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as EmailTemplateType,
    jobId: row.job_id || undefined,
    subject: row.subject,
    body: row.body,
    context: row.context_json ? JSON.parse(row.context_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Get a single email draft by ID
export function getEmailDraft(id: string, userId: string = "default"): EmailDraft | null {
  const stmt = db.prepare(`
    SELECT id, user_id, type, job_id, subject, body, context_json, created_at, updated_at
    FROM email_drafts
    WHERE id = ? AND user_id = ?
  `);

  const row = stmt.get(id, userId) as {
    id: string;
    user_id: string;
    type: string;
    job_id: string | null;
    subject: string;
    body: string;
    context_json: string | null;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as EmailTemplateType,
    jobId: row.job_id || undefined,
    subject: row.subject,
    body: row.body,
    context: row.context_json ? JSON.parse(row.context_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create a new email draft
export function createEmailDraft(
  input: CreateEmailDraftInput,
  userId: string = "default"
): EmailDraft {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO email_drafts (id, user_id, type, job_id, subject, body, context_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    input.type,
    input.jobId || null,
    input.subject,
    input.body,
    input.context ? JSON.stringify(input.context) : null,
    now,
    now
  );

  return {
    id,
    userId,
    type: input.type,
    jobId: input.jobId,
    subject: input.subject,
    body: input.body,
    context: input.context,
    createdAt: now,
    updatedAt: now,
  };
}

// Update an email draft
export function updateEmailDraft(
  id: string,
  input: UpdateEmailDraftInput,
  userId: string = "default"
): EmailDraft | null {
  const existing = getEmailDraft(id, userId);
  if (!existing) return null;

  const now = new Date().toISOString();

  const updates: string[] = [];
  const params: (string | null)[] = [];

  if (input.subject !== undefined) {
    updates.push("subject = ?");
    params.push(input.subject);
  }
  if (input.body !== undefined) {
    updates.push("body = ?");
    params.push(input.body);
  }
  if (input.context !== undefined) {
    updates.push("context_json = ?");
    params.push(JSON.stringify(input.context));
  }

  updates.push("updated_at = ?");
  params.push(now);

  params.push(id);
  params.push(userId);

  const stmt = db.prepare(`
    UPDATE email_drafts
    SET ${updates.join(", ")}
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(...params);

  return getEmailDraft(id, userId);
}

// Delete an email draft
export function deleteEmailDraft(id: string, userId: string = "default"): boolean {
  const stmt = db.prepare(`
    DELETE FROM email_drafts
    WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(id, userId);
  return result.changes > 0;
}

// Get drafts by type
export function getEmailDraftsByType(
  type: EmailTemplateType,
  userId: string = "default"
): EmailDraft[] {
  const stmt = db.prepare(`
    SELECT id, user_id, type, job_id, subject, body, context_json, created_at, updated_at
    FROM email_drafts
    WHERE user_id = ? AND type = ?
    ORDER BY updated_at DESC
  `);

  const rows = stmt.all(userId, type) as Array<{
    id: string;
    user_id: string;
    type: string;
    job_id: string | null;
    subject: string;
    body: string;
    context_json: string | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as EmailTemplateType,
    jobId: row.job_id || undefined,
    subject: row.subject,
    body: row.body,
    context: row.context_json ? JSON.parse(row.context_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
