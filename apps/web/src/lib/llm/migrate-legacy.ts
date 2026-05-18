import {
  migrateLegacyLLMConfig,
  type AddProviderInput,
  type BentoRouterApi,
} from "@anonabento/bento-router";
import type { LLMConfig } from "@/types";
import { getSlothingBentoRouterClient } from "@/lib/llm/bentorouter-client";
import { getSlothingBentoTaskIds } from "@/lib/llm/bentorouter-tasks";

export interface LegacySlothingMigrationInput {
  userId: string;
  legacy: LLMConfig | null | undefined;
  api?: BentoRouterApi;
}

export interface LegacySlothingMigrationResult {
  migrated: boolean;
  providerRegistered: boolean;
  policiesUpdated: number;
  reason?: "missing_legacy_config";
}

export async function migrateLegacySlothingLLMConfig({
  userId,
  legacy,
  api = getSlothingBentoRouterClient().api(),
}: LegacySlothingMigrationInput): Promise<LegacySlothingMigrationResult> {
  if (!legacy?.provider || !legacy.model) {
    return {
      migrated: false,
      providerRegistered: false,
      policiesUpdated: 0,
      reason: "missing_legacy_config",
    };
  }

  const output = migrateLegacyLLMConfig(
    {
      provider: legacy.provider,
      apiKey: legacy.apiKey,
      baseUrl: legacy.baseUrl,
      model: legacy.model,
    },
    {
      userId,
      taskIds: getSlothingBentoTaskIds(),
    },
  );

  const providerRegistered = output.provider
    ? await ensureProvider(api, output.provider)
    : false;

  let policiesUpdated = 0;
  for (const [taskId, policy] of Object.entries(output.taskPolicies)) {
    const task = await api.getTask(taskId);
    const effectivePolicy = task.effectivePolicy as
      | { primaryModel?: string }
      | undefined;
    if (effectivePolicy?.primaryModel === policy.primaryModel) continue;
    await api.updateTaskPolicy(taskId, policy);
    policiesUpdated += 1;
  }

  return {
    migrated: true,
    providerRegistered,
    policiesUpdated,
  };
}

async function ensureProvider(
  api: BentoRouterApi,
  provider: AddProviderInput,
): Promise<boolean> {
  const existing = await api.listConfiguredProviders(provider.userId);
  const match = existing.find(
    (candidate) =>
      candidate.type === provider.type &&
      candidate.displayName === provider.displayName &&
      candidate.baseUrl === provider.baseUrl,
  );
  if (match) return false;
  await api.addConfiguredProvider(provider);
  return true;
}
