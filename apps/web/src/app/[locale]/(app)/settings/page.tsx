"use client";

import { Settings } from "lucide-react";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import { BillingSection } from "@/components/settings/billing-section";
import { ByokExplainer } from "@/components/settings/byok-explainer";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { DataManagement } from "@/components/settings/data-management";
import { EvalHealthSection } from "@/components/settings/eval-health-section";
import { GmailAutoStatusSection } from "@/components/settings/gmail-auto-status-section";
import { GoogleIntegration } from "@/components/settings/google-integration";
import { HelpCards } from "@/components/settings/help-cards";
import { KanbanLanesSection } from "@/components/settings/kanban-lanes-section";
import { LanguageSection } from "@/components/settings/language-section";
import { LLMProviderConfig } from "@/components/settings/llm-provider-config";
import {
  LLMProviderSelector,
  PROVIDERS,
} from "@/components/settings/llm-provider-selector";
import { LocaleSection } from "@/components/settings/locale-section";
import { OllamaWarning } from "@/components/settings/ollama-warning";
import { OpportunityReviewSection } from "@/components/settings/opportunity-review-section";
import { PromptVariantsSection } from "@/components/settings/prompt-variants-section";
import {
  SettingsNav,
  type SettingsNavItem,
} from "@/components/settings/settings-nav";
import { ThemeSection } from "@/components/settings/theme-section";
import { WhatAiPowers } from "@/components/settings/what-ai-powers";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { useDataIO } from "./use-data-io";
import { useLLMSettings } from "./use-llm-settings";
import { useTranslations } from "next-intl";

// Section IDs are kept in module scope so the nav + section anchors
// share a single source of truth. Edit here when adding/removing
// sections; tests assert on these ids.
const SECTION_IDS = {
  account: "account",
  appearance: "appearance",
  integrations: "integrations",
  aiKeys: "ai-keys",
  data: "data",
  plan: "plan-usage",
  danger: "danger",
} as const;

const NAV_ITEMS: ReadonlyArray<SettingsNavItem> = [
  { id: SECTION_IDS.account, label: "Account" },
  { id: SECTION_IDS.appearance, label: "Appearance" },
  { id: SECTION_IDS.integrations, label: "Integrations" },
  { id: SECTION_IDS.aiKeys, label: "AI keys" },
  { id: SECTION_IDS.data, label: "Data" },
  { id: SECTION_IDS.plan, label: "Plan & usage" },
  { id: SECTION_IDS.danger, label: "Danger zone", destructive: true },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const llmSettings = useLLMSettings();
  const dataIO = useDataIO();
  const selectedProvider = PROVIDERS.find(
    (provider) => provider.value === llmSettings.config.provider,
  );

  if (llmSettings.loading) {
    return <SettingsSkeleton />;
  }

  return (
    <AppPage>
      <PageHeader
        width="wide"
        icon={Settings}
        title={t("title")}
        description={t("description")}
      />

      <PageContent width="wide">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <SettingsNav items={NAV_ITEMS} />

          <div className="space-y-6">
            <section
              id={SECTION_IDS.account}
              aria-labelledby={`${SECTION_IDS.account}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.account}-h`} className="sr-only">
                Account
              </h2>
              <LocaleSection />
              <LanguageSection />
            </section>

            <section
              id={SECTION_IDS.appearance}
              aria-labelledby={`${SECTION_IDS.appearance}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.appearance}-h`} className="sr-only">
                Appearance
              </h2>
              <ThemeSection />
            </section>

            <section
              id={SECTION_IDS.integrations}
              aria-labelledby={`${SECTION_IDS.integrations}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.integrations}-h`} className="sr-only">
                Integrations
              </h2>
              <GoogleIntegration />
              <GmailAutoStatusSection />
              <OpportunityReviewSection />
              <KanbanLanesSection />
            </section>

            <section
              id={SECTION_IDS.aiKeys}
              aria-labelledby={`${SECTION_IDS.aiKeys}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.aiKeys}-h`} className="sr-only">
                AI keys
              </h2>
              <ByokExplainer />
              <LLMProviderSelector
                provider={llmSettings.config.provider}
                apiKey={llmSettings.config.apiKey}
                onProviderChange={llmSettings.updateConfig}
              />
              {llmSettings.config.provider === "ollama" && <OllamaWarning />}
              <div className="grid gap-6 lg:grid-cols-2">
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
              </div>
              <PromptVariantsSection />
              <HelpCards />
              <EvalHealthSection />
            </section>

            <section
              id={SECTION_IDS.data}
              aria-labelledby={`${SECTION_IDS.data}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.data}-h`} className="sr-only">
                Data
              </h2>
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
            </section>

            <section
              id={SECTION_IDS.plan}
              aria-labelledby={`${SECTION_IDS.plan}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.plan}-h`} className="sr-only">
                Plan & usage
              </h2>
              <BillingSection />
            </section>

            <section
              id={SECTION_IDS.danger}
              aria-labelledby={`${SECTION_IDS.danger}-h`}
              className="scroll-mt-24 space-y-4"
            >
              <h2 id={`${SECTION_IDS.danger}-h`} className="sr-only">
                Danger zone
              </h2>
              <DangerZoneSection />
            </section>
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}
