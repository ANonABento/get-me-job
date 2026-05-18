import { NextResponse } from "next/server";

import { getLLMConfig } from "@/lib/db";
import {
  deductCredits,
  refundCredits,
  type CreditFeature,
  type CreditTransactionRecord,
} from "@/lib/db/credits";
import { getUserPlan, type UserPlan } from "./plans";
import type { LLMConfig } from "@/types";

export interface AiGatePass {
  allowed: true;
  llmConfig: LLMConfig;
  plan: UserPlan;
  source: "self-host" | "byok" | "credits" | "fallback";
  transaction: CreditTransactionRecord | null;
  refund: () => void;
}

export type AiGateResult = AiGatePass | NextResponse;

export interface OptionalAiGatePass extends Omit<AiGatePass, "llmConfig"> {
  llmConfig: LLMConfig | null;
}

export type OptionalAiGateResult = OptionalAiGatePass | NextResponse;

export function gateAiFeature(
  userId: string,
  feature: CreditFeature,
  refId: string,
): AiGateResult {
  const llmConfig = getLLMConfig(userId);
  const plan = getUserPlan(userId);

  if (plan === "self-host") {
    if (!isUsableLLMConfig(llmConfig)) return missingProviderResponse();
    return pass(llmConfig, plan, "self-host", null);
  }

  if (isUsableLLMConfig(llmConfig)) {
    return pass(llmConfig, plan, "byok", null);
  }

  if (plan === "pro-monthly" || plan === "pro-weekly") {
    const transaction = deductCredits(userId, feature, refId);
    const hostedConfig = getHostedLLMConfig();
    return pass(hostedConfig, plan, "credits", transaction);
  }

  return NextResponse.json(
    {
      error: "AI tools require your own API key or a Pro plan.",
      code: "billing_required",
      plan,
    },
    { status: 402 },
  );
}

export function gateOptionalAiFeature(
  userId: string,
  feature: CreditFeature,
  refId: string,
): OptionalAiGateResult {
  const llmConfig = getLLMConfig(userId);
  const plan = getUserPlan(userId);

  if (plan === "self-host") {
    return optionalPass(
      isUsableLLMConfig(llmConfig) ? llmConfig : null,
      plan,
      "self-host",
      null,
    );
  }

  if (isUsableLLMConfig(llmConfig)) {
    return optionalPass(llmConfig, plan, "byok", null);
  }

  if (plan === "pro-monthly" || plan === "pro-weekly") {
    if (!process.env.SLOTHING_HOSTED_LLM_API_KEY) {
      return optionalPass(null, plan, "fallback", null);
    }
    const transaction = deductCredits(userId, feature, refId);
    return optionalPass(getHostedLLMConfig(), plan, "credits", transaction);
  }

  return optionalPass(null, plan, "fallback", null);
}

function isUsableLLMConfig(config: LLMConfig | null): config is LLMConfig {
  if (!config?.provider || !config.model) return false;
  return config.provider === "ollama" || Boolean(config.apiKey);
}

export function isAiGateResponse(
  result: AiGateResult | OptionalAiGateResult,
): result is NextResponse {
  return result instanceof NextResponse;
}

function pass(
  llmConfig: LLMConfig,
  plan: UserPlan,
  source: AiGatePass["source"],
  transaction: CreditTransactionRecord | null,
): AiGatePass {
  return {
    allowed: true,
    llmConfig,
    plan,
    source,
    transaction,
    refund() {
      if (transaction?.feature && transaction.refId) {
        refundCredits(
          transaction.userId,
          transaction.feature,
          transaction.refId,
        );
      }
    },
  };
}

function optionalPass(
  llmConfig: LLMConfig | null,
  plan: UserPlan,
  source: AiGatePass["source"],
  transaction: CreditTransactionRecord | null,
): OptionalAiGatePass {
  return {
    allowed: true,
    llmConfig,
    plan,
    source,
    transaction,
    refund() {
      if (transaction?.feature && transaction.refId) {
        refundCredits(
          transaction.userId,
          transaction.feature,
          transaction.refId,
        );
      }
    },
  };
}

function missingProviderResponse() {
  return NextResponse.json(
    { error: "No LLM provider configured. Go to Settings to set one up." },
    { status: 400 },
  );
}

function getHostedLLMConfig(): LLMConfig {
  const provider = process.env.SLOTHING_HOSTED_LLM_PROVIDER ?? "openai";
  const apiKey = process.env.SLOTHING_HOSTED_LLM_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SLOTHING_HOSTED_LLM_API_KEY is required for hosted Pro credit usage.",
    );
  }

  return {
    provider: provider as LLMConfig["provider"],
    model: process.env.SLOTHING_HOSTED_LLM_MODEL ?? "gpt-4o-mini",
    apiKey,
    baseUrl: process.env.SLOTHING_HOSTED_LLM_BASE_URL || undefined,
  };
}
