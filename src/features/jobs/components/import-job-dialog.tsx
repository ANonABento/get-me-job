"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImportJobCsvPreviewStep } from "@/features/jobs/components/import-job-csv-preview-step";
import { ImportJobEditStep } from "@/features/jobs/components/import-job-edit-step";
import { ImportJobInputStep } from "@/features/jobs/components/import-job-input-step";
import { ImportJobPreviewStep } from "@/features/jobs/components/import-job-preview-step";
import { useImportJobDialog } from "@/features/jobs/hooks/use-import-job-dialog";
import { AlertCircle, Edit2, FileDown, Sparkles } from "lucide-react";

interface ImportJobDialogProps {
  onJobImported: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const STEP_META = {
  input: {
    description: "Paste job content from LinkedIn, Indeed, or any job board.",
    title: "Import Job",
  },
  preview: {
    description: "Review the parsed job details. Click Edit to make changes.",
    title: "Review Import",
  },
  edit: {
    description: "Make corrections to the parsed job details.",
    title: "Edit Job Details",
  },
  "csv-preview": {
    description: "Review the CSV import summary before saving the valid jobs.",
    title: "Review CSV Import",
  },
} as const;

export function ImportJobDialog({
  onJobImported,
  onOpenChange,
  open,
}: ImportJobDialogProps) {
  const {
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
    saveCsvJobs,
    saveJobPreview,
    saving,
    setImportMode,
    setJobText,
    setJobUrl,
    setStep,
    step,
    updateField,
  } = useImportJobDialog({
    onJobImported,
    onOpenChange,
  });

  const stepMeta = STEP_META[step];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "input" && <FileDown className="h-5 w-5 text-primary" />}
            {step === "preview" && <Sparkles className="h-5 w-5 text-primary" />}
            {step === "edit" && <Edit2 className="h-5 w-5 text-primary" />}
            {step === "csv-preview" && <FileDown className="h-5 w-5 text-primary" />}
            {stepMeta.title}
          </DialogTitle>
          <DialogDescription>
            {stepMeta.description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "input" && (
          <ImportJobInputStep
            csvFileName={csvFileName}
            fetchingUrl={fetchingUrl}
            hasCsvContent={Boolean(csvContent.trim())}
            importMode={importMode}
            jobText={jobText}
            jobUrl={jobUrl}
            onClose={() => handleOpenChange(false)}
            onFetchFromUrl={fetchFromUrl}
            onHandleCsvFile={handleCsvFile}
            onImportModeChange={setImportMode}
            onJobTextChange={setJobText}
            onJobUrlChange={setJobUrl}
            onParseCsv={parseCsv}
            onParseJob={parseJobText}
            parsing={parsing}
          />
        )}

        {step === "preview" && editedPreview && (
          <ImportJobPreviewStep
            onBack={() => setStep("input")}
            onClose={() => handleOpenChange(false)}
            onEdit={() => setStep("edit")}
            onSave={saveJobPreview}
            preview={editedPreview}
            saving={saving}
          />
        )}

        {step === "edit" && editedPreview && (
          <ImportJobEditStep
            onBack={() => setStep("preview")}
            onClose={() => handleOpenChange(false)}
            onSave={saveJobPreview}
            onUpdateField={updateField}
            preview={editedPreview}
            saving={saving}
          />
        )}

        {step === "csv-preview" && csvPreview && (
          <ImportJobCsvPreviewStep
            onBack={() => setStep("input")}
            onClose={() => handleOpenChange(false)}
            onSave={saveCsvJobs}
            preview={csvPreview}
            saving={saving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
