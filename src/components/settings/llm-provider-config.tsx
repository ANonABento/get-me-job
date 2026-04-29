"use client";

import { CheckCircle, Key, Loader2, RefreshCw, Shield, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LLMConfig } from "@/types";
import type { LLMTestResult } from "@/app/(app)/settings/use-llm-settings";
import type { ProviderOption } from "./llm-provider-selector";

interface LLMProviderConfigProps {
  config: LLMConfig;
  selectedProvider?: ProviderOption;
  models: string[];
  saving: boolean;
  testing: boolean;
  hasChanges: boolean;
  testResult: LLMTestResult | null;
  onConfigChange: (updates: Partial<LLMConfig>) => void;
  onSave: () => void;
  onTestConnection: () => void;
}

export function LLMProviderConfig(props: LLMProviderConfigProps) {
  const {
    config,
    selectedProvider,
    models,
    saving,
    testing,
    hasChanges,
    testResult,
    onConfigChange,
    onSave,
    onTestConnection,
  } = props;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">{selectedProvider?.label} Configuration</h2>
          <p className="text-sm text-muted-foreground">
            {selectedProvider?.requiresKey ? "Enter your API key and select a model" : "Configure your local Ollama instance"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedProvider?.requiresKey && (
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={config.apiKey || ""}
              onChange={(event) => onConfigChange({ apiKey: event.target.value })}
              placeholder={`Enter your ${selectedProvider.label} API key`}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Your key is stored locally and never sent to our servers
            </p>
          </div>
        )}

        {config.provider === "ollama" && (
          <div className="space-y-2">
            <Label>Ollama URL</Label>
            <Input
              value={config.baseUrl || "http://localhost:11434"}
              onChange={(event) => onConfigChange({ baseUrl: event.target.value })}
              placeholder="http://localhost:11434"
            />
            <p className="text-xs text-muted-foreground">
              Default is http://localhost:11434. Change if Ollama is running elsewhere.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Model</Label>
          <div className="flex gap-2">
            <Select value={config.model} onValueChange={(value) => onConfigChange({ model: value })}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.provider === "ollama" && (
              <Button
                variant="outline"
                size="icon"
                onClick={onTestConnection}
                disabled={testing}
                title="Refresh available models"
              >
                <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
          {config.provider === "ollama" && (
            <p className="text-xs text-muted-foreground">Click refresh to load available models from Ollama</p>
          )}
        </div>

        {testResult && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              testResult.success
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {testResult.success ? <CheckCircle className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
            <span className="font-medium">{testResult.message}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onTestConnection} disabled={testing} className="flex-1">
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          <Button onClick={onSave} disabled={saving || !hasChanges} className="flex-1 gradient-bg text-primary-foreground hover:opacity-90">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
