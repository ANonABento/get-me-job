import { z } from "zod";

// LLM providers
export const LLM_PROVIDERS = [
  "openai",
  "anthropic",
  "ollama",
  "openrouter",
] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number];

export const llmProviderSchema = z.enum(LLM_PROVIDERS);

// LLM configuration
export const DEFAULT_LLM_TIMEOUT_MS = 60000; // 60 seconds

export const llmConfigSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  model: z.string().min(1, "Model is required"),
});

export type LLMConfigInput = z.infer<typeof llmConfigSchema>;

export const updateSettingsSchema = z.object({
  llm: llmConfigSchema.optional(),
  opportunityReview: z.object({
    enabled: z.boolean(),
  }).optional(),
  locale: z.string().optional(),
});

export const LLM_ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  ollama: "http://localhost:11434",
} as const satisfies Record<LLMProvider, string>;

export const DEFAULT_MODELS = {
  ollama: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"],
  openrouter: ["meta-llama/llama-3.2-3b-instruct:free", "google/gemma-2-9b-it:free"],
} as const satisfies Record<LLMProvider, readonly string[]>;

export const DEFAULT_MODEL_BY_PROVIDER = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  ollama: "llama3.2",
  openrouter: "meta-llama/llama-3.2-3b-instruct:free",
} as const satisfies Record<LLMProvider, string>;
