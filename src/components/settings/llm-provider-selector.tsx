"use client";

import type { ReactNode } from "react";
import { CheckCircle, Cloud, Cpu, Server, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_MODELS } from "@/lib/constants";
import type { LLMConfig } from "@/types";

export interface ProviderOption {
  value: LLMConfig["provider"];
  label: string;
  description: string;
  icon: ReactNode;
  requiresKey: boolean;
}

export const PROVIDERS: ProviderOption[] = [
  {
    value: "ollama",
    label: "Ollama",
    description: "Free, local AI processing",
    icon: <Cpu className="h-5 w-5" />,
    requiresKey: false,
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT-4 & GPT-3.5 models",
    icon: <Sparkles className="h-5 w-5" />,
    requiresKey: true,
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Claude models",
    icon: <Zap className="h-5 w-5" />,
    requiresKey: true,
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Access multiple providers",
    icon: <Cloud className="h-5 w-5" />,
    requiresKey: true,
  },
];

interface LLMProviderSelectorProps {
  provider: LLMConfig["provider"];
  apiKey?: string;
  onProviderChange: (updates: Partial<LLMConfig>) => void;
}

export function LLMProviderSelector({
  provider,
  apiKey,
  onProviderChange,
}: LLMProviderSelectorProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">AI Provider</h2>
          <p className="text-sm text-muted-foreground">
            Choose how Slothing will process your documents
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={provider === option.value}
            onClick={() =>
              onProviderChange({
                provider: option.value,
                model: DEFAULT_MODELS[option.value]?.[0] || "",
                apiKey: option.value === "ollama" ? undefined : apiKey,
              })
            }
            className={`relative flex min-h-28 items-start gap-4 rounded-xl border-2 p-4 pr-24 text-left transition-all ${
              provider === option.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
          >
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              {option.icon}
            </div>
            <div>
              <p className="font-medium">{option.label}</p>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            {provider === option.value && (
              <Badge className="absolute right-3 top-3 gap-1.5 bg-primary text-primary-foreground">
                <CheckCircle className="h-4 w-4" />
                Selected
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
