"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeEditor } from "@/lib/editor/resume-editor";
import { TEMPLATES } from "@/lib/resume/template-data";
import type { TipTapJSONContent } from "@/lib/editor/types";

const PAGE_WIDTH_PX = 816; // 8.5in at 96dpi

export interface ResumePreviewProps {
  templateId: string;
  html?: string;
  content?: TipTapJSONContent;
  onContentChange?: (content: TipTapJSONContent) => void;
  onAddSection?: () => void;
}

export function ResumePreview({
  templateId,
  html,
  content,
  onContentChange,
  onAddSection,
}: ResumePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  const template = TEMPLATES.find((t) => t.id === templateId);
  const templateStyles = template?.styles ?? TEMPLATES[0].styles;
  const accentColor = template?.styles.accentColor ?? "#333333";
  const fontFamily =
    template?.styles.fontFamily ?? "'Helvetica Neue', Arial, sans-serif";

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

  const scale = fitScale * (zoomPercent / 100);
  const hasDocument = Boolean(document);

  return (
    <div ref={wrapperRef} className="h-full overflow-auto bg-muted/30 p-4">
      <div
        className="mx-auto"
        style={{
          width: `${PAGE_WIDTH_PX * scale}px`,
          minHeight: `${PAGE_HEIGHT_PX * scale}px`,
        }}
      >
        <article
          className="min-h-[11in] bg-white text-slate-950 shadow-lg"
          style={{
            width: `${PAGE_WIDTH_PX}px`,
            fontFamily,
            borderTop: `4px solid ${accentColor}`,
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
              <div className="px-12 pb-12">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-full border border-dashed border-slate-300 text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  onClick={onAddSection}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </>
          ) : html ? (
            <div
              className="px-14 py-12"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="flex h-64 items-center justify-center px-14 py-12 text-sm text-muted-foreground">
              Select entries and a template to see a preview.
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
