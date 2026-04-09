import { DEFAULT_MODELS } from "@/shared/llm/config";
import type { ExportType } from "@/features/settings/types";
import type { LLMConfig } from "@/types";

export function getExportMetadata(type: ExportType, date = new Date()) {
  const dateStamp = date.toISOString().split("T")[0];

  switch (type) {
    case "profile":
      return {
        filename: `get-me-job-profile-${dateStamp}.json`,
        url: "/api/export/profile?format=json",
      };
    case "jobs-json":
      return {
        filename: `get-me-job-jobs-${dateStamp}.json`,
        url: "/api/export/jobs?format=json",
      };
    case "jobs-csv":
      return {
        filename: `get-me-job-jobs-${dateStamp}.csv`,
        url: "/api/export/jobs?format=csv",
      };
    case "backup":
      return {
        filename: `get-me-job-backup-${dateStamp}.json`,
        url: "/api/backup",
      };
  }
}

export function getProviderModels(
  provider: LLMConfig["provider"],
  ollamaModels: string[]
) {
  if (provider === "ollama" && ollamaModels.length > 0) {
    return ollamaModels;
  }

  return DEFAULT_MODELS[provider] || [];
}

