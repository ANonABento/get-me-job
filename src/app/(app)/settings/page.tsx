"use client";

import { Loader2, Settings } from "lucide-react";
import { DataManagement } from "@/components/settings/data-management";
import { GoogleIntegration } from "@/components/settings/google-integration";
import { HelpCards } from "@/components/settings/help-cards";
import { LLMProviderConfig } from "@/components/settings/llm-provider-config";
import { LocaleSection } from "@/components/settings/locale-section";
import {
  LLMProviderSelector,
  PROVIDERS,
} from "@/components/settings/llm-provider-selector";
import { OllamaWarning } from "@/components/settings/ollama-warning";
import { OpportunityReviewSection } from "@/components/settings/opportunity-review-section";
import { ThemeSection } from "@/components/settings/theme-section";
import { WhatAiPowers } from "@/components/settings/what-ai-powers";
import { PromptVariantsSection } from "@/components/settings/prompt-variants-section";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { useDataIO } from "./use-data-io";
import { useLLMSettings } from "./use-llm-settings";

export default function SettingsPage() {
  const llmSettings = useLLMSettings();
  const dataIO = useDataIO();
  const selectedProvider = PROVIDERS.find(
    (provider) => provider.value === llmSettings.config.provider,
  );

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
    <AppPage>
      <PageHeader
        width="narrow"
        icon={Settings}
        eyebrow="Configuration"
        title="Settings"
        description="Configure your AI provider for resume parsing and interview preparation."
      />

      <PageContent width="narrow">
        <div className="space-y-6">
          <LLMProviderSelector
            provider={llmSettings.config.provider}
            apiKey={llmSettings.config.apiKey}
            onProviderChange={llmSettings.updateConfig}
          />
          <ThemeSection />
          <LocaleSection />
          <OpportunityReviewSection />
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
          <PromptVariantsSection />
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
      </PageContent>
    </AppPage>
  );
}
