import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getBankEntries, searchBankEntries, getBankEntriesByCategory } from "@/lib/db/profile-bank";
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
