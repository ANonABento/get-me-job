"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { JDInput } from "@/components/tailor/jd-input";
import { ResumePreview } from "@/components/tailor/resume-preview";
import { GapAnalysis } from "@/components/tailor/gap-analysis";
import { FileText, Sparkles } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ErrorState } from "@/components/ui/error-state";
import type { TailoredResume } from "@/lib/resume/generator";
import type { GapItem } from "@/lib/tailor/analyze";
import { useRegisterShortcuts } from "@/components/keyboard-shortcuts";

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

export default function TailorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [result, setResult] = useState<GenerateResult | null>(null);

  // Input state kept for re-generation with different template
  const [lastInput, setLastInput] = useState<{
    jobDescription: string;
    jobTitle: string;
    company: string;
  } | null>(null);

  // Refs for keyboard shortcut access to latest state
  const resultRef = useRef(result);
  resultRef.current = result;
  const lastInputRef = useRef(lastInput);
  lastInputRef.current = lastInput;
  const selectedTemplateRef = useRef(selectedTemplate);
  selectedTemplateRef.current = selectedTemplate;

  useEffect(() => {
    fetch("/api/tailor")
      .then((r) => r.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch(() => {});
  }, []);

  const generate = useCallback(
    async (
      input: { jobDescription: string; jobTitle: string; company: string },
      templateId: string
    ) => {
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

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to generate resume");
          return;
        }

        setResult(data);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Register page-specific keyboard shortcuts
  const generateRef = useRef(generate);
  generateRef.current = generate;
  useRegisterShortcuts("tailor", useMemo(() => [
    {
      key: "Enter",
      ctrl: true,
      description: "Re-generate resume",
      category: "actions" as const,
      action: () => {
        if (lastInputRef.current) {
          generateRef.current(lastInputRef.current, selectedTemplateRef.current);
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
  ], []));

  function handleSubmit(input: {
    jobDescription: string;
    jobTitle: string;
    company: string;
  }) {
    setLastInput(input);
    generate(input, selectedTemplate);
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
        <JDInput onSubmit={handleSubmit} isLoading={isLoading} />
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
              gaps={result.analysis.gaps}
              keywordsFound={result.analysis.keywordsFound}
              keywordsMissing={result.analysis.keywordsMissing}
              matchScore={result.analysis.matchScore}
            />
          </div>
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}
