import db from "./legacy";

export interface AccountDeletionResult {
  userId: string;
  deletedRows: Record<string, number>;
  totalDeletedRows: number;
}

interface DeleteStatement {
  table: string;
  sql: string;
  optional?: boolean;
}

const USER_SCOPED_DELETES: DeleteStatement[] = [
  {
    table: "resume_ab_tracking",
    sql: "DELETE FROM resume_ab_tracking WHERE user_id = ?",
  },
  {
    table: "ats_scan_history",
    sql: "DELETE FROM ats_scan_history WHERE user_id = ?",
  },
  {
    table: "subscriptions",
    sql: "DELETE FROM subscriptions WHERE user_id = ?",
  },
  {
    table: "stripe_customers",
    sql: "DELETE FROM stripe_customers WHERE user_id = ?",
  },
  {
    table: "credit_transactions",
    sql: "DELETE FROM credit_transactions WHERE user_id = ?",
  },
  {
    table: "credit_balances",
    sql: "DELETE FROM credit_balances WHERE user_id = ?",
  },
  { table: "email_sends", sql: "DELETE FROM email_sends WHERE user_id = ?" },
  { table: "email_drafts", sql: "DELETE FROM email_drafts WHERE user_id = ?" },
  {
    table: "analytics_snapshots",
    sql: "DELETE FROM analytics_snapshots WHERE user_id = ?",
  },
  {
    table: "product_events",
    sql: "DELETE FROM product_events WHERE user_id = ?",
    optional: true,
  },
  {
    table: "job_status_history",
    sql: "DELETE FROM job_status_history WHERE user_id = ?",
  },
  {
    table: "notifications",
    sql: "DELETE FROM notifications WHERE user_id = ?",
  },
  {
    table: "suggested_status_updates",
    sql: "DELETE FROM suggested_status_updates WHERE user_id = ?",
    optional: true,
  },
  {
    table: "external_calendar_events",
    sql: "DELETE FROM external_calendar_events WHERE user_id = ?",
    optional: true,
  },
  {
    table: "opportunity_contacts",
    sql: "DELETE FROM opportunity_contacts WHERE user_id = ?",
    optional: true,
  },
  {
    table: "answer_bank_versions",
    sql: "DELETE FROM answer_bank_versions WHERE user_id = ?",
  },
  { table: "answer_bank", sql: "DELETE FROM answer_bank WHERE user_id = ?" },
  {
    table: "extension_sessions",
    sql: "DELETE FROM extension_sessions WHERE user_id = ?",
  },
  {
    table: "field_mappings",
    sql: "DELETE FROM field_mappings WHERE user_id = ?",
  },
  {
    table: "custom_templates",
    sql: "DELETE FROM custom_templates WHERE user_id = ?",
  },
  { table: "profile_bank", sql: "DELETE FROM profile_bank WHERE user_id = ?" },
  {
    table: "knowledge_chunks",
    sql: "DELETE FROM knowledge_chunks WHERE user_id = ?",
    optional: true,
  },
  { table: "chunks", sql: "DELETE FROM chunks WHERE user_id = ?" },
  {
    table: "company_research",
    sql: "DELETE FROM company_research WHERE user_id = ?",
  },
  {
    table: "salary_offers",
    sql: "DELETE FROM salary_offers WHERE user_id = ?",
  },
  {
    table: "interview_answers",
    sql: "DELETE FROM interview_answers WHERE user_id = ?",
  },
  {
    table: "interview_sessions",
    sql: "DELETE FROM interview_sessions WHERE user_id = ?",
  },
  {
    table: "generated_resumes",
    sql: "DELETE FROM generated_resumes WHERE user_id = ?",
  },
  {
    table: "cover_letters",
    sql: "DELETE FROM cover_letters WHERE user_id = ?",
  },
  { table: "reminders", sql: "DELETE FROM reminders WHERE user_id = ?" },
  {
    table: "shared_resumes",
    sql: "DELETE FROM shared_resumes WHERE user_id = ?",
    optional: true,
  },
  { table: "documents", sql: "DELETE FROM documents WHERE user_id = ?" },
  { table: "jobs", sql: "DELETE FROM jobs WHERE user_id = ?" },
  { table: "experiences", sql: "DELETE FROM experiences WHERE user_id = ?" },
  { table: "education", sql: "DELETE FROM education WHERE user_id = ?" },
  { table: "skills", sql: "DELETE FROM skills WHERE user_id = ?" },
  { table: "projects", sql: "DELETE FROM projects WHERE user_id = ?" },
  {
    table: "certifications",
    sql: "DELETE FROM certifications WHERE user_id = ?",
  },
  {
    table: "profile_versions",
    sql: "DELETE FROM profile_versions WHERE user_id = ?",
  },
  { table: "profile", sql: "DELETE FROM profile WHERE user_id = ?" },
  { table: "llm_settings", sql: "DELETE FROM llm_settings WHERE user_id = ?" },
  { table: "settings", sql: "DELETE FROM settings WHERE user_id = ?" },
  {
    table: "achievement_unlocks",
    sql: "DELETE FROM achievement_unlocks WHERE user_id = ?",
    optional: true,
  },
  {
    table: "user_activity",
    sql: "DELETE FROM user_activity WHERE user_id = ?",
    optional: true,
  },
  {
    table: "prompt_variant_results",
    sql: "DELETE FROM prompt_variant_results WHERE user_id = ?",
    optional: true,
  },
  {
    table: "prompt_variants",
    sql: "DELETE FROM prompt_variants WHERE user_id = ?",
    optional: true,
  },
  { table: "account", sql: "DELETE FROM account WHERE userId = ?" },
  { table: "session", sql: "DELETE FROM session WHERE userId = ?" },
  { table: "user", sql: "DELETE FROM `user` WHERE id = ?" },
];

export function deleteAccountData(userId: string): AccountDeletionResult {
  const deletedRows: Record<string, number> = {};

  db.transaction(() => {
    for (const statement of USER_SCOPED_DELETES) {
      if (statement.optional && !tableExists(statement.table)) continue;
      const result = db.prepare(statement.sql).run(userId) as {
        changes?: number;
      };
      deletedRows[statement.table] =
        (deletedRows[statement.table] ?? 0) + Number(result.changes ?? 0);
    }
  })();

  const totalDeletedRows = Object.values(deletedRows).reduce(
    (sum, count) => sum + count,
    0,
  );

  return { userId, deletedRows, totalDeletedRows };
}

function tableExists(tableName: string): boolean {
  return Boolean(
    db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      )
      .get(tableName),
  );
}
