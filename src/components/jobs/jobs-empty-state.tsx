"use client";

import { Briefcase, Download, FileText, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobsEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
        <Briefcase className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold">No jobs tracked yet</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Add a job description to analyze your match score and generate a tailored resume.
      </p>
      <Button onClick={onAdd} size="lg" className="mt-6 gradient-bg text-white hover:opacity-90">
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Job
      </Button>

      <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Paste Job Descriptions</h3>
          <p className="text-sm text-muted-foreground mt-1">Copy the full job posting to get accurate analysis.</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center mb-3">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Get Match Scores</h3>
          <p className="text-sm text-muted-foreground mt-1">See how well your profile matches each job.</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="p-2 w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center mb-3">
            <Download className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Generate Tailored Resumes</h3>
          <p className="text-sm text-muted-foreground mt-1">Create customized resumes for each application.</p>
        </div>
      </div>
    </div>
  );
}
