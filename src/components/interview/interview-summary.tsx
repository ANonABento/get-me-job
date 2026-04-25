"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CheckCircle2,
  Info,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonButton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/lib/interview/category-display";
import { formatInterviewForDocs } from "@/lib/interview/format-for-docs";
import type { JobDescription } from "@/types";
import type { InterviewSession } from "@/types/interview";

const SaveToDocsButton = dynamic(
  () => import("@/components/google").then((module) => module.SaveToDocsButton),
  { loading: () => <SkeletonButton className="w-36" />, ssr: false }
);

interface InterviewSummaryProps {
  session: InterviewSession;
  selectedJob?: JobDescription;
  onReset: () => void;
}

export function InterviewSummary({
  session,
  selectedJob,
  onReset,
}: InterviewSummaryProps) {
  const answeredCount = session.answers.filter((answer) => answer.trim()).length;
  const feedbackEntries = session.feedback.filter((feedback) => feedback.trim());
  const averageFeedbackLength =
    feedbackEntries.reduce((sum, feedback) => sum + feedback.length, 0) /
    (feedbackEntries.length || 1);
  const performanceLevel =
    averageFeedbackLength > 200
      ? "detailed"
      : averageFeedbackLength > 100
        ? "good"
        : "brief";

  return (
    <div className="space-y-6 animate-in">
      <div className="border-success/50 bg-success/5 rounded-2xl border p-8 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
          <Trophy className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Interview Complete!</h2>
        <p className="mt-2 text-muted-foreground">
          You answered all {session.questions.length} questions. Review your
          responses and feedback below.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={onReset} className="gradient-bg text-white hover:opacity-90">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start New Interview
          </Button>
          <SaveToDocsButton
            title={`Interview Prep - ${selectedJob?.title || "Practice"} at ${
              selectedJob?.company || "Company"
            }`}
            content={formatInterviewForDocs(session, selectedJob)}
          />
          {selectedJob && (
            <Link href={`/jobs/research/${selectedJob.id}`}>
              <Button variant="outline">
                <Info className="mr-2 h-4 w-4" />
                Research {selectedJob.company}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Target className="h-5 w-5 text-primary" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold text-primary">
              {answeredCount}/{session.questions.length}
            </p>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold capitalize text-primary">
              {performanceLevel}
            </p>
            <p className="text-xs text-muted-foreground">Response Quality</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold text-primary">
              {feedbackEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">Feedback Received</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold">Your Responses</h3>
      {session.questions.map((question, questionIndex) => (
        <div
          key={`${questionIndex}-${question.question}`}
          className="overflow-hidden rounded-2xl border bg-card"
        >
          <div className="border-b bg-muted/30 p-5">
            <CategoryBadge category={question.category} className="mb-3 text-xs" />
            <h4 className="font-semibold">{question.question}</h4>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Your Answer
              </p>
              <p className="text-sm">
                {session.answers[questionIndex] || "No answer provided"}
              </p>
            </div>
            {session.feedback[questionIndex] && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  AI Feedback
                </p>
                <p className="text-sm">{session.feedback[questionIndex]}</p>
              </div>
            )}

            {session.followUps[questionIndex]?.length ? (
              <div className="mt-4 space-y-4 border-t pt-4">
                <p className="flex items-center gap-2 text-sm font-medium text-warning">
                  <Zap className="h-4 w-4" />
                  Follow-up Questions ({session.followUps[questionIndex].length})
                </p>
                      {session.followUps[questionIndex].map((followUp, followUpIndex) => (
                  <div
                    key={`${questionIndex}-${followUpIndex}-${followUp.followUpQuestion}`}
                    className="space-y-2 border-l-2 border-warning/30 pl-4"
                  >
                    <p className="text-sm font-medium">
                      {followUp.followUpQuestion}
                    </p>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Your Response
                      </p>
                      <p className="text-sm">{followUp.answer}</p>
                    </div>
                    {followUp.feedback && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                        <p className="mb-1 text-xs font-medium text-warning">
                          Feedback
                        </p>
                        <p className="text-sm">{followUp.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
