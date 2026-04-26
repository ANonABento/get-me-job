/**
 * @route POST /api/extension/learned-answers/search
 * @description Search for similar questions in learned answers
 * @auth Extension token
 * @request { question: string, threshold?: number }
 * @response LearnedAnswerSearchResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth, normalizeQuestion, calculateSimilarity } from "@/lib/extension-auth";
import { db, learnedAnswers, eq, and, or, desc, like } from "@/lib/db/drizzle";

type LearnedAnswerSearchRow = {
  id: string;
  question: string;
  questionNormalized: string;
  answer: string;
  timesUsed: number | null;
};

const learnedAnswerSearchColumns = {
  id: learnedAnswers.id,
  question: learnedAnswers.question,
  questionNormalized: learnedAnswers.questionNormalized,
  answer: learnedAnswers.answer,
  timesUsed: learnedAnswers.timesUsed,
};

// POST - Search for similar questions
export async function POST(request: NextRequest) {
  const authResult = await requireExtensionAuth(request);
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

    let rows: LearnedAnswerSearchRow[];
    if (likePatterns.length > 0) {
      const wordConditions = likePatterns.map((pattern) =>
        like(learnedAnswers.questionNormalized, pattern)
      );
      const wordCondition = wordConditions.length === 1
        ? wordConditions[0]
        : or(...wordConditions);

      rows = await db
        .select(learnedAnswerSearchColumns)
        .from(learnedAnswers)
        .where(and(eq(learnedAnswers.userId, authResult.userId), wordCondition))
        .orderBy(desc(learnedAnswers.timesUsed))
        .limit(20);
    } else {
      // Fallback: get most used answers
      rows = await db
        .select(learnedAnswerSearchColumns)
        .from(learnedAnswers)
        .where(eq(learnedAnswers.userId, authResult.userId))
        .orderBy(desc(learnedAnswers.timesUsed))
        .limit(10);
    }

    // Calculate similarity scores and rank
    const results = rows
      .map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        similarity: calculateSimilarity(normalized, row.questionNormalized),
        timesUsed: row.timesUsed ?? 1,
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
