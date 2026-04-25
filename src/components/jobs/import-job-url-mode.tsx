"use client";

import { Link, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 dark:text-amber-400">
        Note: Some sites may block automated fetching. If the import fails, try pasting the job content directly.
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onFetch}
          disabled={fetchingUrl || !jobUrl.trim()}
          className="gradient-bg text-white hover:opacity-90"
        >
          {fetchingUrl ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          Fetch Job
        </Button>
      </div>
    </div>
  );
}
