"use client";

import { Settings, Cpu, Zap } from "lucide-react";

export function ConfigureStep() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg mb-6">
        <Settings className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold">Configure AI (Optional)</h2>
      <p className="text-base mt-2 text-muted-foreground">
        Connect your preferred LLM provider for smarter resume tailoring, or
        skip to use basic mode.
      </p>
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
          <Cpu className="h-4 w-4 text-primary" />
          OpenAI, Anthropic, Ollama, or OpenRouter
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          Configure anytime in Settings
        </div>
      </div>
    </div>
  );
}
