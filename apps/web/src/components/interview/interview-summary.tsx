"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Info,
  RotateCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnswerFeedbackCard } from "@/components/interview/answer-feedback-card";
import { SessionFeedbackSummary } from "@/components/interview/session-feedback-summary";
import { SkeletonButton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/lib/interview/category-display";
import {
  analyzeInterviewAnswer,
  summarizeInterviewFeedback,
} from "@/lib/interview/feedback";
import { formatInterviewForDocs } from "@/lib/interview/format-for-docs";
import type { Opportunity } from "@/types/opportunity";
import type { InterviewSession } from "@/types/interview";

const SaveToDocsButton = dynamic(
  () => import("@/components/google").then((module) => module.SaveToDocsButton),
  { loading: () => <SkeletonButton className="w-36" />, ssr: false },
);

interface InterviewSummaryProps {
  session: InterviewSession;
  selectedJob?: Opportunity;
  onReset: () => void;
  onContextPackSaved?: (contextPackId: string) => void;
}

export function InterviewSummary({
  session,
  selectedJob,
  onReset,
  onContextPackSaved,
}: InterviewSummaryProps) {
  const t = useTranslations("interview.summary");
  const [savingContext, setSavingContext] = useState(false);
  const [contextSaved, setContextSaved] = useState(false);
  const answeredCount = session.answers.filter((answer, index) => {
    const trimmedAnswer = answer.trim();
    return (
      trimmedAnswer &&
      trimmedAnswer !== "[skipped]" &&
      !session.skipped?.[index]
    );
  }).length;
  const coachingSummary = summarizeInterviewFeedback({
    questions: session.questions,
    answers: session.answers,
    skipped: session.skipped,
  });
  const feedbackEntries = session.feedback.filter((feedback) =>
    feedback.trim(),
  );
  const averageFeedbackLength =
    feedbackEntries.reduce((sum, feedback) => sum + feedback.length, 0) /
    (feedbackEntries.length || 1);
  const performanceLevel =
    averageFeedbackLength > 200
      ? "detailed"
      : averageFeedbackLength > 100
        ? "good"
        : "brief";
  const practiceTitle = selectedJob
    ? `Interview Prep - ${selectedJob.title} at ${selectedJob.company}`
    : session.contextPackTitle
      ? `Interview Prep - ${session.contextPackTitle}`
      : `Practice - ${session.category?.replace("-", " ") || "Interview"}`;

  const saveContextPack = async () => {
    if (!session.contextPackId) return;
    setSavingContext(true);
    try {
      const response = await fetch(
        `/api/interview/context-packs/${session.contextPackId}/promote`,
        { method: "POST" },
      );
      if (!response.ok) throw new Error("Failed to save context");
      setContextSaved(true);
      onContextPackSaved?.(session.contextPackId);
    } finally {
      setSavingContext(false);
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="border-success/50 bg-success/5 rounded-lg border p-8 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
          <Trophy className="h-10 w-10" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("description", { count: session.questions.length })}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={onReset}
            className="gradient-bg text-primary-foreground hover:opacity-90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("actions.startNew")}
          </Button>
          <SaveToDocsButton
            title={practiceTitle}
            content={formatInterviewForDocs(session, selectedJob)}
          />
          {selectedJob && (
            <Link href={`/opportunities/${selectedJob.id}/research`}>
              <Button variant="outline">
                <Info className="mr-2 h-4 w-4" />
                {t("actions.research", { company: selectedJob.company })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {session.contextPackPromotable && !contextSaved ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">Save this context to your bank?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Custom project links and notes were used once for this
                interview. Save them to reuse in documents, components, and
                future interview prep.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void saveContextPack()}
              disabled={savingContext}
              variant="outline"
              className="shrink-0"
            >
              {savingContext ? "Saving..." : "Save to bank"}
            </Button>
          </div>
        </div>
      ) : contextSaved ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
          Context saved to your profile bank.
        </div>
      ) : null}

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Target className="h-5 w-5 text-primary" />
          {t("insights.title")}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold text-primary">
              {answeredCount}/{session.questions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("insights.questionsAnswered")}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold capitalize text-primary">
              {t(`performanceLevels.${performanceLevel}`)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("insights.responseQuality")}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-2xl font-bold text-primary">
              {feedbackEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("insights.feedbackReceived")}
            </p>
          </div>
        </div>
      </div>

      <SessionFeedbackSummary summary={coachingSummary} />

      <h3 className="text-xl font-semibold">{t("responses.title")}</h3>
      {session.questions.map((question, questionIndex) => {
        const skipped =
          session.skipped?.[questionIndex] ||
          session.answers[questionIndex] === "[skipped]";
        const answer = session.answers[questionIndex]?.trim() ?? "";
        const answerScorecard =
          !skipped && answer
            ? analyzeInterviewAnswer({
                answer,
                category: question.category,
              })
            : null;

        return (
          <div
            key={`${questionIndex}-${question.question}`}
            className="overflow-hidden rounded-lg border bg-card"
          >
            <div className="border-b bg-muted/30 p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <CategoryBadge
                  category={question.category}
                  className="text-xs"
                />
                {skipped ? (
                  <Badge variant="outline">{t("responses.skipped")}</Badge>
                ) : null}
              </div>
              <h4 className="font-semibold">{question.question}</h4>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  {t("responses.yourAnswer")}
                </p>
                <p className="text-sm">
                  {skipped
                    ? t("responses.skippedShort")
                    : session.answers[questionIndex] || t("responses.noAnswer")}
                </p>
              </div>
              {skipped ? (
                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                  {t("responses.skippedHint")}
                </div>
              ) : session.feedback[questionIndex] ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("responses.aiFeedback")}
                  </p>
                  <p className="text-sm">{session.feedback[questionIndex]}</p>
                </div>
              ) : null}

              {answerScorecard ? (
                <AnswerFeedbackCard scorecard={answerScorecard} compact />
              ) : null}

              {session.followUps[questionIndex]?.length ? (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-warning">
                    <Zap className="h-4 w-4" />
                    Follow-up Questions (
                    {session.followUps[questionIndex].length})
                  </p>
                  {session.followUps[questionIndex].map(
                    (followUp, followUpIndex) => (
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
                    ),
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
