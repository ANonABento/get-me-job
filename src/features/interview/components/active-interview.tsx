"use client";

import { ActiveInterviewCard } from "@/features/interview/components/active-interview-card";
import { ActiveInterviewHeader } from "@/features/interview/components/active-interview-header";
import type {
  FollowUpPrompt,
  InterviewPracticeSession,
} from "@/features/interview/client-types";
import type { InterviewQuestion } from "@/features/interview/types";
import type { JobDescription } from "@/types";

interface ActiveInterviewProps {
  currentAnswer: string;
  currentFollowUp: FollowUpPrompt | null;
  currentQuestion?: InterviewQuestion;
  isListening: boolean;
  isSpeaking: boolean;
  loadingFollowUp: boolean;
  onCurrentAnswerChange: (value: string) => void;
  onRequestFollowUp: () => void;
  onReset: () => void;
  onSkipFollowUp: () => void;
  onSpeakQuestion: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitAnswer: () => void;
  onSubmitFollowUpAnswer: () => void;
  onToggleHint: () => void;
  session: InterviewPracticeSession;
  selectedJob?: JobDescription;
  showHint: boolean;
  followUpMode: boolean;
  submitting: boolean;
}

export function ActiveInterview({
  currentAnswer,
  currentFollowUp,
  currentQuestion,
  followUpMode,
  isListening,
  isSpeaking,
  loadingFollowUp,
  onCurrentAnswerChange,
  onRequestFollowUp,
  onReset,
  onSkipFollowUp,
  onSpeakQuestion,
  onStartListening,
  onStopListening,
  onSubmitAnswer,
  onSubmitFollowUpAnswer,
  onToggleHint,
  selectedJob,
  session,
  showHint,
  submitting,
}: ActiveInterviewProps) {
  return (
    <div className="space-y-6 animate-in">
      <ActiveInterviewHeader
        onReset={onReset}
        selectedJob={selectedJob}
        session={session}
      />
      <ActiveInterviewCard
        currentAnswer={currentAnswer}
        currentFollowUp={currentFollowUp}
        currentQuestion={currentQuestion}
        followUpMode={followUpMode}
        isListening={isListening}
        isSpeaking={isSpeaking}
        loadingFollowUp={loadingFollowUp}
        onCurrentAnswerChange={onCurrentAnswerChange}
        onRequestFollowUp={onRequestFollowUp}
        onSkipFollowUp={onSkipFollowUp}
        onSpeakQuestion={onSpeakQuestion}
        onStartListening={onStartListening}
        onStopListening={onStopListening}
        onSubmitAnswer={onSubmitAnswer}
        onSubmitFollowUpAnswer={onSubmitFollowUpAnswer}
        onToggleHint={onToggleHint}
        session={session}
        showHint={showHint}
        submitting={submitting}
      />
    </div>
  );
}
