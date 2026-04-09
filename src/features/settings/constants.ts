import {
  Calendar,
  Cloud,
  Cpu,
  FileJson,
  FileSpreadsheet,
  FolderOpen,
  HardDrive,
  Key,
  Mail,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ExportType, ProviderOption } from "@/features/settings/types";

export const SETTINGS_PROVIDERS: ProviderOption[] = [
  {
    value: "ollama",
    label: "Ollama",
    description: "Free, local AI processing",
    icon: Cpu,
    requiresKey: false,
    color: "from-violet-500 to-purple-400",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT-4 & GPT-3.5 models",
    icon: Sparkles,
    requiresKey: true,
    color: "from-rose-400 to-orange-400",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Claude models",
    icon: Zap,
    requiresKey: true,
    color: "from-amber-400 to-orange-400",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Access multiple providers",
    icon: Cloud,
    requiresKey: true,
    color: "from-indigo-500 to-violet-400",
  },
];

export const EXPORT_OPTIONS: Array<{
  type: ExportType;
  label: string;
  icon: typeof FileJson;
  iconClassName: string;
}> = [
  {
    type: "profile",
    label: "Export Profile (JSON)",
    icon: FileJson,
    iconClassName: "text-blue-500",
  },
  {
    type: "jobs-json",
    label: "Export Jobs (JSON)",
    icon: FileJson,
    iconClassName: "text-green-500",
  },
  {
    type: "jobs-csv",
    label: "Export Jobs (CSV)",
    icon: FileSpreadsheet,
    iconClassName: "text-emerald-500",
  },
  {
    type: "backup",
    label: "Full Backup",
    icon: HardDrive,
    iconClassName: "text-violet-500",
  },
];

export const GOOGLE_FEATURES = [
  { label: "Calendar Sync", icon: Calendar, iconClassName: "text-blue-500" },
  { label: "Drive Backup", icon: FolderOpen, iconClassName: "text-yellow-500" },
  { label: "Gmail Import", icon: Mail, iconClassName: "text-red-500" },
] as const;

export const SETTINGS_HELP_CARDS = [
  {
    title: "Using Ollama (Free)",
    description: [
      {
        kind: "link",
        label: "ollama.ai",
        href: "https://ollama.ai",
        prefix: "Install from",
      },
      {
        kind: "code",
        label: "ollama pull llama3.2",
        prefix: "Run",
      },
      {
        kind: "text",
        label: "Test the connection above",
      },
    ],
    icon: Cpu,
    iconClassName: "bg-success/10 text-success",
  },
  {
    title: "Using API Keys",
    body: "Connect your own API keys from OpenAI, Anthropic, or OpenRouter for cloud-based processing. Your keys are stored locally and never leave your device.",
    icon: Key,
    iconClassName: "bg-primary/10 text-primary",
  },
] as const;

