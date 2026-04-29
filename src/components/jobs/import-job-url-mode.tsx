"use client";

import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImportJobActions } from "./import-job-actions";

interface ImportJobUrlModeProps {
  jobUrl: string;
  fetchingUrl: boolean;
  onJobUrlChange: (value: string) => void;
  onCancel: () => void;
  onFetch: () => void;
}

export function ImportJobUrlMode({
  jobUrl,
  fetchingUrl,
  onJobUrlChange,
  onCancel,
  onFetch,
}: ImportJobUrlModeProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Job Posting URL</Label>
        <Input
          value={jobUrl}
          onChange={(e) => onJobUrlChange(e.target.value)}
          placeholder="https://linkedin.com/jobs/... or https://indeed.com/..."
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll fetch the job posting and extract the details automatically.
        </p>
      </div>

      <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
        Note: Some sites may block automated fetching. If the import fails, try pasting the job content directly.
      </div>

      <ImportJobActions
        disabled={fetchingUrl || !jobUrl.trim()}
        loading={fetchingUrl}
        icon={Link}
        submitLabel="Fetch Job"
        onCancel={onCancel}
        onSubmit={onFetch}
      />
    </div>
  );
}
