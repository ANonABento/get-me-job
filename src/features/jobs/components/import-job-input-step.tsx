"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobImportMode } from "@/features/jobs/client-types";
import { FileDown, FileSpreadsheet, FileText, Link as LinkIcon, Loader2, Sparkles, Upload } from "lucide-react";
import type { ChangeEvent } from "react";

interface ImportJobInputStepProps {
  csvFileName: string;
  hasCsvContent: boolean;
  fetchingUrl: boolean;
  importMode: JobImportMode;
  jobText: string;
  jobUrl: string;
  onClose: () => void;
  onFetchFromUrl: () => void;
  onHandleCsvFile: (file: File | null) => void;
  onImportModeChange: (mode: JobImportMode) => void;
  onJobTextChange: (value: string) => void;
  onJobUrlChange: (value: string) => void;
  onParseCsv: () => void;
  onParseJob: () => void;
  parsing: boolean;
}

export function ImportJobInputStep({
  csvFileName,
  fetchingUrl,
  hasCsvContent,
  importMode,
  jobText,
  jobUrl,
  onClose,
  onFetchFromUrl,
  onHandleCsvFile,
  onImportModeChange,
  onJobTextChange,
  onJobUrlChange,
  onParseCsv,
  onParseJob,
  parsing,
}: ImportJobInputStepProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onHandleCsvFile(event.target.files?.[0] || null);
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => onImportModeChange("text")}
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
          onClick={() => onImportModeChange("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            importMode === "url"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          URL
        </button>
        <button
          type="button"
          onClick={() => onImportModeChange("csv")}
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

      {importMode === "url" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Job Posting URL</Label>
            <Input
              value={jobUrl}
              onChange={(event) => onJobUrlChange(event.target.value)}
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onFetchFromUrl}
              disabled={fetchingUrl || !jobUrl.trim()}
              className="gradient-bg text-white hover:opacity-90"
            >
              {fetchingUrl ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4 mr-2" />
              )}
              Fetch Job
            </Button>
          </div>
        </div>
      )}

      {importMode === "csv" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onParseCsv}
              disabled={parsing || !hasCsvContent}
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

      {importMode === "text" && (
        <>
          <div className="space-y-2">
            <Label>Job URL (optional)</Label>
            <Input
              value={jobUrl}
              onChange={(event) => onJobUrlChange(event.target.value)}
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
              onChange={(event) => onJobTextChange(event.target.value)}
              placeholder={`Paste the full job posting here...

Example:
Senior Software Engineer
Acme Corp - San Francisco, CA (Remote)

About the role:
We're looking for an experienced software engineer...

Requirements:
• 5+ years of experience
• Python, TypeScript`}
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste the entire job description. We&apos;ll extract the title, company, requirements, and keywords.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onParseJob}
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
  );
}
