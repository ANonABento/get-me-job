import db from "./legacy";
import { generateId } from "@/lib/utils";
import type { ATSScanReport } from "@/lib/ats/analyzer";
import type { ATSScanResult } from "@/lib/ats/analyzer";
import type { FixSuggestion } from "@/lib/ats/fix-suggestions";

interface RawScanRow {
  id: string;
  user_id: string;
  job_id: string | null;
  overall_score: number;
  letter_grade: string;
  formatting_score: number;
  structure_score: number;
  content_score: number;
  keywords_score: number;
  issue_count: number;
  fix_count: number;
  report_json: string;
  scanned_at: string;
}

export interface StoredScanRecord {
  id: string;
  userId: string;
  jobId: string | null;
  overallScore: number;
  letterGrade: string;
  formattingScore: number;
  structureScore: number;
  contentScore: number;
  keywordsScore: number;
  issueCount: number;
  fixCount: number;
  report: ATSScanReport & { fixes: FixSuggestion[] };
  scannedAt: string;
}

export function saveScanResult(
  userId: string,
  report: ATSScanReport,
  fixes: FixSuggestion[],
  jobId?: string,
): string {
  const id = generateId();
  const reportWithFixes = { ...report, fixes };

  const stmt = db.prepare(
    `INSERT INTO ats_scan_history
     (id, user_id, job_id, overall_score, letter_grade, formatting_score, structure_score, content_score, keywords_score, issue_count, fix_count, report_json, scanned_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
     ${jobId ? "WHERE EXISTS (SELECT 1 FROM jobs WHERE id = ? AND user_id = ?)" : ""}`,
  );

  const args: Array<string | number | null> = [
    id,
    userId,
    jobId || null,
    report.score.overall,
    report.letterGrade,
    report.score.formatting,
    report.score.structure,
    report.score.content,
    report.score.keywords,
    report.issues.length,
    fixes.length,
    JSON.stringify(reportWithFixes),
    report.scannedAt,
  ];

  if (jobId) {
    args.push(jobId, userId);
  }

  const result = stmt.run(...args);

  if (result.changes === 0) {
    throw new Error("Job not found");
  }

  return id;
}

/**
 * Save a scan that originated from the in-app /ats page (browser-side
 * `ScannerForm`). The form returns an `ATSScanResult` plus a free-text
 * JD; we persist score columns + a wrapped JSON payload that stores the
 * label, optional opportunity id, and full result for replay.
 */
export interface InAppScanSavePayload {
  result: ATSScanResult;
  jobLabel?: string;
  jobCompany?: string;
  jobTitle?: string;
  opportunityId?: string;
  jdText?: string;
}

export function saveInAppScan(
  userId: string,
  payload: InAppScanSavePayload,
): string {
  const id = generateId();
  const { result } = payload;
  const opportunityId = payload.opportunityId?.trim();

  const stmt = db.prepare(
    `INSERT INTO ats_scan_history
     (id, user_id, job_id, overall_score, letter_grade, formatting_score, structure_score, content_score, keywords_score, issue_count, fix_count, report_json, scanned_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
     ${opportunityId ? "WHERE EXISTS (SELECT 1 FROM jobs WHERE id = ? AND user_id = ?)" : ""}`,
  );

  const wrappedReport = {
    label:
      payload.jobLabel ||
      (payload.jobTitle && payload.jobCompany
        ? `${payload.jobTitle} @ ${payload.jobCompany}`
        : payload.jobTitle || payload.jobCompany || "Standalone scan"),
    jobTitle: payload.jobTitle ?? null,
    jobCompany: payload.jobCompany ?? null,
    jdText: payload.jdText ?? null,
    result,
  };

  const args: Array<string | number | null> = [
    id,
    userId,
    opportunityId || null,
    result.overall,
    result.letterGrade,
    result.legacy.score.formatting,
    Math.round(
      (result.axes.sectionCompleteness.score +
        result.axes.datesAndTenure.score) /
        2,
    ),
    result.legacy.score.content,
    result.legacy.score.keywords,
    result.issues.length,
    0,
    JSON.stringify(wrappedReport),
    result.scannedAt,
  ];

  if (opportunityId) {
    args.push(opportunityId, userId);
  }

  const sqlResult = stmt.run(...args);

  if (sqlResult.changes === 0) {
    throw new Error("Opportunity not found");
  }

  return id;
}

export function getScanHistory(
  userId: string,
  limit: number = 20,
): StoredScanRecord[] {
  const rows = db
    .prepare(
      "SELECT * FROM ats_scan_history WHERE user_id = ? ORDER BY scanned_at DESC LIMIT ?",
    )
    .all(userId, limit) as RawScanRow[];

  return rows.map(mapRow);
}

export function getScanById(
  id: string,
  userId: string,
): StoredScanRecord | null {
  const row = db
    .prepare("SELECT * FROM ats_scan_history WHERE id = ? AND user_id = ?")
    .get(id, userId) as RawScanRow | undefined;

  if (!row) return null;
  return mapRow(row);
}

function mapRow(row: RawScanRow): StoredScanRecord {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    overallScore: row.overall_score,
    letterGrade: row.letter_grade,
    formattingScore: row.formatting_score,
    structureScore: row.structure_score,
    contentScore: row.content_score,
    keywordsScore: row.keywords_score,
    issueCount: row.issue_count,
    fixCount: row.fix_count,
    report: JSON.parse(row.report_json),
    scannedAt: row.scanned_at,
  };
}
