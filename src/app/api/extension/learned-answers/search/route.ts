import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth, normalizeQuestion, calculateSimilarity } from "@/lib/extension-auth";
import db from "@/lib/db/schema";

interface LearnedAnswerRow {
  id: string;
  question: string;
  question_normalized: string;
  answer: string;
  times_used: number;
}

// POST - Search for similar questions
export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { question } = body as { question: string };

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const normalized = normalizeQuestion(question);
    const words = normalized.split(" ").filter((w) => w.length > 2);

    // Find potential matches using LIKE queries on key words
    const likePatterns = words.slice(0, 5).map((w) => `%${w}%`);
    const placeholders = likePatterns.map(() => "question_normalized LIKE ?").join(" OR ");

    let rows: LearnedAnswerRow[];
    if (likePatterns.length > 0) {
      rows = db.prepare(`
        SELECT id, question, question_normalized, answer, times_used
        FROM learned_answers
        WHERE user_id = ? AND (${placeholders})
        ORDER BY times_used DESC
        LIMIT 20
      `).all(authResult.userId, ...likePatterns) as LearnedAnswerRow[];
    } else {
      // Fallback: get most used answers
      rows = db.prepare(`
        SELECT id, question, question_normalized, answer, times_used
        FROM learned_answers
        WHERE user_id = ?
        ORDER BY times_used DESC
        LIMIT 10
      `).all(authResult.userId) as LearnedAnswerRow[];
    }

    // Calculate similarity scores and rank
    const results = rows
      .map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        similarity: calculateSimilarity(normalized, row.question_normalized),
        timesUsed: row.times_used,
      }))
      .filter((r) => r.similarity > 0.2) // Only return reasonably similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search answers error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
