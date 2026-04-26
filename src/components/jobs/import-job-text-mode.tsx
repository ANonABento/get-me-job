"use client";

import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImportJobActions } from "./import-job-actions";

interface ImportJobTextModeProps {
  jobUrl: string;
  jobText: string;
  parsing: boolean;
  onJobUrlChange: (value: string) => void;
  onJobTextChange: (value: string) => void;
  onCancel: () => void;
  onParse: () => void;
}

export function ImportJobTextMode({
  jobUrl,
  jobText,
  parsing,
  onJobUrlChange,
  onJobTextChange,
  onCancel,
  onParse,
}: ImportJobTextModeProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Job URL (optional)</Label>
        <Input
          value={jobUrl}
          onChange={(e) => onJobUrlChange(e.target.value)}
          placeholder="https://linkedin.com/jobs/... or https://indeed.com/..."
        />
        <p className="text-xs text-muted-foreground">
          The URL will be saved with the job for reference
        </p>
      </div>

      <div className="space-y-2">
        <Label>Job Content</Label>
        <Textarea
          rows={12}
          value={jobText}
          onChange={(e) => onJobTextChange(e.target.value)}
          placeholder={`Paste the full job posting here...

Example:
Senior Software Engineer
Acme Corp - San Francisco, CA (Remote)

About the role:
We're looking for an experienced software engineer...

Requirements:
• 5+ years of experience
• Python, TypeScript
...`}
          className="resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Paste the entire job description. We&apos;ll extract the title, company, requirements, and keywords.
        </p>
      </div>

      <ImportJobActions
        disabled={parsing || !jobText.trim()}
        loading={parsing}
        icon={Sparkles}
        submitLabel="Parse Job"
        onCancel={onCancel}
        onSubmit={onParse}
      />
    </>
  );
}
