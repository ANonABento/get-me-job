"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Loader2,
  PanelLeft,
  PanelRight,
  Search,
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
import { getStudioSaveStatusLabel, type StudioSaveStatus } from "./save-status";
import { TemplatePreviewThumbnail } from "./template-preview-thumbnail";

interface StudioHeaderProps {
  documentMode: DocumentMode;
  draftIsSaved: boolean;
  saveStatus: StudioSaveStatus;
  templateId: string;
  canCopyHtml: boolean;
  canDownloadPdf: boolean;
  isExporting: boolean;
  onDocumentModeChange: (mode: DocumentMode) => void;
  onAiPanelToggle?: () => void;
  onFilesPanelToggle?: () => void;
  onTemplateSelect: (templateId: string) => void;
  onCopyHtml: () => void;
  onDownloadPdf: () => void;
}

interface TemplatePickerPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

export function StudioHeader({
  documentMode,
  draftIsSaved,
  saveStatus,
  templateId,
  canCopyHtml,
  canDownloadPdf,
  isExporting,
  onDocumentModeChange,
  onAiPanelToggle,
  onFilesPanelToggle,
  onTemplateSelect,
  onCopyHtml,
  onDownloadPdf,
}: StudioHeaderProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [templatePickerPosition, setTemplatePickerPosition] =
    useState<TemplatePickerPosition | null>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);
  const templates = useMemo(
    () =>
      documentMode === "cover_letter" ? COVER_LETTER_TEMPLATES : TEMPLATES,
    [documentMode],
  );
  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return templates;

    return templates.filter((template) =>
      template.name.toLowerCase().includes(query),
    );
  }, [templateSearch, templates]);
  const selectedTemplate = useMemo(
    () =>
      documentMode === "cover_letter"
        ? getCoverLetterTemplate(templateId)
        : getTemplate(templateId),
    [documentMode, templateId],
  );
  const modeLabel = DOCUMENT_MODE_LABELS[documentMode];
  const documentLabel = modeLabel.toLowerCase();
  const templateListLabel = `${modeLabel} templates`;
  const showTemplateSearch = templates.length >= 6;
  const saveStatusLabel = getStudioSaveStatusLabel(saveStatus, now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!templateOpen) setTemplateSearch("");
  }, [templateOpen]);

  useEffect(() => {
    if (!templateOpen) return;

    const positionTemplatePicker = () => {
      const trigger = templateButtonRef.current;
      if (!trigger) return;

      const viewportGutter = 16;
      const maxPickerWidth = 736;
      const triggerRect = trigger.getBoundingClientRect();
      const width = Math.min(
        maxPickerWidth,
        window.innerWidth - viewportGutter * 2,
      );
      const left = Math.min(
        Math.max(triggerRect.left, viewportGutter),
        window.innerWidth - width - viewportGutter,
      );
      const top = triggerRect.bottom + 8;

      setTemplatePickerPosition({
        left,
        top,
        width,
        maxHeight: Math.max(
          240,
          Math.min(
            window.innerHeight * 0.6,
            window.innerHeight - top - viewportGutter,
          ),
        ),
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTemplateOpen(false);
      }
    };

    positionTemplatePicker();
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", positionTemplatePicker);
    window.addEventListener("scroll", positionTemplatePicker, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", positionTemplatePicker);
      window.removeEventListener("scroll", positionTemplatePicker, true);
    };
  }, [templateOpen]);

  const templatePickerStyle: CSSProperties | undefined =
    templatePickerPosition === null
      ? undefined
      : {
          left: templatePickerPosition.left,
          top: templatePickerPosition.top,
          width: templatePickerPosition.width,
          maxHeight: templatePickerPosition.maxHeight,
        };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b-[length:var(--border-width)] bg-background/95 px-4 py-3 [backdrop-filter:var(--backdrop-blur)] md:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onFilesPanelToggle}
          aria-label="Open files panel"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <FileText className="h-5 w-5 text-primary" />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight">
            Document Studio
          </h1>
          <p className="text-xs text-muted-foreground" role="status">
            {saveStatusLabel}
          </p>
        </div>

        <div className="ml-2 flex rounded-[var(--radius)] border-[length:var(--border-width)] bg-card">
          {DOCUMENT_MODE_OPTIONS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDocumentModeChange(mode)}
              className={cn(
                "min-h-11 px-3 py-2 text-sm font-medium transition-colors",
                documentMode === mode
                  ? "rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative md:ml-4">
          <button
            ref={templateButtonRef}
            type="button"
            aria-label={`Select ${documentLabel} template`}
            aria-expanded={templateOpen}
            aria-haspopup="listbox"
            onClick={() => setTemplateOpen((prev) => !prev)}
            className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted sm:min-w-[15rem]"
          >
            <TemplatePreviewThumbnail
              template={selectedTemplate}
              className="h-20 w-14 shrink-0 rounded-[calc(var(--radius)_-_4px)]"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium leading-tight">
                {selectedTemplate.name}
              </span>
              <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                {selectedTemplate.description}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                style={templatePickerStyle}
                className="fixed left-0 top-full z-50 mt-2 flex max-h-[60vh] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] bg-popover p-2 text-popover-foreground shadow-[var(--shadow-elevated)] [backdrop-filter:var(--backdrop-blur)]"
              >
                {showTemplateSearch && (
                  <div className="relative mb-2 shrink-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={templateSearch}
                      onChange={(event) =>
                        setTemplateSearch(event.target.value)
                      }
                      placeholder="Search templates"
                      aria-label="Search templates"
                      className="h-10 w-full rounded-[var(--radius)] border-[length:var(--border-width)] bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                )}
                <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {filteredTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplate.id;
                    const selectTemplate = () => {
                      onTemplateSelect(template.id);
                      setTemplateOpen(false);
                    };

                    return (
                      <button
                        key={template.id}
                        type="button"
                        role="option"
                        aria-label={`${template.name} template`}
                        aria-selected={isSelected}
                        onClick={selectTemplate}
                        className={cn(
                          "group rounded-[var(--radius)] border-[length:var(--border-width)] bg-background p-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <TemplatePreviewThumbnail
                          template={template}
                          className="h-32"
                        />
                        <span className="mt-2 block">
                          <span className="flex items-center gap-1.5 font-medium leading-tight">
                            <span className="min-w-0 flex-1 truncate">
                              {template.name}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                            )}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                            {template.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-3 flex h-8 w-full items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)] px-3 text-xs font-medium transition-colors",
                            isSelected
                              ? "border-transparent bg-secondary text-secondary-foreground"
                              : "border-input bg-background group-hover:bg-accent group-hover:text-accent-foreground",
                          )}
                        >
                          Apply
                        </span>
                      </button>
                    );
                  })}
                  {filteredTemplates.length === 0 && (
                    <div className="col-span-2 px-2 py-8 text-center text-sm text-muted-foreground">
                      No templates found.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "hidden rounded-[var(--radius)] border-[length:var(--border-width)] px-2 py-1 text-xs font-medium lg:inline-flex",
            draftIsSaved
              ? "border-success/20 bg-success/10 text-success"
              : "border-warning/20 bg-warning/10 text-warning",
          )}
        >
          {saveStatusLabel}
        </span>
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onAiPanelToggle}
          aria-label="Open AI assistant panel"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
