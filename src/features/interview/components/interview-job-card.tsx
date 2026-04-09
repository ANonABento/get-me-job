"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  Target,
} from "lucide-react";
import { PrepGuideCard } from "@/components/interview/prep-guide-card";
import { Button } from "@/components/ui/button";
import type { JobDescription } from "@/types";

interface InterviewJobCardProps {
  generating: boolean;
  job: JobDescription;
  onStartInterview: (jobId: string, mode: "text" | "voice") => void;
  onTogglePrepGuide: (id: string) => void;
  selectedJob: string | null;
  showPrepGuide: boolean;
}

export function InterviewJobCard({
  generating,
  job,
  onStartInterview,
  onTogglePrepGuide,
  selectedJob,
  showPrepGuide,
}: InterviewJobCardProps) {
  return (
    <div className="space-y-4">
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
            className="flex-1 gradient-bg text-white hover:opacity-90"
            disabled={generating}
            onClick={() => onStartInterview(job.id, "text")}
          >
            {generating && selectedJob === job.id ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Text Practice
          </Button>
          <Button
            className="flex-1"
            disabled={generating}
            onClick={() => onStartInterview(job.id, "voice")}
            variant="outline"
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice Practice
          </Button>
        </div>

        <div className="flex items-center gap-2 border-t pt-3">
          <Button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onTogglePrepGuide(job.id)}
            size="sm"
            variant="ghost"
          >
            <Target className="h-4 w-4 mr-1" />
            {showPrepGuide ? "Hide Prep Guide" : "Prep Guide"}
          </Button>
          <Link
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            href={`/jobs/research/${job.id}`}
          >
            <Info className="h-4 w-4" />
            Company Research
          </Link>
        </div>
      </div>

      {showPrepGuide && (
        <div className="animate-in">
          <PrepGuideCard jobId={job.id} />
        </div>
      )}
    </div>
  );
}
