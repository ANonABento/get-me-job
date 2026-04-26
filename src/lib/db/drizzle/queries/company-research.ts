import { db, companyResearch, eq, and } from '../index';
import { generateId } from '@/lib/utils';

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

// Get company research by company name
export async function getCompanyResearch(
  userId: string,
  companyName: string
): Promise<CompanyResearch | null> {
  const normalized = companyName.toLowerCase().trim();

  const rows = await db.select().from(companyResearch)
    .where(eq(companyResearch.userId, userId));

  const row = rows.find(r => r.companyName.toLowerCase() === normalized);
  if (!row) return null;

  return {
    id: row.id,
    companyName: row.companyName,
    summary: row.summary ?? undefined,
    keyFacts: row.keyFactsJson ? JSON.parse(row.keyFactsJson) : [],
    interviewQuestions: row.interviewQuestionsJson ? JSON.parse(row.interviewQuestionsJson) : [],
    cultureNotes: row.cultureNotes ?? undefined,
    recentNews: row.recentNews ?? undefined,
    createdAt: row.createdAt?.toISOString() ?? '',
    updatedAt: row.updatedAt?.toISOString() ?? '',
  };
}

// Save or update company research
export async function saveCompanyResearch(
  userId: string,
  research: Omit<CompanyResearch, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CompanyResearch> {
  const id = generateId();
  const now = new Date();
  const normalized = research.companyName.toLowerCase().trim();

  // Check if research already exists for this company
  const existing = await getCompanyResearch(userId, research.companyName);

  if (existing) {
    // Update existing research
    await db.update(companyResearch)
      .set({
        summary: research.summary ?? null,
        keyFactsJson: JSON.stringify(research.keyFacts),
        interviewQuestionsJson: JSON.stringify(research.interviewQuestions),
        cultureNotes: research.cultureNotes ?? null,
        recentNews: research.recentNews ?? null,
        updatedAt: now,
      })
      .where(and(eq(companyResearch.id, existing.id), eq(companyResearch.userId, userId)));

    return {
      ...existing,
      ...research,
      updatedAt: now.toISOString(),
    };
  }

  // Insert new research
  await db.insert(companyResearch).values({
    id,
    userId,
    companyName: normalized,
    summary: research.summary ?? null,
    keyFactsJson: JSON.stringify(research.keyFacts),
    interviewQuestionsJson: JSON.stringify(research.interviewQuestions),
    cultureNotes: research.cultureNotes ?? null,
    recentNews: research.recentNews ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    companyName: research.companyName,
    summary: research.summary,
    keyFacts: research.keyFacts,
    interviewQuestions: research.interviewQuestions,
    cultureNotes: research.cultureNotes,
    recentNews: research.recentNews,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

// Delete company research
export async function deleteCompanyResearch(userId: string, researchId: string): Promise<void> {
  await db.delete(companyResearch)
    .where(and(eq(companyResearch.id, researchId), eq(companyResearch.userId, userId)));
}

// Check if research is stale
export function isResearchStale(research: CompanyResearch, maxAgeDays = 7): boolean {
  const updatedAt = new Date(research.updatedAt);
  const now = new Date();
  const ageInDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays > maxAgeDays;
}

// Get all company research for a user
export async function getAllCompanyResearch(userId: string): Promise<CompanyResearch[]> {
  const rows = await db.select().from(companyResearch)
    .where(eq(companyResearch.userId, userId));

  return rows.map((row) => ({
    id: row.id,
    companyName: row.companyName,
    summary: row.summary ?? undefined,
    keyFacts: row.keyFactsJson ? JSON.parse(row.keyFactsJson) : [],
    interviewQuestions: row.interviewQuestionsJson ? JSON.parse(row.interviewQuestionsJson) : [],
    cultureNotes: row.cultureNotes ?? undefined,
    recentNews: row.recentNews ?? undefined,
    createdAt: row.createdAt?.toISOString() ?? '',
    updatedAt: row.updatedAt?.toISOString() ?? '',
  }));
}
