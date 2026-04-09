import type { InterviewDifficulty } from "@/features/interview/schemas";
import type {
  PastInterviewSession,
} from "@/features/interview/client-types";
import type { InterviewQuestion } from "@/features/interview/types";
import type { JobDescription } from "@/types";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchInterviewJobs() {
  const data = await readJson<{ jobs?: JobDescription[] }>(await fetch("/api/jobs"));
  return data.jobs || [];
}

export async function fetchPastInterviewSessions() {
  const data = await readJson<{ sessions?: PastInterviewSession[] }>(
    await fetch("/api/interview/sessions")
  );
  return data.sessions || [];
}

export async function markInterviewSessionCompleted(sessionId: string) {
  await readJson(await fetch(`/api/interview/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "completed" }),
  }));
}

export async function deleteInterviewSessionById(sessionId: string) {
  await readJson(await fetch(`/api/interview/sessions/${sessionId}`, {
    method: "DELETE",
  }));
}

export async function generateInterviewQuestions(
  jobId: string,
  difficulty: InterviewDifficulty
) {
  const data = await readJson<{ questions?: InterviewQuestion[] }>(
    await fetch("/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, difficulty }),
    })
  );

  if (!data.questions) {
    throw new Error("Failed to generate questions");
  }

  return data.questions;
}

export async function createInterviewSessionRecord(
  jobId: string,
  questions: InterviewQuestion[],
  mode: "text" | "voice"
) {
  const data = await readJson<{ session?: { id?: string } }>(
    await fetch("/api/interview/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        questions,
        mode,
      }),
    })
  );

  return data.session?.id;
}

export async function submitInterviewAnswerRequest({
  sessionId,
  jobId,
  questionIndex,
  answer,
}: {
  sessionId?: string;
  jobId: string;
  questionIndex: number;
  answer: string;
}) {
  const apiUrl = sessionId
    ? `/api/interview/sessions/${sessionId}/answer`
    : "/api/interview/answer";

  const data = await readJson<{ feedback?: string }>(
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        questionIndex,
        answer,
      }),
    })
  );

  return data.feedback || "";
}

export async function requestInterviewFollowUp({
  jobId,
  originalQuestion,
  userAnswer,
  questionCategory,
}: {
  jobId: string;
  originalQuestion: string;
  userAnswer: string;
  questionCategory: string;
}) {
  return readJson<{
    followUpQuestion?: string;
    reason?: string;
    suggestedFocus?: string[];
  }>(
    await fetch("/api/interview/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        originalQuestion,
        userAnswer,
        questionCategory,
      }),
    })
  );
}
