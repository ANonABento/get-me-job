import { NextResponse } from "next/server";
import { getLLMConfig } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import type { LLMConfig } from "@/types";

/**
 * Lightweight endpoint to check if LLM is configured.
 * Used by sidebar status indicator — returns only boolean + provider name.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const config = getLLMConfig();
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

/**
 * Check if an LLM config has enough info to be usable.
 * Ollama doesn't need an API key; cloud providers do.
 */
export function isLLMConfigured(config: LLMConfig | null): boolean {
  if (!config) return false;
  if (!config.model) return false;

  if (config.provider === "ollama") return true;

  return !!config.apiKey;
}
