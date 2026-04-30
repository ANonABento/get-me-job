"use client";

import {
  useEffect,
  useId,
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
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COVER_LETTER_TEMPLATES,
  getCoverLetterTemplate,
} from "@/lib/builder/cover-letter-document";
import { getTemplate, TEMPLATES } from "@/lib/resume/template-data";
import type { ResumeScoreResult } from "@/lib/resume/scoring";
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
  resumeScore?: ResumeScoreResult | null;
  onDocumentModeChange: (mode: DocumentMode) => void;
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

type ResumeScoreVariant = "success" | "warning" | "destructive";
type ResumeScoreBreakdownItem = readonly [label: string, score: number];

function getResumeScoreVariant(score: number): ResumeScoreVariant {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "destructive";
}

function getResumeScoreBreakdown(
  resumeScore: ResumeScoreResult,
): ResumeScoreBreakdownItem[] {
  return [
    ["Completeness", resumeScore.breakdown.completeness],
    ["Keywords", resumeScore.breakdown.keywordDensity],
    ["Length", resumeScore.breakdown.length],
    ["Action verbs", resumeScore.breakdown.actionVerbs],
    ["Metrics", resumeScore.breakdown.quantifiedAchievements],
  ];
}

export function StudioHeader({
  documentMode,
  draftIsSaved,
  templateId,
  canCopyHtml,
  canDownloadPdf,
  isExporting,
  resumeScore,
  onDocumentModeChange,
  onTemplateSelect,
  onCopyHtml,
  onDownloadPdf,
}: StudioHeaderProps) {
  const resumeScoreBreakdownId = useId();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templatePickerPosition, setTemplatePickerPosition] =
    useState<TemplatePickerPosition | null>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);
  const templates = useMemo(
    () =>
      documentMode === "cover_letter" ? COVER_LETTER_TEMPLATES : TEMPLATES,
    [documentMode],
  );
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
  const scoreBreakdown = resumeScore
    ? getResumeScoreBreakdown(resumeScore)
    : [];

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
        maxHeight: Math.max(240, window.innerHeight - top - viewportGutter),
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
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Document Studio</h1>

        <div className="ml-2 flex rounded-[var(--radius)] border-[length:var(--border-width)] bg-card">
          {DOCUMENT_MODE_OPTIONS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDocumentModeChange(mode)}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
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
            className="flex min-w-[15rem] items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] bg-card px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted"
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
                className="fixed left-0 top-full z-50 mt-2 grid max-h-[70vh] w-[min(26rem,calc(100vw-2rem))] grid-cols-2 gap-2 overflow-auto rounded-[var(--radius)] border-[length:var(--border-width)] bg-popover p-2 text-popover-foreground shadow-[var(--shadow-elevated)] [backdrop-filter:var(--backdrop-blur)] sm:grid-cols-3"
              >
                {templates.map((template) => {
                  const isSelected = template.id === selectedTemplate.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      role="option"
                      aria-label={`${template.name} template`}
                      aria-selected={isSelected}
                      onClick={() => {
                        onTemplateSelect(template.id);
                        setTemplateOpen(false);
                      }}
                      className={cn(
                        "rounded-[var(--radius)] border-[length:var(--border-width)] p-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background",
                      )}
                    >
                      <TemplatePreviewThumbnail
                        template={template}
                        className="h-36 transition-all duration-150 group-hover:h-56 group-hover:shadow-xl group-focus-visible:h-56 group-focus-visible:shadow-xl"
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
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <span
          className={cn(
            "rounded-[var(--radius)] border-[length:var(--border-width)] px-2 py-0.5 text-xs font-medium",
            draftIsSaved
              ? "border-success/20 bg-success/10 text-success"
              : "border-warning/20 bg-warning/10 text-warning",
          )}
        >
          {draftIsSaved ? "Saved" : "Unsaved"}
        </span>

        {resumeScore && (
          <div className="group relative">
            <Badge
              variant={getResumeScoreVariant(resumeScore.overall)}
              tabIndex={0}
              aria-describedby={resumeScoreBreakdownId}
              className="gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Resume score {resumeScore.overall}
            </Badge>
            <div
              id={resumeScoreBreakdownId}
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-64 rounded-[var(--radius)] border-[length:var(--border-width)] bg-popover p-3 text-xs text-popover-foreground shadow-[var(--shadow-elevated)] group-focus-within:block group-hover:block"
            >
              <div className="mb-2 flex items-center justify-between gap-2 font-medium">
                <span>Score breakdown</span>
                <span>{resumeScore.overall}/100</span>
              </div>
              <dl className="space-y-1.5">
                {scoreBreakdown.map(([label, score]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{score}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-muted-foreground">
                {resumeScore.stats.matchedKeywordCount}/
                {resumeScore.stats.totalKeywordCount} keywords matched,{" "}
                {resumeScore.stats.quantifiedAchievementCount} metrics found.
              </p>
            </div>
          </div>
        )}
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
