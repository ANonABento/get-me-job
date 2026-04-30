"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { CheckCircle2, FileText, PenLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeEditor } from "@/lib/editor/resume-editor";
import {
  getTemplateForDocumentMode,
  TEMPLATES,
} from "@/lib/resume/template-data";
import type { TipTapJSONContent } from "@/lib/editor/types";
import type { DocumentMode } from "./studio-documents";

const PAGE_WIDTH_PX = 816; // 8.5in at 96dpi
const PAGE_HEIGHT_PX = 1056; // 11in at 96dpi

export interface ResumePreviewProps {
  templateId: string;
  html?: string;
  content?: TipTapJSONContent;
  documentMode?: DocumentMode;
  onContentChange?: (content: TipTapJSONContent) => void;
  onAddSection?: () => void;
  onAddFromBank?: () => void;
}

interface PreviewEmptyStateContent {
  eyebrow: string;
  heading: string;
  description: string;
  steps: string[];
}

export function getPreviewEmptyStateContent(
  documentMode: DocumentMode = "resume",
): PreviewEmptyStateContent {
  if (documentMode === "cover_letter") {
    return {
      eyebrow: "Cover Letter",
      heading: "Get started",
      description:
        "Select bank entries to draft a focused cover letter with your strongest experience ready to edit.",
      steps: [
        "Select entries from the bank",
        "Choose a template",
        "Preview and edit your cover letter",
      ],
    };
  }

  return {
    eyebrow: "Resume",
    heading: "Get started",
    description:
      "Build a polished preview from the experience, skills, and projects already saved in your bank.",
    steps: [
      "Select entries from the bank",
      "Choose a template",
      "Preview and edit your resume",
    ],
  };
}

export function ResumePreview({
  templateId,
  html,
  content,
  documentMode = "resume",
  onContentChange,
  onAddSection,
  onAddFromBank,
}: ResumePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  const template = getTemplateForDocumentMode(documentMode, templateId);
  const templateStyles =
    template.styles.layout === "letter" ? TEMPLATES[0].styles : template.styles;
  const accentColor = template.styles.accentColor;
  const fontFamily =
    template.styles.fontFamily ?? "'Helvetica Neue', Arial, sans-serif";

  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const availableWidth = wrapperRef.current.clientWidth - 48; // minus padding
    if (availableWidth < PAGE_WIDTH_PX) {
      setFitScale(Math.max(availableWidth, 1) / PAGE_WIDTH_PX);
    } else {
      setFitScale(1);
    }
  }, []);

  useEffect(() => {
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [updateScale]);

  const zoomPercent = 100;
  const scale = fitScale * (zoomPercent / 100);
  const emptyStateContent = getPreviewEmptyStateContent(documentMode);
  const EmptyStateIcon = documentMode === "cover_letter" ? PenLine : FileText;
  const isCoverLetter = documentMode === "cover_letter";

  return (
    <div
      ref={wrapperRef}
      className="h-full overflow-auto bg-muted/30 p-4 [backdrop-filter:var(--backdrop-blur)]"
    >
      <div
        className="mx-auto"
        style={{
          width: `${PAGE_WIDTH_PX * scale}px`,
          minHeight: `${PAGE_HEIGHT_PX * scale}px`,
        }}
      >
        <article
          className="min-h-[11in] bg-white text-slate-950 shadow-[var(--shadow-elevated)]"
          style={{
            width: `${PAGE_WIDTH_PX}px`,
            fontFamily,
            borderTop: isCoverLetter ? undefined : `4px solid ${accentColor}`,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {content ? (
            <>
              <ResumeEditor
                content={content}
                templateStyles={templateStyles}
                editable
                onUpdate={onContentChange}
              />
              {onAddSection && (
                <div className="px-12 pb-12">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-full border-[length:var(--border-width)] border-dashed border-border text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                    onClick={onAddSection}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                  </Button>
                </div>
              )}
            </>
          ) : html ? (
            <div
              className={isCoverLetter ? undefined : "px-14 py-12"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="flex min-h-[11in] items-center justify-center px-14 py-16 text-slate-950">
              <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[calc(var(--radius)_+_8px)] bg-primary/10 text-primary">
                  <EmptyStateIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold uppercase text-primary">
                  {emptyStateContent.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {emptyStateContent.heading}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {emptyStateContent.description}
                </p>

                <ol className="mt-7 space-y-3 text-left">
                  {emptyStateContent.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-center gap-3 rounded-[var(--radius)] border-[length:var(--border-width)] border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground shadow-[var(--shadow-card)]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius)] bg-background text-xs font-bold text-primary shadow-[var(--shadow-sm)]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">{step}</span>
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ol>

                <Button
                  type="button"
                  size="lg"
                  className="mt-7 gradient-bg text-primary-foreground hover:opacity-90"
                  onClick={onAddFromBank}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add from bank
                </Button>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
