"use client";

import { useRef } from "react";
import { TEMPLATES } from "@/lib/resume/template-data";
import type { TailoredResume } from "@/lib/resume/generator";

export interface ResumePreviewProps {
  resume: TailoredResume;
  templateId: string;
  html: string;
}

export function ResumePreview({ resume, templateId, html }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((t) => t.id === templateId);
  const accentColor = template?.styles.accentColor ?? "#333333";
  const fontFamily =
    template?.styles.fontFamily ?? "'Helvetica Neue', Arial, sans-serif";

  return (
    <div className="h-full overflow-auto bg-muted/30 p-4">
      <article
        ref={containerRef}
        className="mx-auto min-h-[11in] bg-white px-14 py-12 text-slate-950 shadow-lg"
        style={{
          maxWidth: "8.5in",
          fontFamily,
          borderTop: `4px solid ${accentColor}`,
        }}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Select entries and a template to see a preview.
          </div>
        )}
      </article>
    </div>
  );
}
