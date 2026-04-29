"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
  Wand2,
  Loader2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TailoredResume } from "@/lib/resume/generator";
import { ExportMenu } from "./export-menu";
import {
  highlightKeywords,
  type HighlightSegment,
} from "@/lib/tailor/highlight";
import { ScoreRing, SCORE_STRONG, SCORE_MODERATE } from "./gap-analysis";

interface ResumePreviewProps {
  resume: TailoredResume;
  pdfUrl: string;
  resumeId: string;
  matchScore: number;
  templateId: string;
  templates: { id: string; name: string; description: string }[];
  onTemplateChange: (templateId: string) => void;
  keywordsFound?: string[];
  keywordsMissing?: string[];
  jobDescription?: string;
  onResumeChange?: (resume: TailoredResume) => void;
}

interface AutoTailorResponse {
  resume?: TailoredResume;
}

function HighlightedText({
  segments,
}: {
  segments: HighlightSegment[];
}) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "matched") {
          return (
            <mark
              key={i}
              className="bg-success/20 text-success rounded px-0.5"
            >
              {seg.text}
            </mark>
          );
        }
        if (seg.type === "missing") {
          return (
            <mark
              key={i}
              className="bg-warning/20 text-warning rounded px-0.5"
            >
              {seg.text}
            </mark>
          );
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}

function HighlightText({
  text,
  matchedKeywords,
  missingKeywords,
}: {
  text: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}) {
  const segments = highlightKeywords(text, matchedKeywords, missingKeywords);
  return <HighlightedText segments={segments} />;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

function DiffView({ original, improved }: { original: string; improved: string }) {
  const origLines = original.split("\n");
  const impLines = improved.split("\n");
  const maxLen = Math.max(origLines.length, impLines.length);

  const lines: DiffLine[] = [];
  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i] ?? "";
    const impLine = impLines[i] ?? "";
    if (origLine === impLine) {
      lines.push({ type: "unchanged", text: origLine });
    } else {
      if (origLine) lines.push({ type: "removed", text: origLine });
      if (impLine) lines.push({ type: "added", text: impLine });
    }
  }

  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs font-mono space-y-0.5 max-h-80 overflow-y-auto">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "px-2 py-0.5 rounded",
            line.type === "added" && "bg-success/10 text-success",
            line.type === "removed" && "bg-destructive/10 text-destructive line-through",
            line.type === "unchanged" && "text-muted-foreground"
          )}
        >
          <span className="select-none mr-2 opacity-50">
            {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
          </span>
          {line.text}
        </div>
      ))}
    </div>
  );
}

function resumeToText(resume: TailoredResume): string {
  const parts: string[] = [];
  if (resume.summary) parts.push(resume.summary);
  for (const exp of resume.experiences) {
    parts.push(`${exp.title} at ${exp.company}`);
    parts.push(exp.highlights.join("\n"));
  }
  parts.push(resume.skills.join(", "));
  return parts.join("\n");
}

export function ResumePreview({
  resume,
  pdfUrl,
  resumeId,
  matchScore,
  templateId,
  templates,
  onTemplateChange,
  keywordsFound = [],
  keywordsMissing = [],
  jobDescription = "",
  onResumeChange,
}: ResumePreviewProps) {
  const [expanded, setExpanded] = useState(true);
  const [autoTailorLoading, setAutoTailorLoading] = useState(false);
  const [autoTailorResult, setAutoTailorResult] =
    useState<TailoredResume | null>(null);
  const [resumeBeforeAutoTailor, setResumeBeforeAutoTailor] =
    useState<TailoredResume | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const pendingAutoTailorResumeRef = useRef<TailoredResume | null>(null);

  const displayResume = autoTailorResult ?? resume;

  useEffect(() => {
    if (!autoTailorResult) return;

    if (resume === autoTailorResult) {
      pendingAutoTailorResumeRef.current = null;
      return;
    }

    if (
      pendingAutoTailorResumeRef.current === autoTailorResult ||
      resume === resumeBeforeAutoTailor
    ) {
      return;
    }

    pendingAutoTailorResumeRef.current = null;
    setAutoTailorResult(null);
    setResumeBeforeAutoTailor(null);
    setShowDiff(false);
  }, [autoTailorResult, resume, resumeBeforeAutoTailor]);

  async function handleAutoTailor() {
    if (keywordsMissing.length === 0 || !jobDescription) return;

    setAutoTailorLoading(true);
    try {
      const res = await fetch("/api/tailor/autofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: displayResume,
          keywordsMissing,
          jobDescription,
        }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as AutoTailorResponse;
      if (data.resume) {
        pendingAutoTailorResumeRef.current = data.resume;
        setResumeBeforeAutoTailor((current) => current ?? displayResume);
        setAutoTailorResult(data.resume);
        onResumeChange?.(data.resume);
        setShowDiff(true);
      }
    } catch {
      // silently fail
    } finally {
      setAutoTailorLoading(false);
    }
  }

  function handleRevert() {
    if (resumeBeforeAutoTailor) {
      onResumeChange?.(resumeBeforeAutoTailor);
    }
    pendingAutoTailorResumeRef.current = null;
    setAutoTailorResult(null);
    setResumeBeforeAutoTailor(null);
    setShowDiff(false);
  }

  return (
    <div className="space-y-4">
      {/* Match score ring + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <ScoreRing score={matchScore} size={80} strokeWidth={7} />
          </div>
          <div>
            <p className="font-semibold">Match Score</p>
            <p className="text-sm text-muted-foreground">
              {matchScore >= SCORE_STRONG
                ? "Strong match"
                : matchScore >= SCORE_MODERATE
                ? "Moderate match"
                : "Needs work — review gaps below"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {keywordsMissing.length > 0 && jobDescription && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoTailor}
              disabled={autoTailorLoading}
            >
              {autoTailorLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-1.5" />
              )}
              Auto-Tailor
            </Button>
          )}
          {autoTailorResult && (
            <Button variant="ghost" size="sm" onClick={handleRevert}>
              <Undo2 className="h-4 w-4 mr-1.5" />
              Revert
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Preview
            </a>
          </Button>
          <Button size="sm" asChild title="Download PDF (Ctrl+E)">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </a>
          </Button>
          <ExportMenu
            resumeId={resumeId}
            resume={displayResume}
            templateId={templateId}
          />
        </div>
      </div>

      {/* Template picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Template:</span>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              t.id === templateId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Diff view when Auto-Tailor was applied */}
      {showDiff && autoTailorResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Auto-Tailor Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DiffView
              original={resumeToText(resumeBeforeAutoTailor ?? resume)}
              improved={resumeToText(autoTailorResult)}
            />
          </CardContent>
        </Card>
      )}

      {/* Resume content preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Resume Preview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="space-y-4 text-sm">
            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg">{displayResume.contact.name}</h3>
              <p className="text-muted-foreground text-xs">
                {[displayResume.contact.email, displayResume.contact.phone, displayResume.contact.location]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Summary
              </h4>
              <p>
                <HighlightText
                  text={displayResume.summary}
                  matchedKeywords={keywordsFound}
                  missingKeywords={keywordsMissing}
                />
              </p>
            </div>

            {/* Experience */}
            {displayResume.experiences.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Experience
                </h4>
                <div className="space-y-3">
                  {displayResume.experiences.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium">
                          {exp.title}{" "}
                          <span className="text-muted-foreground font-normal">
                            at {exp.company}
                          </span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {exp.dates}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {exp.highlights.map((h, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-1.5 text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3 w-3 mt-1 shrink-0 text-primary" />
                            <span>
                              <HighlightText
                                text={h}
                                matchedKeywords={keywordsFound}
                                missingKeywords={keywordsMissing}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {displayResume.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {displayResume.skills.map((skill, i) => {
                    const isMatched = keywordsFound.some(
                      (kw) => kw.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <span
                        key={i}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs",
                          isMatched
                            ? "bg-success/15 text-success"
                            : "bg-muted"
                        )}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Education */}
            {displayResume.education.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Education
                </h4>
                {displayResume.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <p>
                      {edu.degree} in {edu.field},{" "}
                      <span className="text-muted-foreground">
                        {edu.institution}
                      </span>
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {edu.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export { HighlightedText, DiffView, resumeToText };
