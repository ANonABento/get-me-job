/**
 * @route GET /api/bank
 * @description Fetch bank entries with optional search/category filter
 * @auth Required
 * @response BankEntriesResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getBankEntries, searchBankEntries, getBankEntriesByCategory, insertBankEntry } from "@/lib/db/profile-bank";
import type { BankCategory } from "@/types";
import { BANK_CATEGORIES } from "@/types";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category") as BankCategory | null;

    let entries;
    if (query) {
      entries = searchBankEntries(query, authResult.userId);
      if (category && BANK_CATEGORIES.includes(category)) {
        entries = entries.filter((e) => e.category === category);
      }
    } else if (category && BANK_CATEGORIES.includes(category)) {
      entries = getBankEntriesByCategory(category, authResult.userId);
    } else {
      entries = getBankEntries(authResult.userId);
    }

    return NextResponse.json({ entries });
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

    const id = insertBankEntry(
      { category, content, confidenceScore: 1.0 },
      authResult.userId
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Create bank entry error:", error);
    return NextResponse.json(
      { error: "Failed to create bank entry" },
      { status: 500 }
    );
  }
}
