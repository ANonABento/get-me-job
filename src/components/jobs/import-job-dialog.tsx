"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FileDown,
  Sparkles,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
  Check,
  X,
  Edit2,
} from "lucide-react";

interface ParsedJobPreview {
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  description: string;
  fullDescription: string;
  requirements: string[];
  keywords: string[];
  url?: string;
  source?: string;
}

interface ImportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobImported: () => void;
}

export function ImportJobDialog({ open, onOpenChange, onJobImported }: ImportJobDialogProps) {
  const [step, setStep] = useState<"input" | "preview" | "edit">("input");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedJobPreview | null>(null);
  const [editedPreview, setEditedPreview] = useState<ParsedJobPreview | null>(null);

  const resetDialog = () => {
    setStep("input");
    setJobText("");
    setJobUrl("");
    setParsing(false);
    setSaving(false);
    setError(null);
    setPreview(null);
    setEditedPreview(null);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      resetDialog();
    }
    onOpenChange(openState);
  };

  const parseJob = async () => {
    if (!jobText.trim()) {
      setError("Please paste job content to import");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/import/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: jobText,
          url: jobUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse job");
      }

      setPreview(data.preview);
      setEditedPreview(data.preview);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse job content");
    } finally {
      setParsing(false);
    }
  };

  const saveJob = async () => {
    if (!editedPreview) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/import/job", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedPreview.title,
          company: editedPreview.company,
          location: editedPreview.location,
          type: editedPreview.type,
          remote: editedPreview.remote,
          salary: editedPreview.salary,
          description: editedPreview.fullDescription,
          requirements: editedPreview.requirements,
          keywords: editedPreview.keywords,
          url: editedPreview.url || jobUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save job");
      }

      onJobImported();
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ParsedJobPreview>(field: K, value: ParsedJobPreview[K]) => {
    if (editedPreview) {
      setEditedPreview({ ...editedPreview, [field]: value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            {step === "input" && "Import Job"}
            {step === "preview" && "Review Import"}
            {step === "edit" && "Edit Job Details"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Paste job content from LinkedIn, Indeed, or any job board."}
            {step === "preview" && "Review the parsed job details. Click Edit to make changes."}
            {step === "edit" && "Make corrections to the parsed job details."}
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {step === "input" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job URL (optional)</Label>
              <Input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
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
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job posting here...

Example:
Senior Software Engineer
Acme Corp - San Francisco, CA (Remote)

About the role:
We're looking for an experienced software engineer...

Requirements:
• 5+ years of experience
• Python, TypeScript
..."
                className="resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste the entire job description. We&apos;ll extract the title, company, requirements, and keywords.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={parseJob}
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
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && editedPreview && (
          <div className="space-y-4 py-4">
            {/* Header Info */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{editedPreview.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {editedPreview.company}
                    </span>
                    {editedPreview.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {editedPreview.location}
                      </span>
                    )}
                    {editedPreview.type && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {editedPreview.type}
                      </span>
                    )}
                    {editedPreview.remote && (
                      <Badge variant="secondary" className="text-xs">
                        Remote
                      </Badge>
                    )}
                  </div>
                  {editedPreview.salary && (
                    <p className="text-sm font-medium text-emerald-600">{editedPreview.salary}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep("edit")}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              {editedPreview.url && (
                <a
                  href={editedPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Original Posting
                </a>
              )}
            </div>

            {/* Description Preview */}
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-4">
                {editedPreview.description}
              </p>
            </div>

            {/* Requirements */}
            {editedPreview.requirements.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Requirements</Label>
                <ul className="mt-1 space-y-1">
                  {editedPreview.requirements.slice(0, 5).map((req, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {req}
                    </li>
                  ))}
                  {editedPreview.requirements.length > 5 && (
                    <li className="text-sm text-muted-foreground">
                      +{editedPreview.requirements.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {editedPreview.keywords.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Extracted Keywords</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {editedPreview.keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {editedPreview.source && (
              <div className="text-xs text-muted-foreground">
                Source: {editedPreview.source}
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("input")}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveJob}
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
        )}

        {/* Step 3: Edit */}
        {step === "edit" && editedPreview && (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={editedPreview.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={editedPreview.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editedPreview.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={editedPreview.type}
                  onValueChange={(value) => updateField("type", value)}
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
                  value={editedPreview.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                  placeholder="$120,000 - $150,000"
                />
              </div>
              <div className="space-y-2">
                <Label>Remote</Label>
                <Select
                  value={editedPreview.remote ? "yes" : "no"}
                  onValueChange={(value) => updateField("remote", value === "yes")}
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
                value={editedPreview.url || ""}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("preview")}>
                Back to Preview
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveJob}
                  disabled={saving || !editedPreview.title || !editedPreview.company}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
