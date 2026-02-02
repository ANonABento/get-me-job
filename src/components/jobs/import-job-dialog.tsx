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
  Edit2,
  Link,
  FileText,
  FileSpreadsheet,
  Upload,
  AlertCircle,
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

interface CSVJob {
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: string;
  description: string;
  url: string;
  isValid: boolean;
  errors: string[];
}

interface CSVPreview {
  total: number;
  valid: number;
  invalid: number;
  jobs: CSVJob[];
  errors: string[];
}

interface ImportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobImported: () => void;
}

export function ImportJobDialog({ open, onOpenChange, onJobImported }: ImportJobDialogProps) {
  const [step, setStep] = useState<"input" | "preview" | "edit" | "csv-preview">("input");
  const [importMode, setImportMode] = useState<"text" | "url" | "csv">("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedJobPreview | null>(null);
  const [editedPreview, setEditedPreview] = useState<ParsedJobPreview | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);

  const resetDialog = () => {
    setStep("input");
    setImportMode("text");
    setJobText("");
    setJobUrl("");
    setCsvContent("");
    setCsvFileName("");
    setParsing(false);
    setFetchingUrl(false);
    setSaving(false);
    setError(null);
    setPreview(null);
    setEditedPreview(null);
    setCsvPreview(null);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      resetDialog();
    }
    onOpenChange(openState);
  };

  const fetchFromUrl = async () => {
    if (!jobUrl.trim()) {
      setError("Please enter a job URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(jobUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setFetchingUrl(true);
    setError(null);

    try {
      const res = await fetch("/api/import/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch job from URL");
      }

      setPreview(data.preview);
      setEditedPreview(data.preview);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job from URL");
    } finally {
      setFetchingUrl(false);
    }
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

  const handleCsvFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const parseCSV = async () => {
    if (!csvContent.trim()) {
      setError("Please upload a CSV file");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse CSV");
      }

      setCsvPreview(data.preview);
      setStep("csv-preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      setParsing(false);
    }
  };

  const saveCSVJobs = async () => {
    if (!csvPreview || csvPreview.jobs.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/import/csv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: csvPreview.jobs }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import jobs");
      }

      onJobImported();
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import jobs");
    } finally {
      setSaving(false);
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
            {/* Import Mode Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  importMode === "text"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                Paste
              </button>
              <button
                type="button"
                onClick={() => setImportMode("url")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  importMode === "url"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link className="h-4 w-4" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setImportMode("csv")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  importMode === "csv"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </button>
            </div>

            {/* URL Mode */}
            {importMode === "url" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Posting URL</Label>
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
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
                  <Button variant="outline" onClick={() => handleClose(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={fetchFromUrl}
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
            )}

            {/* CSV Mode */}
            {importMode === "csv" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload CSV File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvFile}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      {csvFileName ? (
                        <span className="text-sm font-medium">{csvFileName}</span>
                      ) : (
                        <>
                          <span className="text-sm font-medium">Click to upload CSV</span>
                          <span className="text-xs text-muted-foreground">
                            or drag and drop
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium mb-2">Expected columns:</p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li><span className="font-medium text-foreground">title</span> (required) - Job title or position</li>
                    <li><span className="font-medium text-foreground">company</span> (required) - Company name</li>
                    <li><span className="text-muted-foreground">location, type, remote, salary, description, url</span> - optional</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => handleClose(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={parseCSV}
                    disabled={parsing || !csvContent.trim()}
                    className="gradient-bg text-white hover:opacity-90"
                  >
                    {parsing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Parse CSV
                  </Button>
                </div>
              </div>
            )}

            {/* Text Mode */}
            {importMode === "text" && (
              <>
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
              </>
            )}
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

        {/* Step: CSV Preview */}
        {step === "csv-preview" && csvPreview && (
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <h3 className="font-semibold mb-3">Import Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{csvPreview.total}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{csvPreview.valid}</div>
                  <div className="text-xs text-muted-foreground">Valid Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{csvPreview.invalid}</div>
                  <div className="text-xs text-muted-foreground">Invalid</div>
                </div>
              </div>
            </div>

            {/* Errors */}
            {csvPreview.errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Validation Errors
                </div>
                <ul className="text-xs text-destructive space-y-1">
                  {csvPreview.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {csvPreview.errors.length > 5 && (
                    <li>...and {csvPreview.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {/* Job List Preview */}
            {csvPreview.jobs.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Jobs to Import ({csvPreview.jobs.length})</Label>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                  {csvPreview.jobs.slice(0, 10).map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                      <div>
                        <span className="font-medium">{job.title}</span>
                        <span className="text-muted-foreground"> at {job.company}</span>
                      </div>
                      {job.location && (
                        <span className="text-xs text-muted-foreground">{job.location}</span>
                      )}
                    </div>
                  ))}
                  {csvPreview.jobs.length > 10 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      ...and {csvPreview.jobs.length - 10} more jobs
                    </div>
                  )}
                </div>
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
                  onClick={saveCSVJobs}
                  disabled={saving || csvPreview.jobs.length === 0}
                  className="gradient-bg text-white hover:opacity-90"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Import {csvPreview.jobs.length} Jobs
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
