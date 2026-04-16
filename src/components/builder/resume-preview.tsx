"use client";

import { useMemo } from "react";
import type { TailoredResume } from "@/lib/resume/generator";

interface ResumePreviewProps {
  resume: TailoredResume;
  templateId: string;
  html: string;
}

export function ResumePreview({ resume, templateId, html }: ResumePreviewProps) {
  const hasContent = useMemo(() => {
    return (
      resume.experiences.length > 0 ||
      resume.skills.length > 0 ||
      resume.education.length > 0 ||
      resume.summary.length > 0
    );
  }, [resume]);

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No entries selected</p>
          <p className="text-sm">Select entries from the left panel to build your resume</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-muted/30 p-4">
      <div
        className="mx-auto bg-white shadow-lg rounded"
        style={{ maxWidth: "8.5in" }}
      >
        <iframe
          key={templateId + "-" + html.length}
          srcDoc={html}
          title="Resume Preview"
          className="w-full border-0 rounded"
          style={{ minHeight: "11in" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
