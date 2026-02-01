"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { JobDescription } from "@/types";
import { Loader2, MessageSquare, Mic, Play, RotateCcw, Volume2 } from "lucide-react";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "general";
  suggestedAnswer?: string;
}

interface InterviewSession {
  jobId: string;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: string[];
  feedback: string[];
  mode: "text" | "voice";
}

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

  useEffect(() => {
    fetchJobs();
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

  const startInterview = async (jobId: string, mode: "text" | "voice") => {
    setSelectedJob(jobId);
    setGenerating(true);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, mode }),
      });
      const data = await res.json();

      if (data.questions) {
        setSession({
          jobId,
          questions: data.questions,
          currentIndex: 0,
          answers: [],
          feedback: [],
          mode,
        });
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/interview/answer", {
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
        // Interview complete
        setSession({
          ...session,
          answers: newAnswers,
          feedback: newFeedback,
          currentIndex: session.questions.length, // Mark as complete
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

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
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
  };

  const currentQuestion = session?.questions[session.currentIndex];
  const isComplete = session && session.currentIndex >= session.questions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Interview Preparation</h1>
        <p className="text-muted-foreground">
          Practice with AI-powered mock interviews tailored to your target job
        </p>
      </div>

      {!session ? (
        // Job selection
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No jobs to practice for</h3>
                <p className="text-muted-foreground mb-4">
                  Add a job description first to get personalized interview questions
                </p>
                <Button onClick={() => (window.location.href = "/jobs")}>
                  Add a Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Select a job to practice for:</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => startInterview(job.id, "text")}
                          disabled={generating}
                        >
                          {generating && selectedJob === job.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4 mr-2" />
                          )}
                          Text Practice
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startInterview(job.id, "voice")}
                          disabled={generating}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : isComplete ? (
        // Interview complete - show summary
        <div className="space-y-6">
          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="text-green-600">Interview Complete!</CardTitle>
              <CardDescription>
                You answered {session.questions.length} questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={resetSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Interview
              </Button>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold">Your Responses:</h2>
          {session.questions.map((q, i) => (
            <Card key={i}>
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">
                  {q.category}
                </Badge>
                <CardTitle className="text-lg">{q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Your Answer:
                  </p>
                  <p>{session.answers[i] || "No answer provided"}</p>
                </div>
                {session.feedback[i] && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Feedback:</p>
                    <p className="text-sm">{session.feedback[i]}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Active interview
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Question {session.currentIndex + 1} of {session.questions.length}
              </p>
              <div className="w-48 h-2 bg-muted rounded-full mt-1">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${((session.currentIndex + 1) / session.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetSession}>
              End Interview
            </Button>
          </div>

          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2">
                {currentQuestion?.category}
              </Badge>
              <CardTitle>{currentQuestion?.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.mode === "voice" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={speakQuestion}
                    disabled={isSpeaking}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    {isSpeaking ? "Speaking..." : "Hear Question"}
                  </Button>
                </div>
              )}

              <div>
                <Textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="mb-2"
                />

                {session.mode === "voice" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className="mb-2"
                  >
                    <Mic className={`h-4 w-4 mr-2 ${isListening ? "text-red-500" : ""}`} />
                    {isListening ? "Stop Recording" : "Start Voice Input"}
                  </Button>
                )}
              </div>

              {currentQuestion?.suggestedAnswer && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View suggested answer structure
                  </summary>
                  <p className="mt-2 p-3 bg-muted rounded-lg">
                    {currentQuestion.suggestedAnswer}
                  </p>
                </details>
              )}

              <Button
                onClick={submitAnswer}
                disabled={submitting || !currentAnswer.trim()}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
