import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { listOpportunities } from "@/lib/opportunities";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const statuses = request.nextUrl.searchParams
    .get("status")
    ?.split(",")
    .map((status) => status.trim())
    .filter(Boolean);

  try {
    return NextResponse.json({
      opportunities: listOpportunities(authResult.userId, statuses),
    });
  } catch (error) {
    console.error("List opportunities error:", error);
    return NextResponse.json(
      { error: "Failed to list opportunities" },
      { status: 500 },
    );
  }
}
