import { db, interviewSessions, interviewAnswers, jobs, eq, and, desc } from '../index';
import { generateId } from '@/lib/utils';

interface InterviewQuestion {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'general';
  suggestedAnswer?: string;
}

export interface InterviewSession {
  id: string;
  jobId: string;
  profileId: string;
  mode: 'text' | 'voice';
  questions: InterviewQuestion[];
  status: 'in_progress' | 'completed';
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
export async function createInterviewSession(
  userId: string,
  jobId: string,
  profileId: string,
  questions: InterviewQuestion[],
  mode: 'text' | 'voice' = 'text'
): Promise<InterviewSession> {
  const id = generateId();
  const now = new Date();
  const jobRows = await db.select({ id: jobs.id }).from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);

  if (jobRows.length === 0) {
    throw new Error('Job not found');
  }

  await db.insert(interviewSessions).values({
    id,
    userId,
    jobId,
    profileId,
    mode,
    questionsJson: JSON.stringify(questions),
    status: 'in_progress',
    startedAt: now,
  });

  return {
    id,
    jobId,
    profileId,
    mode,
    questions,
    status: 'in_progress',
    startedAt: now.toISOString(),
  };
}

// Get interview session by ID
export async function getInterviewSession(
  userId: string,
  sessionId: string
): Promise<InterviewSessionWithAnswers | null> {
  const sessionRows = await db.select().from(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)));

  if (sessionRows.length === 0) return null;
  const row = sessionRows[0];

  const answerRows = await db.select().from(interviewAnswers)
    .where(and(eq(interviewAnswers.sessionId, sessionId), eq(interviewAnswers.userId, userId)));

  return {
    id: row.id,
    jobId: row.jobId,
    profileId: row.profileId,
    mode: row.mode as 'text' | 'voice',
    questions: JSON.parse(row.questionsJson),
    status: row.status as 'in_progress' | 'completed',
    startedAt: row.startedAt?.toISOString() ?? '',
    completedAt: row.completedAt?.toISOString(),
    answers: answerRows.map((a) => ({
      id: a.id,
      sessionId: a.sessionId,
      questionIndex: a.questionIndex,
      answer: a.answer,
      feedback: a.feedback ?? undefined,
      createdAt: a.createdAt?.toISOString() ?? '',
    })),
  };
}

// Get all interview sessions for a user
export async function getInterviewSessions(
  userId: string,
  jobId?: string
): Promise<InterviewSession[]> {
  let query = db.select().from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.startedAt));

  if (jobId) {
    query = db.select().from(interviewSessions)
      .where(and(eq(interviewSessions.userId, userId), eq(interviewSessions.jobId, jobId)))
      .orderBy(desc(interviewSessions.startedAt));
  }

  const rows = await query;

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    profileId: row.profileId,
    mode: row.mode as 'text' | 'voice',
    questions: JSON.parse(row.questionsJson),
    status: row.status as 'in_progress' | 'completed',
    startedAt: row.startedAt?.toISOString() ?? '',
    completedAt: row.completedAt?.toISOString(),
  }));
}

// Add an answer to an interview session
export async function addInterviewAnswer(
  userId: string,
  sessionId: string,
  questionIndex: number,
  answer: string,
  feedback?: string
): Promise<InterviewAnswer> {
  const id = generateId();
  const now = new Date();
  const sessionRows = await db.select({ id: interviewSessions.id }).from(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)))
    .limit(1);

  if (sessionRows.length === 0) {
    throw new Error('Session not found');
  }

  await db.insert(interviewAnswers).values({
    id,
    userId,
    sessionId,
    questionIndex,
    answer,
    feedback: feedback ?? null,
    createdAt: now,
  });

  return {
    id,
    sessionId,
    questionIndex,
    answer,
    feedback,
    createdAt: now.toISOString(),
  };
}

// Complete an interview session
export async function completeInterviewSession(userId: string, sessionId: string): Promise<void> {
  await db.update(interviewSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)));
}

// Delete an interview session
export async function deleteInterviewSession(userId: string, sessionId: string): Promise<void> {
  await db.delete(interviewAnswers)
    .where(and(eq(interviewAnswers.sessionId, sessionId), eq(interviewAnswers.userId, userId)));

  await db.delete(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)));
}

// Get recent interview sessions for dashboard
export async function getRecentInterviewSessions(
  userId: string,
  limit: number = 5
): Promise<InterviewSession[]> {
  const rows = await db.select().from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.startedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    profileId: row.profileId,
    mode: row.mode as 'text' | 'voice',
    questions: JSON.parse(row.questionsJson),
    status: row.status as 'in_progress' | 'completed',
    startedAt: row.startedAt?.toISOString() ?? '',
    completedAt: row.completedAt?.toISOString(),
  }));
}
