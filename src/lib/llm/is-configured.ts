import type { LLMConfig } from "@/types";

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
