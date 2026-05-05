import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getPromptVariantStats, seedDefaultPromptVariant } from "@/lib/db/prompt-variants";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  seedDefaultPromptVariant(authResult.userId);
  const stats = getPromptVariantStats(authResult.userId);
  return NextResponse.json({ stats });
}
