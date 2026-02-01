import db from "./schema";
import { generateId } from "@/lib/utils";

export interface CompanyResearch {
  id: string;
  companyName: string;
  summary?: string;
  keyFacts: string[];
  interviewQuestions: string[];
  cultureNotes?: string;
  recentNews?: string;
  createdAt: string;
  updatedAt: string;
}

export function getCompanyResearch(companyName: string): CompanyResearch | null {
  const normalized = companyName.toLowerCase().trim();
  const stmt = db.prepare(
    "SELECT * FROM company_research WHERE LOWER(company_name) = ?"
  );
  const row = stmt.get(normalized) as {
    id: string;
    company_name: string;
    summary: string | null;
    key_facts_json: string | null;
    interview_questions_json: string | null;
    culture_notes: string | null;
    recent_news: string | null;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    companyName: row.company_name,
    summary: row.summary || undefined,
    keyFacts: row.key_facts_json ? JSON.parse(row.key_facts_json) : [],
    interviewQuestions: row.interview_questions_json
      ? JSON.parse(row.interview_questions_json)
      : [],
    cultureNotes: row.culture_notes || undefined,
    recentNews: row.recent_news || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function saveCompanyResearch(
  research: Omit<CompanyResearch, "id" | "createdAt" | "updatedAt">
): CompanyResearch {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO company_research (
      id, company_name, summary, key_facts_json, interview_questions_json,
      culture_notes, recent_news, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(company_name) DO UPDATE SET
      summary = excluded.summary,
      key_facts_json = excluded.key_facts_json,
      interview_questions_json = excluded.interview_questions_json,
      culture_notes = excluded.culture_notes,
      recent_news = excluded.recent_news,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    id,
    research.companyName.toLowerCase().trim(),
    research.summary || null,
    JSON.stringify(research.keyFacts),
    JSON.stringify(research.interviewQuestions),
    research.cultureNotes || null,
    research.recentNews || null,
    now,
    now
  );

  return {
    id,
    companyName: research.companyName,
    summary: research.summary,
    keyFacts: research.keyFacts,
    interviewQuestions: research.interviewQuestions,
    cultureNotes: research.cultureNotes,
    recentNews: research.recentNews,
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteCompanyResearch(id: string): void {
  const stmt = db.prepare("DELETE FROM company_research WHERE id = ?");
  stmt.run(id);
}

export function isResearchStale(research: CompanyResearch, maxAgeDays = 7): boolean {
  const updatedAt = new Date(research.updatedAt);
  const now = new Date();
  const ageInDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays > maxAgeDays;
}
