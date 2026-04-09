"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Info,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { SaveToDocsButton } from "@/components/google";
import { Button } from "@/components/ui/button";
import { getInterviewCategoryStyle } from "@/features/interview/category-styles";
import type { InterviewPracticeSession } from "@/features/interview/client-types";
import { formatInterviewForDocs } from "@/features/interview/utils";
import type { JobDescription } from "@/types";

interface InterviewSummaryProps {
  onReset: () => void;
  selectedJob?: JobDescription;
  session: InterviewPracticeSession;
}

export function InterviewSummary({
  onReset,
  selectedJob,
  session,
}: InterviewSummaryProps) {
  const answeredCount = session.answers.filter((answer) => answer.trim()).length;
  const feedbackEntries = session.feedback.filter(Boolean);
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
      <div className="rounded-2xl border border-success/50 bg-success/5 p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 text-success mb-6">
          <Trophy className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Interview Complete!</h2>
        <p className="text-muted-foreground mt-2">
          You answered all {session.questions.length} questions. Review your responses and
          feedback below.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button className="gradient-bg text-white hover:opacity-90" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Interview
          </Button>
          <SaveToDocsButton
            content={formatInterviewForDocs(session, selectedJob)}
            title={`Interview Prep - ${selectedJob?.title || "Practice"} at ${selectedJob?.company || "Company"}`}
          />
          {selectedJob && (
            <Link href={`/jobs/research/${selectedJob.id}`}>
              <Button variant="outline">
                <Info className="h-4 w-4 mr-2" />
                Research {selectedJob.company}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">
              {answeredCount}/{session.questions.length}
            </p>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary capitalize">
              {performanceLevel}
            </p>
            <p className="text-xs text-muted-foreground">Response Quality</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">
              {feedbackEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">Feedback Received</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold">Your Responses</h3>
      {session.questions.map((question, index) => {
        const categoryStyle = getInterviewCategoryStyle(question.category);

        return (
          <div key={index} className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-5 border-b bg-muted/30">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} mb-3`}
              >
                {categoryStyle.icon}
                {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
              </span>
              <h4 className="font-semibold">{question.question}</h4>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer</p>
                <p className="text-sm">{session.answers[index] || "No answer provided"}</p>
              </div>
              {session.feedback[index] && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm font-medium text-primary flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    AI Feedback
                  </p>
                  <p className="text-sm">{session.feedback[index]}</p>
                </div>
              )}

              {session.followUps[index] && session.followUps[index].length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <p className="text-sm font-medium text-warning flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Follow-up Questions ({session.followUps[index].length})
                  </p>
                  {session.followUps[index].map((followUp, followUpIndex) => (
                    <div
                      key={followUpIndex}
                      className="pl-4 border-l-2 border-warning/30 space-y-2"
                    >
                      <p className="text-sm font-medium">{followUp.followUpQuestion}</p>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Your Response
                        </p>
                        <p className="text-sm">{followUp.answer}</p>
                      </div>
                      {followUp.feedback && (
                        <div className="rounded-lg bg-warning/5 border border-warning/30 p-3">
                          <p className="text-xs font-medium text-warning mb-1">Feedback</p>
                          <p className="text-sm">{followUp.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
