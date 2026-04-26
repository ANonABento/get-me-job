import db from "./schema";
import { generateId } from "@/lib/utils";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "general";
  suggestedAnswer?: string;
}

export interface InterviewSession {
  id: string;
  jobId: string;
  profileId: string;
  mode: "text" | "voice";
  questions: InterviewQuestion[];
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
}

export interface InterviewAnswer {
  id: string;
  sessionId: string;
  questionIndex: number;
  answer: string;
  feedback?: string;
  createdAt: string;
}

export interface InterviewSessionWithAnswers extends InterviewSession {
  answers: InterviewAnswer[];
}

// Create a new interview session
export function createInterviewSession(
  jobId: string,
  questions: InterviewQuestion[],
  mode: "text" | "voice" = "text",
  userId: string = "default"
): InterviewSession {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO interview_sessions (id, job_id, profile_id, mode, questions_json, status, started_at)
    VALUES (?, ?, ?, ?, ?, 'in_progress', ?)
  `);

  stmt.run(id, jobId, userId, mode, JSON.stringify(questions), now);

  return {
    id,
    jobId,
    profileId: userId,
    mode,
    questions,
    status: "in_progress",
    startedAt: now,
  };
}

// Get interview session by ID
export function getInterviewSession(
  id: string,
  userId: string = "default"
): InterviewSessionWithAnswers | null {
  const sessionStmt = db.prepare(`
    SELECT id, job_id, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
    WHERE id = ? AND profile_id = ?
  `);

  const row = sessionStmt.get(id, userId) as {
    id: string;
    job_id: string;
    profile_id: string;
    mode: string;
    questions_json: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  } | undefined;

  if (!row) return null;

  const answersStmt = db.prepare(`
    SELECT id, session_id, question_index, answer, feedback, created_at
    FROM interview_answers
    WHERE session_id = ? AND user_id = ?
    ORDER BY question_index
  `);

  const answerRows = answersStmt.all(id, userId) as Array<{
    id: string;
    session_id: string;
    question_index: number;
    answer: string;
    feedback: string | null;
    created_at: string;
  }>;

  return {
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    mode: row.mode as "text" | "voice",
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    answers: answerRows.map((a) => ({
      id: a.id,
      sessionId: a.session_id,
      questionIndex: a.question_index,
      answer: a.answer,
      feedback: a.feedback || undefined,
      createdAt: a.created_at,
    })),
  };
}

// Get all interview sessions (optionally filter by job)
export function getInterviewSessions(
  jobId?: string,
  userId: string = "default"
): InterviewSession[] {
  let query = `
    SELECT id, job_id, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
  `;
  const params: string[] = [userId];

  query += " WHERE profile_id = ?";

  if (jobId) {
    query += " AND job_id = ?";
    params.push(jobId);
  }

  query += " ORDER BY started_at DESC";

  const stmt = db.prepare(query);
  const rows = (params.length > 0 ? stmt.all(...params) : stmt.all()) as Array<{
    id: string;
    job_id: string;
    profile_id: string;
    mode: string;
    questions_json: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    mode: row.mode as "text" | "voice",
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
  }));
}

// Add an answer to an interview session
export function addInterviewAnswer(
  sessionId: string,
  questionIndex: number,
  answer: string,
  feedback?: string,
  userId: string = "default"
): InterviewAnswer {
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO interview_answers (id, user_id, session_id, question_index, answer, feedback, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, sessionId, questionIndex, answer, feedback || null, now);

  return {
    id,
    sessionId,
    questionIndex,
    answer,
    feedback,
    createdAt: now,
  };
}

// Complete an interview session
export function completeInterviewSession(
  sessionId: string,
  userId: string = "default"
): void {
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE interview_sessions
    SET status = 'completed', completed_at = ?
    WHERE id = ? AND profile_id = ?
  `);

  stmt.run(now, sessionId, userId);
}

// Delete an interview session (cascades to answers)
export function deleteInterviewSession(id: string, userId: string = "default"): void {
  const session = db
    .prepare("SELECT id FROM interview_sessions WHERE id = ? AND profile_id = ?")
    .get(id, userId) as { id: string } | undefined;

  if (!session) {
    return;
  }

  const deleteAnswers = db.prepare("DELETE FROM interview_answers WHERE session_id = ? AND user_id = ?");
  deleteAnswers.run(id, userId);

  const deleteSession = db.prepare("DELETE FROM interview_sessions WHERE id = ? AND profile_id = ?");
  deleteSession.run(id, userId);
}

// Get recent interview sessions for dashboard
export function getRecentInterviewSessions(
  limit: number = 5,
  userId: string = "default"
): InterviewSession[] {
  const stmt = db.prepare(`
    SELECT id, job_id, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
    WHERE profile_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(userId, limit) as Array<{
    id: string;
    job_id: string;
    profile_id: string;
    mode: string;
    questions_json: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    profileId: row.profile_id,
    mode: row.mode as "text" | "voice",
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
  }));
}
