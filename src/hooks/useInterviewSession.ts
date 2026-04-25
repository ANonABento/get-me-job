"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { InterviewDifficulty } from "@/lib/constants";
import type { JobDescription } from "@/types";
import type {
  InterviewMode,
  InterviewQuestion,
  InterviewSession,
  PastSession,
} from "@/types/interview";

interface JobsResponse {
  jobs?: JobDescription[];
}

interface InterviewSessionsResponse {
  sessions?: PastSession[];
}

interface InterviewStartResponse {
  questions?: InterviewQuestion[];
}

interface CreateInterviewSessionResponse {
  session?: {
    id?: string;
  };
}

interface InterviewAnswerResponse {
  feedback?: string;
}

interface UseInterviewSessionReturn {
  jobs: JobDescription[];
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
    jobId: string,
    mode: InterviewMode,
    difficulty: InterviewDifficulty
  ) => Promise<void>;
  submitAnswer: () => Promise<void>;
  resumeSession: (pastSession: PastSession) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  resetSession: () => void;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

async function fetchJson<T>(
  url: string,
  init: RequestInit | undefined,
  errorContext: string
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`${errorContext} (${response.status})`);
  }

  return (await response.json()) as T;
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const activeRequestRef = useRef(0);

  const invalidatePendingRequests = useCallback(() => {
    activeRequestRef.current += 1;
    return activeRequestRef.current;
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await fetchJson<JobsResponse>(
        "/api/jobs",
        undefined,
        "Failed to fetch jobs"
      );
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPastSessions = useCallback(async () => {
    try {
      const data = await fetchJson<InterviewSessionsResponse>(
        "/api/interview/sessions",
        undefined,
        "Failed to fetch past sessions"
      );
      setPastSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch past sessions:", error);
    }
  }, []);

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
          "Failed to complete session"
        );
        await fetchPastSessions();
      } catch (error) {
        console.error("Failed to complete session:", error);
      }
    },
    [fetchPastSessions]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await fetchJson(
          `/api/interview/sessions/${sessionId}`,
          {
            method: "DELETE",
          },
          "Failed to delete session"
        );
        await fetchPastSessions();
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    },
    [fetchPastSessions]
  );

  const resumeSession = useCallback(
    (pastSession: PastSession) => {
      const hasMatchingJob = jobs.some(
        (candidateJob) => candidateJob.id === pastSession.jobId
      );

      if (!hasMatchingJob) return;

      invalidatePendingRequests();

      const answerMap = new Map(
        (pastSession.answers ?? []).map((answer) => [answer.questionIndex, answer])
      );
      const currentIndex = pastSession.questions.findIndex(
        (_, questionIndex) => !answerMap.has(questionIndex)
      );

      setSelectedJob(pastSession.jobId);
      setCurrentAnswer("");
      setSession({
        id: pastSession.id,
        jobId: pastSession.jobId,
        questions: pastSession.questions,
        currentIndex:
          currentIndex === -1 ? pastSession.questions.length : currentIndex,
        answers: pastSession.questions.map(
          (_, questionIndex) => answerMap.get(questionIndex)?.answer || ""
        ),
        feedback: pastSession.questions.map(
          (_, questionIndex) => answerMap.get(questionIndex)?.feedback || ""
        ),
        followUps: [],
        mode: pastSession.mode,
      });
    },
    [invalidatePendingRequests, jobs]
  );

  const startInterview = useCallback(
    async (
      jobId: string,
      mode: InterviewMode,
      difficulty: InterviewDifficulty
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
            body: JSON.stringify({ jobId, mode, difficulty }),
          },
          "Failed to generate questions"
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
              questions: questionsData.questions,
              mode,
            }),
          },
          "Failed to create interview session"
        );

        if (activeRequestRef.current !== requestId) {
          return;
        }

        setCurrentAnswer("");
        setSession({
          id: sessionData.session?.id,
          jobId,
          questions: questionsData.questions,
          currentIndex: 0,
          answers: [],
          feedback: [],
          followUps: [],
          mode,
        });
      } catch (error) {
        console.error("Failed to start interview:", error);
      } finally {
        if (activeRequestRef.current === requestId) {
          setGenerating(false);
        }
      }
    },
    [invalidatePendingRequests]
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
          }),
        },
        "Failed to submit answer"
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
      console.error("Failed to submit answer:", error);
    } finally {
      setSubmitting(false);
    }
  }, [completeSession, currentAnswer, session]);

  const resetSession = useCallback(() => {
    invalidatePendingRequests();
    setSession(null);
    setSelectedJob(null);
    setCurrentAnswer("");
    setGenerating(false);
  }, [invalidatePendingRequests]);

  return {
    jobs,
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
    resumeSession,
    deleteSession,
    resetSession,
  };
}
