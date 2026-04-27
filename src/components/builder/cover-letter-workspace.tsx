"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COVER_LETTER_TEMPLATES,
  generateCoverLetterHTML,
} from "@/lib/builder/cover-letter-document";
import {
  createDocumentFilename,
  downloadHtmlAsPdf,
} from "@/lib/builder/document-export";
import { readCoverLetterApiResult } from "@/lib/cover-letter/api-response";

export function CoverLetterWorkspace() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState("classic-letter");
  const [llmError, setLlmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const html = useMemo(
    () =>
      content
        ? generateCoverLetterHTML({
            content,
            templateId,
            jobTitle: jobTitle.trim() || undefined,
            company: company.trim() || undefined,
          })
        : "",
    [company, content, jobTitle, templateId]
  );

  async function handleGenerate() {
    if (jobDescription.trim().length < 20) return;
    setIsLoading(true);
    setLlmError(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          action: "generate",
        }),
      });

      const result = await readCoverLetterApiResult(
        res,
        "Failed to generate cover letter"
      );

      if (!result.ok) {
        setLlmError(result.error);
        return;
      }

      setContent(result.content);
    } catch {
      setLlmError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!html) return;
    setIsExporting(true);
    setLlmError(null);

    try {
      await downloadHtmlAsPdf(
        html,
        createDocumentFilename(
          "cover-letter",
          company.trim() || jobTitle.trim() || "document"
        )
      );
    } catch (err) {
      setLlmError(err instanceof Error ? err.message : "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="min-h-0 overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Cover Letter
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a single editable letter from the JD and your bank.
          </p>
        </div>

        {llmError && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {llmError}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label
                htmlFor="cover-job-title"
                className="mb-1 block text-sm font-medium"
              >
                Job Title
              </label>
              <Input
                id="cover-job-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label
                htmlFor="cover-company"
                className="mb-1 block text-sm font-medium"
              >
                Company
              </label>
              <Input
                id="cover-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="cover-job-description"
              className="mb-1 block text-sm font-medium"
            >
              Job Description
            </label>
            <Textarea
              id="cover-job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-[220px] font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {jobDescription.length > 0
                ? `${jobDescription.split(/\s+/).filter(Boolean).length} words`
                : "Minimum 20 characters required"}
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={jobDescription.trim().length < 20 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </div>
      </aside>

      <main className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Template</span>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
              aria-label="Cover letter template"
            >
              {COVER_LETTER_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!html || isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" />
            ) : (
              <Download className="h-4 w-4 md:mr-1.5" />
            )}
            <span className="hidden md:inline">Download PDF</span>
          </Button>
        </div>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <section className="min-h-0 border-b p-4 lg:border-b-0 lg:border-r">
            <label
              htmlFor="cover-letter-content"
              className="mb-2 block text-sm font-medium"
            >
              Document
            </label>
            <Textarea
              id="cover-letter-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Generate or write a cover letter..."
              className="h-[calc(100%-1.75rem)] min-h-[360px] resize-none leading-relaxed"
            />
          </section>

          <section className="min-h-0 overflow-auto bg-muted/30 p-4">
            {html ? (
              <div
                className="mx-auto rounded bg-white shadow-lg"
                style={{ maxWidth: "8.5in" }}
              >
                <iframe
                  key={templateId + "-" + html.length}
                  srcDoc={html}
                  title="Cover Letter Preview"
                  className="w-full rounded border-0"
                  style={{ minHeight: "11in" }}
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-muted-foreground">
                <div className="max-w-sm text-center">
                  <Settings className="mx-auto mb-3 h-8 w-8" />
                  <p className="text-sm">
                    The editable cover letter preview appears here after
                    generation.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
