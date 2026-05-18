import db from "@/lib/db/legacy";
import { ensureSharedResumesSchema } from "@/lib/db/shared-resumes";
import { ensureExtensionSessionsColumns } from "@/lib/db/extension-sessions";
import { nowEpoch, toIso } from "@/lib/format/time";

export interface CleanupCronResult {
  expiredShares: number;
  expiredAuthSessions: number;
  expiredVerificationTokens: number;
  expiredExtensionSessions: number;
  oldCronRuns: number;
  errors: string[];
}

export function runCleanupCron(now: number = nowEpoch()): CleanupCronResult {
  ensureSharedResumesSchema();
  ensureExtensionSessionsColumns();

  const result: CleanupCronResult = {
    expiredShares: 0,
    expiredAuthSessions: 0,
    expiredVerificationTokens: 0,
    expiredExtensionSessions: 0,
    oldCronRuns: 0,
    errors: [],
  };

  result.expiredShares = safeDelete(
    "expiredShares",
    "DELETE FROM shared_resumes WHERE expires_at <= ?",
    [now],
    result.errors,
  );
  result.expiredAuthSessions = safeDelete(
    "expiredAuthSessions",
    "DELETE FROM session WHERE expires <= ?",
    [now],
    result.errors,
  );
  result.expiredVerificationTokens = safeDelete(
    "expiredVerificationTokens",
    "DELETE FROM verificationToken WHERE expires <= ?",
    [now],
    result.errors,
  );
  result.expiredExtensionSessions = safeDelete(
    "expiredExtensionSessions",
    "DELETE FROM extension_sessions WHERE expires_at <= ?",
    [toIso(now)],
    result.errors,
  );
  result.oldCronRuns = safeDelete(
    "oldCronRuns",
    "DELETE FROM cron_runs WHERE started_at < ?",
    [toIso(now - 30 * 24 * 60 * 60 * 1000)],
    result.errors,
  );

  return result;
}

function safeDelete(
  label: string,
  sql: string,
  params: unknown[],
  errors: string[],
): number {
  try {
    const outcome = db.prepare(sql).run(...params) as
      | { changes?: number }
      | undefined;
    return outcome?.changes ?? 0;
  } catch (error) {
    errors.push(
      `${label}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return 0;
  }
}
