"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useErrorToast } from "@/hooks/use-error-toast";
import { DEFAULT_MODELS, LLM_ENDPOINTS } from "@/lib/constants";
import type { LLMConfig } from "@/types";

export interface LLMTestResult {
  success: boolean;
  message: string;
}

export type LLMSettingsSaveStatus = "saved" | "saving" | "error";

const AUTO_SAVE_DEBOUNCE_MS = 700;

const DEFAULT_CONFIG: LLMConfig = {
  provider: "ollama",
  model: DEFAULT_MODELS.ollama[0],
  baseUrl: LLM_ENDPOINTS.ollama,
};

export function useLLMSettings() {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<LLMTestResult | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] =
    useState<LLMSettingsSaveStatus>("saved");
  const changeVersionRef = useRef(0);
  const saveRequestRef = useRef(0);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        if (data.llm) {
          setConfig(data.llm);
        }
      } catch (error) {
        showErrorToast(error, {
          title: "Could not load settings",
          fallbackDescription: "Default settings are being shown.",
        });
      } finally {
        setLoading(false);
      }
    }

    void fetchSettings();
  }, [showErrorToast]);

  const updateConfig = (updates: Partial<LLMConfig>) => {
    changeVersionRef.current += 1;
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
    setSaveStatus("saving");
    setTestResult(null);
  };

  const saveSettings = useCallback(async () => {
    const saveVersion = changeVersionRef.current;
    const saveRequest = saveRequestRef.current + 1;
    saveRequestRef.current = saveRequest;
    setSaving(true);
    setSaveStatus("saving");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llm: config }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to save settings");
      }

      if (saveVersion === changeVersionRef.current) {
        setHasChanges(false);
        setSaveStatus("saved");
      }
    } catch (error) {
      if (saveVersion === changeVersionRef.current) {
        setSaveStatus("error");
        showErrorToast(error, {
          title: "Could not save settings",
          fallbackDescription: "Your changes were not saved.",
        });
      }
    } finally {
      if (saveRequest === saveRequestRef.current) {
        setSaving(false);
      }
    }
  }, [config, showErrorToast]);

  useEffect(() => {
    if (!hasChanges) return;

    const timeout = window.setTimeout(() => {
      void saveSettings();
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [hasChanges, saveSettings]);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llm: config }),
      });
      const data = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" });
        if (data.models) {
          setOllamaModels(data.models);
        }
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection failed",
        });
      }
    } catch {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };

  const availableModels: string[] =
    config.provider === "ollama" && ollamaModels.length > 0
      ? ollamaModels
      : [...(DEFAULT_MODELS[config.provider] || [])];

  return {
    config,
    loading,
    testing,
    testResult,
    saveStatus,
    availableModels,
    updateConfig,
    saveSettings,
    testConnection,
  };
}
