"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ActiveInterview } from "@/features/interview/components/active-interview";
import { InterviewSummary } from "@/features/interview/components/interview-summary";
import { JobSelection } from "@/features/interview/components/job-selection";
import { useInterviewPractice } from "@/features/interview/hooks/use-interview-practice";

export default function InterviewPage() {
  const {
    currentAnswer,
    currentFollowUp,
    currentQuestion,
    deleteSession,
    difficulty,
    followUpMode,
    generating,
    isComplete,
    isListening,
    isSpeaking,
    jobs,
    loading,
    loadingFollowUp,
    pastSessions,
    requestFollowUpQuestion,
    resetSession,
    resumeSession,
    selectedJob,
    selectedJobData,
    session,
    setCurrentAnswer,
    setDifficulty,
    setShowHint,
    setShowPrepGuide,
    setShowHistory,
    showHint,
    showHistory,
    showPrepGuide,
    skipFollowUp,
    speakQuestion,
    startInterview,
    startListening,
    stopListening,
    submitAnswer,
    submitFollowUpAnswer,
    submitting,
  } = useInterviewPractice();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI Interview Coach
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Interview Preparation
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Practice with AI-generated questions tailored to your target jobs and receive instant feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!session ? (
          <JobSelection
            difficulty={difficulty}
            generating={generating}
            jobs={jobs}
            onDeleteSession={deleteSession}
            onDifficultyChange={setDifficulty}
            onResumeSession={resumeSession}
            onStartInterview={startInterview}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onTogglePrepGuide={(id) =>
              setShowPrepGuide(showPrepGuide === id ? null : id)
            }
            pastSessions={pastSessions}
            selectedJob={selectedJob}
            showHistory={showHistory}
            showPrepGuide={showPrepGuide}
          />
        ) : isComplete ? (
          <InterviewSummary
            onReset={resetSession}
            selectedJob={selectedJobData}
            session={session}
          />
        ) : (
          <ActiveInterview
            currentAnswer={currentAnswer}
            currentFollowUp={currentFollowUp}
            currentQuestion={currentQuestion}
            followUpMode={followUpMode}
            isListening={isListening}
            isSpeaking={isSpeaking}
            loadingFollowUp={loadingFollowUp}
            onCurrentAnswerChange={setCurrentAnswer}
            onRequestFollowUp={requestFollowUpQuestion}
            onReset={resetSession}
            onSkipFollowUp={skipFollowUp}
            onSpeakQuestion={speakQuestion}
            onStartListening={startListening}
            onStopListening={stopListening}
            onSubmitAnswer={submitAnswer}
            onSubmitFollowUpAnswer={submitFollowUpAnswer}
            onToggleHint={() => setShowHint(!showHint)}
            selectedJob={selectedJobData}
            session={session}
            showHint={showHint}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
