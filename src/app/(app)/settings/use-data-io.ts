"use client";

import { useState, type ChangeEvent } from "react";
import { useErrorToast } from "@/hooks/use-error-toast";

import { pluralize } from "@/lib/text/pluralize";

export type ExportType =
  | "profile"
  | "jobs-json"
  | "jobs-csv"
  | "backup"
  | "full-export";
export type DataImportType = "jobs" | "backup";

export interface ImportResult {
  success: boolean;
  message: string;
}

export interface ImportPreview {
  stats: Record<string, number>;
  data: unknown;
}

interface FullExportData {
  version?: string;
  data?: {
    profile?: unknown;
    jobs?: unknown[];
    coverLetters?: unknown[];
    bankEntries?: unknown[];
    generatedResumes?: unknown[];
    interviewSessions?: unknown[];
    llmConfig?: unknown;
  };
}

export function getExportFileName(
  type: ExportType,
  date: Date = new Date(),
): string {
  const formattedDate = date.toISOString().split("T")[0];

  switch (type) {
    case "profile":
      return `taida-profile-${formattedDate}.json`;
    case "jobs-json":
      return `slothing-jobs-${formattedDate}.json`;
    case "jobs-csv":
      return `slothing-jobs-${formattedDate}.csv`;
    case "backup":
      return `slothing-backup-${formattedDate}.json`;
    case "full-export":
      return `slothing-export-${formattedDate}.json`;
  }
}

export function getExportUrl(type: ExportType): string {
  switch (type) {
    case "profile":
      return "/api/export/profile?format=json";
    case "jobs-json":
      return "/api/export/jobs?format=json";
    case "jobs-csv":
      return "/api/export/jobs?format=csv";
    case "backup":
      return "/api/backup";
    case "full-export":
      return "/api/export";
  }
}

export function buildImportPreviewStats(
  data: FullExportData,
): Record<string, number> {
  const stats: Record<string, number> = {};

  if (data.data?.profile) stats["Profile"] = 1;
  if (data.data?.jobs?.length) stats["Jobs"] = data.data.jobs.length;
  if (data.data?.coverLetters?.length)
    stats["Cover Letters"] = data.data.coverLetters.length;
  if (data.data?.bankEntries?.length)
    stats["Bank Entries"] = data.data.bankEntries.length;
  if (data.data?.generatedResumes?.length)
    stats["Generated Resumes"] = data.data.generatedResumes.length;
  if (data.data?.interviewSessions?.length)
    stats["Interview Sessions"] = data.data.interviewSessions.length;
  if (data.data?.llmConfig) stats["LLM Config"] = 1;

  return stats;
}

export function buildFullImportMessage(result: {
  results: {
    profile?: boolean;
    jobs: { imported: number };
    coverLetters?: { imported: number };
    bankEntries?: { imported: number };
    llmConfig?: boolean;
  };
}): string {
  const parts: string[] = [];

  if (result.results.profile) parts.push("Profile");
  if (result.results.jobs.imported > 0) {
    parts.push(pluralize(result.results.jobs.imported, "job"));
  }
  if (
    result.results.coverLetters?.imported &&
    result.results.coverLetters.imported > 0
  ) {
    parts.push(`${result.results.coverLetters.imported} cover letters`);
  }
  if (
    result.results.bankEntries?.imported &&
    result.results.bankEntries.imported > 0
  ) {
    parts.push(`${result.results.bankEntries.imported} bank entries`);
  }
  if (result.results.llmConfig) parts.push("LLM config");

  return parts.length > 0
    ? `Imported: ${parts.join(", ")}`
    : "No new data to import (all duplicates skipped)";
}

export function useDataIO() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportPreview, setShowImportPreview] =
    useState<ImportPreview | null>(null);
  const showErrorToast = useErrorToast();

  const exportData = async (type: ExportType) => {
    setExporting(type);

    try {
      const response = await fetch(getExportUrl(type));

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = getExportFileName(type);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not export data",
        fallbackDescription: "Please try the export again.",
      });
      setImportResult({ success: false, message: "Export failed" });
    } finally {
      setExporting(null);
    }
  };

  const handleFullImportPreview = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text) as FullExportData;

      if (!data.version || !data.data) {
        setShowImportPreview(null);
        setImportResult({
          success: false,
          message: "Invalid export file format",
        });
        return;
      }

      setShowImportPreview({ stats: buildImportPreviewStats(data), data });
    } catch {
      setShowImportPreview(null);
      setImportResult({
        success: false,
        message: "Failed to parse import file",
      });
    } finally {
      event.target.value = "";
    }
  };

  const confirmFullImport = async () => {
    if (!showImportPreview) {
      return;
    }

    setImporting(true);
    setImportResult(null);
    setShowImportPreview(null);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(showImportPreview.data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportResult({
        success: true,
        message: buildFullImportMessage(result),
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : "Import failed",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async (
    event: ChangeEvent<HTMLInputElement>,
    type: DataImportType,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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

        if (!response.ok) {
          throw new Error(result.error || "Restore failed");
        }

        setImportResult({
          success: true,
          message: `Restored: ${result.results.profile ? "Profile" : ""} ${pluralize(result.results.jobs.imported, "job")} imported`,
        });

        return;
      }

      const isCsv = file.name.endsWith(".csv");

      if (isCsv) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/import/jobs", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Import failed");
        }

        setImportResult({ success: true, message: result.message });
        return;
      }

      const text = await file.text();
      const data = JSON.parse(text);
      const response = await fetch("/api/import/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportResult({ success: true, message: result.message });
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

  return {
    exporting,
    importing,
    importResult,
    showImportPreview,
    exportData,
    handleFileImport,
    handleFullImportPreview,
    confirmFullImport,
    clearImportPreview: () => setShowImportPreview(null),
  };
}
