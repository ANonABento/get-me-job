"use client";

import { Rocket, CheckCircle } from "lucide-react";

const FEATURES = [
  "AI resume parsing",
  "Job match scoring",
  "Document Studio",
  "Mock interviews",
  "Resume exports",
  "Progress tracking",
] as const;

export function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg mb-6">
        <Rocket className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold">Welcome to Taida</h2>
      <p className="text-base mt-2 text-muted-foreground">
        Your AI-powered job application assistant. Let&apos;s set up your
        knowledge bank in a few quick steps.
      </p>
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          What Taida helps you with:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {FEATURES.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <CheckCircle className="h-3 w-3 text-success" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
