/**
 * @route POST /api/interview/context-packs/[id]/promote
 * @description Save a custom interview context pack source to the profile bank
 * @auth Required
 */
import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getInterviewContextPack,
  markInterviewContextPackSavedToBank,
} from "@/lib/db/interviews";
import { saveContextPackToBank } from "@/lib/interview/context-pack-builder";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const contextPack = getInterviewContextPack(params.id, authResult.userId);
    if (!contextPack) {
      return NextResponse.json(
        { error: "Context pack not found" },
        { status: 404 },
      );
    }

    const bankEntryId = saveContextPackToBank(contextPack, authResult.userId);
    if (!bankEntryId) {
      return NextResponse.json(
        { error: "No custom source available to save" },
        { status: 400 },
      );
    }

    markInterviewContextPackSavedToBank(contextPack.id, authResult.userId);
    return NextResponse.json({ success: true, bankEntryId });
  } catch (error) {
    console.error("Promote interview context pack error:", error);
    return NextResponse.json(
      { error: "Failed to save context pack to bank" },
      { status: 500 },
    );
  }
}
