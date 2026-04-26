/**
 * @route PATCH /api/bank/[id]
 * @route DELETE /api/bank/[id]
 * @description PATCH: Update bank entry. DELETE: Remove bank entry.
 * @auth Required
 * @request { content?: string, category?: string, subcategory?: string } (PATCH)
 * @response BankEntryUpdateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, profileBank, eq, and } from "@/lib/db/drizzle";

interface BankEntryUpdateBody {
  content?: unknown;
  confidenceScore?: unknown;
}

interface BankEntryParams {
  params: { id: string };
}

function isBankEntryContent(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function updateBankEntryForUser(
  entryId: string,
  userId: string,
  body: BankEntryUpdateBody
) {
  if (!isBankEntryContent(body.content)) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const updated = await db
    .update(profileBank)
    .set({
      content: JSON.stringify(body.content),
      confidenceScore: typeof body.confidenceScore === "number" ? body.confidenceScore : 0.8,
    })
    .where(and(eq(profileBank.id, entryId), eq(profileBank.userId, userId)))
    .returning({ id: profileBank.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: BankEntryParams
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json() as BankEntryUpdateBody;
    return updateBankEntryForUser(params.id, authResult.userId, body);
  } catch (error) {
    console.error("Update bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to update bank entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: BankEntryParams
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json() as BankEntryUpdateBody;
    return updateBankEntryForUser(params.id, authResult.userId, body);
  } catch (error) {
    console.error("Update bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to update bank entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: BankEntryParams
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const deleted = await db
      .delete(profileBank)
      .where(and(eq(profileBank.id, params.id), eq(profileBank.userId, authResult.userId)))
      .returning({ id: profileBank.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete bank entry" },
      { status: 500 }
    );
  }
}
