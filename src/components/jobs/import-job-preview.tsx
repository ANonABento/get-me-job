"use client";

import { Briefcase, Building2, Check, Edit2, ExternalLink, Loader2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ParsedJobPreview } from "./import-job-dialog.types";

interface ImportJobPreviewProps {
  preview: ParsedJobPreview;
  saving: boolean;
  onBack: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
}

export function ImportJobPreview({
  preview,
  saving,
  onBack,
  onCancel,
  onEdit,
  onSave,
}: ImportJobPreviewProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{preview.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {preview.company}
              </span>
              {preview.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {preview.location}
                </span>
              )}
              {preview.type && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {preview.type}
                </span>
              )}
              {preview.remote && (
                <Badge variant="secondary" className="text-xs">
                  Remote
                </Badge>
              )}
            </div>
            {preview.salary && (
              <p className="text-sm font-medium text-emerald-600">{preview.salary}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        {preview.url && (
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
          >
            <ExternalLink className="h-3 w-3" />
            View Original Posting
          </a>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium">Description</Label>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-4">
          {preview.description}
        </p>
      </div>

      {preview.requirements.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Requirements</Label>
          <ul className="mt-1 space-y-1">
            {preview.requirements.slice(0, 5).map((req, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {req}
              </li>
            ))}
            {preview.requirements.length > 5 && (
              <li className="text-sm text-muted-foreground">
                +{preview.requirements.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}

      {preview.keywords.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Extracted Keywords</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {preview.keywords.map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {preview.source && (
        <div className="text-xs text-muted-foreground">
          Source: {preview.source}
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
            disabled={saving}
            className="gradient-bg text-white hover:opacity-90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Import Job
          </Button>
        </div>
      </div>
    </div>
  );
}
