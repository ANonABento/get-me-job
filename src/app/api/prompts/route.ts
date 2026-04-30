import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import {
  getAllPromptVariants,
  createPromptVariant,
  seedDefaultPromptVariant,
} from "@/lib/db/prompt-variants";
import { z } from "zod";

const CreatePromptVariantSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1),
  version: z.number().int().positive().optional(),
});

export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  seedDefaultPromptVariant();
  const variants = getAllPromptVariants();
  return NextResponse.json({ variants });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = CreatePromptVariantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const variant = createPromptVariant(
      parsed.data.name,
      parsed.data.content,
      parsed.data.version
    );
    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    console.error("Create prompt variant error:", error);
    return NextResponse.json(
      { error: "Failed to create prompt variant", details: String(error) },
      { status: 500 }
    );
  }
}
