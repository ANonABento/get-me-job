import {
  defineBentoTask,
  ModelRegistry,
  type ModelProfile,
  type TaskDefinition,
  type TaskPolicy,
  type TaskRegistry,
} from "@anonabento/bento-router";
import { SLOTHING_AI_TASKS } from "@/lib/llm/tasks";

export const SLOTHING_BENTO_APP_ID = "slothing";

export const SLOTHING_BENTO_TASK_IDS = [
  "slothing.parse_resume",
  "slothing.profile_extract",
  "slothing.chunk_atomize",
  "slothing.opportunity_extract",
  "slothing.classify_email",
  "slothing.score_match",
  "slothing.tailor_resume",
  "slothing.cover_letter_generate",
  "slothing.answer_generate",
  "slothing.embedding",
] as const;

export type SlothingBentoTaskId = (typeof SLOTHING_BENTO_TASK_IDS)[number];

type SlothingBentoTaskDefinition = TaskDefinition & {
  id: SlothingBentoTaskId;
};

const jsonStandardPolicy = (
  primaryModel: string,
  fallbacks: string[],
  maxRequestCostUsd: number,
): TaskPolicy => ({
  primaryModel,
  fallbacks,
  modelRequirements: {
    caps: { json: true },
    allowedQualityTiers: ["cheap", "standard", "premium"],
  },
  guardrails: {
    maxInputTokens: 12000,
    maxOutputTokens: 1400,
    timeoutMs: 20000,
    maxRetries: 1,
    maxRequestCostUsd,
  },
  degradation: {
    mode: "static_message",
    message: "",
  },
});

export const SLOTHING_BENTO_TASKS: readonly SlothingBentoTaskDefinition[] = [
  {
    id: "slothing.parse_resume",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Parse resume",
    category: "Studio",
    description: "Extract structured resume chunks from resume text.",
    defaultPolicy: jsonStandardPolicy(
      "openrouter/anthropic/claude-haiku-4.5",
      ["openrouter/google/gemini-flash", "openrouter/openai/gpt-4o-mini"],
      0.02,
    ),
  },
  {
    id: "slothing.profile_extract",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Profile extract",
    category: "Studio",
    description: "Extract contact, headline, experience, and template signals.",
    defaultPolicy: jsonStandardPolicy(
      "openrouter/anthropic/claude-haiku-4.5",
      ["openrouter/google/gemini-flash"],
      0.015,
    ),
  },
  {
    id: "slothing.chunk_atomize",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Chunk atomize",
    category: "Studio",
    description: "Split long resume bullets into smaller reusable atoms.",
    defaultPolicy: jsonStandardPolicy(
      "openrouter/google/gemini-flash",
      ["openrouter/anthropic/claude-haiku-4.5"],
      0.006,
    ),
  },
  {
    id: "slothing.opportunity_extract",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Opportunity extract",
    category: "Opportunities",
    description: "Turn job descriptions into structured opportunity data.",
    defaultPolicy: jsonStandardPolicy(
      "openrouter/anthropic/claude-haiku-4.5",
      ["openrouter/google/gemini-flash"],
      0.015,
    ),
  },
  {
    id: "slothing.classify_email",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Classify email",
    category: "Email",
    description: "Classify career-related email messages.",
    defaultPolicy: jsonStandardPolicy(
      "openrouter/google/gemini-flash",
      ["openrouter/anthropic/claude-haiku-4.5"],
      0.004,
    ),
  },
  {
    id: "slothing.score_match",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Score match",
    category: "Opportunities",
    description: "Score a resume against a job description.",
    defaultPolicy: {
      primaryModel: "openrouter/anthropic/claude-sonnet-4.6",
      fallbacks: ["openrouter/openai/gpt-4o"],
      modelRequirements: {
        minContextTokens: 100000,
      },
      guardrails: {
        maxInputTokens: 50000,
        maxOutputTokens: 1800,
        timeoutMs: 30000,
        maxRetries: 1,
        maxRequestCostUsd: 0.08,
      },
      degradation: {
        mode: "static_message",
        message: "",
      },
    },
  },
  {
    id: "slothing.tailor_resume",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Tailor resume",
    category: "Studio",
    description: "Rewrite a resume for a target role.",
    defaultPolicy: premiumGenerationPolicy(),
  },
  {
    id: "slothing.cover_letter_generate",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Cover letter generate",
    category: "Cover Letters",
    description:
      "Generate or revise a cover letter from job and profile context.",
    defaultPolicy: premiumGenerationPolicy(),
  },
  {
    id: "slothing.answer_generate",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Answer generate",
    category: "Interview",
    description:
      "Generate coaching, answers, interview feedback, or email copy.",
    defaultPolicy: premiumGenerationPolicy(),
  },
  {
    id: "slothing.embedding",
    appId: SLOTHING_BENTO_APP_ID,
    name: "Embedding",
    category: "Knowledge",
    description: "Embed resume and opportunity text chunks.",
    defaultPolicy: {
      primaryModel: "openrouter/openai/text-embedding-3-small",
      fallbacks: ["local/nomic-embed-text"],
      modelRequirements: {
        caps: { embeddings: true },
      },
      guardrails: {
        maxInputTokens: 8000,
        maxOutputTokens: 1,
        timeoutMs: 15000,
        maxRetries: 1,
        maxRequestCostUsd: 0.002,
      },
      degradation: {
        mode: "static_message",
        message: "",
      },
    },
  },
] as const;

export const SLOTHING_TASK_TO_BENTO_TASK_ID = Object.freeze(
  Object.fromEntries(
    SLOTHING_AI_TASKS.flatMap((task) =>
      task.bentoTaskId ? [[task.id, task.bentoTaskId]] : [],
    ),
  ) as Record<string, SlothingBentoTaskId>,
);

export function getBentoTaskIdForSlothingTask(
  slothingTaskId: string,
): SlothingBentoTaskId | undefined {
  return SLOTHING_TASK_TO_BENTO_TASK_ID[slothingTaskId];
}

export function getSlothingBentoTaskIds(): SlothingBentoTaskId[] {
  return [...SLOTHING_BENTO_TASK_IDS];
}

export function registerSlothingBentoTasks(registry: TaskRegistry): void {
  for (const task of SLOTHING_BENTO_TASKS) {
    defineBentoTask(task, registry);
  }
}

export function createSlothingBentoModelRegistry(): ModelRegistry {
  const registry = new ModelRegistry();
  for (const model of SLOTHING_BENTO_MODELS) {
    registry.register(model);
  }
  return registry;
}

function premiumGenerationPolicy(): TaskPolicy {
  return {
    primaryModel: "openrouter/anthropic/claude-sonnet-4.6",
    fallbacks: ["openrouter/openai/gpt-4o"],
    modelRequirements: {
      minContextTokens: 100000,
    },
    guardrails: {
      maxInputTokens: 60000,
      maxOutputTokens: 3000,
      timeoutMs: 45000,
      maxRetries: 1,
      maxRequestCostUsd: 0.12,
    },
    degradation: {
      mode: "static_message",
      message: "",
    },
  };
}

const SLOTHING_BENTO_MODELS: readonly ModelProfile[] = [
  model({
    id: "openrouter/anthropic/claude-haiku-4.5",
    provider: "openrouter",
    displayName: "Claude Haiku 4.5 via OpenRouter",
    inputCostPerMillionTokens: 1,
    outputCostPerMillionTokens: 5,
    qualityTier: "standard",
    maxContextTokens: 200000,
  }),
  model({
    id: "openrouter/google/gemini-flash",
    provider: "openrouter",
    displayName: "Gemini Flash via OpenRouter",
    inputCostPerMillionTokens: 0.1,
    outputCostPerMillionTokens: 0.4,
    qualityTier: "cheap",
    maxContextTokens: 1000000,
  }),
  model({
    id: "openrouter/openai/gpt-4o-mini",
    provider: "openrouter",
    displayName: "GPT-4o Mini via OpenRouter",
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.6,
    qualityTier: "cheap",
    maxContextTokens: 128000,
  }),
  model({
    id: "openrouter/anthropic/claude-sonnet-4.6",
    provider: "openrouter",
    displayName: "Claude Sonnet 4.6 via OpenRouter",
    inputCostPerMillionTokens: 3,
    outputCostPerMillionTokens: 15,
    qualityTier: "premium",
    maxContextTokens: 200000,
  }),
  model({
    id: "openrouter/openai/gpt-4o",
    provider: "openrouter",
    displayName: "GPT-4o via OpenRouter",
    inputCostPerMillionTokens: 2.5,
    outputCostPerMillionTokens: 10,
    qualityTier: "premium",
    maxContextTokens: 128000,
  }),
  {
    ...model({
      id: "openrouter/openai/text-embedding-3-small",
      provider: "openrouter",
      displayName: "Text Embedding 3 Small via OpenRouter",
      inputCostPerMillionTokens: 0.02,
      outputCostPerMillionTokens: 0,
      qualityTier: "cheap",
      maxContextTokens: 8191,
    }),
    caps: {
      json: false,
      vision: false,
      tools: false,
      streaming: false,
      embeddings: true,
    },
  },
  {
    ...model({
      id: "local/nomic-embed-text",
      provider: "local",
      displayName: "Nomic Embed Text via local provider",
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      qualityTier: "cheap",
      maxContextTokens: 8192,
    }),
    caps: {
      json: false,
      vision: false,
      tools: false,
      streaming: false,
      embeddings: true,
    },
  },
  model({
    id: "openai/gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.6,
    qualityTier: "cheap",
    maxContextTokens: 128000,
  }),
  model({
    id: "anthropic/claude-haiku-4.5",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    inputCostPerMillionTokens: 1,
    outputCostPerMillionTokens: 5,
    qualityTier: "standard",
    maxContextTokens: 200000,
  }),
];

function model(
  profile: Omit<ModelProfile, "caps"> & { caps?: ModelProfile["caps"] },
): ModelProfile {
  return {
    caps: { json: true, vision: false, tools: true, streaming: true },
    ...profile,
  };
}
