"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COVER_LETTER_TEMPLATES,
  composeCoverLetterContent,
  coverLetterContentToDocument,
  createBlankCoverLetterDocument,
  generateCoverLetterHTML,
  type CoverLetterDocument,
} from "@/lib/builder/cover-letter-document";
import {
  createDocumentFilename,
  downloadHtmlAsPdf,
} from "@/lib/builder/document-export";
import { readCoverLetterApiResult } from "@/lib/cover-letter/api-response";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";

interface DocumentsResponse {
  documents?: Document[];
}

const COVER_LETTER_DOCUMENT_TYPE = "cover_letter";

export function CoverLetterWorkspace() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [templateId, setTemplateId] = useState(COVER_LETTER_TEMPLATES[0].id);
  const [document, setDocument] = useState<CoverLetterDocument>(
    createBlankCoverLetterDocument
  );
  const [coverLetterFiles, setCoverLetterFiles] = useState<Document[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () =>
      COVER_LETTER_TEMPLATES.find((template) => template.id === templateId) ??
      COVER_LETTER_TEMPLATES[0],
    [templateId]
  );

  const content = useMemo(
    () => composeCoverLetterContent(document),
    [document]
  );

  const previewHtml = useMemo(
    () =>
      generateCoverLetterHTML({
        content,
        templateId,
        candidateName: candidateName.trim() || "Your Name",
        jobTitle: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
      }),
    [candidateName, company, content, jobTitle, templateId]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchCoverLetterFiles() {
      setIsLoadingFiles(true);
      try {
        const response = await fetch(
          `/api/documents?type=${COVER_LETTER_DOCUMENT_TYPE}`
        );
        if (!response.ok) throw new Error("Failed to load cover letters.");
        const data = (await response.json()) as DocumentsResponse;
        if (!cancelled) setCoverLetterFiles(data.documents ?? []);
      } catch {
        if (!cancelled) setCoverLetterFiles([]);
      } finally {
        if (!cancelled) setIsLoadingFiles(false);
      }
    }

    fetchCoverLetterFiles();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleDocumentSectionChange(
    section: keyof CoverLetterDocument,
    value: string
  ) {
    setSelectedFileId(null);
    setDocument((current) => ({ ...current, [section]: value }));
  }

  function handleFileSelect(file: Document) {
    setSelectedFileId(file.id);
    setDocument(coverLetterContentToDocument(file.extractedText ?? ""));
  }

  async function handleGenerate() {
    if (jobDescription.trim().length < 20) return;
    setIsGenerating(true);
    setError(null);

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
        setError(result.error);
        return;
      }

      setDocument(coverLetterContentToDocument(result.content));
      setSelectedFileId(null);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!content) return;
    setIsExporting(true);
    setError(null);

    try {
      await downloadHtmlAsPdf(
        previewHtml,
        createDocumentFilename("cover-letter", company.trim() || jobTitle.trim())
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)_340px]">
      <aside className="min-h-0 overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Cover Letters</h2>
        </div>

        <div className="space-y-2">
          {isLoadingFiles && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading files
            </div>
          )}

          {!isLoadingFiles && coverLetterFiles.length === 0 && (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No cover letters found.
            </p>
          )}

          {coverLetterFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => handleFileSelect(file)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                selectedFileId === file.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <span className="font-medium">{file.filename}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto">
        <div className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Editor</h2>
              <p className="text-sm text-muted-foreground">
                Opening, body, and closing in one letter document.
              </p>
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                disabled={!content || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" />
                ) : (
                  <Download className="h-4 w-4 md:mr-1.5" />
                )}
                <span className="hidden md:inline">Download PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div>{error}</div>
            {error.includes("Settings") && (
              <Link className="mt-1 inline-block underline" href="/settings">
                Open Settings
              </Link>
            )}
            {error.includes("bank") && (
              <Link className="mt-1 inline-block underline" href="/bank">
                Open Documents
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-4">
            <div>
              <label
                htmlFor="candidateName"
                className="mb-1 block text-sm font-medium"
              >
                Candidate Name
              </label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label
                htmlFor="coverOpening"
                className="mb-1 block text-sm font-medium"
              >
                Opening
              </label>
              <Textarea
                id="coverOpening"
                value={document.opening}
                onChange={(event) =>
                  handleDocumentSectionChange("opening", event.target.value)
                }
                className="min-h-[120px]"
                placeholder="Dear hiring team..."
              />
            </div>

            <div>
              <label
                htmlFor="coverBody"
                className="mb-1 block text-sm font-medium"
              >
                Body
              </label>
              <Textarea
                id="coverBody"
                value={document.body}
                onChange={(event) =>
                  handleDocumentSectionChange("body", event.target.value)
                }
                className="min-h-[220px]"
                placeholder="Connect your strongest experience to the role..."
              />
            </div>

            <div>
              <label
                htmlFor="coverClosing"
                className="mb-1 block text-sm font-medium"
              >
                Closing
              </label>
              <Textarea
                id="coverClosing"
                value={document.closing}
                onChange={(event) =>
                  handleDocumentSectionChange("closing", event.target.value)
                }
                className="min-h-[120px]"
                placeholder="Thank you for your consideration..."
              />
            </div>
          </section>

          <section className="min-h-[620px] overflow-hidden rounded-md border bg-muted/30">
            {content ? (
              <iframe
                title="Cover letter preview"
                srcDoc={previewHtml}
                className="h-full min-h-[620px] w-full bg-white"
              />
            ) : (
              <div className="flex h-full min-h-[620px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Select a cover letter file or generate a draft to preview it.
              </div>
            )}
          </section>
        </div>
      </main>

      <aside className="min-h-0 overflow-y-auto border-t p-4 lg:border-l lg:border-t-0">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">AI Panel</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="jobTitle"
              className="mb-1 block text-sm font-medium"
            >
              Job Title
            </label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="Senior Product Engineer"
            />
          </div>

          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium">
              Company
            </label>
            <Input
              id="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Acme"
            />
          </div>

          <div>
            <label
              htmlFor="jobDescription"
              className="mb-1 block text-sm font-medium"
            >
              Job Description
            </label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="min-h-[260px]"
              placeholder="Paste the full job description..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={jobDescription.trim().length < 20 || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Settings className="mr-2 h-4 w-4" />
            )}
            Generate Cover Letter
          </Button>

          <p className="text-xs text-muted-foreground">
            {selectedTemplate.description}
          </p>
        </div>
      </aside>
    </div>
  );
}
