"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Briefcase, Building2 } from "lucide-react";

interface JDInputProps {
  onSubmit: (data: {
    jobDescription: string;
    jobTitle: string;
    company: string;
  }) => void;
  onChange?: (data: {
    jobDescription: string;
    jobTitle: string;
    company: string;
  }) => void;
  isLoading: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}

const JD_PLACEHOLDER = `Paste the full job description here...

Example:
We are looking for a Senior Frontend Engineer to join our team.
You will be responsible for building and maintaining our web application
using React, TypeScript, and modern web technologies...`;

export function JDInput({
  onSubmit,
  onChange,
  isLoading,
  submitLabel = "Generate Tailored Resume",
  loadingLabel = "Generating...",
}: JDInputProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");

  function updateDraft(next: {
    jobDescription?: string;
    jobTitle?: string;
    company?: string;
  }) {
    const draft = {
      jobDescription:
        next.jobDescription !== undefined ? next.jobDescription : jobDescription,
      jobTitle: next.jobTitle !== undefined ? next.jobTitle : jobTitle,
      company: next.company !== undefined ? next.company : company,
    };

    if (next.jobDescription !== undefined) setJobDescription(next.jobDescription);
    if (next.jobTitle !== undefined) setJobTitle(next.jobTitle);
    if (next.company !== undefined) setCompany(next.company);

    onChange?.(draft);
  }

  function handlePasteFromClipboard() {
    navigator.clipboard.readText().then((text) => {
      updateDraft({ jobDescription: text });
    });
  }

  function handleSubmit() {
    if (jobDescription.trim().length < 20) return;
    onSubmit({ jobDescription, jobTitle, company });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="tailor-job-title"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Job Title
          </label>
          <Input
            id="tailor-job-title"
            value={jobTitle}
            onChange={(e) => updateDraft({ jobTitle: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="tailor-company"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Company
          </label>
          <Input
            id="tailor-company"
            value={company}
            onChange={(e) => updateDraft({ company: e.target.value })}
            placeholder="e.g. Acme Corp"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="tailor-job-description" className="text-sm font-medium">
            Job Description
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePasteFromClipboard}
            type="button"
          >
            <ClipboardPaste className="h-4 w-4 mr-1.5" />
            Paste from clipboard
          </Button>
        </div>
        <Textarea
          id="tailor-job-description"
          value={jobDescription}
          onChange={(e) => updateDraft({ jobDescription: e.target.value })}
          placeholder={JD_PLACEHOLDER}
          className="min-h-[300px] font-mono text-sm"
          aria-describedby="jd-help-text"
        />
        <p id="jd-help-text" className="text-xs text-muted-foreground">
          {jobDescription.length > 0
            ? `${jobDescription.split(/\s+/).filter(Boolean).length} words`
            : "Paste the full job posting for best results"}
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || jobDescription.trim().length < 20}
        className="w-full"
        size="lg"
        title={`${submitLabel} (Ctrl+Enter to re-generate)`}
      >
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
