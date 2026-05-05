"use client";

import { AlertCircle } from "lucide-react";

export function OllamaWarning() {
  return (
    <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-warning">Make sure Ollama is running</p>
        <p className="text-warning mt-1">
          Ollama must be running in the background for Slothing to work. If you
          get connection errors, start Ollama from your Applications folder.
        </p>
      </div>
    </div>
  );
}
