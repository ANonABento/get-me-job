"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { JobDescription } from "@/types";
import {
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Brain,
  Target,
  Lightbulb,
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
  Info,
  GraduationCap,
  History,
  Trash2,
  PlayCircle,
  Zap,
  SkipForward,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrepGuideCard } from "@/components/interview/prep-guide-card";
import { RecordingControls } from "@/components/interview/recording-controls";
import { SaveToDocsButton } from "@/components/google";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "general";
  suggestedAnswer?: string;
}

interface FollowUpExchange {
  followUpQuestion: string;
  answer: string;
  feedback: string;
}

interface InterviewSession {
  id?: string; // Session ID from database
  jobId: string;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: string[];
  feedback: string[];
  followUps: FollowUpExchange[][]; // Follow-ups per question
  mode: "text" | "voice";
}

interface PastSession {
  id: string;
  jobId: string;
  mode: "text" | "voice";
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers?: Array<{
    id: string;
    questionIndex: number;
    answer: string;
    feedback?: string;
  }>;
}

const categoryColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  behavioral: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: <Brain className="h-4 w-4" />,
  },
  technical: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    icon: <Target className="h-4 w-4" />,
  },
  situational: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  general: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <MessageSquare className="h-4 w-4" />,
  },
};

export default function InterviewPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [generating, setGenerating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("mid");
  const [showPrepGuide, setShowPrepGuide] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [followUpMode, setFollowUpMode] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<{ question: string; reason: string; suggestedFocus: string[] } | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchPastSessions();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastSessions = async () => {
    try {
      const res = await fetch("/api/interview/sessions");
      const data = await res.json();
      setPastSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch past sessions:", error);
    }
  };

  const completeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/interview/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchPastSessions();
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/interview/sessions/${sessionId}`, {
        method: "DELETE",
      });
      fetchPastSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const resumeSession = async (pastSession: PastSession) => {
    const job = jobs.find((j) => j.id === pastSession.jobId);
    if (!job) return;

    // Calculate where we left off
    const answeredCount = pastSession.answers?.length || 0;

    setSelectedJob(pastSession.jobId);
    setSession({
      id: pastSession.id,
      jobId: pastSession.jobId,
      questions: pastSession.questions,
      currentIndex: answeredCount,
      answers: pastSession.answers?.map((a) => a.answer) || [],
      feedback: pastSession.answers?.map((a) => a.feedback || "") || [],
      followUps: [],
      mode: pastSession.mode,
    });
  };

  const startInterview = async (jobId: string, mode: "text" | "voice") => {
    setSelectedJob(jobId);
    setGenerating(true);

    try {
      // Generate questions
      const questionsRes = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, mode }),
      });
      const questionsData = await questionsRes.json();

      if (!questionsData.questions) {
        throw new Error("Failed to generate questions");
      }

      // Create persisted session
      const sessionRes = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          questions: questionsData.questions,
          mode,
        }),
      });
      const sessionData = await sessionRes.json();

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
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;

    setSubmitting(true);
    setShowHint(false);
    try {
      // Use session-based API if we have a session ID
      const apiUrl = session.id
        ? `/api/interview/sessions/${session.id}/answer`
        : "/api/interview/answer";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: session.jobId,
          questionIndex: session.currentIndex,
          answer: currentAnswer,
        }),
      });
      const data = await res.json();

      const newAnswers = [...session.answers, currentAnswer];
      const newFeedback = [...session.feedback, data.feedback || ""];

      if (session.currentIndex < session.questions.length - 1) {
        setSession({
          ...session,
          currentIndex: session.currentIndex + 1,
          answers: newAnswers,
          feedback: newFeedback,
        });
        setCurrentAnswer("");
      } else {
        // Interview complete - mark session as completed
        if (session.id) {
          await completeSession(session.id);
        }
        setSession({
          ...session,
          answers: newAnswers,
          feedback: newFeedback,
          currentIndex: session.questions.length,
        });
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const speakQuestion = () => {
    if (!session || typeof window === "undefined") return;

    const question = session.questions[session.currentIndex]?.question;
    if (!question) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setCurrentAnswer(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
  };

  const resetSession = () => {
    setSession(null);
    setSelectedJob(null);
    setCurrentAnswer("");
    setShowHint(false);
    setFollowUpMode(false);
    setCurrentFollowUp(null);
  };

  const requestFollowUp = async () => {
    if (!session || session.answers.length === 0) return;

    setLoadingFollowUp(true);
    try {
      const currentQuestionIndex = session.currentIndex - 1;
      const question = session.questions[currentQuestionIndex];
      const answer = session.answers[currentQuestionIndex];

      const res = await fetch("/api/interview/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: session.jobId,
          originalQuestion: question.question,
          userAnswer: answer,
          questionCategory: question.category,
        }),
      });

      const data = await res.json();

      if (data.followUpQuestion) {
        setCurrentFollowUp({
          question: data.followUpQuestion,
          reason: data.reason,
          suggestedFocus: data.suggestedFocus || [],
        });
        setFollowUpMode(true);
        setCurrentAnswer("");
      }
    } catch (error) {
      console.error("Failed to get follow-up question:", error);
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const submitFollowUpAnswer = async () => {
    if (!session || !currentFollowUp || !currentAnswer.trim()) return;

    setSubmitting(true);
    try {
      // Get feedback for the follow-up answer
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: session.jobId,
          answer: currentAnswer,
        }),
      });

      const data = await res.json();

      // Store the follow-up exchange
      const questionIndex = session.currentIndex - 1;
      const newFollowUps = [...session.followUps];
      if (!newFollowUps[questionIndex]) {
        newFollowUps[questionIndex] = [];
      }
      newFollowUps[questionIndex].push({
        followUpQuestion: currentFollowUp.question,
        answer: currentAnswer,
        feedback: data.feedback || "",
      });

      setSession({
        ...session,
        followUps: newFollowUps,
      });

      // Reset follow-up mode
      setFollowUpMode(false);
      setCurrentFollowUp(null);
      setCurrentAnswer("");
    } catch (error) {
      console.error("Failed to submit follow-up answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const skipFollowUp = () => {
    setFollowUpMode(false);
    setCurrentFollowUp(null);
    setCurrentAnswer("");
  };

  const currentQuestion = session?.questions[session.currentIndex];
  const isComplete = session && session.currentIndex >= session.questions.length;
  const selectedJobData = jobs.find((j) => j.id === selectedJob);

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
          // Job Selection
          <JobSelection
            jobs={jobs}
            selectedJob={selectedJob}
            generating={generating}
            onStartInterview={startInterview}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            showPrepGuide={showPrepGuide}
            onTogglePrepGuide={(id) => setShowPrepGuide(showPrepGuide === id ? null : id)}
            pastSessions={pastSessions}
            showHistory={showHistory}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onResumeSession={resumeSession}
            onDeleteSession={deleteSession}
          />
        ) : isComplete ? (
          // Interview Complete
          <InterviewSummary session={session} selectedJob={selectedJobData} onReset={resetSession} />
        ) : (
          // Active Interview
          <div className="space-y-6 animate-in">
            {/* Interview Header */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedJobData?.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedJobData?.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {session.mode === "voice" ? "Voice Mode" : "Text Mode"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={resetSession}>
                    End Interview
                  </Button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Question {session.currentIndex + 1} of {session.questions.length}
                  </span>
                  <span className="font-medium">
                    {Math.round(((session.currentIndex + 1) / session.questions.length) * 100)}%
                  </span>
                </div>
                <Progress
                  value={((session.currentIndex + 1) / session.questions.length) * 100}
                  size="sm"
                />
              </div>
            </div>

            {/* Current Question or Follow-Up */}
            <div className="rounded-2xl border bg-card overflow-hidden">
              {/* Question Header */}
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    {followUpMode && currentFollowUp ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                          <Zap className="h-4 w-4" />
                          Follow-up Question
                        </span>
                        <h2 className="text-xl font-semibold leading-relaxed">
                          {currentFollowUp.question}
                        </h2>
                        {currentFollowUp.suggestedFocus.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentFollowUp.suggestedFocus.map((focus, i) => (
                              <span
                                key={i}
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
                        {currentQuestion && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                              categoryColors[currentQuestion.category]?.bg
                            } ${categoryColors[currentQuestion.category]?.text}`}
                          >
                            {categoryColors[currentQuestion.category]?.icon}
                            {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                          </span>
                        )}
                        <h2 className="text-xl font-semibold leading-relaxed">
                          {currentQuestion?.question}
                        </h2>
                      </>
                    )}
                  </div>

                  {/* Voice Controls */}
                  {session.mode === "voice" && !followUpMode && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={speakQuestion}
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

              {/* Answer Area */}
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Textarea
                    rows={8}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={
                      followUpMode
                        ? "Elaborate on your previous answer..."
                        : session.mode === "voice"
                        ? "Click the microphone to speak, or type your answer..."
                        : "Type your answer here..."
                    }
                    className="resize-none text-base"
                  />

                  {/* Voice Input Button */}
                  {session.mode === "voice" && (
                    <Button
                      variant={isListening ? "destructive" : "secondary"}
                      size="icon"
                      onClick={isListening ? stopListening : startListening}
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
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                    Recording speech...
                  </div>
                )}

                {/* Audio Recording Controls - Voice Mode */}
                {session.mode === "voice" && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mic className="h-4 w-4" />
                      <span>Record your answer for playback</span>
                    </div>
                    <RecordingControls compact />
                  </div>
                )}

                {/* Hint Section - Only for main questions */}
                {!followUpMode && currentQuestion?.suggestedAnswer && (
                  <div className="rounded-xl border bg-muted/30 overflow-hidden">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
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

                {/* Submit/Follow-up Buttons */}
                {followUpMode ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={skipFollowUp}
                      className="flex-1"
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip Follow-up
                    </Button>
                    <Button
                      onClick={submitFollowUpAnswer}
                      disabled={submitting || !currentAnswer.trim()}
                      className="flex-1 gradient-bg text-white hover:opacity-90"
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
                      onClick={submitAnswer}
                      disabled={submitting || !currentAnswer.trim()}
                      size="lg"
                      className="w-full gradient-bg text-white hover:opacity-90"
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

                    {/* Follow-up button - show after answering previous question */}
                    {session.answers.length > 0 && session.currentIndex > 0 && (
                      <Button
                        variant="outline"
                        onClick={requestFollowUp}
                        disabled={loadingFollowUp}
                        className="w-full"
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
          </div>
        )}
      </div>
    </div>
  );
}

function JobSelection({
  jobs,
  selectedJob,
  generating,
  onStartInterview,
  difficulty,
  onDifficultyChange,
  showPrepGuide,
  onTogglePrepGuide,
  pastSessions,
  showHistory,
  onToggleHistory,
  onResumeSession,
  onDeleteSession,
}: {
  jobs: JobDescription[];
  selectedJob: string | null;
  generating: boolean;
  onStartInterview: (jobId: string, mode: "text" | "voice") => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  showPrepGuide: string | null;
  onTogglePrepGuide: (id: string) => void;
  pastSessions: PastSession[];
  showHistory: boolean;
  onToggleHistory: () => void;
  onResumeSession: (session: PastSession) => void;
  onDeleteSession: (sessionId: string) => void;
}) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
          <MessageSquare className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">No Jobs to Practice For</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Add a job description first to get personalized interview questions based on the role.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Briefcase className="h-5 w-5" />
          Add a Job
        </Link>

        {/* Tips */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3 text-left">
          <Tip
            icon={<Brain className="h-5 w-5" />}
            color="blue"
            title="Behavioral Questions"
            description="Practice STAR method responses for common scenarios."
          />
          <Tip
            icon={<Target className="h-5 w-5" />}
            color="violet"
            title="Technical Questions"
            description="Get role-specific technical questions and feedback."
          />
          <Tip
            icon={<Lightbulb className="h-5 w-5" />}
            color="amber"
            title="Situational Questions"
            description="Handle hypothetical scenarios with confidence."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Past Sessions History */}
      {pastSessions.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <button
            onClick={onToggleHistory}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <History className="h-5 w-5 text-primary" />
              Interview History ({pastSessions.length})
            </span>
            {showHistory ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showHistory && (
            <div className="border-t divide-y">
              {pastSessions.slice(0, 10).map((pastSession) => {
                const job = jobs.find((j) => j.id === pastSession.jobId);
                const answeredCount = pastSession.answers?.length || 0;
                const totalQuestions = pastSession.questions.length;
                const isComplete = pastSession.status === "completed";

                return (
                  <div key={pastSession.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isComplete ? "bg-success/10 text-success" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"}`}>
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job?.title || "Unknown Job"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{job?.company || "Unknown Company"}</span>
                          <span>•</span>
                          <span>{answeredCount}/{totalQuestions} questions</span>
                          <span>•</span>
                          <span>{pastSession.mode === "voice" ? "Voice" : "Text"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pastSession.startedAt).toLocaleDateString()} at{" "}
                          {new Date(pastSession.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isComplete && job && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResumeSession(pastSession)}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSession(pastSession.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Difficulty Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select a job to practice for:</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Difficulty:
          </span>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <div key={job.id} className="space-y-4">
            <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20">
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
                  onClick={() => onStartInterview(job.id, "text")}
                  disabled={generating}
                  className="flex-1 gradient-bg text-white hover:opacity-90"
                >
                  {generating && selectedJob === job.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  Text Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onStartInterview(job.id, "voice")}
                  disabled={generating}
                  className="flex-1"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Practice
                </Button>
              </div>

              {/* Prep Guide & Research Links */}
              <div className="flex items-center gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTogglePrepGuide(job.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Target className="h-4 w-4 mr-1" />
                  {showPrepGuide === job.id ? "Hide Prep Guide" : "Prep Guide"}
                </Button>
                <Link
                  href={`/jobs/research/${job.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Company Research
                </Link>
              </div>
            </div>

            {/* Prep Guide Card */}
            {showPrepGuide === job.id && (
              <div className="animate-in">
                <PrepGuideCard jobId={job.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatInterviewForDocs(session: InterviewSession, job?: JobDescription): string {
  const lines: string[] = [];
  lines.push(`Interview Preparation Notes`);
  lines.push(`${"=".repeat(30)}`);
  lines.push("");
  if (job) {
    lines.push(`Position: ${job.title}`);
    lines.push(`Company: ${job.company}`);
    lines.push("");
  }
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push(`Mode: ${session.mode === "voice" ? "Voice" : "Text"}`);
  lines.push(`Questions: ${session.questions.length}`);
  lines.push("");
  lines.push(`${"=".repeat(30)}`);
  lines.push("");

  session.questions.forEach((q, i) => {
    lines.push(`Question ${i + 1} (${q.category})`);
    lines.push(`${"-".repeat(20)}`);
    lines.push(q.question);
    lines.push("");
    lines.push(`Your Answer:`);
    lines.push(session.answers[i] || "(No answer provided)");
    lines.push("");
    if (session.feedback[i]) {
      lines.push(`AI Feedback:`);
      lines.push(session.feedback[i]);
    }
    lines.push("");
    lines.push("");
  });

  return lines.join("\n");
}

function InterviewSummary({
  session,
  selectedJob,
  onReset,
}: {
  session: InterviewSession;
  selectedJob?: JobDescription;
  onReset: () => void;
}) {
  const answeredCount = session.answers.filter(a => a && a.trim()).length;
  const avgFeedbackLength = session.feedback.filter(f => f).reduce((sum, f) => sum + f.length, 0) / (session.feedback.filter(f => f).length || 1);
  const performanceLevel = avgFeedbackLength > 200 ? "detailed" : avgFeedbackLength > 100 ? "good" : "brief";

  return (
    <div className="space-y-6 animate-in">
      {/* Success Header */}
      <div className="rounded-2xl border border-success/50 bg-success/5 p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 text-success mb-6">
          <Trophy className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Interview Complete!</h2>
        <p className="text-muted-foreground mt-2">
          You answered all {session.questions.length} questions. Review your responses and feedback below.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Button onClick={onReset} className="gradient-bg text-white hover:opacity-90">
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Interview
          </Button>
          <SaveToDocsButton
            title={`Interview Prep - ${selectedJob?.title || "Practice"} at ${selectedJob?.company || "Company"}`}
            content={formatInterviewForDocs(session, selectedJob)}
          />
          {selectedJob && (
            <Link href={`/jobs/research/${selectedJob.id}`}>
              <Button variant="outline">
                <Info className="h-4 w-4 mr-2" />
                Research {selectedJob.company}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{answeredCount}/{session.questions.length}</p>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary capitalize">{performanceLevel}</p>
            <p className="text-xs text-muted-foreground">Response Quality</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{session.feedback.filter(f => f).length}</p>
            <p className="text-xs text-muted-foreground">Feedback Received</p>
          </div>
        </div>
      </div>

      {/* Responses */}
      <h3 className="text-xl font-semibold">Your Responses</h3>
      {session.questions.map((q, i) => (
        <div key={i} className="rounded-2xl border bg-card overflow-hidden">
          <div className="p-5 border-b bg-muted/30">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                categoryColors[q.category]?.bg
              } ${categoryColors[q.category]?.text} mb-3`}
            >
              {categoryColors[q.category]?.icon}
              {q.category.charAt(0).toUpperCase() + q.category.slice(1)}
            </span>
            <h4 className="font-semibold">{q.question}</h4>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer</p>
              <p className="text-sm">{session.answers[i] || "No answer provided"}</p>
            </div>
            {session.feedback[i] && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-medium text-primary flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  AI Feedback
                </p>
                <p className="text-sm">{session.feedback[i]}</p>
              </div>
            )}

            {/* Follow-up Exchanges */}
            {session.followUps[i] && session.followUps[i].length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Follow-up Questions ({session.followUps[i].length})
                </p>
                {session.followUps[i].map((followUp, j) => (
                  <div key={j} className="pl-4 border-l-2 border-orange-200 dark:border-orange-800 space-y-2">
                    <p className="text-sm font-medium">{followUp.followUpQuestion}</p>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your Response</p>
                      <p className="text-sm">{followUp.answer}</p>
                    </div>
                    {followUp.feedback && (
                      <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3">
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Feedback</p>
                        <p className="text-sm">{followUp.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tip({
  icon,
  color,
  title,
  description,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    violet: "bg-violet-500/10 text-violet-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="p-4 rounded-xl bg-muted/50">
      <div className={`p-2 w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
