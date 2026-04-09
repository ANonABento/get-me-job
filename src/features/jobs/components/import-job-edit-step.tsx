"use client";

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
import type { ParsedJobPreview } from "@/features/jobs/client-types";
import { Check, Loader2 } from "lucide-react";

interface ImportJobEditStepProps {
  onBack: () => void;
  onClose: () => void;
  onSave: () => void;
  onUpdateField: <K extends keyof ParsedJobPreview>(
    field: K,
    value: ParsedJobPreview[K]
  ) => void;
  preview: ParsedJobPreview;
  saving: boolean;
}

export function ImportJobEditStep({
  onBack,
  onClose,
  onSave,
  onUpdateField,
  preview,
  saving,
}: ImportJobEditStepProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            value={preview.title}
            onChange={(event) => onUpdateField("title", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            value={preview.company}
            onChange={(event) => onUpdateField("company", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={preview.location}
            onChange={(event) => onUpdateField("location", event.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select
            value={preview.type}
            onValueChange={(value) => onUpdateField("type", value)}
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
            onChange={(event) => onUpdateField("salary", event.target.value)}
            placeholder="$120,000 - $150,000"
          />
        </div>
        <div className="space-y-2">
          <Label>Remote</Label>
          <Select
            value={preview.remote ? "yes" : "no"}
            onValueChange={(value) => onUpdateField("remote", value === "yes")}
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
          onChange={(event) => onUpdateField("url", event.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          Back to Preview
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !preview.title || !preview.company}
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
