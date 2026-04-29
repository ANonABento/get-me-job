"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/resume/template-data";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_MODE_OPTIONS,
  type DocumentMode,
} from "./studio-documents";

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
  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId),
    [templateId]
  );

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
                  ? "bg-primary text-primary-foreground"
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
            aria-label="Select resume template"
            onClick={() => setTemplateOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: selectedTemplate?.styles.accentColor }}
            />
            <span>{selectedTemplate?.name ?? "Template"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {templateOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setTemplateOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-lg">
                {TEMPLATES.map((template) => {
                  const isSelected = template.id === templateId;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        onTemplateSelect(template.id);
                        setTemplateOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <div
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: template.styles.accentColor }}
                      />
                      <span className="flex-1 text-left">{template.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
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
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          )}
        >
          {draftIsSaved ? "Saved" : "Unsaved"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label="Copy resume HTML"
          variant="outline"
          size="sm"
          onClick={onCopyHtml}
          disabled={!canCopyHtml}
        >
          <Copy className="h-4 w-4 md:mr-1.5" />
          <span className="hidden md:inline">Copy HTML</span>
        </Button>
        <Button
          aria-label="Download resume PDF"
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
