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
import { db, learnedAnswers, eq, and, desc, sqlOp } from "@/lib/db/drizzle";
import { randomUUID } from "crypto";
import { toNullableIsoDateString } from "@/lib/utils";

// GET - List all learned answers
export async function GET(request: NextRequest) {
  const authResult = await requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const rows = await db
      .select()
      .from(learnedAnswers)
      .where(eq(learnedAnswers.userId, authResult.userId))
      .orderBy(desc(learnedAnswers.timesUsed), desc(learnedAnswers.updatedAt));

    const answers = rows.map((row) => ({
      id: row.id,
      question: row.question,
      questionNormalized: row.questionNormalized,
      answer: row.answer,
      sourceUrl: row.sourceUrl,
      sourceCompany: row.sourceCompany,
      timesUsed: row.timesUsed ?? 1,
      lastUsedAt: toNullableIsoDateString(row.lastUsedAt),
      createdAt: toNullableIsoDateString(row.createdAt),
      updatedAt: toNullableIsoDateString(row.updatedAt),
    }));

    return NextResponse.json({ answers });
  } catch (error) {
    console.error("Learned answers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 });
  }
}

// POST - Save a new learned answer
export async function POST(request: NextRequest) {
  const authResult = await requireExtensionAuth(request);
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
    const existingRows = await db
      .select()
      .from(learnedAnswers)
      .where(and(
        eq(learnedAnswers.userId, authResult.userId),
        eq(learnedAnswers.questionNormalized, questionNormalized)
      ))
      .limit(1);
    const existing = existingRows[0];

    if (existing) {
      // Update existing answer
      const now = new Date();
      await db
        .update(learnedAnswers)
        .set({
          answer,
          timesUsed: sqlOp`coalesce(${learnedAnswers.timesUsed}, 0) + 1`,
          updatedAt: now,
          lastUsedAt: now,
        })
        .where(and(
          eq(learnedAnswers.id, existing.id),
          eq(learnedAnswers.userId, authResult.userId)
        ));

      return NextResponse.json({
        id: existing.id,
        question: existing.question,
        questionNormalized: existing.questionNormalized,
        answer,
        timesUsed: (existing.timesUsed ?? 0) + 1,
        updated: true,
      });
    }

    // Create new answer
    const id = randomUUID();
    const now = new Date();

    await db.insert(learnedAnswers).values({
      id,
      userId: authResult.userId,
      question,
      questionNormalized,
      answer,
      sourceUrl: sourceUrl || null,
      sourceCompany: sourceCompany || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      id,
      question,
      questionNormalized,
      answer,
      sourceUrl,
      sourceCompany,
      timesUsed: 1,
      createdAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
