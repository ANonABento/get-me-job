"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  SkipForward,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RecordingControls } from "@/components/interview/recording-controls";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";
import { useErrorToast } from "@/hooks/use-error-toast";
import { CategoryBadge } from "@/lib/interview/category-display";
import type { JobDescription } from "@/types";
import type { CurrentFollowUp, InterviewSession } from "@/types/interview";

interface InterviewActiveSessionProps {
  session: InterviewSession;
  selectedJobData?: JobDescription;
  currentAnswer: string;
  onChangeAnswer: (value: string) => void;
  submitting: boolean;
  onSubmitAnswer: () => void;
  onEndInterview: () => void;
  followUpMode: boolean;
  currentFollowUp: CurrentFollowUp | null;
  loadingFollowUp: boolean;
  onRequestFollowUp: () => void;
  onSubmitFollowUp: () => void;
  onSkipFollowUp: () => void;
}

export function InterviewActiveSession({
  session,
  selectedJobData,
  currentAnswer,
  onChangeAnswer,
  submitting,
  onSubmitAnswer,
  onEndInterview,
  followUpMode,
  currentFollowUp,
  loadingFollowUp,
  onRequestFollowUp,
  onSubmitFollowUp,
  onSkipFollowUp,
}: InterviewActiveSessionProps) {
  const [showHint, setShowHint] = useState(false);
  const voiceAnswerSeedRef = useRef("");
  const showErrorToast = useErrorToast();

  const {
    isListening,
    isSupported: voiceInputSupported,
    transcript,
    interimTranscript,
    resetTranscript,
    startListening,
    stopListening,
  } = useVoiceInput({
    continuous: true,
    onError: (error) => {
      showErrorToast(error, {
        title: "Could not use voice input",
        fallbackDescription: "Please check your microphone and try again.",
      });
    },
  });

  const { isSpeaking, speak, stop: stopSpeaking } = useVoiceOutput({
    rate: 0.9,
  });

  const currentQuestion = session.questions[session.currentIndex];

  useEffect(() => {
    if (!isListening) return;

    const nextValue = [
      voiceAnswerSeedRef.current.trim(),
      transcript.trim(),
      interimTranscript.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    onChangeAnswer(nextValue);
  }, [interimTranscript, isListening, onChangeAnswer, transcript]);

  useEffect(() => {
    setShowHint(false);
    resetTranscript();
    stopListening();
    stopSpeaking();
  }, [followUpMode, resetTranscript, session.currentIndex, stopListening, stopSpeaking]);

  const handleToggleListening = () => {
    if (!voiceInputSupported) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    voiceAnswerSeedRef.current = currentAnswer;
    resetTranscript();
    startListening();
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    speak(currentQuestion.question);
  };

  const handleSubmitAnswer = () => {
    stopListening();
    stopSpeaking();
    setShowHint(false);
    onSubmitAnswer();
  };

  const handleSubmitFollowUp = () => {
    stopListening();
    onSubmitFollowUp();
  };

  const handleSkipFollowUp = () => {
    stopListening();
    onSkipFollowUp();
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{selectedJobData?.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedJobData?.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {session.mode === "voice" ? "Voice Mode" : "Text Mode"}
            </Badge>
            <Button variant="outline" size="sm" onClick={onEndInterview}>
              End Interview
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {session.currentIndex + 1} of {session.questions.length}
            </span>
            <span className="font-medium">
              {Math.round(
                ((session.currentIndex + 1) / session.questions.length) * 100
              )}
              %
            </span>
          </div>
          <Progress
            value={((session.currentIndex + 1) / session.questions.length) * 100}
            size="sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b bg-muted/30 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              {followUpMode && currentFollowUp ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
                    <Zap className="h-4 w-4" />
                    Follow-up Question
                  </span>
                  <h2 className="text-xl font-semibold leading-relaxed">
                    {currentFollowUp.question}
                  </h2>
                  {currentFollowUp.reason.trim() && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      Focus: {currentFollowUp.reason}
                    </p>
                  )}
                  {currentFollowUp.suggestedFocus.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentFollowUp.suggestedFocus.map((focus) => (
                        <span
                          key={focus}
                          className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {currentQuestion && (
                    <CategoryBadge category={currentQuestion.category} />
                  )}
                  <h2 className="text-xl font-semibold leading-relaxed">
                    {currentQuestion?.question}
                  </h2>
                </>
              )}
            </div>

            {session.mode === "voice" && !followUpMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleSpeakQuestion}
                className="shrink-0"
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="relative">
            <Textarea
              rows={8}
              value={currentAnswer}
              onChange={(event) => onChangeAnswer(event.target.value)}
              placeholder={
                followUpMode
                  ? "Elaborate on your previous answer..."
                  : session.mode === "voice"
                    ? "Click the microphone to speak, or type your answer..."
                    : "Type your answer here..."
              }
              className="resize-none text-base"
            />

            {session.mode === "voice" && (
              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                onClick={handleToggleListening}
                className="absolute bottom-3 right-3"
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
              </span>
              Recording speech...
            </div>
          )}

          {session.mode === "voice" && (
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="h-4 w-4" />
                <span>Record your answer for playback</span>
              </div>
              <RecordingControls compact />
            </div>
          )}

          {!followUpMode && currentQuestion?.suggestedAnswer && (
            <div className="overflow-hidden rounded-xl border bg-muted/30">
              <button
                type="button"
                onClick={() => setShowHint((currentValue) => !currentValue)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  Need a hint? View suggested answer structure
                </span>
                {showHint ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showHint && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.suggestedAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

          {followUpMode ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkipFollowUp}
                className="flex-1"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip Follow-up
              </Button>
              <Button
                onClick={handleSubmitFollowUp}
                disabled={submitting || !currentAnswer.trim()}
                className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Follow-up
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleSubmitAnswer}
                disabled={submitting || !currentAnswer.trim()}
                size="lg"
                className="w-full gradient-bg text-primary-foreground hover:opacity-90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Feedback...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {session.answers.length > 0 && session.currentIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={onRequestFollowUp}
                  disabled={loadingFollowUp}
                  className="w-full"
                >
                  {loadingFollowUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating follow-up...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Get Follow-up on Previous Answer
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
