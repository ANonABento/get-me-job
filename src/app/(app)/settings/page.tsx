"use client";

import { Loader2 } from "lucide-react";
import { DataManagementCard } from "@/features/settings/components/data-management-card";
import { GoogleIntegrationCard } from "@/features/settings/components/google-integration-card";
import { OllamaWarning } from "@/features/settings/components/ollama-warning";
import { ProviderConfigurationCard } from "@/features/settings/components/provider-configuration-card";
import { ProviderSelectionCard } from "@/features/settings/components/provider-selection-card";
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { SettingsHelpCards } from "@/features/settings/components/settings-help-cards";
import { useSettingsPage } from "@/features/settings/hooks/use-settings-page";

export default function SettingsPage() {
  const {
    availableModels,
    config,
    exportData,
    exporting,
    handleFileImport,
    hasChanges,
    importing,
    importResult,
    loading,
    saveSettings,
    saving,
    selectProvider,
    selectedProvider,
    testConnection,
    testResult,
    testing,
    updateConfig,
  } = useSettingsPage();

  if (loading) {
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
      <SettingsHeader />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <ProviderSelectionCard provider={config.provider} onSelect={selectProvider} />
          <ProviderConfigurationCard
            availableModels={availableModels}
            config={config}
            hasChanges={hasChanges}
            onSave={saveSettings}
            onTest={testConnection}
            onUpdateConfig={updateConfig}
            saving={saving}
            selectedProviderLabel={selectedProvider?.label}
            selectedProviderRequiresKey={selectedProvider?.requiresKey}
            testResult={testResult}
            testing={testing}
          />
          <SettingsHelpCards />
          <DataManagementCard
            exporting={exporting}
            importing={importing}
            importResult={importResult}
            onExport={exportData}
            onImport={handleFileImport}
          />
          <GoogleIntegrationCard />
          {config.provider === "ollama" ? <OllamaWarning /> : null}
        </div>
      </div>
    </div>
  );
}
