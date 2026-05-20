"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useErrorToast } from "@/hooks/use-error-toast";
import { showAchievementToasts } from "@/components/streak/achievement-toast";
import { useToast } from "@/components/ui/toast";
import { extractUnlockedFromResponse } from "@/lib/streak/client";
import {
  INTERVIEW_TIMER_DEFAULTS_MS,
  type InterviewDifficulty,
  type SessionQuestionCategory,
} from "@/lib/constants";
import type { Opportunity } from "@/types/opportunity";
import type {
  InterviewContextMode,
  FollowUpExchange,
  InterviewMode,
  InterviewQuestion,
  InterviewSession,
  PastSession,
} from "@/types/interview";

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
}

interface InterviewSessionsResponse {
  sessions?: PastSession[];
}

interface InterviewStartResponse {
  questions?: InterviewQuestion[];
  contextPack?: {
    id: string;
    title: string;
    mode: InterviewContextMode;
    promotionState?: "none" | "prompted" | "saved_to_bank";
    sources?: Array<{ type: string }>;
  };
}

interface CreateInterviewSessionResponse {
  session?: {
    id?: string;
    contextPackId?: string | null;
    contextPackTitle?: string | null;
    contextPackMode?: InterviewContextMode | null;
    contextPackPromotable?: boolean;
  };
  unlocked?: unknown[];
}

interface InterviewAnswerResponse {
  feedback?: string;
}

interface StartInterviewOptions {
  category?: SessionQuestionCategory;
  contextPackId?: string;
  contextPackTitle?: string;
  contextPackMode?: InterviewContextMode;
  contextPackPromotable?: boolean;
  questionCount?: number;
  timerEnabled?: boolean;
}

interface UseInterviewSessionReturn {
  opportunities: Opportunity[];
  loading: boolean;
  pastSessions: PastSession[];
  session: InterviewSession | null;
  setSession: Dispatch<SetStateAction<InterviewSession | null>>;
  selectedJob: string | null;
  currentAnswer: string;
  setCurrentAnswer: Dispatch<SetStateAction<string>>;
  submitting: boolean;
  generating: boolean;
  startInterview: (
    jobId: string | null,
    mode: InterviewMode,
    difficulty: InterviewDifficulty,
    options?: StartInterviewOptions,
  ) => Promise<void>;
  submitAnswer: () => Promise<void>;
  skipQuestion: () => Promise<void>;
  resumeSession: (pastSession: PastSession) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  resetSession: () => void;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

async function fetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  errorContext: string,
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`${errorContext} (${response.status})`);
  }

  return (await response.json()) as T;
}

function groupFollowUpsByQuestion(
  followUps: FollowUpExchange[] | undefined,
  questionCount: number,
): FollowUpExchange[][] {
  const grouped: FollowUpExchange[][] = Array.from(
    { length: questionCount },
    () => [],
  );

  for (const followUp of followUps ?? []) {
    const questionIndex = followUp.questionIndex;
    if (
      typeof questionIndex === "number" &&
      questionIndex >= 0 &&
      questionIndex < questionCount
    ) {
      grouped[questionIndex].push(followUp);
    }
  }

  return grouped;
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const activeRequestRef = useRef(0);
  const showErrorToast = useErrorToast();
  const { addToast } = useToast();

  const invalidatePendingRequests = useCallback(() => {
    activeRequestRef.current += 1;
    return activeRequestRef.current;
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await fetchJson<OpportunitiesResponse>(
        "/api/opportunities",
        undefined,
        "Failed to fetch jobs",
      );
      setOpportunities(data.opportunities || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load interview jobs",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  const fetchPastSessions = useCallback(async () => {
    try {
      const data = await fetchJson<InterviewSessionsResponse>(
        "/api/interview/sessions",
        undefined,
        "Failed to fetch past sessions",
      );
      setPastSessions(data.sessions || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load interview sessions",
        fallbackDescription: "Please refresh the page and try again.",
      });
    }
  }, [showErrorToast]);

  useEffect(() => {
    void fetchJobs();
    void fetchPastSessions();
  }, [fetchJobs, fetchPastSessions]);

  const completeSession = useCallback(
    async (sessionId: string) => {
      try {
        await fetchJson(
          `/api/interview/sessions/${sessionId}`,
          {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify({ status: "completed" }),
          },
          "Failed to complete session",
        );
        await fetchPastSessions();
      } catch (error) {
        showErrorToast(error, {
          title: "Could not complete interview",
          fallbackDescription: "Please try ending the interview again.",
        });
      }
    },
    [fetchPastSessions, showErrorToast],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await fetchJson(
          `/api/interview/sessions/${sessionId}`,
          {
            method: "DELETE",
          },
          "Failed to delete session",
        );
        await fetchPastSessions();
      } catch (error) {
        showErrorToast(error, {
          title: "Could not delete interview",
          fallbackDescription: "Please try deleting the interview again.",
        });
      }
    },
    [fetchPastSessions, showErrorToast],
  );

  const resumeSession = useCallback(
    (pastSession: PastSession) => {
      const hasMatchingJob =
        pastSession.jobId === null ||
        opportunities.some(
          (candidateJob) => candidateJob.id === pastSession.jobId,
        );

      if (!hasMatchingJob) return;

      invalidatePendingRequests();

      const answerMap = new Map(
        (pastSession.answers ?? []).map((answer) => [
          answer.questionIndex,
          answer,
        ]),
      );
      const currentIndex = pastSession.questions.findIndex(
        (_, questionIndex) => !answerMap.has(questionIndex),
      );

      setSelectedJob(pastSession.jobId);
      setCurrentAnswer("");
      setSession({
        id: pastSession.id,
        jobId: pastSession.jobId,
        category: pastSession.category || null,
        contextPackId: pastSession.contextPackId || null,
        contextPackTitle: pastSession.contextPackTitle || null,
        contextPackMode: pastSession.contextPackMode || null,
        contextPackPromotable: pastSession.contextPackPromotable,
        questions: pastSession.questions,
        currentIndex:
          currentIndex === -1 ? pastSession.questions.length : currentIndex,
        answers: pastSession.questions.map(
          (_, questionIndex) => answerMap.get(questionIndex)?.answer || "",
        ),
        feedback: pastSession.questions.map(
          (_, questionIndex) => answerMap.get(questionIndex)?.feedback || "",
        ),
        followUps: groupFollowUpsByQuestion(
          pastSession.followUps,
          pastSession.questions.length,
        ),
        mode: pastSession.mode,
        skipped: pastSession.questions.map(
          (_, questionIndex) =>
            answerMap.get(questionIndex)?.answer === "[skipped]",
        ),
      });
    },
    [invalidatePendingRequests, opportunities],
  );

  const startInterview = useCallback(
    async (
      jobId: string | null,
      mode: InterviewMode,
      difficulty: InterviewDifficulty,
      options: StartInterviewOptions = {},
    ) => {
      const requestId = invalidatePendingRequests();
      setSelectedJob(jobId);
      setGenerating(true);

      try {
        const questionsData = await fetchJson<InterviewStartResponse>(
          "/api/interview/start",
          {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              jobId,
              contextPackId: options.contextPackId,
              mode,
              difficulty,
              category: options.category,
              questionCount: options.questionCount,
            }),
          },
          "Failed to generate questions",
        );

        if (!questionsData.questions) {
          throw new Error("Failed to generate questions");
        }

        const sessionData = await fetchJson<CreateInterviewSessionResponse>(
          "/api/interview/sessions",
          {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              jobId,
              contextPackId: options.contextPackId,
              category: options.category,
              questions: questionsData.questions,
              mode,
            }),
          },
          "Failed to create interview session",
        );

        if (activeRequestRef.current !== requestId) {
          return;
        }

        showAchievementToasts(
          extractUnlockedFromResponse(sessionData),
          addToast,
        );
        setCurrentAnswer("");
        setSession({
          id: sessionData.session?.id,
          jobId,
          category: options.category || null,
          contextPackId:
            sessionData.session?.contextPackId ||
            options.contextPackId ||
            questionsData.contextPack?.id ||
            null,
          contextPackTitle:
            sessionData.session?.contextPackTitle ||
            options.contextPackTitle ||
            questionsData.contextPack?.title ||
            null,
          contextPackMode:
            sessionData.session?.contextPackMode ||
            options.contextPackMode ||
            questionsData.contextPack?.mode ||
            null,
          contextPackPromotable:
            sessionData.session?.contextPackPromotable ??
            options.contextPackPromotable ??
            Boolean(
              questionsData.contextPack?.sources?.some((source) =>
                ["custom-url", "custom-text"].includes(source.type),
              ) &&
              questionsData.contextPack?.promotionState !== "saved_to_bank",
            ),
          questionCount:
            options.questionCount || questionsData.questions.length,
          timer: options.timerEnabled
            ? {
                enabled: true,
                remainingMs:
                  INTERVIEW_TIMER_DEFAULTS_MS[
                    options.category ||
                      questionsData.questions[0]?.category ||
                      "general"
                  ],
                extended: false,
              }
            : null,
          questions: questionsData.questions,
          currentIndex: 0,
          answers: [],
          feedback: [],
          followUps: [],
          mode,
          skipped: Array(questionsData.questions.length).fill(false),
        });
      } catch (error) {
        showErrorToast(error, {
          title: "Could not start interview",
          fallbackDescription: "Please try starting the interview again.",
        });
      } finally {
        if (activeRequestRef.current === requestId) {
          setGenerating(false);
        }
      }
    },
    [addToast, invalidatePendingRequests, showErrorToast],
  );

  const submitAnswer = useCallback(async () => {
    if (!session || !currentAnswer.trim()) return;

    const submittingSession = session;
    setSubmitting(true);

    try {
      const apiUrl = submittingSession.id
        ? `/api/interview/sessions/${submittingSession.id}/answer`
        : "/api/interview/answer";

      const data = await fetchJson<InterviewAnswerResponse>(
        apiUrl,
        {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            jobId: submittingSession.jobId,
            questionIndex: submittingSession.currentIndex,
            answer: currentAnswer,
            category:
              submittingSession.category ||
              submittingSession.questions[submittingSession.currentIndex]
                ?.category,
          }),
        },
        "Failed to submit answer",
      );
      let completedSessionId: string | null = null;
      let shouldClearAnswer = false;

      setSession((currentSession) => {
        if (currentSession !== submittingSession) {
          return currentSession;
        }

        const nextAnswers = [...currentSession.answers];
        nextAnswers[currentSession.currentIndex] = currentAnswer;

        const nextFeedback = [...currentSession.feedback];
        nextFeedback[currentSession.currentIndex] = data.feedback || "";

        if (currentSession.currentIndex < currentSession.questions.length - 1) {
          shouldClearAnswer = true;
          return {
            ...currentSession,
            currentIndex: currentSession.currentIndex + 1,
            answers: nextAnswers,
            feedback: nextFeedback,
          };
        }

        completedSessionId = currentSession.id ?? null;
        return {
          ...currentSession,
          answers: nextAnswers,
          feedback: nextFeedback,
          currentIndex: currentSession.questions.length,
        };
      });

      if (shouldClearAnswer) {
        setCurrentAnswer("");
      }

      if (completedSessionId) {
        await completeSession(completedSessionId);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not submit answer",
        fallbackDescription: "Please try submitting the answer again.",
      });
    } finally {
      setSubmitting(false);
    }
  }, [completeSession, currentAnswer, session, showErrorToast]);

  const skipQuestion = useCallback(async () => {
    if (!session) return;

    const skippingSession = session;
    setSubmitting(true);

    try {
      if (skippingSession.id) {
        await fetchJson<InterviewAnswerResponse>(
          `/api/interview/sessions/${skippingSession.id}/answer`,
          {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
              jobId: skippingSession.jobId,
              questionIndex: skippingSession.currentIndex,
              answer: "[skipped]",
              category:
                skippingSession.category ||
                skippingSession.questions[skippingSession.currentIndex]
                  ?.category,
            }),
          },
          "Failed to skip question",
        );
      }

      let completedSessionId: string | null = null;

      setSession((currentSession) => {
        if (currentSession !== skippingSession) {
          return currentSession;
        }

        const nextAnswers = [...currentSession.answers];
        nextAnswers[currentSession.currentIndex] = "[skipped]";

        const nextFeedback = [...currentSession.feedback];
        nextFeedback[currentSession.currentIndex] = "";

        const nextSkipped =
          currentSession.skipped ||
          Array(currentSession.questions.length).fill(false);
        const skipped = [...nextSkipped];
        skipped[currentSession.currentIndex] = true;

        if (currentSession.currentIndex < currentSession.questions.length - 1) {
          return {
            ...currentSession,
            currentIndex: currentSession.currentIndex + 1,
            answers: nextAnswers,
            feedback: nextFeedback,
            skipped,
          };
        }

        completedSessionId = currentSession.id ?? null;
        return {
          ...currentSession,
          answers: nextAnswers,
          feedback: nextFeedback,
          skipped,
          currentIndex: currentSession.questions.length,
        };
      });

      setCurrentAnswer("");

      if (completedSessionId) {
        await completeSession(completedSessionId);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not skip question",
        fallbackDescription: "Please try skipping the question again.",
      });
    } finally {
      setSubmitting(false);
    }
  }, [completeSession, session, showErrorToast]);

  const resetSession = useCallback(() => {
    invalidatePendingRequests();
    setSession(null);
    setSelectedJob(null);
    setCurrentAnswer("");
    setGenerating(false);
  }, [invalidatePendingRequests]);

  return {
    opportunities,
    loading,
    pastSessions,
    session,
    setSession,
    selectedJob,
    currentAnswer,
    setCurrentAnswer,
    submitting,
    generating,
    startInterview,
    submitAnswer,
    skipQuestion,
    resumeSession,
    deleteSession,
    resetSession,
  };
}
