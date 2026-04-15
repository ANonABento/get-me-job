import { NextRequest, NextResponse } from "next/server";
import { searchBankEntries } from "@/lib/db/profile-bank";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const entries = searchBankEntries(query.trim(), authResult.userId);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Search bank entries error:", error);
    return NextResponse.json(
      { error: "Failed to search bank entries" },
      { status: 500 }
    );
  }
}
