import db from "./legacy";
import { ensureEmailSendsSchema } from "./email-sends-schema";
import { nowIso } from "@/lib/format/time";
import { generateId } from "@/lib/utils";
import type { EmailTemplateType } from "@/types";

export interface EmailSend {
  id: string;
  userId: string;
  type: EmailTemplateType;
  jobId?: string;
  recipient: string;
  subject: string;
  body: string;
  inReplyToDraftId?: string;
  gmailMessageId?: string;
  status: "sent" | "failed";
  errorMessage?: string;
  sentAt: string;
}

export interface CreateEmailSendInput {
  type: EmailTemplateType;
  jobId?: string;
  recipient: string;
  subject: string;
  body: string;
  inReplyToDraftId?: string;
  gmailMessageId?: string;
  status?: "sent" | "failed";
  errorMessage?: string;
}

interface EmailSendRow {
  id: string;
  user_id: string;
  type: string;
  job_id: string | null;
  recipient: string;
  subject: string;
  body: string;
  in_reply_to_draft_id: string | null;
  gmail_message_id: string | null;
  status: string;
  error_message: string | null;
  sent_at: string;
}

export interface GetEmailSendsOptions {
  limit?: number;
  offset?: number;
  jobId?: string;
}

export interface GetFailedEmailSendsOptions {
  limit?: number;
}

function ensureSchema(): void {
  ensureEmailSendsSchema(db);
}

function mapEmailSend(row: EmailSendRow): EmailSend {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as EmailTemplateType,
    jobId: row.job_id || undefined,
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    inReplyToDraftId: row.in_reply_to_draft_id || undefined,
    gmailMessageId: row.gmail_message_id || undefined,
    status: row.status === "failed" ? "failed" : "sent",
    errorMessage: row.error_message || undefined,
    sentAt: row.sent_at,
  };
}

export function getEmailSends(
  userId: string,
  options: GetEmailSendsOptions = {},
): EmailSend[] {
  ensureSchema();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const params: Array<string | number> = [userId];
  let jobFilter = "";

  if (options.jobId) {
    jobFilter = "AND job_id = ?";
    params.push(options.jobId);
  }

  params.push(limit, offset);

  const rows = db
    .prepare(
      `
      SELECT id, user_id, type, job_id, recipient, subject, body,
             in_reply_to_draft_id, gmail_message_id, status, error_message, sent_at
      FROM email_sends
      WHERE user_id = ?
      ${jobFilter}
      ORDER BY sent_at DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(...params) as EmailSendRow[];

  return rows.map(mapEmailSend);
}

export function getEmailSend(id: string, userId: string): EmailSend | null {
  ensureSchema();
  const row = db
    .prepare(
      `
      SELECT id, user_id, type, job_id, recipient, subject, body,
             in_reply_to_draft_id, gmail_message_id, status, error_message, sent_at
      FROM email_sends
      WHERE id = ? AND user_id = ?
    `,
    )
    .get(id, userId) as EmailSendRow | undefined;

  return row ? mapEmailSend(row) : null;
}

export function getRecentEmailSendForRecipient(
  userId: string,
  recipient: string,
  type: EmailTemplateType,
  sinceIso: string,
): EmailSend | null {
  ensureSchema();
  const row = db
    .prepare(
      `
      SELECT id, user_id, type, job_id, recipient, subject, body,
             in_reply_to_draft_id, gmail_message_id, status, error_message, sent_at
      FROM email_sends
      WHERE user_id = ? AND recipient = ? AND type = ? AND sent_at >= ?
      ORDER BY sent_at DESC
      LIMIT 1
    `,
    )
    .get(userId, recipient, type, sinceIso) as EmailSendRow | undefined;

  return row ? mapEmailSend(row) : null;
}

export function hasDailyDigestSentSince(
  userId: string,
  sinceIso: string,
): boolean {
  ensureSchema();
  const row = db
    .prepare(
      `
      SELECT id
      FROM email_sends
      WHERE user_id = ? AND type = 'daily_digest' AND sent_at >= ?
      LIMIT 1
    `,
    )
    .get(userId, sinceIso) as { id: string } | undefined;

  return Boolean(row);
}

export function hasDigestSentSince(
  userId: string,
  type: string,
  sinceIso: string,
): boolean {
  ensureSchema();
  const row = db
    .prepare(
      `
      SELECT id
      FROM email_sends
      WHERE user_id = ? AND type = ? AND status = 'sent' AND sent_at >= ?
      LIMIT 1
    `,
    )
    .get(userId, type, sinceIso) as { id: string } | undefined;

  return Boolean(row);
}

export function getFailedEmailSends(
  options: GetFailedEmailSendsOptions = {},
): EmailSend[] {
  ensureSchema();
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const rows = db
    .prepare(
      `
      SELECT id, user_id, type, job_id, recipient, subject, body,
             in_reply_to_draft_id, gmail_message_id, status, error_message, sent_at
      FROM email_sends
      WHERE status = 'failed'
      ORDER BY sent_at ASC
      LIMIT ?
    `,
    )
    .all(limit) as EmailSendRow[];

  return rows.map(mapEmailSend);
}

export function markEmailSendStatus(
  id: string,
  userId: string,
  status: "sent" | "failed",
  errorMessage?: string,
): boolean {
  ensureSchema();
  const result = db
    .prepare(
      `
      UPDATE email_sends
      SET status = ?, error_message = ?, sent_at = ?
      WHERE id = ? AND user_id = ?
    `,
    )
    .run(status, errorMessage || null, nowIso(), id, userId) as
    | { changes?: number }
    | undefined;

  return (result?.changes ?? 0) > 0;
}

export function createEmailSend(
  input: CreateEmailSendInput,
  userId: string,
): EmailSend {
  ensureSchema();
  const id = generateId();
  const sentAt = nowIso();
  const status = input.status ?? "sent";

  db.prepare(
    `
    INSERT INTO email_sends (
      id, user_id, type, job_id, recipient, subject, body,
      in_reply_to_draft_id, gmail_message_id, status, error_message, sent_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    userId,
    input.type,
    input.jobId || null,
    input.recipient,
    input.subject,
    input.body,
    input.inReplyToDraftId || null,
    input.gmailMessageId || null,
    status,
    input.errorMessage || null,
    sentAt,
  );

  return {
    id,
    userId,
    type: input.type,
    jobId: input.jobId,
    recipient: input.recipient,
    subject: input.subject,
    body: input.body,
    inReplyToDraftId: input.inReplyToDraftId,
    gmailMessageId: input.gmailMessageId,
    status,
    errorMessage: input.errorMessage,
    sentAt,
  };
}
