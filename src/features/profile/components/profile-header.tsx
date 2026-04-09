"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  completeness: number;
  name: string;
}

export function ProfileHeader({ completeness, name }: ProfileHeaderProps) {
  return (
    <div className="hero-gradient border-b">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Your Professional Profile
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Keep your profile up to date for the best job matching results.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 lg:w-64">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                  completeness >= 80
                    ? "bg-success/20 text-success"
                    : completeness >= 50
                    ? "bg-warning/20 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {completeness}%
              </div>
              <div>
                <p className="font-medium">Profile Complete</p>
                <p className="text-sm text-muted-foreground">
                  {completeness >= 80 ? "Excellent!" : completeness >= 50 ? "Almost there" : "Getting started"}
                </p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completeness >= 80
                    ? "bg-success"
                    : completeness >= 50
                    ? "bg-warning"
                    : "bg-primary"
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
