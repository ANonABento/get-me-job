"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Loader2, Settings } from "lucide-react";
import { JDInput } from "@/components/tailor/jd-input";
import { GapAnalysis } from "@/components/tailor/gap-analysis";
import { ResumePreview } from "@/components/builder/resume-preview";
import { Button } from "@/components/ui/button";
import {
  downloadHtmlAsPdf,
  createDocumentFilename,
} from "@/lib/builder/document-export";
import { TEMPLATES } from "@/lib/resume/template-data";
import type { TailoredResume } from "@/lib/resume/generator";
import type { GapItem } from "@/lib/tailor/analyze";

interface AnalysisResult {
  matchScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  gaps: GapItem[];
  matchedEntriesCount: number;
}

interface GenerateResult {
  success: boolean;
  html: string;
  resume: TailoredResume;
  analysis: AnalysisResult;
}

interface RenderResult {
  success: boolean;
  html: string;
}

interface LastInput {
  jobDescription: string;
  jobTitle: string;
  company: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  return (
    isRecord(value) &&
    typeof value.matchScore === "number" &&
    Array.isArray(value.keywordsFound) &&
    Array.isArray(value.keywordsMissing) &&
    Array.isArray(value.gaps) &&
    typeof value.matchedEntriesCount === "number"
  );
}

function isTailoredResume(value: unknown): value is TailoredResume {
  return (
    isRecord(value) &&
    isRecord(value.contact) &&
    typeof value.contact.name === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.experiences) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.education)
  );
}

function isGenerateResult(value: unknown): value is GenerateResult {
  return (
    isRecord(value) &&
    value.success === true &&
    typeof value.html === "string" &&
    isTailoredResume(value.resume) &&
    isAnalysisResult(value.analysis)
  );
}

function isRenderResult(value: unknown): value is RenderResult {
  return (
    isRecord(value) && value.success === true && typeof value.html === "string"
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function TailoredResumeWorkspace() {
  const [templateId, setTemplateId] = useState("classic");
  const [renderedTemplateId, setRenderedTemplateId] = useState("classic");
  const [lastInput, setLastInput] = useState<LastInput | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const templateIdRef = useRef(templateId);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId),
    [templateId]
  );

  function selectTemplate(nextTemplateId: string) {
    templateIdRef.current = nextTemplateId;
    setTemplateId(nextTemplateId);
  }

  function isCurrentRequest(requestId: number) {
    return requestId === requestIdRef.current;
  }

  async function renderResume(
    resume: TailoredResume,
    nextTemplateId: string,
    requestId = ++requestIdRef.current
  ) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "render",
          templateId: nextTemplateId,
          resume,
        }),
      });
      const data = await readJson(response);

      if (!isCurrentRequest(requestId)) return null;

      if (!response.ok) {
        setError(
          isRecord(data) && typeof data.error === "string"
            ? data.error
            : "Failed to update the resume template."
        );
        return null;
      }

      if (!isRenderResult(data)) {
        setError("Failed to update the resume template.");
        return null;
      }

      setRenderedTemplateId(nextTemplateId);
      setResult((current) =>
        current?.resume === resume ? { ...current, html: data.html } : current
      );
      return data.html;
    } catch {
      if (isCurrentRequest(requestId)) {
        setError("Network error. Please try again.");
      }
      return null;
    } finally {
      if (isCurrentRequest(requestId)) {
        setIsLoading(false);
      }
    }
  }

  async function generate(
    input: LastInput,
    nextTemplateId = templateIdRef.current
  ) {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          templateId: nextTemplateId,
          action: "generate",
        }),
      });
      const data = await readJson(response);

      if (!isCurrentRequest(requestId)) return;

      if (!response.ok) {
        setError(
          isRecord(data) && typeof data.error === "string"
            ? data.error
            : "Failed to generate tailored resume."
        );
        return;
      }

      if (!isGenerateResult(data)) {
        setError("Failed to generate tailored resume.");
        return;
      }

      if (templateIdRef.current !== nextTemplateId) {
        const html = await renderResume(
          data.resume,
          templateIdRef.current,
          requestId
        );
        if (html && isCurrentRequest(requestId)) {
          setResult({ ...data, html });
        }
        return;
      }

      setResult(data);
      setRenderedTemplateId(nextTemplateId);
    } catch {
      if (isCurrentRequest(requestId)) {
        setError("Network error. Please try again.");
      }
    } finally {
      if (isCurrentRequest(requestId)) {
        setIsLoading(false);
      }
    }
  }

  function handleSubmit(input: LastInput) {
    setLastInput(input);
    generate(input);
  }

  function handleTemplateChange(nextTemplateId: string) {
    selectTemplate(nextTemplateId);
    if (result?.resume) {
      renderResume(result.resume, nextTemplateId);
    }
  }

  async function handleDownloadPdf() {
    if (!result?.html) return;
    setIsExporting(true);
    setError(null);

    try {
      await downloadHtmlAsPdf(
        result.html,
        createDocumentFilename(
          "tailored-resume",
          lastInput?.company || lastInput?.jobTitle
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)_360px]">
      <aside className="min-h-0 overflow-y-auto border-b p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Tailored Resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate from a job description and your knowledge bank.
          </p>
        </div>
        <JDInput onSubmit={handleSubmit} isLoading={isLoading} />
      </aside>

      <main className="relative min-h-[520px] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Template</span>
            <select
              value={templateId}
              onChange={(event) => handleTemplateChange(event.target.value)}
              disabled={isLoading}
              className="h-9 rounded-md border bg-background px-3 text-sm"
              aria-label="Resume template"
            >
              {TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {selectedTemplate.description}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={
              !result?.html || isExporting || renderedTemplateId !== templateId
            }
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" />
            ) : (
              <Download className="h-4 w-4 md:mr-1.5" />
            )}
            <span className="hidden md:inline">Download PDF</span>
          </Button>
        </div>

        {error && (
          <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {result ? (
          <ResumePreview
            resume={result.resume}
            templateId={templateId}
            html={result.html}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="max-w-sm text-center">
              <Settings className="mx-auto mb-3 h-8 w-8" />
              <p className="text-sm">
                Paste a job description to generate an optimized resume preview.
              </p>
            </div>
          </div>
        )}
      </main>

      <aside className="min-h-0 overflow-y-auto border-t p-4 lg:border-l lg:border-t-0">
        <h2 className="mb-4 text-base font-semibold">Gap Analysis</h2>
        {result ? (
          <GapAnalysis
            gaps={result.analysis.gaps}
            keywordsFound={result.analysis.keywordsFound}
            keywordsMissing={result.analysis.keywordsMissing}
            matchScore={result.analysis.matchScore}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Matched and missing keywords will appear after generation.
          </p>
        )}
      </aside>
    </div>
  );
}
