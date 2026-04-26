export const LOCAL_DEV_CLEAN_SLATE_SETTING = "local_dev_clean_slate_v1";
export const LOCAL_DEV_USER_ID = "default";

type EnvSource = Record<string, string | undefined>;

export interface SqlStatement {
  sql: string;
  params: readonly string[];
  requiredTable?: string;
}

interface StatementRunner {
  get(...params: string[]): unknown;
  run(...params: string[]): unknown;
}

export interface CleanSlateDatabase {
  prepare(sql: string): StatementRunner;
  transaction(fn: () => void): () => void;
}

export function shouldRunLocalDevCleanSlate(env: EnvSource = process.env): boolean {
  return (
    env.NODE_ENV === "development" &&
    env.GET_ME_JOB_SKIP_LOCAL_CLEAN_SLATE !== "true" &&
    !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !env.CLERK_SECRET_KEY
  );
}

export function buildLocalDevCleanSlateStatements(
  userId: string = LOCAL_DEV_USER_ID
): SqlStatement[] {
  const userParam = [userId] as const;

  return [
    { sql: "DELETE FROM resume_ab_tracking WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM ats_scan_history WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM cover_letters WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM email_drafts WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM analytics_snapshots WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM job_status_history WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM notifications WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM learned_answers WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM extension_sessions WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM field_mappings WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM custom_templates WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM profile_bank WHERE user_id = ?", params: userParam },
    {
      sql: "DELETE FROM knowledge_chunks WHERE user_id = ?",
      params: userParam,
      requiredTable: "knowledge_chunks",
    },
    {
      sql: "DELETE FROM chunks_vec WHERE rowid IN (SELECT rowid FROM chunks WHERE user_id = ?)",
      params: userParam,
      requiredTable: "chunks_vec",
    },
    { sql: "DELETE FROM chunks WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM company_research WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM salary_offers WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM interview_answers WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM interview_sessions WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM generated_resumes WHERE profile_id = ?", params: userParam },
    {
      sql: "DELETE FROM reminders WHERE job_id IN (SELECT id FROM jobs WHERE user_id = ?)",
      params: userParam,
    },
    { sql: "DELETE FROM documents WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM jobs WHERE user_id = ?", params: userParam },
    { sql: "DELETE FROM experiences WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM education WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM skills WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM projects WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM certifications WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM profile_versions WHERE profile_id = ?", params: userParam },
    { sql: "DELETE FROM profile WHERE id = ?", params: userParam },
  ];
}

export function runLocalDevCleanSlateMigration(db: CleanSlateDatabase): void {
  if (!shouldRunLocalDevCleanSlate()) return;

  const existing = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(LOCAL_DEV_CLEAN_SLATE_SETTING);

  if (isCompletedCleanSlateSetting(existing)) return;

  db.transaction(() => {
    for (const statement of buildLocalDevCleanSlateStatements()) {
      if (statement.requiredTable && !tableExists(db, statement.requiredTable)) continue;
      db.prepare(statement.sql).run(...statement.params);
    }

    db.prepare(
      "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
    ).run(LOCAL_DEV_CLEAN_SLATE_SETTING, "true");
  })();
}

function isCompletedCleanSlateSetting(row: unknown): boolean {
  return (
    typeof row === "object" &&
    row !== null &&
    "value" in row &&
    row.value === "true"
  );
}

function tableExists(db: CleanSlateDatabase, tableName: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);

  return Boolean(row);
}
