"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  THEME_MUTED_SURFACE_CLASSES,
  THEME_PRIMARY_GRADIENT_BUTTON_CLASSES,
} from "@/lib/theme/component-classes";
import { pluralize } from "@/lib/text/pluralize";
import { cn } from "@/lib/utils";
import type { CSVPreview } from "./import-job-dialog.types";

interface ImportJobCsvPreviewProps {
  preview: CSVPreview;
  saving: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ImportJobCsvPreview({
  preview,
  saving,
  onBack,
  onCancel,
  onSave,
}: ImportJobCsvPreviewProps) {
  return (
    <div className="space-y-4 py-4">
      <div className={cn(THEME_MUTED_SURFACE_CLASSES, "p-4")}>
        <h3 className="font-semibold mb-3">Import Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{preview.total}</div>
            <div className="text-xs text-muted-foreground">Total Rows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">
              {preview.valid}
            </div>
            <div className="text-xs text-muted-foreground">Valid Jobs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">
              {preview.invalid}
            </div>
            <div className="text-xs text-muted-foreground">Invalid</div>
          </div>
        </div>
      </div>

      {preview.errors.length > 0 && (
        <div className="rounded-[var(--radius)] bg-destructive/10 border-[length:var(--border-width)] border-destructive/20 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            Validation Errors
          </div>
          <ul className="text-xs text-destructive space-y-1">
            {preview.errors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {preview.errors.length > 5 && (
              <li>...and {preview.errors.length - 5} more errors</li>
            )}
          </ul>
        </div>
      )}

      {preview.jobs.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Jobs to Import ({preview.jobs.length})
          </Label>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
            {preview.jobs.slice(0, 10).map((job, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-[var(--radius)] bg-muted/50 text-sm"
              >
                <div>
                  <span className="font-medium">{job.title}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    at {job.company}
                  </span>
                </div>
                {job.location && (
                  <span className="text-xs text-muted-foreground">
                    {job.location}
                  </span>
                )}
              </div>
            ))}
            {preview.jobs.length > 10 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                ...and {pluralize(preview.jobs.length - 10, "more job")}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || preview.jobs.length === 0}
            className={THEME_PRIMARY_GRADIENT_BUTTON_CLASSES}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Import {pluralize(preview.jobs.length, "Job")}
          </Button>
        </div>
      </div>
    </div>
  );
}
