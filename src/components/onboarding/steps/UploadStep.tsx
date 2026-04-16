"use client";

import { Upload, FileUp } from "lucide-react";

export function UploadStep() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 text-white shadow-lg mb-6">
        <Upload className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold">Upload Your Resume</h2>
      <p className="text-base mt-2 text-muted-foreground">
        Drag &amp; drop your resume to get started, or skip this step and add it
        later.
      </p>
      <div className="mt-6 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 flex flex-col items-center gap-3 text-muted-foreground">
        <FileUp className="h-8 w-8" />
        <p className="text-sm">
          Drop your PDF or DOCX here, or head to{" "}
          <span className="font-medium text-primary">Knowledge Bank</span>{" "}
          after setup.
        </p>
      </div>
    </div>
  );
}
