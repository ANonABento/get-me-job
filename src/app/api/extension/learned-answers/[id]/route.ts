/**
 * @route PATCH /api/extension/learned-answers/[id]
 * @route DELETE /api/extension/learned-answers/[id]
 * @description Update or delete a learned answer by ID
 * @auth Extension token
 * @request { answer?: string, question?: string } (PATCH)
 * @response Updated or deleted learned answer
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { db, learnedAnswers, eq, and } from "@/lib/db/drizzle";

// PATCH - Update a learned answer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { answer } = body as { answer: string };

    if (!answer) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    // Verify ownership
    const existingRows = await db
      .select()
      .from(learnedAnswers)
      .where(and(eq(learnedAnswers.id, id), eq(learnedAnswers.userId, authResult.userId)))
      .limit(1);
    const existing = existingRows[0];

    if (!existing) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Update
    const now = new Date();
    await db
      .update(learnedAnswers)
      .set({ answer, updatedAt: now })
      .where(and(eq(learnedAnswers.id, id), eq(learnedAnswers.userId, authResult.userId)));

    return NextResponse.json({
      id,
      question: existing.question,
      answer,
      timesUsed: existing.timesUsed ?? 1,
      updatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Update answer error:", error);
    return NextResponse.json({ error: "Failed to update answer" }, { status: 500 });
  }
}

// DELETE - Delete a learned answer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    const deleted = await db
      .delete(learnedAnswers)
      .where(and(eq(learnedAnswers.id, id), eq(learnedAnswers.userId, authResult.userId)))
      .returning({ id: learnedAnswers.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete answer error:", error);
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 });
  }
}
