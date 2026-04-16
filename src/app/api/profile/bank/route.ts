/**
 * @route GET /api/profile/bank
 * @description Get grouped bank entries by category
 * @auth Required
 * @response BankEntriesResponse from @/types/api
 */
import { NextResponse } from "next/server";
import { getGroupedBankEntries } from "@/lib/db/profile-bank";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const entries = getGroupedBankEntries(authResult.userId);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Get bank entries error:", error);
    return NextResponse.json(
      { error: "Failed to get bank entries" },
      { status: 500 }
    );
  }
}
