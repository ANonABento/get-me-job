import { AlertCircle } from "lucide-react";

export function OllamaWarning() {
  return (
    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-200">Make sure Ollama is running</p>
        <p className="text-amber-700/80 dark:text-amber-300/80 mt-1">
          Ollama must be running in the background for Get Me Job to work. If you get connection
          errors, start Ollama from your Applications folder.
        </p>
      </div>
    </div>
  );
}

