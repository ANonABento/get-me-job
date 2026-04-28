"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { ResumeEditor } from "@/lib/editor/resume-editor";
import type { TipTapJSONContent } from "@/lib/editor/types";
import { TEMPLATES } from "@/lib/resume/template-data";
import { cn } from "@/lib/utils";

export interface ResumePreviewProps {
  templateId: string;
  html?: string;
  document?: TipTapJSONContent | null;
  editable?: boolean;
  zoomPercent?: number;
  onEditorReady?: (editor: Editor | null) => void;
  onUpdate?: (content: TipTapJSONContent) => void;
}

export function ResumePreview({
  templateId,
  html = "",
  document,
  editable = false,
  zoomPercent = 100,
  onEditorReady,
  onUpdate,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  const template = TEMPLATES.find((t) => t.id === templateId);
  const accentColor = template?.styles.accentColor ?? "#333333";
  const fontFamily =
    template?.styles.fontFamily ?? "'Helvetica Neue', Arial, sans-serif";

  const PAGE_WIDTH_PX = 816; // 8.5in at 96dpi
  const PAGE_HEIGHT_PX = 1056; // 11in at 96dpi

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
          ref={containerRef}
          className={cn(
            "min-h-[11in] bg-white text-slate-950 shadow-lg",
            !hasDocument && "px-14 py-12"
          )}
          style={{
            width: `${PAGE_WIDTH_PX}px`,
            fontFamily,
            borderTop: `4px solid ${accentColor}`,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {document && template ? (
            <ResumeEditor
              content={document}
              templateStyles={template.styles}
              editable={editable}
              onEditorReady={onEditorReady}
              onUpdate={onUpdate}
            />
          ) : html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Select entries and a template to see a preview.
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
