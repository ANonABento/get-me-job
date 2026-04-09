"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Brain,
  Briefcase,
  Lightbulb,
  MessageSquare,
  Target,
} from "lucide-react";

export function InterviewEmptyState() {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
        <MessageSquare className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold">No Jobs to Practice For</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Add a job description first to get personalized interview questions based on the role.
      </p>
      <Link
        className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        href="/jobs"
      >
        <Briefcase className="h-5 w-5" />
        Add a Job
      </Link>

      <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
        <Tip
          color="blue"
          description="Practice STAR method responses for common scenarios."
          icon={<Brain className="h-5 w-5" />}
          title="Behavioral Questions"
        />
        <Tip
          color="violet"
          description="Get role-specific technical questions and feedback."
          icon={<Target className="h-5 w-5" />}
          title="Technical Questions"
        />
        <Tip
          color="amber"
          description="Handle hypothetical scenarios with confidence."
          icon={<Lightbulb className="h-5 w-5" />}
          title="Situational Questions"
        />
      </div>
    </div>
  );
}

function Tip({
  color,
  description,
  icon,
  title,
}: {
  color: string;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-info/10 text-info",
    violet: "bg-primary/10 text-primary",
    amber: "bg-warning/10 text-warning",
  };

  return (
    <div className="p-4 rounded-xl bg-muted/50">
      <div
        className={`p-2 w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
