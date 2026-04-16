"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LLMConfig } from "@/types";
import { DEFAULT_MODELS, LLM_ENDPOINTS } from "@/lib/constants";
import {
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Settings,
  Cpu,
  Cloud,
  Key,
  Zap,
  Server,
  ExternalLink,
  Shield,
  Sparkles,
  AlertCircle,
  Download,
  Upload,
  Database,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  Calendar,
  FolderOpen,
  Mail,
  FileText,
} from "lucide-react";
import { GoogleConnectButton } from "@/components/google";

interface Provider {
  value: LLMConfig["provider"];
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresKey: boolean;
  color: string;
}

const FEATURE_DESCRIPTIONS = [
  {
    title: "Resume Parsing",
    description: "Extract skills, experience, and education from uploaded resumes automatically",
    icon: <FileText className="h-4 w-4 text-blue-600" />,
    color: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Resume Tailoring",
    description: "Generate job-specific resumes optimized for ATS and recruiter review",
    icon: <Sparkles className="h-4 w-4 text-amber-600" />,
    color: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    title: "Cover Letters",
    description: "Create personalized cover letters matching your profile to job requirements",
    icon: <Mail className="h-4 w-4 text-rose-600" />,
    color: "bg-rose-100 dark:bg-rose-900/30",
  },
];

const PROVIDERS: Provider[] = [
  {
    value: "ollama",
    label: "Ollama",
    description: "Free, local AI processing",
    icon: <Cpu className="h-5 w-5" />,
    requiresKey: false,
    color: "from-violet-500 to-purple-400",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT-4 & GPT-3.5 models",
    icon: <Sparkles className="h-5 w-5" />,
    requiresKey: true,
    color: "from-rose-400 to-orange-400",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Claude models",
    icon: <Zap className="h-5 w-5" />,
    requiresKey: true,
    color: "from-amber-400 to-orange-400",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Access multiple providers",
    icon: <Cloud className="h-5 w-5" />,
    requiresKey: true,
    color: "from-indigo-500 to-violet-400",
  },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<LLMConfig>({
    provider: "ollama",
    model: DEFAULT_MODELS.ollama[0],
    baseUrl: LLM_ENDPOINTS.ollama,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const updateConfig = (updates: Partial<LLMConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
    setTestResult(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llm: config }),
      });
      setTestResult({ success: true, message: "Settings saved successfully!" });
      setHasChanges(false);
    } catch {
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
    } catch {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };

  const exportData = async (type: "profile" | "jobs-json" | "jobs-csv" | "backup") => {
    setExporting(type);
    try {
      let url = "";
      let filename = "";

      switch (type) {
        case "profile":
          url = "/api/export/profile?format=json";
          filename = `get-me-job-profile-${new Date().toISOString().split("T")[0]}.json`;
          break;
        case "jobs-json":
          url = "/api/export/jobs?format=json";
          filename = `get-me-job-jobs-${new Date().toISOString().split("T")[0]}.json`;
          break;
        case "jobs-csv":
          url = "/api/export/jobs?format=csv";
          filename = `get-me-job-jobs-${new Date().toISOString().split("T")[0]}.csv`;
          break;
        case "backup":
          url = "/api/backup";
          filename = `get-me-job-backup-${new Date().toISOString().split("T")[0]}.json`;
          break;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      setImportResult({ success: false, message: "Export failed" });
    } finally {
      setExporting(null);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>, type: "jobs" | "backup") => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      if (type === "backup") {
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await fetch("/api/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
          setImportResult({
            success: true,
            message: `Restored: ${result.results.profile ? "Profile" : ""} ${result.results.jobs.imported} jobs imported`,
          });
        } else {
          throw new Error(result.error || "Restore failed");
        }
      } else {
        // Jobs import
        const isCSV = file.name.endsWith(".csv");

        if (isCSV) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/import/jobs", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (response.ok) {
            setImportResult({
              success: true,
              message: result.message,
            });
          } else {
            throw new Error(result.error || "Import failed");
          }
        } else {
          const text = await file.text();
          const data = JSON.parse(text);

          const response = await fetch("/api/import/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          if (response.ok) {
            setImportResult({
              success: true,
              message: result.message,
            });
          } else {
            throw new Error(result.error || "Import failed");
          }
        }
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
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === config.provider);
  const models =
    config.provider === "ollama" && ollamaModels.length > 0
      ? ollamaModels
      : DEFAULT_MODELS[config.provider] || [];

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
      {/* Hero Section */}
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

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Provider Selection */}
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
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.value}
                  onClick={() => {
                    updateConfig({
                      provider: provider.value,
                      model: DEFAULT_MODELS[provider.value]?.[0] || "",
                      apiKey: provider.value === "ollama" ? undefined : config.apiKey,
                    });
                  }}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    config.provider === provider.value
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${provider.color} text-white shrink-0`}
                  >
                    {provider.icon}
                  </div>
                  <div>
                    <p className="font-medium">{provider.label}</p>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                  {config.provider === provider.value && (
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Configuration */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">{selectedProvider?.label} Configuration</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedProvider?.requiresKey
                    ? "Enter your API key and select a model"
                    : "Configure your local Ollama instance"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key */}
              {selectedProvider?.requiresKey && (
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={config.apiKey || ""}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    placeholder={`Enter your ${selectedProvider.label} API key`}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Your key is stored locally and never sent to our servers
                  </p>
                </div>
              )}

              {/* Ollama URL */}
              {config.provider === "ollama" && (
                <div className="space-y-2">
                  <Label>Ollama URL</Label>
                  <Input
                    value={config.baseUrl || "http://localhost:11434"}
                    onChange={(e) => updateConfig({ baseUrl: e.target.value })}
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
                  <Select value={config.model} onValueChange={(v) => updateConfig({ model: v })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {config.provider === "ollama" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={testConnection}
                      disabled={testing}
                      title="Refresh available models"
                    >
                      <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
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
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    testResult.success
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0" />
                  )}
                  <span className="font-medium">{testResult.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={testing}
                  className="flex-1"
                >
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
                <Button
                  onClick={saveSettings}
                  disabled={saving || !hasChanges}
                  className="flex-1 gradient-bg text-white hover:opacity-90"
                >
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

          {/* What AI Powers */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">What AI Powers</h2>
                <p className="text-sm text-muted-foreground">
                  Your configured provider enables these features
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {FEATURE_DESCRIPTIONS.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className={`p-2 rounded-lg ${feature.color} shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-success/10 text-success">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Using Ollama (Free)</h3>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Install from{" "}
                  <a
                    href="https://ollama.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    ollama.ai <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ollama pull llama3.2</code>
                </li>
                <li>Test the connection above</li>
              </ol>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Key className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Using API Keys</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your own API keys from OpenAI, Anthropic, or OpenRouter for cloud-based processing. Your keys are stored locally and never leave your device.
              </p>
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Data Management</h2>
                <p className="text-sm text-muted-foreground">
                  Export your data or import from backups
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Export Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => exportData("profile")}
                    disabled={!!exporting}
                    className="justify-start"
                  >
                    {exporting === "profile" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    Export Profile (JSON)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportData("jobs-json")}
                    disabled={!!exporting}
                    className="justify-start"
                  >
                    {exporting === "jobs-json" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileJson className="h-4 w-4 mr-2 text-green-500" />
                    )}
                    Export Jobs (JSON)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportData("jobs-csv")}
                    disabled={!!exporting}
                    className="justify-start"
                  >
                    {exporting === "jobs-csv" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" />
                    )}
                    Export Jobs (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportData("backup")}
                    disabled={!!exporting}
                    className="justify-start"
                  >
                    {exporting === "backup" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <HardDrive className="h-4 w-4 mr-2 text-violet-500" />
                    )}
                    Full Backup
                  </Button>
                </div>
              </div>

              {/* Import Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import Data
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => handleFileImport(e, "jobs")}
                      disabled={importing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Button
                      variant="outline"
                      disabled={importing}
                      className="w-full justify-start pointer-events-none"
                    >
                      {importing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileJson className="h-4 w-4 mr-2 text-blue-500" />
                      )}
                      Import Jobs (JSON/CSV)
                    </Button>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileImport(e, "backup")}
                      disabled={importing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Button
                      variant="outline"
                      disabled={importing}
                      className="w-full justify-start pointer-events-none"
                    >
                      {importing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <HardDrive className="h-4 w-4 mr-2 text-violet-500" />
                      )}
                      Restore Backup
                    </Button>
                  </div>
                </div>
              </div>

              {/* Import Result */}
              {importResult && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    importResult.success
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0" />
                  )}
                  <span className="font-medium">{importResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Google Integration */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 text-white">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Google Integration</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your Google account to sync calendars, store documents, and more
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <GoogleConnectButton />

              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-3">Connected features:</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Calendar Sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderOpen className="h-4 w-4 text-yellow-500" />
                    <span>Drive Backup</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-red-500" />
                    <span>Gmail Import</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Connect your Google account to enable these features. Your data stays private and secure.
                </p>
              </div>
            </div>
          </div>

          {/* Warning for Ollama */}
          {config.provider === "ollama" && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">Make sure Ollama is running</p>
                <p className="text-amber-700/80 dark:text-amber-300/80 mt-1">
                  Ollama must be running in the background for Get Me Job to work. If you get connection errors, start Ollama from your Applications folder.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
