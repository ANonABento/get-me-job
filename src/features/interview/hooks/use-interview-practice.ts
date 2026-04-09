"use client";

import { useState } from "react";
import type { InterviewDifficulty } from "@/features/interview/schemas";
import type {
  FollowUpPrompt,
  InterviewPracticeSession,
  PastInterviewSession,
} from "@/features/interview/client-types";
import {
  createInterviewSessionRecord,
  generateInterviewQuestions,
  markInterviewSessionCompleted,
  requestInterviewFollowUp,
  submitInterviewAnswerRequest,
} from "@/features/interview/api";
import { useInterviewData } from "@/features/interview/hooks/use-interview-data";
import { useInterviewVoice } from "@/features/interview/hooks/use-interview-voice";

export function useInterviewPractice() {
  const {
    deleteSession,
    jobs,
    loading,
    pastSessions,
    refreshPastSessions,
  } = useInterviewData();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewPracticeSession | null>(null);
  const [generating, setGenerating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("mid");
  const [showPrepGuide, setShowPrepGuide] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [followUpMode, setFollowUpMode] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUpPrompt | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  const currentQuestion = session?.questions[session.currentIndex];
  const isComplete = !!session && session.currentIndex >= session.questions.length;
  const selectedJobData = jobs.find((job) => job.id === selectedJob);
  const {
    isListening,
    isSpeaking,
    speakQuestion,
    startListening,
    stopListening,
  } = useInterviewVoice(
    () => session?.questions[session.currentIndex]?.question,
    setCurrentAnswer
  );

  function resumeSession(pastSession: PastInterviewSession) {
    const answeredCount = pastSession.answers?.length || 0;

    setSelectedJob(pastSession.jobId);
    setSession({
      id: pastSession.id,
      jobId: pastSession.jobId,
      questions: pastSession.questions,
      currentIndex: answeredCount,
      answers: pastSession.answers?.map((answer) => answer.answer) || [],
      feedback: pastSession.answers?.map((answer) => answer.feedback || "") || [],
      followUps: [],
      mode: pastSession.mode,
    });
  }

  async function startInterview(jobId: string, mode: "text" | "voice") {
    setSelectedJob(jobId);
    setGenerating(true);

    try {
      const questions = await generateInterviewQuestions(jobId, difficulty);
      const sessionId = await createInterviewSessionRecord(jobId, questions, mode);

      setSession({
        id: sessionId,
        jobId,
        questions,
        currentIndex: 0,
        answers: [],
        feedback: [],
        followUps: [],
        mode,
      });
    } catch (error) {
      console.error("Failed to start interview:", error);
    } finally {
      setGenerating(false);
    }
  }

  async function submitAnswer() {
    if (!session || !currentAnswer.trim()) return;

    setSubmitting(true);
    setShowHint(false);

    try {
      const feedback = await submitInterviewAnswerRequest({
        sessionId: session.id,
        jobId: session.jobId,
        questionIndex: session.currentIndex,
        answer: currentAnswer,
      });

      const newAnswers = [...session.answers, currentAnswer];
      const newFeedback = [...session.feedback, feedback];

      if (session.currentIndex < session.questions.length - 1) {
        setSession({
          ...session,
          currentIndex: session.currentIndex + 1,
          answers: newAnswers,
          feedback: newFeedback,
        });
        setCurrentAnswer("");
        return;
      }

      if (session.id) {
        await markInterviewSessionCompleted(session.id);
        await refreshPastSessions();
      }

      setSession({
        ...session,
        answers: newAnswers,
        feedback: newFeedback,
        currentIndex: session.questions.length,
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function resetSession() {
    setSession(null);
    setSelectedJob(null);
    setCurrentAnswer("");
    setShowHint(false);
    setFollowUpMode(false);
    setCurrentFollowUp(null);
  }

  async function requestFollowUpQuestion() {
    if (!session || session.answers.length === 0) return;

    setLoadingFollowUp(true);

    try {
      const currentQuestionIndex = session.currentIndex - 1;
      const question = session.questions[currentQuestionIndex];
      const answer = session.answers[currentQuestionIndex];
      const data = await requestInterviewFollowUp({
        jobId: session.jobId,
        originalQuestion: question.question,
        userAnswer: answer,
        questionCategory: question.category,
      });

      if (!data.followUpQuestion) {
        return;
      }

      setCurrentFollowUp({
        question: data.followUpQuestion,
        reason: data.reason || "",
        suggestedFocus: data.suggestedFocus || [],
      });
      setFollowUpMode(true);
      setCurrentAnswer("");
    } catch (error) {
      console.error("Failed to get follow-up question:", error);
    } finally {
      setLoadingFollowUp(false);
    }
  }

  async function submitFollowUpAnswer() {
    if (!session || !currentFollowUp || !currentAnswer.trim()) return;

    setSubmitting(true);

    try {
      const feedback = await submitInterviewAnswerRequest({
        jobId: session.jobId,
        questionIndex: session.currentIndex,
        answer: currentAnswer,
      });

      const questionIndex = session.currentIndex - 1;
      const newFollowUps = [...session.followUps];
      if (!newFollowUps[questionIndex]) {
        newFollowUps[questionIndex] = [];
      }

      newFollowUps[questionIndex].push({
        followUpQuestion: currentFollowUp.question,
        answer: currentAnswer,
        feedback,
      });

      setSession({
        ...session,
        followUps: newFollowUps,
      });

      setFollowUpMode(false);
      setCurrentFollowUp(null);
      setCurrentAnswer("");
    } catch (error) {
      console.error("Failed to submit follow-up answer:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function skipFollowUp() {
    setFollowUpMode(false);
    setCurrentFollowUp(null);
    setCurrentAnswer("");
  }

  return {
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
    requestFollowUpQuestion,
    submitting,
  };
}
