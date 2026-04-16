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
import db from "@/lib/db/schema";

interface LearnedAnswerRow {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  times_used: number;
}

// PATCH - Update a learned answer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireExtensionAuth(request);
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
    const existing = db.prepare(`
      SELECT * FROM learned_answers WHERE id = ? AND user_id = ?
    `).get(id, authResult.userId) as LearnedAnswerRow | undefined;

    if (!existing) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Update
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE learned_answers SET answer = ?, updated_at = ? WHERE id = ?
    `).run(answer, now, id);

    return NextResponse.json({
      id,
      question: existing.question,
      answer,
      timesUsed: existing.times_used,
      updatedAt: now,
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
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    // Verify ownership and delete
    const result = db.prepare(`
      DELETE FROM learned_answers WHERE id = ? AND user_id = ?
    `).run(id, authResult.userId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete answer error:", error);
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 });
  }
}
