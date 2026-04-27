"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { JDInput } from "@/components/tailor/jd-input";
import { ResumePreview } from "@/components/tailor/resume-preview";
import { GapAnalysis } from "@/components/tailor/gap-analysis";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ErrorState } from "@/components/ui/error-state";
import type { TailoredResume } from "@/lib/resume/generator";
import { analyzeResumeFit } from "@/lib/tailor/analyze";
import type { GapItem } from "@/lib/tailor/analyze";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";
import { readJsonResponse } from "@/lib/http";

interface TemplateOption {
  id: string;
  name: string;
  description: string;
}

interface AnalysisResult {
  matchScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  gaps: GapItem[];
  matchedEntriesCount: number;
}

interface GenerateResult {
  success: boolean;
  pdfUrl: string;
  resume: TailoredResume;
  savedResume: { id: string };
  analysis: AnalysisResult;
  jobId: string;
}

interface TailorInput {
  jobDescription: string;
  jobTitle: string;
  company: string;
}

interface AnalyzeResult {
  success: boolean;
  analysis: AnalysisResult;
}

export function TailorWorkspace() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Input state kept for re-generation with different template
  const [draftInput, setDraftInput] = useState<TailorInput | null>(null);
  const [lastInput, setLastInput] = useState<TailorInput | null>(null);

  // Refs for keyboard shortcut access to latest state
  const resultRef = useRef(result);
  resultRef.current = result;
  const lastInputRef = useRef(lastInput);
  lastInputRef.current = lastInput;
  const selectedTemplateRef = useRef(selectedTemplate);
  selectedTemplateRef.current = selectedTemplate;

  useEffect(() => {
    fetch("/api/tailor")
      .then((response) =>
        readJsonResponse<{ templates: TemplateOption[] }>(
          response,
          "Failed to load templates"
        )
      )
      .then((data) => {
        setTemplates(data.templates);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const input = draftInput;
    if (!input || input.jobDescription.trim().length < 20) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    if (result?.resume) {
      const resumeAnalysis = analyzeResumeFit(
        input.jobDescription,
        result.resume
      );
      setAnalysis({
        ...resumeAnalysis,
        matchedEntriesCount: result.analysis.matchedEntriesCount,
      });
      setIsAnalyzing(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await fetch("/api/tailor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...input,
            action: "analyze",
          }),
          signal: controller.signal,
        });

        const data = await readJsonResponse<AnalyzeResult>(
          res,
          "Failed to analyze job description"
        );

        if (!cancelled) {
          setAnalysis(data.analysis);
        }
      } catch (err) {
        const isAbortError =
          err instanceof DOMException && err.name === "AbortError";
        if (!cancelled && !isAbortError) {
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [draftInput, result?.analysis.matchedEntriesCount, result?.resume]);

  const generate = useCallback(
    async (input: TailorInput, templateId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/tailor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...input,
            templateId,
            action: "generate",
          }),
        });

        const data = await readJsonResponse<GenerateResult>(
          res,
          "Failed to generate resume"
        );
        setResult(data);
        setAnalysis(data.analysis);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Network error. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Register page-specific keyboard shortcuts
  const generateRef = useRef(generate);
  generateRef.current = generate;
  const shortcuts = useMemo(
    () => [
      {
        key: "Enter",
        ctrl: true,
        description: "Re-generate resume",
        category: "actions" as const,
        action: () => {
          if (lastInputRef.current) {
            generateRef.current(
              lastInputRef.current,
              selectedTemplateRef.current
            );
          }
        },
      },
      {
        key: "e",
        ctrl: true,
        description: "Export/download PDF",
        category: "actions" as const,
        action: () => {
          const pdfUrl = resultRef.current?.pdfUrl;
          if (pdfUrl) {
            window.open(pdfUrl, "_blank", "noopener,noreferrer");
          }
        },
      },
    ],
    []
  );
  useRegisterShortcuts("studio-tailored", shortcuts);

  function handleSubmit(input: TailorInput) {
    setDraftInput(input);
    setLastInput(input);
    generate(input, selectedTemplate);
  }

  function handleDraftChange(input: TailorInput) {
    setDraftInput(input);
    if (result) {
      setResult(null);
    }
  }

  function handleResumeChange(resume: TailoredResume) {
    if (!lastInput) return;

    const resumeAnalysis = analyzeResumeFit(lastInput.jobDescription, resume);
    setResult((current) =>
      current
        ? {
            ...current,
            resume,
            analysis: {
              ...resumeAnalysis,
              matchedEntriesCount: current.analysis.matchedEntriesCount,
            },
          }
        : current
    );
    setAnalysis((current) => ({
      ...resumeAnalysis,
      matchedEntriesCount: current?.matchedEntriesCount ?? 0,
    }));
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplate(templateId);
    if (lastInput) {
      generate(lastInput, templateId);
    }
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Tailor Resume
          </h1>
          <p className="text-muted-foreground mt-1">
            Paste a job description to generate a tailored resume from your
            knowledge bank
          </p>
        </div>

        {/* Step 1: Input */}
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </div>
            <h2 className="font-semibold">Paste Job Description</h2>
          </div>
          <JDInput
            onSubmit={handleSubmit}
            onChange={handleDraftChange}
            isLoading={isLoading}
            submitLabel="Auto-Tailor"
            loadingLabel="Auto-tailoring..."
          />

          {(isAnalyzing || analysis) && (
            <div className="mt-6 border-t pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold">Gap Analysis</h3>
                {isAnalyzing && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating
                  </span>
                )}
              </div>
              {analysis && (
                <GapAnalysis
                  gaps={analysis.gaps}
                  keywordsFound={analysis.keywordsFound}
                  keywordsMissing={analysis.keywordsMissing}
                  matchScore={analysis.matchScore}
                />
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            title="Generation failed"
            message={error}
            onDismiss={() => setError(null)}
            variant="inline"
          />
        )}

        {/* Results */}
        {result && (
          <>
            {/* Step 2: Preview */}
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </div>
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tailored Resume
                </h2>
              </div>
              <ResumePreview
                resume={result.resume}
                pdfUrl={result.pdfUrl}
                resumeId={result.savedResume.id}
                matchScore={result.analysis.matchScore}
                templateId={selectedTemplate}
                templates={templates}
                onTemplateChange={handleTemplateChange}
                keywordsFound={analysis?.keywordsFound ?? result.analysis.keywordsFound}
                keywordsMissing={
                  analysis?.keywordsMissing ?? result.analysis.keywordsMissing
                }
                jobDescription={lastInput?.jobDescription}
                onResumeChange={handleResumeChange}
              />
            </div>

            {/* Step 3: Gap Analysis */}
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </div>
                <h2 className="font-semibold">Gap Analysis</h2>
              </div>
              <GapAnalysis
                gaps={analysis?.gaps ?? result.analysis.gaps}
                keywordsFound={analysis?.keywordsFound ?? result.analysis.keywordsFound}
                keywordsMissing={
                  analysis?.keywordsMissing ?? result.analysis.keywordsMissing
                }
                matchScore={analysis?.matchScore ?? result.analysis.matchScore}
              />
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
