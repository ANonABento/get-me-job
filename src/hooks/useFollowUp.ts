"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { CurrentFollowUp, InterviewSession } from "@/types/interview";

interface FollowUpApiResponse {
  followUpQuestion?: string;
  reason?: string;
  suggestedFocus?: string[];
}

interface FollowUpAnswerResponse {
  feedback?: string;
}

interface UseFollowUpArgs {
  session: InterviewSession | null;
  setSession: Dispatch<SetStateAction<InterviewSession | null>>;
  currentAnswer: string;
  setCurrentAnswer: Dispatch<SetStateAction<string>>;
}

interface UseFollowUpReturn {
  followUpMode: boolean;
  currentFollowUp: CurrentFollowUp | null;
  loadingFollowUp: boolean;
  submittingFollowUp: boolean;
  requestFollowUp: () => Promise<void>;
  submitFollowUpAnswer: () => Promise<void>;
  skipFollowUp: () => void;
  resetFollowUp: () => void;
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

export function useFollowUp({
  session,
  setSession,
  currentAnswer,
  setCurrentAnswer,
}: UseFollowUpArgs): UseFollowUpReturn {
  const [followUpMode, setFollowUpMode] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] =
    useState<CurrentFollowUp | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const requestFollowUp = useCallback(async () => {
    if (!session || session.answers.length === 0) return;

    const requestingSession = session;
    const questionIndex = session.currentIndex - 1;
    const question = session.questions[questionIndex];
    const answer = session.answers[questionIndex];

    if (questionIndex < 0 || !question || !answer?.trim()) return;

    setLoadingFollowUp(true);

    try {
      const data = await fetchJson<FollowUpApiResponse>(
        "/api/interview/followup",
        {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            jobId: session.jobId,
            originalQuestion: question.question,
            userAnswer: answer,
            questionCategory: question.category,
          }),
        },
        "Failed to get follow-up question"
      );

      if (sessionRef.current === requestingSession && data.followUpQuestion) {
        setCurrentFollowUp({
          question: data.followUpQuestion,
          reason: data.reason ?? "",
          suggestedFocus: data.suggestedFocus ?? [],
        });
        setFollowUpMode(true);
        setCurrentAnswer("");
      }
    } catch (error) {
      console.error("Failed to get follow-up question:", error);
    } finally {
      setLoadingFollowUp(false);
    }
  }, [session, setCurrentAnswer]);

  const submitFollowUpAnswer = useCallback(async () => {
    if (!session || !currentFollowUp || !currentAnswer.trim()) return;

    const submittingSession = session;
    setSubmittingFollowUp(true);

    try {
      const data = await fetchJson<FollowUpAnswerResponse>(
        "/api/interview/answer",
        {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            jobId: session.jobId,
            answer: currentAnswer,
          }),
        },
        "Failed to submit follow-up answer"
      );
      let didUpdateFollowUps = false;

      setSession((currentSession) => {
        if (!currentSession || currentSession !== submittingSession) {
          return currentSession;
        }

        const questionIndex = currentSession.currentIndex - 1;
        if (questionIndex < 0) {
          return currentSession;
        }

        const nextFollowUps = currentSession.followUps.map((followUps) => [
          ...(followUps || []),
        ]);

        if (!nextFollowUps[questionIndex]) {
          nextFollowUps[questionIndex] = [];
        }

        nextFollowUps[questionIndex].push({
          followUpQuestion: currentFollowUp.question,
          answer: currentAnswer,
          feedback: data.feedback || "",
        });
        didUpdateFollowUps = true;

        return {
          ...currentSession,
          followUps: nextFollowUps,
        };
      });

      if (didUpdateFollowUps) {
        setFollowUpMode(false);
        setCurrentFollowUp(null);
        setCurrentAnswer("");
      }
    } catch (error) {
      console.error("Failed to submit follow-up answer:", error);
    } finally {
      setSubmittingFollowUp(false);
    }
  }, [currentAnswer, currentFollowUp, session, setCurrentAnswer, setSession]);

  const skipFollowUp = useCallback(() => {
    setFollowUpMode(false);
    setCurrentFollowUp(null);
    setCurrentAnswer("");
  }, [setCurrentAnswer]);

  const resetFollowUp = useCallback(() => {
    setFollowUpMode(false);
    setCurrentFollowUp(null);
  }, []);

  return {
    followUpMode,
    currentFollowUp,
    loadingFollowUp,
    submittingFollowUp,
    requestFollowUp,
    submitFollowUpAnswer,
    skipFollowUp,
    resetFollowUp,
  };
}
