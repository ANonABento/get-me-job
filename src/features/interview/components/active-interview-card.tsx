"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  SkipForward,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { RecordingControls } from "@/components/interview/recording-controls";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInterviewCategoryStyle } from "@/features/interview/category-styles";
import type {
  FollowUpPrompt,
  InterviewPracticeSession,
} from "@/features/interview/client-types";
import type { InterviewQuestion } from "@/features/interview/types";

interface ActiveInterviewCardProps {
  currentAnswer: string;
  currentFollowUp: FollowUpPrompt | null;
  currentQuestion?: InterviewQuestion;
  followUpMode: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  loadingFollowUp: boolean;
  onCurrentAnswerChange: (value: string) => void;
  onRequestFollowUp: () => void;
  onSkipFollowUp: () => void;
  onSpeakQuestion: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitAnswer: () => void;
  onSubmitFollowUpAnswer: () => void;
  onToggleHint: () => void;
  session: InterviewPracticeSession;
  showHint: boolean;
  submitting: boolean;
}

export function ActiveInterviewCard({
  currentAnswer,
  currentFollowUp,
  currentQuestion,
  followUpMode,
  isListening,
  isSpeaking,
  loadingFollowUp,
  onCurrentAnswerChange,
  onRequestFollowUp,
  onSkipFollowUp,
  onSpeakQuestion,
  onStartListening,
  onStopListening,
  onSubmitAnswer,
  onSubmitFollowUpAnswer,
  onToggleHint,
  session,
  showHint,
  submitting,
}: ActiveInterviewCardProps) {
  const questionCategoryStyle = currentQuestion
    ? getInterviewCategoryStyle(currentQuestion.category)
    : null;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-6 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            {followUpMode && currentFollowUp ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                  <Zap className="h-4 w-4" />
                  Follow-up Question
                </span>
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentFollowUp.question}
                </h2>
                {currentFollowUp.suggestedFocus.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentFollowUp.suggestedFocus.map((focus, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {currentQuestion && questionCategoryStyle && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${questionCategoryStyle.bg} ${questionCategoryStyle.text}`}
                  >
                    {questionCategoryStyle.icon}
                    {currentQuestion.category.charAt(0).toUpperCase() +
                      currentQuestion.category.slice(1)}
                  </span>
                )}
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              </>
            )}
          </div>

          {session.mode === "voice" && !followUpMode && (
            <Button className="shrink-0" onClick={onSpeakQuestion} size="icon" variant="outline">
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="relative">
          <Textarea
            className="resize-none text-base"
            onChange={(event) => onCurrentAnswerChange(event.target.value)}
            placeholder={
              followUpMode
                ? "Elaborate on your previous answer..."
                : session.mode === "voice"
                ? "Click the microphone to speak, or type your answer..."
                : "Type your answer here..."
            }
            rows={8}
            value={currentAnswer}
          />

          {session.mode === "voice" && (
            <Button
              className="absolute bottom-3 right-3"
              onClick={isListening ? onStopListening : onStartListening}
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            Recording speech...
          </div>
        )}

        {session.mode === "voice" && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mic className="h-4 w-4" />
              <span>Record your answer for playback</span>
            </div>
            <RecordingControls compact />
          </div>
        )}

        {!followUpMode && currentQuestion?.suggestedAnswer && (
          <div className="rounded-xl border bg-muted/30 overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={onToggleHint}
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
            <Button className="flex-1" onClick={onSkipFollowUp} variant="outline">
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Follow-up
            </Button>
            <Button
              className="flex-1 gradient-bg text-white hover:opacity-90"
              disabled={submitting || !currentAnswer.trim()}
              onClick={onSubmitFollowUpAnswer}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Follow-up
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full gradient-bg text-white hover:opacity-90"
              disabled={submitting || !currentAnswer.trim()}
              onClick={onSubmitAnswer}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Getting Feedback...
                </>
              ) : (
                <>
                  Submit Answer
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {session.answers.length > 0 && session.currentIndex > 0 && (
              <Button
                className="w-full"
                disabled={loadingFollowUp}
                onClick={onRequestFollowUp}
                variant="outline"
              >
                {loadingFollowUp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating follow-up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Get Follow-up on Previous Answer
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
