/**
 * @route GET /api/extension/learned-answers
 * @route POST /api/extension/learned-answers
 * @description List learned answers (GET) or save a new learned answer (POST)
 * @auth Extension token
 * @request { question: string, answer: string, source?: string } (POST)
 * @response LearnedAnswersResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth, normalizeQuestion } from "@/lib/extension-auth";
import db from "@/lib/db/schema";
import { randomUUID } from "crypto";

interface LearnedAnswerRow {
  id: string;
  user_id: string;
  question: string;
  question_normalized: string;
  answer: string;
  source_url: string | null;
  source_company: string | null;
  times_used: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

// GET - List all learned answers
export async function GET(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const rows = db.prepare(`
      SELECT * FROM learned_answers
      WHERE user_id = ?
      ORDER BY times_used DESC, updated_at DESC
    `).all(authResult.userId) as LearnedAnswerRow[];

    const answers = rows.map((row) => ({
      id: row.id,
      question: row.question,
      questionNormalized: row.question_normalized,
      answer: row.answer,
      sourceUrl: row.source_url,
      sourceCompany: row.source_company,
      timesUsed: row.times_used,
      lastUsedAt: row.last_used_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ answers });
  } catch (error) {
    console.error("Learned answers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

// POST - Save a new learned answer
export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { question, answer, sourceUrl, sourceCompany } = body as {
      question: string;
      answer: string;
      sourceUrl?: string;
      sourceCompany?: string;
    };

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const questionNormalized = normalizeQuestion(question);

    // Check if similar question already exists
    const existing = db.prepare(`
      SELECT * FROM learned_answers
      WHERE user_id = ? AND question_normalized = ?
    `).get(authResult.userId, questionNormalized) as LearnedAnswerRow | undefined;

    if (existing) {
      // Update existing answer
      db.prepare(`
        UPDATE learned_answers
        SET answer = ?, times_used = times_used + 1, updated_at = ?, last_used_at = ?
        WHERE id = ?
      `).run(answer, new Date().toISOString(), new Date().toISOString(), existing.id);

      return NextResponse.json({
        id: existing.id,
        question: existing.question,
        questionNormalized: existing.question_normalized,
        answer,
        timesUsed: existing.times_used + 1,
        updated: true,
      });
    }

    // Create new answer
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO learned_answers
      (id, user_id, question, question_normalized, answer, source_url, source_company, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, authResult.userId, question, questionNormalized, answer, sourceUrl || null, sourceCompany || null, now, now);

    return NextResponse.json({
      id,
      question,
      questionNormalized,
      answer,
      sourceUrl,
      sourceCompany,
      timesUsed: 1,
      createdAt: now,
    });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
