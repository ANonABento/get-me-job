"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COVER_LETTER_TEMPLATES,
  getCoverLetterTemplate,
} from "@/lib/builder/cover-letter-document";
import { getTemplate, TEMPLATES } from "@/lib/resume/template-data";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_MODE_LABELS,
  DOCUMENT_MODE_OPTIONS,
  type DocumentMode,
} from "./studio-documents";
import { TemplatePreviewThumbnail } from "./template-preview-thumbnail";

interface StudioHeaderProps {
  documentMode: DocumentMode;
  draftIsSaved: boolean;
  templateId: string;
  canCopyHtml: boolean;
  canDownloadPdf: boolean;
  isExporting: boolean;
  onDocumentModeChange: (mode: DocumentMode) => void;
  onTemplateSelect: (templateId: string) => void;
  onCopyHtml: () => void;
  onDownloadPdf: () => void;
}

export function StudioHeader({
  documentMode,
  draftIsSaved,
  templateId,
  canCopyHtml,
  canDownloadPdf,
  isExporting,
  onDocumentModeChange,
  onTemplateSelect,
  onCopyHtml,
  onDownloadPdf,
}: StudioHeaderProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const templates = useMemo(
    () =>
      documentMode === "cover_letter" ? COVER_LETTER_TEMPLATES : TEMPLATES,
    [documentMode]
  );
  const selectedTemplate = useMemo(
    () =>
      documentMode === "cover_letter"
        ? getCoverLetterTemplate(templateId)
        : getTemplate(templateId),
    [documentMode, templateId]
  );
  const modeLabel = DOCUMENT_MODE_LABELS[documentMode];
  const documentLabel = modeLabel.toLowerCase();
  const templateListLabel = `${modeLabel} templates`;

  useEffect(() => {
    if (!templateOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTemplateOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [templateOpen]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Document Studio</h1>

        <div className="ml-2 flex rounded-md border">
          {DOCUMENT_MODE_OPTIONS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDocumentModeChange(mode)}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
                documentMode === mode
                  ? "rounded-md bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative md:ml-4">
          <button
            type="button"
            aria-label={`Select ${documentLabel} template`}
            aria-expanded={templateOpen}
            aria-haspopup="listbox"
            onClick={() => setTemplateOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <TemplatePreviewThumbnail
              template={selectedTemplate}
              className="h-7 w-5 shrink-0 rounded-sm"
            />
            <span>{selectedTemplate.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {templateOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setTemplateOpen(false)}
              />
              <div
                role="listbox"
                aria-label={templateListLabel}
                className="absolute left-0 top-full z-50 mt-2 grid max-h-[70vh] w-[min(26rem,calc(100vw-2rem))] grid-cols-2 gap-2 overflow-auto rounded-lg border bg-popover p-2 shadow-lg sm:grid-cols-3"
              >
                {templates.map((template) => {
                  const isSelected = template.id === selectedTemplate.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onTemplateSelect(template.id);
                        setTemplateOpen(false);
                      }}
                      className={cn(
                        "rounded-md border p-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      )}
                    >
                      <TemplatePreviewThumbnail template={template} />
                      <span className="mt-2 flex items-center gap-1.5 font-medium">
                        <span className="min-w-0 flex-1 truncate">
                          {template.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            draftIsSaved
              ? "border-success/20 bg-success/10 text-success"
              : "border-warning/20 bg-warning/10 text-warning"
          )}
        >
          {draftIsSaved ? "Saved" : "Unsaved"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label={`Copy ${documentLabel} HTML`}
          variant="outline"
          size="sm"
          onClick={onCopyHtml}
          disabled={!canCopyHtml}
        >
          <Copy className="h-4 w-4 md:mr-1.5" />
          <span className="hidden md:inline">Copy HTML</span>
        </Button>
        <Button
          aria-label={`Download ${documentLabel} PDF`}
          size="sm"
          onClick={onDownloadPdf}
          disabled={!canDownloadPdf || isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" />
          ) : (
            <Download className="h-4 w-4 md:mr-1.5" />
          )}
          <span className="hidden md:inline">Download PDF</span>
        </Button>
      </div>
    </div>
  );
}
