"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  Plus,
  Target,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingEmptyState } from "@/components/ui/empty-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrepGuideCard } from "@/components/interview/prep-guide-card";
import { PastSessionsList } from "@/components/interview/past-sessions-list";
import { CategoryPracticeTiles } from "@/components/interview/category-practice-tiles";
import { InterviewSourceBuilder } from "@/components/interview/interview-source-builder";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_QUESTION_COUNTS,
  type InterviewDifficulty,
  type SessionQuestionCategory,
} from "@/lib/constants";
import type { Opportunity } from "@/types/opportunity";
import type {
  InterviewContextMode,
  InterviewMode,
  PastSession,
} from "@/types/interview";

const QUESTION_COUNT_STORAGE_KEY = "taida:interview:question-count";
const TIMER_STORAGE_KEY = "taida:interview:timer-enabled";

interface InterviewJobSelectionProps {
  opportunities: Opportunity[];
  selectedJob: string | null;
  generating: boolean;
  onStartInterview: (
    jobId: string,
    mode: InterviewMode,
    options: { questionCount: number; timerEnabled: boolean },
  ) => void;
  onStartQuickPractice: (category?: SessionQuestionCategory) => void;
  onStartContextPractice: (options: {
    contextPackId: string;
    contextPackTitle: string;
    contextPackMode: InterviewContextMode;
    contextPackPromotable: boolean;
    questionCount: number;
    timerEnabled: boolean;
  }) => void;
  difficulty: InterviewDifficulty;
  onDifficultyChange: (value: InterviewDifficulty) => void;
  pastSessions: PastSession[];
  onResumeSession: (session: PastSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function InterviewJobSelection({
  opportunities,
  selectedJob,
  generating,
  onStartInterview,
  onStartQuickPractice,
  onStartContextPractice,
  difficulty,
  onDifficultyChange,
  pastSessions,
  onResumeSession,
  onDeleteSession,
}: InterviewJobSelectionProps) {
  const t = useTranslations("interview.jobSelection");
  const [showPrepGuide, setShowPrepGuide] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [timerEnabled, setTimerEnabled] = useState(false);

  useEffect(() => {
    const storedQuestionCount = Number(
      window.localStorage.getItem(QUESTION_COUNT_STORAGE_KEY),
    );
    if (
      INTERVIEW_QUESTION_COUNTS.includes(storedQuestionCount as 5 | 10 | 15)
    ) {
      setQuestionCount(storedQuestionCount);
    }
    setTimerEnabled(window.localStorage.getItem(TIMER_STORAGE_KEY) === "true");
  }, []);

  const handleQuestionCountChange = (value: string) => {
    const nextValue = Number(value);
    setQuestionCount(nextValue);
    window.localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, String(nextValue));
  };

  const handleTimerChange = (checked: boolean) => {
    setTimerEnabled(checked);
    window.localStorage.setItem(TIMER_STORAGE_KEY, String(checked));
  };

  const startJobPractice = (jobId: string, mode: InterviewMode) => {
    onStartInterview(jobId, mode, { questionCount, timerEnabled });
  };

  const togglePrepGuide = (id: string) =>
    setShowPrepGuide(showPrepGuide === id ? null : id);

  if (opportunities.length === 0) {
    return (
      <div className="space-y-6">
        <InterviewSourceBuilder
          generating={generating}
          defaultQuestionCount={questionCount}
          defaultTimerEnabled={timerEnabled}
          onStartContextPractice={onStartContextPractice}
        />
        <OnboardingEmptyState
          icon={MessageSquare}
          illustrationName="interview-empty"
          title={t("empty.title")}
          description={t("empty.description")}
          steps={[
            {
              icon: Briefcase,
              label: "Choose a role",
              description: "Start from a saved opportunity for targeted prep.",
            },
            {
              icon: MessageSquare,
              label: "Generate questions",
              description: "Practice behavioral and role-specific prompts.",
            },
            {
              icon: Mic,
              label: "Answer out loud",
              description: "Get feedback and improve the next take.",
            },
          ]}
          primaryAction={
            <Button asChild>
              <Link href="/opportunities">
                <Briefcase className="mr-2 h-4 w-4" />
                {t("empty.addOpportunity")}
              </Link>
            </Button>
          }
          secondaryAction={
            <Button variant="outline" onClick={() => onStartQuickPractice()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.quickPractice")}
            </Button>
          }
        />
        <div className="mt-12">
          <CategoryPracticeTiles
            pastSessions={pastSessions}
            onStartQuickPractice={onStartQuickPractice}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      <PastSessionsList
        pastSessions={pastSessions}
        opportunities={opportunities}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onResumeSession={onResumeSession}
        onDeleteSession={onDeleteSession}
      />

      <InterviewSourceBuilder
        generating={generating}
        defaultQuestionCount={questionCount}
        defaultTimerEnabled={timerEnabled}
        onStartContextPractice={onStartContextPractice}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onStartQuickPractice()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.quickPractice")}
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{t("controls.difficulty")}</span>
          </label>
          <Select
            value={difficulty}
            onValueChange={(value) =>
              onDifficultyChange(value as InterviewDifficulty)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_DIFFICULTIES.map((level) => (
                <SelectItem key={level} value={level}>
                  {t(`difficulty.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(questionCount)}
            onValueChange={handleQuestionCountChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_QUESTION_COUNTS.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {t("controls.questionCount", { count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(event) => handleTimerChange(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <Timer className="h-4 w-4" />
            {t("controls.timer")}
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((job) => (
          <div key={job.id} className="space-y-4">
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Button
                  onClick={() => startJobPractice(job.id, "text")}
                  disabled={generating}
                  className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
                >
                  {generating && selectedJob === job.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  {t("actions.textPractice")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startJobPractice(job.id, "voice")}
                  disabled={generating}
                  className="flex-1"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {t("actions.voicePractice")}
                </Button>
              </div>

              <div className="flex items-center gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePrepGuide(job.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Target className="h-4 w-4 mr-1" />
                  {showPrepGuide === job.id
                    ? t("actions.hidePrepGuide")
                    : t("actions.prepGuide")}
                </Button>
                <Link
                  href={`/opportunities/${job.id}/research`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <Info className="h-4 w-4" />
                  {t("actions.companyResearch")}
                </Link>
              </div>
            </div>

            {showPrepGuide === job.id && (
              <div className="animate-enter">
                <PrepGuideCard jobId={job.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
