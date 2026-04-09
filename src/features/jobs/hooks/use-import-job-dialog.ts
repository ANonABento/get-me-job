"use client";

import { useState } from "react";
import type {
  CSVPreview,
  JobImportMode,
  JobImportStep,
  ParsedJobPreview,
} from "@/features/jobs/client-types";
import {
  fetchImportedJobFromUrl,
  parseImportedCsv,
  parseImportedJob,
  saveImportedCsvJobs,
  saveImportedJob,
} from "@/features/jobs/api";

interface UseImportJobDialogOptions {
  onJobImported: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useImportJobDialog({
  onJobImported,
  onOpenChange,
}: UseImportJobDialogOptions) {
  const [step, setStep] = useState<JobImportStep>("input");
  const [importMode, setImportMode] = useState<JobImportMode>("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedJobPreview | null>(null);
  const [editedPreview, setEditedPreview] = useState<ParsedJobPreview | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);

  function resetDialog() {
    setStep("input");
    setImportMode("text");
    setJobText("");
    setJobUrl("");
    setCsvContent("");
    setCsvFileName("");
    setParsing(false);
    setFetchingUrl(false);
    setSaving(false);
    setError(null);
    setPreview(null);
    setEditedPreview(null);
    setCsvPreview(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  }

  async function fetchFromUrl() {
    if (!jobUrl.trim()) {
      setError("Please enter a job URL");
      return;
    }

    try {
      new URL(jobUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setFetchingUrl(true);
    setError(null);

    try {
      const nextPreview = await fetchImportedJobFromUrl(jobUrl);
      setPreview(nextPreview);
      setEditedPreview(nextPreview);
      setStep("preview");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to fetch job from URL");
    } finally {
      setFetchingUrl(false);
    }
  }

  async function parseJobText() {
    if (!jobText.trim()) {
      setError("Please paste job content to import");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const nextPreview = await parseImportedJob(jobText, jobUrl || undefined);
      setPreview(nextPreview);
      setEditedPreview(nextPreview);
      setStep("preview");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to parse job content");
    } finally {
      setParsing(false);
    }
  }

  function handleCsvFile(file: File | null) {
    if (!file) {
      return;
    }

    setCsvFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  }

  async function parseCsv() {
    if (!csvContent.trim()) {
      setError("Please upload a CSV file");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const nextPreview = await parseImportedCsv(csvContent);
      setCsvPreview(nextPreview);
      setStep("csv-preview");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to parse CSV");
    } finally {
      setParsing(false);
    }
  }

  async function saveCsvJobs() {
    if (!csvPreview || csvPreview.jobs.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveImportedCsvJobs(csvPreview.jobs);
      onJobImported();
      handleOpenChange(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to import jobs");
    } finally {
      setSaving(false);
    }
  }

  async function saveJobPreview() {
    if (!editedPreview) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveImportedJob(editedPreview, jobUrl);
      onJobImported();
      handleOpenChange(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ParsedJobPreview>(
    field: K,
    value: ParsedJobPreview[K]
  ) {
    if (!editedPreview) {
      return;
    }

    setEditedPreview({ ...editedPreview, [field]: value });
  }

  return {
    csvContent,
    csvFileName,
    csvPreview,
    editedPreview,
    error,
    fetchFromUrl,
    fetchingUrl,
    handleCsvFile,
    handleOpenChange,
    importMode,
    jobText,
    jobUrl,
    parseCsv,
    parseJobText,
    parsing,
    preview,
    saveCsvJobs,
    saveJobPreview,
    saving,
    setImportMode,
    setJobText,
    setJobUrl,
    setStep,
    step,
    updateField,
  };
}
