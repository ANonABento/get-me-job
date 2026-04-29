import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getOpportunity } from "@/lib/opportunities";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const opportunity = getOpportunity(params.id, authResult.userId);
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Get opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to get opportunity" },
      { status: 500 },
    );
  }
}
