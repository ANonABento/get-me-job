import { getDb } from "@/lib/db";
import {
  buildLocalDevCleanSlateStatements,
  type SqlStatement,
} from "@/lib/db/local-clean-slate";

const MODERN_USER_SCOPED_DELETES: readonly string[] = [
  "DELETE FROM cover_letters WHERE user_id = ?",
  "DELETE FROM generated_resumes WHERE user_id = ?",
  "DELETE FROM interview_sessions WHERE user_id = ?",
  "DELETE FROM reminders WHERE user_id = ?",
  "DELETE FROM experiences WHERE user_id = ?",
  "DELETE FROM education WHERE user_id = ?",
  "DELETE FROM skills WHERE user_id = ?",
  "DELETE FROM projects WHERE user_id = ?",
  "DELETE FROM certifications WHERE user_id = ?",
  "DELETE FROM profile_versions WHERE user_id = ?",
  "DELETE FROM profile WHERE user_id = ?",
];

type DevDb = ReturnType<typeof getDb>;

export interface CleanSlateResult {
  statementsRun: number;
  rowsAffected: number;
  skippedOptionalTables: number;
}

export function buildDevCleanSlateStatements(userId: string): SqlStatement[] {
  const userParam = [userId] as const;

  return [
    ...buildLocalDevCleanSlateStatements(userId),
    ...MODERN_USER_SCOPED_DELETES.map((sql) => ({
      sql,
      params: userParam,
    })),
  ];
}

export async function runDevCleanSlate(
  userId: string,
  db: DevDb = getDb(),
): Promise<CleanSlateResult> {
  let statementsRun = 0;
  let rowsAffected = 0;
  let skippedOptionalTables = 0;

  for (const statement of buildDevCleanSlateStatements(userId)) {
    const tableName = statement.requiredTable ?? getDeletedTable(statement.sql);
    if (tableName && !(await tableExists(db, tableName))) {
      skippedOptionalTables += 1;
      continue;
    }

    try {
      const result = await db.prepare(statement.sql).run(...statement.params);
      statementsRun += 1;
      rowsAffected += Number(result.changes ?? 0);
    } catch (error) {
      if (statement.requiredTable && isUnavailableVirtualTableError(error)) {
        skippedOptionalTables += 1;
        continue;
      }
      throw error;
    }
  }

  return {
    statementsRun,
    rowsAffected,
    skippedOptionalTables,
  };
}

function getDeletedTable(sql: string): string | null {
  const match = sql.match(/^DELETE\s+FROM\s+([a-z_][a-z0-9_]*)/i);
  return match?.[1] ?? null;
}

async function tableExists(db: DevDb, tableName: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);

  return Boolean(row);
}

function isUnavailableVirtualTableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "SQLITE_ERROR" &&
    error.message.includes("no such module:")
  );
}
