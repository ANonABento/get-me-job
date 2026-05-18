import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  addSlothingBentoProvider,
  removeSlothingBentoProvider,
} from "@/lib/llm/bentorouter-client";

export const dynamic = "force-dynamic";

const providerSchema = z.object({
  type: z.enum(["openai", "anthropic", "openrouter", "openai-compatible"]),
  displayName: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
  defaultModel: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parsed = providerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid provider", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const provider = await addSlothingBentoProvider({
      ...parsed.data,
      userId: authResult.userId,
    });
    return NextResponse.json(provider);
  } catch (error) {
    console.error("BentoRouter provider add error:", error);
    return NextResponse.json(
      { error: "Failed to add BentoRouter provider" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const parsed = deleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid provider", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    await removeSlothingBentoProvider(authResult.userId, parsed.data.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BentoRouter provider remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove BentoRouter provider" },
      { status: 500 },
    );
  }
}
