/**
 * @route POST /api/interview/context-packs
 * @description Build and persist an interview context pack from selected sources
 * @auth Required
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { createInterviewContextPackSchema } from "@/lib/constants";
import { validationErrorResponse } from "@/lib/api-utils";
import { createInterviewContextPack } from "@/lib/db/interviews";
import { buildInterviewContextPack } from "@/lib/interview/context-pack-builder";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();
    const parsed = createInterviewContextPackSchema.safeParse(rawData);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const built = await buildInterviewContextPack({
      userId: authResult.userId,
      mode: parsed.data.mode,
      sources: parsed.data.sources,
      customInput: parsed.data.customInput,
      deepDiveEnabled: parsed.data.deepDiveEnabled,
    });
    const contextPack = createInterviewContextPack(built, authResult.userId);

    return NextResponse.json({ contextPack }, { status: 201 });
  } catch (error) {
    console.error("Create interview context pack error:", error);
    return NextResponse.json(
      { error: "Failed to create interview context pack" },
      { status: 500 },
    );
  }
}
