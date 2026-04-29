"use client";

import { FileText, Mail, Sparkles } from "lucide-react";

const FEATURE_DESCRIPTIONS = [
  {
    title: "Resume Parsing",
    description: "Extract skills, experience, and education from uploaded resumes automatically",
    icon: <FileText className="h-4 w-4 text-info" />,
    color: "bg-info/10",
  },
  {
    title: "Resume Tailoring",
    description: "Generate job-specific resumes optimized for ATS and recruiter review",
    icon: <Sparkles className="h-4 w-4 text-warning" />,
    color: "bg-warning/10",
  },
  {
    title: "Cover Letters",
    description: "Create personalized cover letters matching your profile to job requirements",
    icon: <Mail className="h-4 w-4 text-accent" />,
    color: "bg-accent/10",
  },
];

export function WhatAiPowers() {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">What AI Powers</h2>
          <p className="text-sm text-muted-foreground">Your configured provider enables these features</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FEATURE_DESCRIPTIONS.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
            <div className={`p-2 rounded-lg ${feature.color} shrink-0`}>{feature.icon}</div>
            <div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
