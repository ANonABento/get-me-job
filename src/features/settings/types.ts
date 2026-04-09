import type { LucideIcon } from "lucide-react";
import type { LLMConfig } from "@/types";

export type ExportType = "profile" | "jobs-json" | "jobs-csv" | "backup";
export type ImportType = "jobs" | "backup";

export interface SettingsStatusResult {
  success: boolean;
  message: string;
}

export interface ProviderOption {
  value: LLMConfig["provider"];
  label: string;
  description: string;
  icon: LucideIcon;
  requiresKey: boolean;
  color: string;
}

