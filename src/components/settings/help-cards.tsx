"use client";

import { Cpu, ExternalLink, Key } from "lucide-react";

export function HelpCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-success/10 text-success">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">Using Ollama (Free)</h3>
        </div>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>
            Install from{" "}
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 font-medium inline-flex items-center gap-1"
            >
              ollama.ai <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ollama pull llama3.2</code>
          </li>
          <li>Test the connection above</li>
        </ol>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">Using API Keys</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect your own API keys from OpenAI, Anthropic, or OpenRouter for cloud-based processing. Your keys are
          stored locally and never leave your device.
        </p>
      </div>
    </div>
  );
}
