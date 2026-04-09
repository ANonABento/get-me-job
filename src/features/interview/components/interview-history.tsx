"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PastInterviewSession } from "@/features/interview/client-types";
import type { JobDescription } from "@/types";

interface InterviewHistoryProps {
  jobs: JobDescription[];
  onDeleteSession: (sessionId: string) => void;
  onResumeSession: (session: PastInterviewSession) => void;
  onToggleHistory: () => void;
  pastSessions: PastInterviewSession[];
  showHistory: boolean;
}

export function InterviewHistory({
  jobs,
  onDeleteSession,
  onResumeSession,
  onToggleHistory,
  pastSessions,
  showHistory,
}: InterviewHistoryProps) {
  if (pastSessions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        onClick={onToggleHistory}
      >
        <span className="flex items-center gap-2 font-medium">
          <History className="h-5 w-5 text-primary" />
          Interview History ({pastSessions.length})
        </span>
        {showHistory ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {showHistory && (
        <div className="border-t divide-y">
          {pastSessions.slice(0, 10).map((pastSession) => {
            const job = jobs.find((item) => item.id === pastSession.jobId);
            const answeredCount = pastSession.answers?.length || 0;
            const totalQuestions = pastSession.questions.length;
            const isComplete = pastSession.status === "completed";

            return (
              <div
                key={pastSession.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      isComplete
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{job?.title || "Unknown Job"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{job?.company || "Unknown Company"}</span>
                      <span>•</span>
                      <span>
                        {answeredCount}/{totalQuestions} questions
                      </span>
                      <span>•</span>
                      <span>{pastSession.mode === "voice" ? "Voice" : "Text"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(pastSession.startedAt).toLocaleDateString()} at{" "}
                      {new Date(pastSession.startedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isComplete && job && (
                    <Button
                      onClick={() => onResumeSession(pastSession)}
                      size="sm"
                      variant="outline"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteSession(pastSession.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
