"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TailoredResume } from "@/lib/resume/generator";
import { ExportMenu } from "./export-menu";

interface ResumePreviewProps {
  resume: TailoredResume;
  pdfUrl: string;
  resumeId: string;
  matchScore: number;
  templateId: string;
  templates: { id: string; name: string; description: string }[];
  onTemplateChange: (templateId: string) => void;
}

export function ResumePreview({
  resume,
  pdfUrl,
  resumeId,
  matchScore,
  templateId,
  templates,
  onTemplateChange,
}: ResumePreviewProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Match score badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white",
              matchScore >= 70
                ? "bg-emerald-500"
                : matchScore >= 40
                ? "bg-amber-500"
                : "bg-red-500"
            )}
          >
            {matchScore}%
          </div>
          <div>
            <p className="font-semibold">Match Score</p>
            <p className="text-sm text-muted-foreground">
              {matchScore >= 70
                ? "Strong match"
                : matchScore >= 40
                ? "Moderate match"
                : "Weak match — review gaps below"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
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
            resume={resume}
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
              <h3 className="font-semibold text-lg">{resume.contact.name}</h3>
              <p className="text-muted-foreground text-xs">
                {[resume.contact.email, resume.contact.phone, resume.contact.location]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Summary
              </h4>
              <p>{resume.summary}</p>
            </div>

            {/* Experience */}
            {resume.experiences.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Experience
                </h4>
                <div className="space-y-3">
                  {resume.experiences.map((exp, i) => (
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
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Education
                </h4>
                {resume.education.map((edu, i) => (
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
