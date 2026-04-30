"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Brain,
  Briefcase,
  Building2,
  GraduationCap,
  Info,
  Lightbulb,
  Loader2,
  MessageSquare,
  Mic,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrepGuideCard } from "@/components/interview/prep-guide-card";
import { PastSessionsList } from "@/components/interview/past-sessions-list";
import {
  INTERVIEW_DIFFICULTIES,
  type InterviewDifficulty,
} from "@/lib/constants";
import type { JobDescription } from "@/types";
import type { InterviewMode, PastSession } from "@/types/interview";

const INTERVIEW_DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  executive: "Executive",
};

interface InterviewJobSelectionProps {
  jobs: JobDescription[];
  selectedJob: string | null;
  generating: boolean;
  onStartInterview: (jobId: string, mode: InterviewMode) => void;
  difficulty: InterviewDifficulty;
  onDifficultyChange: (value: InterviewDifficulty) => void;
  pastSessions: PastSession[];
  onResumeSession: (session: PastSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function InterviewJobSelection({
  jobs,
  selectedJob,
  generating,
  onStartInterview,
  difficulty,
  onDifficultyChange,
  pastSessions,
  onResumeSession,
  onDeleteSession,
}: InterviewJobSelectionProps) {
  const [showPrepGuide, setShowPrepGuide] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const togglePrepGuide = (id: string) =>
    setShowPrepGuide(showPrepGuide === id ? null : id);

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
          <MessageSquare className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">No Jobs to Practice For</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Add a job description first to get personalized interview questions
          based on the role.
        </p>
        <Link
          href="/opportunities"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-xl gradient-bg text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Briefcase className="h-5 w-5" />
          Add an Opportunity
        </Link>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
          <Tip
            icon={<Brain className="h-5 w-5" />}
            color="blue"
            title="Behavioral Questions"
            description="Practice STAR method responses for common scenarios."
          />
          <Tip
            icon={<Target className="h-5 w-5" />}
            color="violet"
            title="Technical Questions"
            description="Get role-specific technical questions and feedback."
          />
          <Tip
            icon={<Lightbulb className="h-5 w-5" />}
            color="amber"
            title="Situational Questions"
            description="Handle hypothetical scenarios with confidence."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      <PastSessionsList
        pastSessions={pastSessions}
        jobs={jobs}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onResumeSession={onResumeSession}
        onDeleteSession={onDeleteSession}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select a job to practice for:</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Difficulty:
          </span>
          <Select
            value={difficulty}
            onValueChange={(value) =>
              onDifficultyChange(value as InterviewDifficulty)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_DIFFICULTIES.map((level) => (
                <SelectItem key={level} value={level}>
                  {INTERVIEW_DIFFICULTY_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-4">
            <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Button
                  onClick={() => onStartInterview(job.id, "text")}
                  disabled={generating}
                  className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
                >
                  {generating && selectedJob === job.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  Text Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onStartInterview(job.id, "voice")}
                  disabled={generating}
                  className="flex-1"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Practice
                </Button>
              </div>

              <div className="flex items-center gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePrepGuide(job.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Target className="h-4 w-4 mr-1" />
                  {showPrepGuide === job.id ? "Hide Prep Guide" : "Prep Guide"}
                </Button>
                <Link
                  href={`/jobs/research/${job.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Company Research
                </Link>
              </div>
            </div>

            {showPrepGuide === job.id && (
              <div className="animate-enter">
                <PrepGuideCard jobId={job.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tip({
  icon,
  color,
  title,
  description,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  description: string;
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
