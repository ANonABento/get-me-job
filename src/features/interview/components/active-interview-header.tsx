"use client";

import { Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { InterviewPracticeSession } from "@/features/interview/client-types";
import type { JobDescription } from "@/types";

interface ActiveInterviewHeaderProps {
  onReset: () => void;
  selectedJob?: JobDescription;
  session: InterviewPracticeSession;
}

export function ActiveInterviewHeader({
  onReset,
  selectedJob,
  session,
}: ActiveInterviewHeaderProps) {
  const progressValue =
    ((session.currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">{selectedJob?.title}</p>
            <p className="text-sm text-muted-foreground">{selectedJob?.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="gap-1" variant="outline">
            <Clock className="h-3 w-3" />
            {session.mode === "voice" ? "Voice Mode" : "Text Mode"}
          </Badge>
          <Button onClick={onReset} size="sm" variant="outline">
            End Interview
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {session.currentIndex + 1} of {session.questions.length}
          </span>
          <span className="font-medium">{Math.round(progressValue)}%</span>
        </div>
        <Progress size="sm" value={progressValue} />
      </div>
    </div>
  );
}
