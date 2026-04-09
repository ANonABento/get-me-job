"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { SETTINGS_PROVIDERS } from "@/features/settings/constants";
import type {
  ExportType,
  ImportType,
  SettingsStatusResult,
} from "@/features/settings/types";
import { getExportMetadata, getProviderModels } from "@/features/settings/utils";
import { DEFAULT_MODELS, LLM_ENDPOINTS } from "@/shared/llm/config";
import type { LLMConfig } from "@/types";

const DEFAULT_CONFIG: LLMConfig = {
  provider: "ollama",
  model: DEFAULT_MODELS.ollama[0],
  baseUrl: LLM_ENDPOINTS.ollama,
};

export function useSettingsPage() {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<SettingsStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<SettingsStatusResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);

    try {
      const response = await fetch("/api/settings");
      const data = (await response.json()) as { llm?: LLMConfig };

      if (data.llm) {
        setConfig(data.llm);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  function updateConfig(updates: Partial<LLMConfig>) {
    setConfig((previousConfig) => ({ ...previousConfig, ...updates }));
    setHasChanges(true);
    setTestResult(null);
  }

  function selectProvider(provider: LLMConfig["provider"]) {
    updateConfig({
      apiKey: provider === "ollama" ? undefined : config.apiKey,
      model: DEFAULT_MODELS[provider]?.[0] || "",
      provider,
    });
  }

  async function saveSettings() {
    setSaving(true);

    try {
      await fetch("/api/settings", {
        body: JSON.stringify({ llm: config }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      setHasChanges(false);
      setTestResult({ success: true, message: "Settings saved successfully!" });
    } catch {
      setTestResult({ success: false, message: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/settings", {
        body: JSON.stringify({ llm: config }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; models?: string[] };

      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" });

        if (data.models) {
          setOllamaModels(data.models);
        }
      } else {
        setTestResult({ success: false, message: data.error || "Connection failed" });
      }
    } catch {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  }

  async function exportData(type: ExportType) {
    setExporting(type);

    try {
      const { filename, url } = getExportMetadata(type);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      setImportResult({ success: false, message: "Export failed" });
    } finally {
      setExporting(null);
    }
  }

  async function importBackupFile(file: File) {
    const text = await file.text();
    const data = JSON.parse(text);

    const response = await fetch("/api/backup", {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as {
      error?: string;
      results: { jobs: { imported: number }; profile?: boolean };
    };

    if (!response.ok) {
      throw new Error(result.error || "Restore failed");
    }

    setImportResult({
      success: true,
      message: `Restored: ${result.results.profile ? "Profile" : ""} ${result.results.jobs.imported} jobs imported`,
    });
  }

  async function importJobsFile(file: File) {
    const isCsv = file.name.endsWith(".csv");

    if (isCsv) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/jobs", {
        body: formData,
        method: "POST",
      });
      const result = (await response.json()) as { error?: string; message: string };

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportResult({ success: true, message: result.message });
      return;
    }

    const text = await file.text();
    const data = JSON.parse(text);

    const response = await fetch("/api/import/jobs", {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as { error?: string; message: string };

    if (!response.ok) {
      throw new Error(result.error || "Import failed");
    }

    setImportResult({ success: true, message: result.message });
  }

  async function handleFileImport(
    event: ChangeEvent<HTMLInputElement>,
    type: ImportType
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      if (type === "backup") {
        await importBackupFile(file);
      } else {
        await importJobsFile(file);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "Import failed",
      });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  const selectedProvider = SETTINGS_PROVIDERS.find((provider) => provider.value === config.provider);
  const availableModels = getProviderModels(config.provider, ollamaModels);

  return {
    availableModels,
    config,
    exportData,
    exporting,
    fetchSettings,
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
  };
}
