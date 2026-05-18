import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { listSlothingBentoRouterAdminState } from "@/lib/llm/bentorouter-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const state = await listSlothingBentoRouterAdminState(authResult.userId);
    return NextResponse.json(state);
  } catch (error) {
    console.error("BentoRouter admin state error:", error);
    return NextResponse.json(
      { error: "Failed to load BentoRouter settings" },
      { status: 500 },
    );
  }
}
