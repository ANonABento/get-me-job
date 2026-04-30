"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_PRIMARY_GRADIENT_BUTTON_CLASSES } from "@/lib/theme/component-classes";
import type { ParsedJobPreview } from "./import-job-dialog.types";

interface ImportJobEditFormProps {
  preview: ParsedJobPreview;
  saving: boolean;
  onFieldChange: <K extends keyof ParsedJobPreview>(
    field: K,
    value: ParsedJobPreview[K],
  ) => void;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ImportJobEditForm({
  preview,
  saving,
  onFieldChange,
  onBack,
  onCancel,
  onSave,
}: ImportJobEditFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            value={preview.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            value={preview.company}
            onChange={(e) => onFieldChange("company", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={preview.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select
            value={preview.type}
            onValueChange={(value) => onFieldChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Salary</Label>
          <Input
            value={preview.salary}
            onChange={(e) => onFieldChange("salary", e.target.value)}
            placeholder="$120,000 - $150,000"
          />
        </div>
        <div className="space-y-2">
          <Label>Remote</Label>
          <Select
            value={preview.remote ? "yes" : "no"}
            onValueChange={(value) => onFieldChange("remote", value === "yes")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Remote</SelectItem>
              <SelectItem value="no">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={preview.url || ""}
          onChange={(e) => onFieldChange("url", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          Back to Preview
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !preview.title || !preview.company}
            className={THEME_PRIMARY_GRADIENT_BUTTON_CLASSES}
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
