"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Download,
  FileEdit,
  Info,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CoverLetterDialog } from "@/components/cover-letter/cover-letter-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useErrorToast } from "@/hooks/use-error-toast";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import { readJsonResponse } from "@/lib/http";
import type { JobDescription, JobMatch } from "@/types";

const ATSScoreBreakdown = dynamic(
  () =>
    import("@/components/ats/score-breakdown").then(
      (module) => module.ATSScoreBreakdown,
    ),
  {
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />,
  },
);

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
}

interface TemplatesResponse {
  templates?: ResumeTemplate[];
}

interface AnalyzeOpportunityResponse {
  analysis?: JobMatch;
}

interface GenerateResumeResponse {
  pdfUrl?: string;
}

const FALLBACK_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional format",
  },
  { id: "modern", name: "Modern", description: "Contemporary design" },
  { id: "minimal", name: "Minimal", description: "Clean and simple" },
  {
    id: "executive",
    name: "Executive",
    description: "Bold headers, strong hierarchy",
  },
  { id: "tech", name: "Tech", description: "Tech industry focused" },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colors for creative roles",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout for experienced pros",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Conservative for business",
  },
];

interface OpportunityActionsProps {
  opportunity: JobDescription;
  onApply: () => Promise<void> | void;
  onGeneratedDocument?: () => Promise<void> | void;
}

export function OpportunityActions({
  opportunity,
  onApply,
  onGeneratedDocument,
}: OpportunityActionsProps) {
  const [templates, setTemplates] =
    useState<ResumeTemplate[]>(FALLBACK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [analysis, setAnalysis] = useState<JobMatch | null>(null);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [atsDialogOpen, setAtsDialogOpen] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const showErrorToast = useErrorToast();

  useEffect(() => {
    let active = true;

    async function fetchTemplates() {
      try {
        const response = await fetch("/api/opportunities/templates");
        const data = await readJsonResponse<TemplatesResponse>(
          response,
          "Failed to load templates",
        );
        if (active) setTemplates(data.templates || FALLBACK_TEMPLATES);
      } catch {
        if (active) setTemplates(FALLBACK_TEMPLATES);
      }
    }

    void fetchTemplates();
    return () => {
      active = false;
    };
  }, []);

  const analyzeOpportunity = useCallback(async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        `/api/opportunities/${opportunity.id}/analyze`,
        { method: "POST" },
      );
      const data = await readJsonResponse<AnalyzeOpportunityResponse>(
        response,
        "Failed to analyze opportunity",
      );
      setAnalysis(data.analysis ?? null);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not analyze opportunity",
        fallbackDescription: "Please try the analysis again.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [opportunity.id, showErrorToast]);

  const generateResume = useCallback(async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `/api/opportunities/${opportunity.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId: selectedTemplate }),
        },
      );
      const data = await readJsonResponse<GenerateResumeResponse>(
        response,
        "Failed to generate resume",
      );
      if (data.pdfUrl) window.open(data.pdfUrl, "_blank");
      await onGeneratedDocument?.();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not generate resume",
        fallbackDescription: "Please try generating the resume again.",
      });
    } finally {
      setGenerating(false);
    }
  }, [onGeneratedDocument, opportunity.id, selectedTemplate, showErrorToast]);

  const runAtsCheck = useCallback(async () => {
    setAtsAnalyzing(true);
    try {
      const response = await fetch("/api/ats/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: opportunity.id }),
      });
      const data = await readJsonResponse<ATSAnalysisResult>(
        response,
        "Failed to run ATS check",
      );
      setAtsResult(data);
      setAtsDialogOpen(true);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not run ATS check",
        fallbackDescription: "Please try the ATS check again.",
      });
    } finally {
      setAtsAnalyzing(false);
    }
  }, [opportunity.id, showErrorToast]);

  return (
    <>
      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Actions
        </h2>
        <div className="mt-4 grid gap-3">
          <Button
            type="button"
            className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => void onApply()}
          >
            <Send className="mr-2 h-4 w-4" />
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => void analyzeOpportunity()}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {analysis ? "Re-analyze Match" : "Analyze Match"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => void runAtsCheck()}
            disabled={atsAnalyzing}
          >
            {atsAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {atsResult ? "Re-check ATS" : "ATS Check"}
          </Button>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger aria-label="Resume template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => void generateResume()}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Resume
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => setCoverLetterOpen(true)}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Cover Letter
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href={`/opportunities/${opportunity.id}/research`}>
              <Info className="mr-2 h-4 w-4" />
              Company Research
            </Link>
          </Button>
        </div>
      </section>

      {atsResult && (
        <ATSScoreBreakdown
          result={atsResult}
          open={atsDialogOpen}
          onOpenChange={setAtsDialogOpen}
        />
      )}
      <CoverLetterDialog
        open={coverLetterOpen}
        onOpenChange={(open) => {
          setCoverLetterOpen(open);
          if (!open) void onGeneratedDocument?.();
        }}
        jobId={opportunity.id}
        jobTitle={opportunity.title}
        company={opportunity.company}
      />
    </>
  );
}
