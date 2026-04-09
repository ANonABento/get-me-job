import { CheckCircle, Server } from "lucide-react";
import { SETTINGS_PROVIDERS } from "@/features/settings/constants";
import type { ProviderOption } from "@/features/settings/types";
import type { LLMConfig } from "@/types";

interface ProviderSelectionCardProps {
  provider: LLMConfig["provider"];
  onSelect: (provider: LLMConfig["provider"]) => void;
}

export function ProviderSelectionCard({
  provider,
  onSelect,
}: ProviderSelectionCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">AI Provider</h2>
          <p className="text-sm text-muted-foreground">
            Choose how Get Me Job will process your documents
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SETTINGS_PROVIDERS.map((option) => (
          <ProviderOptionButton
            key={option.value}
            isSelected={provider === option.value}
            onSelect={() => onSelect(option.value)}
            option={option}
          />
        ))}
      </div>
    </div>
  );
}

interface ProviderOptionButtonProps {
  isSelected: boolean;
  onSelect: () => void;
  option: ProviderOption;
}

function ProviderOptionButton({
  isSelected,
  onSelect,
  option,
}: ProviderOptionButtonProps) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-transparent bg-muted/50 hover:bg-muted"
      }`}
    >
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${option.color} text-white shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">{option.label}</p>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </div>
      {isSelected ? <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" /> : null}
    </button>
  );
}

