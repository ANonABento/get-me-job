"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchJobFromUrl,
  parseCsvContent,
  parseJobText,
  saveCsvJobs,
  saveParsedJob,
} from "./import-job-api";
import { ImportJobCsvMode } from "./import-job-csv-mode";
import { ImportJobCsvPreview } from "./import-job-csv-preview";
import { ImportJobEditForm } from "./import-job-edit-form";
import { ImportJobError } from "./import-job-error";
import { ImportJobPreview } from "./import-job-preview";
import { ImportJobTextMode } from "./import-job-text-mode";
import { ImportJobUrlMode } from "./import-job-url-mode";
import { ImportModeTabs } from "./import-mode-tabs";
import type {
  CSVPreview,
  ImportJobDialogProps,
  ImportMode,
  ImportStep,
  ParsedJobPreview,
} from "./import-job-dialog.types";

const STEP_COPY: Record<ImportStep, { title: string; description: string }> = {
  input: {
    title: "Import Job",
    description: "Paste job content from LinkedIn, Indeed, or any job board.",
  },
  preview: {
    title: "Review Import",
    description: "Review the parsed job details. Click Edit to make changes.",
  },
  edit: {
    title: "Edit Job Details",
    description: "Make corrections to the parsed job details.",
  },
  "csv-preview": {
    title: "Review CSV Import",
    description: "Review the parsed CSV rows before importing jobs.",
  },
};

export function ImportJobDialog({
  open,
  onOpenChange,
  onJobImported,
}: ImportJobDialogProps) {
  const [step, setStep] = useState<ImportStep>("input");
  const [importMode, setImportMode] = useState<ImportMode>("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedPreview, setEditedPreview] = useState<ParsedJobPreview | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);

  const resetDialog = () => {
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
    setEditedPreview(null);
    setCsvPreview(null);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      resetDialog();
    }
    onOpenChange(openState);
  };

  const handleModeChange = (mode: ImportMode) => {
    setImportMode(mode);
    setError(null);
  };

  const fetchFromUrl = async () => {
    const trimmedUrl = jobUrl.trim();
    if (!trimmedUrl) {
      setError("Please enter a job URL");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setFetchingUrl(true);
    setError(null);

    try {
      const nextPreview = await fetchJobFromUrl(trimmedUrl);
      setEditedPreview(nextPreview);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job from URL");
    } finally {
      setFetchingUrl(false);
    }
  };

  const parseJob = async () => {
    const trimmedText = jobText.trim();
    if (!trimmedText) {
      setError("Please paste job content to import");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const nextPreview = await parseJobText(trimmedText, jobUrl);
      setEditedPreview(nextPreview);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse job content");
    } finally {
      setParsing(false);
    }
  };

  const handleCsvFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCsvContent("");
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      setCsvContent(typeof result === "string" ? result : "");
    };
    reader.onerror = () => {
      setCsvFileName("");
      setCsvContent("");
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const parseCSV = async () => {
    if (!csvContent.trim()) {
      setError("Please upload a CSV file");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const nextPreview = await parseCsvContent(csvContent);
      setCsvPreview(nextPreview);
      setStep("csv-preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      setParsing(false);
    }
  };

  const saveCSVJobs = async () => {
    if (!csvPreview || csvPreview.jobs.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      await saveCsvJobs(csvPreview.jobs);
      onJobImported();
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import jobs");
    } finally {
      setSaving(false);
    }
  };

  const saveJob = async () => {
    if (!editedPreview) return;

    setSaving(true);
    setError(null);

    try {
      await saveParsedJob(editedPreview, jobUrl);
      onJobImported();
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ParsedJobPreview>(
    field: K,
    value: ParsedJobPreview[K]
  ) => {
    setEditedPreview((current) => {
      if (!current) return current;
      return { ...current, [field]: value };
    });
  };

  const copy = STEP_COPY[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {error && <ImportJobError message={error} />}

        {step === "input" && (
          <div className="space-y-4 py-4">
            <ImportModeTabs value={importMode} onChange={handleModeChange} />

            {importMode === "url" && (
              <ImportJobUrlMode
                jobUrl={jobUrl}
                fetchingUrl={fetchingUrl}
                onJobUrlChange={setJobUrl}
                onCancel={() => handleClose(false)}
                onFetch={fetchFromUrl}
              />
            )}

            {importMode === "csv" && (
              <ImportJobCsvMode
                csvContent={csvContent}
                csvFileName={csvFileName}
                parsing={parsing}
                onFileChange={handleCsvFile}
                onCancel={() => handleClose(false)}
                onParse={parseCSV}
              />
            )}

            {importMode === "text" && (
              <ImportJobTextMode
                jobUrl={jobUrl}
                jobText={jobText}
                parsing={parsing}
                onJobUrlChange={setJobUrl}
                onJobTextChange={setJobText}
                onCancel={() => handleClose(false)}
                onParse={parseJob}
              />
            )}
          </div>
        )}

        {step === "preview" && editedPreview && (
          <ImportJobPreview
            preview={editedPreview}
            saving={saving}
            onBack={() => setStep("input")}
            onCancel={() => handleClose(false)}
            onEdit={() => setStep("edit")}
            onSave={saveJob}
          />
        )}

        {step === "edit" && editedPreview && (
          <ImportJobEditForm
            preview={editedPreview}
            saving={saving}
            onFieldChange={updateField}
            onBack={() => setStep("preview")}
            onCancel={() => handleClose(false)}
            onSave={saveJob}
          />
        )}

        {step === "csv-preview" && csvPreview && (
          <ImportJobCsvPreview
            preview={csvPreview}
            saving={saving}
            onBack={() => setStep("input")}
            onCancel={() => handleClose(false)}
            onSave={saveCSVJobs}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
