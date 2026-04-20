"use client";

import Link from "next/link";
import { Upload, FileText, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  variant: "no-resume" | "no-resumes-built";
}

export function EmptyState({ variant }: EmptyStateProps) {
  if (variant === "no-resume") {
    return (
      <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg text-white shadow-lg">
          <Upload className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">Get started: upload your resume</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Upload your existing resume and we&apos;ll extract your professional info automatically.
          Then you can tailor it for every job application.
        </p>
        <Link
          href="/bank"
          className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-bg px-6 py-3 font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
        >
          <Upload className="h-4 w-4" />
          Upload Resume
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileText className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold">Build your first resume</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Add a job description and we&apos;ll generate a tailored resume that highlights your most relevant experience.
      </p>
      <Link
        href="/jobs"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-6 py-3 font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <FileText className="h-4 w-4" />
        Build your first resume
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
