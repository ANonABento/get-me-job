"use client";

import {
  GraduationCap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewEmptyState } from "@/features/interview/components/interview-empty-state";
import { InterviewHistory } from "@/features/interview/components/interview-history";
import { InterviewJobCard } from "@/features/interview/components/interview-job-card";
import type { PastInterviewSession } from "@/features/interview/client-types";
import type { InterviewDifficulty } from "@/features/interview/schemas";
import type { JobDescription } from "@/types";

interface JobSelectionProps {
  difficulty: InterviewDifficulty;
  generating: boolean;
  jobs: JobDescription[];
  onDeleteSession: (sessionId: string) => void;
  onDifficultyChange: (value: InterviewDifficulty) => void;
  onResumeSession: (session: PastInterviewSession) => void;
  onStartInterview: (jobId: string, mode: "text" | "voice") => void;
  onToggleHistory: () => void;
  onTogglePrepGuide: (id: string) => void;
  pastSessions: PastInterviewSession[];
  selectedJob: string | null;
  showHistory: boolean;
  showPrepGuide: string | null;
}

export function JobSelection({
  difficulty,
  generating,
  jobs,
  onDeleteSession,
  onDifficultyChange,
  onResumeSession,
  onStartInterview,
  onToggleHistory,
  onTogglePrepGuide,
  pastSessions,
  selectedJob,
  showHistory,
  showPrepGuide,
}: JobSelectionProps) {
  if (jobs.length === 0) {
    return <InterviewEmptyState />;
  }

  return (
    <div className="space-y-6 animate-in">
      <InterviewHistory
        jobs={jobs}
        onDeleteSession={onDeleteSession}
        onResumeSession={onResumeSession}
        onToggleHistory={onToggleHistory}
        pastSessions={pastSessions}
        showHistory={showHistory}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select a job to practice for:</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Difficulty:
          </span>
          <Select
            onValueChange={(value) => onDifficultyChange(value as InterviewDifficulty)}
            value={difficulty}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <InterviewJobCard
            generating={generating}
            job={job}
            key={job.id}
            onStartInterview={onStartInterview}
            onTogglePrepGuide={onTogglePrepGuide}
            selectedJob={selectedJob}
            showPrepGuide={showPrepGuide === job.id}
          />
        ))}
      </div>
    </div>
  );
}
