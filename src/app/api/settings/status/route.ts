import { NextResponse } from "next/server";
import { getLLMConfig } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { isLLMConfigured } from "@/lib/llm/is-configured";

/**
 * Lightweight endpoint to check if LLM is configured.
 * Used by sidebar status indicator — returns only boolean + provider name.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const config = getLLMConfig(authResult.userId);
    const configured = isLLMConfigured(config);

    return NextResponse.json({
      configured,
      provider: configured ? config!.provider : null,
    });
  } catch (error) {
    console.error("LLM status check error:", error);
    return NextResponse.json({ configured: false, provider: null });
  }
}

