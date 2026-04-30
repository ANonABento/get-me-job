"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { InterviewActiveSession } from "@/components/interview/interview-active-session";
import { InterviewJobSelection } from "@/components/interview/interview-job-selection";
import { InterviewSummary } from "@/components/interview/interview-summary";
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
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
    (job) => job.id === interview.selectedJob,
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
    [difficulty, followUp, interview],
  );

  const handleResumeSession = useCallback(
    (pastSession: PastSession) => {
      followUp.resetFollowUp();
      interview.resumeSession(pastSession);
    },
    [followUp, interview],
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
    <AppPage className="pb-0">
      <PageHeader
        width="wide"
        icon={Sparkles}
        eyebrow="AI Interview Coach"
        title="Interview Preparation"
        description="Practice with AI-generated questions tailored to your target jobs and receive instant feedback."
      />

      <PageContent>
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
            onDeleteSession={(sessionId) =>
              void interview.deleteSession(sessionId)
            }
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
      </PageContent>
    </AppPage>
  );
}
