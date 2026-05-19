"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BrainCircuit,
  CreditCard,
  Database,
  Plug,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import { BillingSection } from "@/components/settings/billing-section";
import { AiTaskRoutingSection } from "@/components/settings/ai-task-routing-section";
import { SlothingBentoRouterAdminSection } from "@/components/settings/bento-router-admin-section";
import { ByokExplainer } from "@/components/settings/byok-explainer";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { DataManagement } from "@/components/settings/data-management";
import { EvalHealthSection } from "@/components/settings/eval-health-section";
import { GmailAutoStatusSection } from "@/components/settings/gmail-auto-status-section";
import { GoogleIntegration } from "@/components/settings/google-integration";
import { HelpCards } from "@/components/settings/help-cards";
import { LanguageSection } from "@/components/settings/language-section";
import { LLMProviderConfig } from "@/components/settings/llm-provider-config";
import {
  LLMProviderSelector,
  PROVIDERS,
} from "@/components/settings/llm-provider-selector";
import { LocaleSection } from "@/components/settings/locale-section";
import { OllamaWarning } from "@/components/settings/ollama-warning";
import { OpportunityReviewSection } from "@/components/settings/opportunity-review-section";
import { OpportunityPreferencesSection } from "@/components/settings/opportunity-preferences-section";
import { PromptVariantsSection } from "@/components/settings/prompt-variants-section";
import { ThemeSection } from "@/components/settings/theme-section";
import { WhatAiPowers } from "@/components/settings/what-ai-powers";
import {
  AppPage,
  PageContent,
  PageHeader,
  PagePanel,
} from "@/components/ui/page-layout";
import { cn } from "@/lib/utils";
import { useDataIO } from "./use-data-io";
import { useLLMSettings } from "./use-llm-settings";
import { useTranslations } from "next-intl";

type SettingsTabId = "general" | "integrations" | "ai" | "data" | "billing";

const SETTINGS_TABS: ReadonlyArray<{
  id: SettingsTabId;
  label: string;
  description: string;
  icon: typeof SlidersHorizontal;
}> = [
  {
    id: "general",
    label: "General",
    description: "Language, region, and appearance.",
    icon: SlidersHorizontal,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connected services and automation.",
    icon: Plug,
  },
  {
    id: "ai",
    label: "AI",
    description: "Providers, prompts, and task routing.",
    icon: BrainCircuit,
  },
  {
    id: "data",
    label: "Data",
    description: "Exports, imports, and account data controls.",
    icon: Database,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan and usage.",
    icon: CreditCard,
  },
];

const HASH_TAB_MAP: Record<string, SettingsTabId> = {
  account: "general",
  appearance: "general",
  integrations: "integrations",
  "ai-keys": "ai",
  "ai-tasks": "ai",
  data: "data",
  danger: "data",
  "plan-usage": "billing",
};

function normalizeSettingsTab(value: string | null | undefined): SettingsTabId {
  if (!value) return "general";
  const lowered = value.toLowerCase();
  return SETTINGS_TABS.some((tab) => tab.id === lowered)
    ? (lowered as SettingsTabId)
    : "general";
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageInner />
    </Suspense>
  );
}

function SettingsPageInner() {
  const t = useTranslations("settings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const llmSettings = useLLMSettings();
  const dataIO = useDataIO();
  const selectedProvider = PROVIDERS.find(
    (provider) => provider.value === llmSettings.config.provider,
  );
  const hasProvider =
    selectedProvider?.requiresKey === false ||
    Boolean(llmSettings.config.apiKey?.trim());
  const activeTab = useMemo(
    () => normalizeSettingsTab(searchParams?.get("tab")),
    [searchParams],
  );
  const activeTabConfig = SETTINGS_TABS.find((tab) => tab.id === activeTab);

  const setActiveTab = useCallback(
    (nextTab: SettingsTabId) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", nextTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const mappedTab = HASH_TAB_MAP[hash];
    if (mappedTab && mappedTab !== activeTab) {
      setActiveTab(mappedTab);
    }
  }, [activeTab, setActiveTab]);

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
        variant="compact"
      />

      <PageContent width="wide">
        <div className="space-y-5">
          <PagePanel className="!p-2">
            <div
              role="tablist"
              aria-label="Settings categories"
              className="flex gap-1 overflow-x-auto whitespace-nowrap md:flex-wrap md:overflow-x-visible md:whitespace-normal"
            >
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`settings-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`settings-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </PagePanel>

          <div
            id={`settings-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`settings-tab-${activeTab}`}
            className="min-w-0 space-y-4"
          >
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {activeTabConfig?.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTabConfig?.description}
              </p>
            </div>

            {activeTab === "general" && (
              <div className="space-y-4">
                <LocaleSection />
                <LanguageSection />
                <ThemeSection />
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-4">
                <GoogleIntegration />
                <GmailAutoStatusSection />
                <OpportunityReviewSection />
                <OpportunityPreferencesSection />
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
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
                <SlothingBentoRouterAdminSection />
                <AiTaskRoutingSection hasProvider={hasProvider} />
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-4">
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
                <div className="border-t border-destructive/20 pt-4">
                  <DangerZoneSection />
                </div>
              </div>
            )}

            {activeTab === "billing" && <BillingSection />}
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}
