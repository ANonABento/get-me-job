/**
 * @route GET /api/interview/sources
 * @description List reusable profile, bank, document, and opportunity sources for interview context packs
 * @auth Required
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { listInterviewSourceOptions } from "@/lib/interview/context-pack-builder";
import { listInterviewContextPacks } from "@/lib/db/interviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    return NextResponse.json({
      sources: listInterviewSourceOptions(authResult.userId),
      recentContextPacks: listInterviewContextPacks(authResult.userId, 8),
    });
  } catch (error) {
    console.error("Interview sources error:", error);
    return NextResponse.json(
      { error: "Failed to load interview sources" },
      { status: 500 },
    );
  }
}
