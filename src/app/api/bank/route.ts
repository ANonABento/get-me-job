/**
 * @route GET /api/bank
 * @description Fetch bank entries with optional search/category filter
 * @auth Required
 * @response BankEntriesResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, profileBank, eq, and, desc, like } from "@/lib/db/drizzle";
import { generateId, toIsoDateString } from "@/lib/utils";
import type { BankCategory, BankEntry } from "@/types";
import { BANK_CATEGORIES } from "@/types";

function toBankEntry(row: typeof profileBank.$inferSelect): BankEntry {
  return {
    id: row.id,
    userId: row.userId,
    category: row.category as BankCategory,
    content: JSON.parse(row.content) as Record<string, unknown>,
    sourceDocumentId: row.sourceDocumentId ?? undefined,
    confidenceScore: row.confidenceScore ?? 0.8,
    createdAt: toIsoDateString(row.createdAt),
  };
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category") as BankCategory | null;

    const conditions = [eq(profileBank.userId, authResult.userId)];
    if (query) {
      conditions.push(like(profileBank.content, `%${query}%`));
    }
    if (category && BANK_CATEGORIES.includes(category)) {
      conditions.push(eq(profileBank.category, category));
    }

    const orderBy = query
      ? [desc(profileBank.confidenceScore), desc(profileBank.createdAt)]
      : [desc(profileBank.createdAt)];

    const rows = await db
      .select()
      .from(profileBank)
      .where(and(...conditions))
      .orderBy(...orderBy);

    return NextResponse.json({ entries: rows.map(toBankEntry) });
  } catch (error) {
    console.error("Get bank entries error:", error);
    return NextResponse.json(
      { error: "Failed to get bank entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const { category, content } = body;

    if (!category || !BANK_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const id = generateId();
    await db.insert(profileBank).values({
      id,
      userId: authResult.userId,
      category,
      content: JSON.stringify(content),
      confidenceScore: 1.0,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Create bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to create bank entry" },
      { status: 500 }
    );
  }
}
