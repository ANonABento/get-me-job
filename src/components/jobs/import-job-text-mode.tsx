"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onParse}
          disabled={parsing || !jobText.trim()}
          className="gradient-bg text-white hover:opacity-90"
        >
          {parsing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Parse Job
        </Button>
      </div>
    </>
  );
}
