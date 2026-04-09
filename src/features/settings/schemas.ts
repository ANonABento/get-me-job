import { z } from "zod";
import { llmProviderSchema } from "@/shared/llm/config";

export const llmConfigSchema = z.object({
  provider: llmProviderSchema,
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional().or(z.literal("")),
  model: z.string().min(1, "Model is required"),
});

export type LLMConfigInput = z.infer<typeof llmConfigSchema>;

export const updateSettingsSchema = z.object({
  llm: llmConfigSchema.optional(),
});
