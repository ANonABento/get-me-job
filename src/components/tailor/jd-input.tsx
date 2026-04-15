"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Briefcase, Building2 } from "lucide-react";

interface JDInputProps {
  onSubmit: (data: {
    jobDescription: string;
    jobTitle: string;
    company: string;
  }) => void;
  isLoading: boolean;
}

const JD_PLACEHOLDER = `Paste the full job description here...

Example:
We are looking for a Senior Frontend Engineer to join our team.
You will be responsible for building and maintaining our web application
using React, TypeScript, and modern web technologies...`;

export function JDInput({ onSubmit, isLoading }: JDInputProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");

  function handlePasteFromClipboard() {
    navigator.clipboard.readText().then((text) => {
      setJobDescription(text);
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
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Job Description</label>
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
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={JD_PLACEHOLDER}
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
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
      >
        {isLoading ? "Generating..." : "Generate Tailored Resume"}
      </Button>
    </div>
  );
}
