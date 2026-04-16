"use client";

import { useState } from "react";
import { FileSearch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeATS } from "@/lib/ats/analyzer";
import type { ATSAnalysisResult } from "@/lib/ats/analyzer";
import { textToProfile, textToJob } from "@/lib/ats/text-to-profile";
import { ScoreDisplay } from "./score-display";
import { FixSuggestionsList } from "./fix-suggestions";

const MIN_RESUME_LENGTH = 50;

export function ScannerForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleAnalyze() {
    if (resumeText.trim().length < MIN_RESUME_LENGTH) return;

    setAnalyzing(true);

    // Use requestAnimationFrame to allow the UI to update before heavy computation
    requestAnimationFrame(() => {
      const profile = textToProfile(resumeText);
      const job = jobText.trim().length > 20 ? textToJob(jobText) : undefined;
      const analysis = analyzeATS(profile, job);
      setResult(analysis);
      setAnalyzing(false);
    });
  }

  function handleReset() {
    setResult(null);
    setResumeText("");
    setJobText("");
  }

  const canAnalyze = resumeText.trim().length >= MIN_RESUME_LENGTH && !analyzing;

  if (result) {
    return (
      <div className="space-y-8">
        <ScoreDisplay result={result} />
        <FixSuggestionsList issues={result.issues} />

        {/* CTA */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Want AI-powered resume tailoring?</h3>
          <p className="text-muted-foreground mb-4">
            Get personalized rewrites, keyword optimization, and cover letters generated for each job.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="gradient" size="pill" asChild>
              <a href="/sign-up">Sign up free &rarr;</a>
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Scan another resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
          Paste your resume text <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="resume-text"
          placeholder="Paste your full resume text here..."
          className="min-h-[200px] font-mono text-sm"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {resumeText.trim().length < MIN_RESUME_LENGTH
            ? `At least ${MIN_RESUME_LENGTH} characters required`
            : `${resumeText.trim().split(/\s+/).length} words`}
        </p>
      </div>

      <div>
        <label htmlFor="job-text" className="block text-sm font-medium mb-2">
          Paste job description <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="job-text"
          placeholder="Paste the job description to check keyword matching..."
          className="min-h-[120px] font-mono text-sm"
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Adding a job description enables keyword match analysis
        </p>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        variant="gradient"
        size="lg"
        className="w-full"
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileSearch className="h-4 w-4 mr-2" />
            Scan Resume
          </>
        )}
      </Button>
    </div>
  );
}
