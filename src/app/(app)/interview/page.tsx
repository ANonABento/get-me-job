"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { InterviewActiveSession } from "@/components/interview/interview-active-session";
import { InterviewJobSelection } from "@/components/interview/interview-job-selection";
import { InterviewSummary } from "@/components/interview/interview-summary";
import { useFollowUp } from "@/hooks/useFollowUp";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import type { InterviewDifficulty } from "@/lib/constants";
import type { InterviewMode, PastSession } from "@/types/interview";

export default function InterviewPage() {
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("mid");
  const interview = useInterviewSession();
  const followUp = useFollowUp({
    session: interview.session,
    setSession: interview.setSession,
    currentAnswer: interview.currentAnswer,
    setCurrentAnswer: interview.setCurrentAnswer,
  });

  const selectedJobData = interview.jobs.find(
    (job) => job.id === interview.selectedJob
  );
  const isComplete =
    interview.session &&
    interview.session.currentIndex >= interview.session.questions.length;

  const resetInterview = useCallback(() => {
    followUp.resetFollowUp();
    interview.resetSession();
  }, [followUp, interview]);

  const handleStartInterview = useCallback(
    (jobId: string, mode: InterviewMode) => {
      followUp.resetFollowUp();
      void interview.startInterview(jobId, mode, difficulty);
    },
    [difficulty, followUp, interview]
  );

  const handleResumeSession = useCallback(
    (pastSession: PastSession) => {
      followUp.resetFollowUp();
      interview.resumeSession(pastSession);
    },
    [followUp, interview]
  );

  if (interview.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="hero-gradient border-b">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-enter">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI Interview Coach
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Interview Preparation
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Practice with AI-generated questions tailored to your target jobs
              and receive instant feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {!interview.session ? (
          <InterviewJobSelection
            jobs={interview.jobs}
            selectedJob={interview.selectedJob}
            generating={interview.generating}
            onStartInterview={handleStartInterview}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            pastSessions={interview.pastSessions}
            onResumeSession={handleResumeSession}
            onDeleteSession={(sessionId) => void interview.deleteSession(sessionId)}
          />
        ) : isComplete ? (
          <InterviewSummary
            session={interview.session}
            selectedJob={selectedJobData}
            onReset={resetInterview}
          />
        ) : (
          <InterviewActiveSession
            session={interview.session}
            selectedJobData={selectedJobData}
            currentAnswer={interview.currentAnswer}
            onChangeAnswer={interview.setCurrentAnswer}
            submitting={interview.submitting || followUp.submittingFollowUp}
            onSubmitAnswer={() => void interview.submitAnswer()}
            onEndInterview={resetInterview}
            followUpMode={followUp.followUpMode}
            currentFollowUp={followUp.currentFollowUp}
            loadingFollowUp={followUp.loadingFollowUp}
            onRequestFollowUp={() => void followUp.requestFollowUp()}
            onSubmitFollowUp={() => void followUp.submitFollowUpAnswer()}
            onSkipFollowUp={followUp.skipFollowUp}
          />
        )}
      </div>
    </div>
  );
}
