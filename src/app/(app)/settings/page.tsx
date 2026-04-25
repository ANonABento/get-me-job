"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { DataManagement } from "@/components/settings/data-management";
import { GoogleIntegration } from "@/components/settings/google-integration";
import { HelpCards } from "@/components/settings/help-cards";
import { LLMProviderConfig } from "@/components/settings/llm-provider-config";
import { LLMProviderSelector, PROVIDERS } from "@/components/settings/llm-provider-selector";
import { OllamaWarning } from "@/components/settings/ollama-warning";
import { WhatAiPowers } from "@/components/settings/what-ai-powers";
import { useDataIO } from "./use-data-io";
import { useLLMSettings } from "./use-llm-settings";

export default function SettingsPage() {
  const llmSettings = useLLMSettings();
  const dataIO = useDataIO();
  const selectedProvider = PROVIDERS.find((provider) => provider.value === llmSettings.config.provider);

  if (llmSettings.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="hero-gradient border-b">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Settings className="h-4 w-4" />
              Configuration
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Configure your AI provider for resume parsing and interview preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <LLMProviderSelector
            provider={llmSettings.config.provider}
            apiKey={llmSettings.config.apiKey}
            onProviderChange={llmSettings.updateConfig}
          />
          <LLMProviderConfig
            config={llmSettings.config}
            selectedProvider={selectedProvider}
            models={llmSettings.availableModels}
            saving={llmSettings.saving}
            testing={llmSettings.testing}
            hasChanges={llmSettings.hasChanges}
            testResult={llmSettings.testResult}
            onConfigChange={llmSettings.updateConfig}
            onSave={() => void llmSettings.saveSettings()}
            onTestConnection={() => void llmSettings.testConnection()}
          />
          <WhatAiPowers />
          <HelpCards />
          <DataManagement
            exporting={dataIO.exporting}
            importing={dataIO.importing}
            importResult={dataIO.importResult}
            showImportPreview={dataIO.showImportPreview}
            onExport={(type) => void dataIO.exportData(type)}
            onImportFile={dataIO.handleFileImport}
            onFullImportPreview={dataIO.handleFullImportPreview}
            onConfirmFullImport={dataIO.confirmFullImport}
            onCancelImportPreview={dataIO.clearImportPreview}
          />
          <GoogleIntegration />
          {llmSettings.config.provider === "ollama" && <OllamaWarning />}
        </div>
      </div>
    </div>
  );
}
