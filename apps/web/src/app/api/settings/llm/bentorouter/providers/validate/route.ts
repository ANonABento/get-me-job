import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { validateSlothingBentoProvider } from "@/lib/llm/bentorouter-client";

export const dynamic = "force-dynamic";

const validateProviderSchema = z.object({
  type: z.enum(["openai", "anthropic", "openrouter", "openai-compatible"]),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const parsed = validateProviderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid provider", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return NextResponse.json(await validateSlothingBentoProvider(parsed.data));
}
