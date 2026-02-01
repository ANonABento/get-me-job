"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LLMConfig } from "@/types";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const PROVIDERS = [
  { value: "ollama", label: "Ollama (Local)", requiresKey: false },
  { value: "openai", label: "OpenAI", requiresKey: true },
  { value: "anthropic", label: "Anthropic", requiresKey: true },
  { value: "openrouter", label: "OpenRouter", requiresKey: true },
];

const DEFAULT_MODELS: Record<string, string[]> = {
  ollama: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"],
  openrouter: ["meta-llama/llama-3.2-3b-instruct:free", "google/gemma-2-9b-it:free"],
};

export default function SettingsPage() {
  const [config, setConfig] = useState<LLMConfig>({
    provider: "ollama",
    model: "llama3.2",
    baseUrl: "http://localhost:11434",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.llm) {
        setConfig(data.llm);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llm: config }),
      });
      setTestResult({ success: true, message: "Settings saved!" });
    } catch (error) {
      setTestResult({ success: false, message: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

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
        setTestResult({ success: false, message: data.error || "Connection failed" });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === config.provider);
  const models = config.provider === "ollama" && ollamaModels.length > 0
    ? ollamaModels
    : DEFAULT_MODELS[config.provider] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your AI provider for resume parsing and interview preparation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Choose how Columbus will process your documents and generate content.
            Use Ollama for free local processing, or connect your own API key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <select
              value={config.provider}
              onChange={(e) => {
                const provider = e.target.value as LLMConfig["provider"];
                setConfig({
                  ...config,
                  provider,
                  model: DEFAULT_MODELS[provider]?.[0] || "",
                  apiKey: provider === "ollama" ? undefined : config.apiKey,
                });
                setTestResult(null);
              }}
              className="w-full rounded-md border px-3 py-2"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key (if required) */}
          {selectedProvider?.requiresKey && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={config.apiKey || ""}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={`Enter your ${selectedProvider.label} API key`}
              />
            </div>
          )}

          {/* Base URL (for Ollama) */}
          {config.provider === "ollama" && (
            <div className="space-y-2">
              <Label>Ollama URL</Label>
              <Input
                value={config.baseUrl || "http://localhost:11434"}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-muted-foreground">
                Default is http://localhost:11434. Change if Ollama is running elsewhere.
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Model</Label>
            <div className="flex gap-2">
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="flex-1 rounded-md border px-3 py-2"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {config.provider === "ollama" && (
                <Button variant="outline" size="icon" onClick={testConnection}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {config.provider === "ollama" && (
              <p className="text-xs text-muted-foreground">
                Click refresh to load available models from Ollama
              </p>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={testConnection} variant="outline" disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Using Ollama (Free)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Install Ollama from <a href="https://ollama.ai" className="text-primary underline" target="_blank">ollama.ai</a></p>
            <p>2. Run <code className="bg-muted px-1 rounded">ollama pull llama3.2</code> in terminal</p>
            <p>3. Ollama runs automatically in the background</p>
            <p>4. Test the connection above to verify it&apos;s working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Using API Keys</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              If you have API keys for OpenAI, Anthropic, or OpenRouter, you can use them here.
              Your keys are stored locally and never sent to our servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
