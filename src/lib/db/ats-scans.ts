import db from "./schema";
import { generateId } from "@/lib/utils";
import type { ATSScanReport } from "@/lib/ats/analyzer";
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
  jobId?: string
): string {
  const id = generateId();
  const reportWithFixes = { ...report, fixes };

  db.prepare(
    `INSERT INTO ats_scan_history
     (id, user_id, job_id, overall_score, letter_grade, formatting_score, structure_score, content_score, keywords_score, issue_count, fix_count, report_json, scanned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
    report.scannedAt
  );

  return id;
}

export function getScanHistory(
  userId: string,
  limit: number = 20
): StoredScanRecord[] {
  const rows = db
    .prepare(
      "SELECT * FROM ats_scan_history WHERE user_id = ? ORDER BY scanned_at DESC LIMIT ?"
    )
    .all(userId, limit) as RawScanRow[];

  return rows.map(mapRow);
}

export function getScanById(
  id: string,
  userId: string
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
