import db from "./legacy";
import { generateId } from "@/lib/utils";
import type { SessionQuestionCategory, SessionMode } from "@/lib/constants";
import type {
  InterviewContextMode,
  InterviewContextPackSummary,
  InterviewContextSourceRef,
} from "@/types/interview";

import { nowIso } from "@/lib/format/time";
interface InterviewQuestion {
  question: string;
  category: SessionQuestionCategory;
  suggestedAnswer?: string;
  sourceRefs?: InterviewContextSourceRef[];
  interviewMode?: InterviewContextMode;
  probeType?: string;
}

export interface InterviewSession {
  id: string;
  jobId: string | null;
  contextPackId?: string | null;
  contextPackTitle?: string | null;
  contextPackMode?: InterviewContextMode | null;
  contextPackPromotable?: boolean;
  profileId: string;
  mode: SessionMode;
  category?: SessionQuestionCategory | null;
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

export interface InterviewFollowUp {
  id: string;
  sessionId: string;
  questionIndex: number;
  followUpQuestion: string;
  answer: string;
  feedback?: string;
  createdAt: string;
}

export interface InterviewSessionWithAnswers extends InterviewSession {
  answers: InterviewAnswer[];
  followUps: InterviewFollowUp[];
}

export interface InterviewContextPack {
  id: string;
  userId: string;
  title: string;
  mode: InterviewContextMode;
  status: "ready" | "partial" | "failed";
  sources: InterviewContextSourceRef[];
  summary: InterviewContextPackSummary;
  rawContextExcerpt?: string;
  deepDiveEnabled: boolean;
  promotionState: "none" | "prompted" | "saved_to_bank";
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInterviewContextPackRecord {
  title: string;
  mode: InterviewContextMode;
  status: "ready" | "partial" | "failed";
  sources: InterviewContextSourceRef[];
  summary: InterviewContextPackSummary;
  rawContextExcerpt?: string;
  deepDiveEnabled: boolean;
  promotionState?: "none" | "prompted" | "saved_to_bank";
}

let interviewSessionsSchemaEnsured = false;

interface TableInfoRow {
  name: string;
  notnull: number;
}

function tryExec(statement: string): void {
  const exec = (db as unknown as { exec?: (sql: string) => void }).exec;
  if (typeof exec === "function") {
    exec.call(db, statement);
    return;
  }

  const prepared = db.prepare(statement);
  if ("run" in prepared && typeof prepared.run === "function") {
    prepared.run();
  }
}

export function ensureInterviewSessionsSchema(): void {
  if (interviewSessionsSchemaEnsured) return;

  tryExec(`
    CREATE TABLE IF NOT EXISTS interview_follow_ups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      session_id TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      follow_up_question TEXT NOT NULL,
      answer TEXT NOT NULL,
      feedback TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  tryExec(`
    CREATE INDEX IF NOT EXISTS idx_interview_follow_ups_session_question
    ON interview_follow_ups(user_id, session_id, question_index, created_at)
  `);
  tryExec(`
    CREATE TABLE IF NOT EXISTS interview_context_packs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      sources_json TEXT NOT NULL DEFAULT '[]',
      normalized_context_json TEXT NOT NULL DEFAULT '{}',
      raw_context_excerpt TEXT,
      deep_dive_enabled INTEGER NOT NULL DEFAULT 0,
      promotion_state TEXT NOT NULL DEFAULT 'none',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  tryExec(`
    CREATE INDEX IF NOT EXISTS idx_interview_context_packs_user_created
    ON interview_context_packs(user_id, created_at)
  `);

  try {
    tryExec("ALTER TABLE interview_sessions ADD COLUMN category TEXT");
  } catch (error) {
    const message = (error as Error).message.toLowerCase();
    if (!message.includes("duplicate column")) throw error;
  }
  try {
    tryExec("ALTER TABLE interview_sessions ADD COLUMN context_pack_id TEXT");
  } catch (error) {
    const message = (error as Error).message.toLowerCase();
    if (!message.includes("duplicate column")) throw error;
  }

  try {
    const pragmaStmt = db.prepare("PRAGMA table_info(interview_sessions)") as {
      all?: () => TableInfoRow[];
    };
    if (typeof pragmaStmt.all !== "function") {
      interviewSessionsSchemaEnsured = true;
      return;
    }
    const rows = pragmaStmt.all();
    const jobIdColumn = rows?.find((row) => row.name === "job_id");

    if (jobIdColumn?.notnull) {
      tryExec("BEGIN");
      try {
        tryExec(`
          CREATE TABLE interview_sessions_new (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL DEFAULT 'default',
            job_id TEXT,
            context_pack_id TEXT,
            category TEXT,
            profile_id TEXT NOT NULL,
            mode TEXT DEFAULT 'text',
            questions_json TEXT NOT NULL,
            status TEXT DEFAULT 'in_progress',
            started_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT
          )
        `);
        tryExec(`
          INSERT INTO interview_sessions_new (
            id, user_id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at, completed_at
          )
          SELECT id, user_id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at, completed_at
          FROM interview_sessions
        `);
        tryExec("DROP TABLE interview_sessions");
        tryExec(
          "ALTER TABLE interview_sessions_new RENAME TO interview_sessions",
        );
        tryExec("COMMIT");
      } catch (error) {
        tryExec("ROLLBACK");
        throw error;
      }
    }
  } catch (error) {
    const message = (error as Error).message.toLowerCase();
    if (
      !message.includes("no such table") &&
      !message.includes("no such column")
    ) {
      throw error;
    }
  }

  interviewSessionsSchemaEnsured = true;
}

function rowJobId(value: string | null | undefined): string | null {
  return value || null;
}

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToContextPack(row: {
  id: string;
  user_id: string;
  title: string;
  mode: string;
  status: string;
  sources_json: string;
  normalized_context_json: string;
  raw_context_excerpt: string | null;
  deep_dive_enabled: number | boolean;
  promotion_state: string;
  created_at: string;
  updated_at: string | null;
}): InterviewContextPack {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    mode: row.mode as InterviewContextMode,
    status: row.status as InterviewContextPack["status"],
    sources: safeJson<InterviewContextSourceRef[]>(row.sources_json, []),
    summary: safeJson<InterviewContextPackSummary>(
      row.normalized_context_json,
      {
        detectedStack: [],
        skills: [],
        claims: [],
        weakSpots: [],
        questionAngles: [],
        warnings: [],
        sourceLabels: [],
      },
    ),
    rawContextExcerpt: row.raw_context_excerpt || undefined,
    deepDiveEnabled: Boolean(row.deep_dive_enabled),
    promotionState:
      row.promotion_state === "prompted" ||
      row.promotion_state === "saved_to_bank"
        ? row.promotion_state
        : "none",
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

function getContextPacksForSessions(
  contextPackIds: string[],
  userId: string,
): Map<string, InterviewContextPack> {
  const packs = new Map<string, InterviewContextPack>();
  if (contextPackIds.length === 0) return packs;
  const placeholders = contextPackIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `
      SELECT *
      FROM interview_context_packs
      WHERE user_id = ? AND id IN (${placeholders})
    `,
    )
    .all(userId, ...contextPackIds) as Array<
    Parameters<typeof rowToContextPack>[0]
  >;

  for (const row of rows) {
    const pack = rowToContextPack(row);
    packs.set(pack.id, pack);
  }
  return packs;
}

function hasCustomSource(pack: InterviewContextPack | undefined): boolean {
  return Boolean(
    pack?.sources.some(
      (source) => source.type === "custom-text" || source.type === "custom-url",
    ),
  );
}

function getInterviewAnswersForSessions(
  sessionIds: string[],
  userId: string,
): Map<string, InterviewAnswer[]> {
  const answersBySession = new Map<string, InterviewAnswer[]>();
  if (sessionIds.length === 0) return answersBySession;

  const placeholders = sessionIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `
      SELECT id, session_id, question_index, answer, feedback, created_at
      FROM interview_answers
      WHERE user_id = ? AND session_id IN (${placeholders})
      ORDER BY session_id, question_index, created_at
    `,
    )
    .all(userId, ...sessionIds) as Array<{
    id: string;
    session_id: string;
    question_index: number;
    answer: string;
    feedback: string | null;
    created_at: string;
  }>;

  for (const row of rows) {
    const list = answersBySession.get(row.session_id) ?? [];
    list.push({
      id: row.id,
      sessionId: row.session_id,
      questionIndex: row.question_index,
      answer: row.answer,
      feedback: row.feedback || undefined,
      createdAt: row.created_at,
    });
    answersBySession.set(row.session_id, list);
  }

  return answersBySession;
}

function getInterviewFollowUpsForSessions(
  sessionIds: string[],
  userId: string,
): Map<string, InterviewFollowUp[]> {
  const followUpsBySession = new Map<string, InterviewFollowUp[]>();
  if (sessionIds.length === 0) return followUpsBySession;

  const placeholders = sessionIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `
      SELECT id, session_id, question_index, follow_up_question, answer, feedback, created_at
      FROM interview_follow_ups
      WHERE user_id = ? AND session_id IN (${placeholders})
      ORDER BY session_id, question_index, created_at
    `,
    )
    .all(userId, ...sessionIds) as Array<{
    id: string;
    session_id: string;
    question_index: number;
    follow_up_question: string;
    answer: string;
    feedback: string | null;
    created_at: string;
  }>;

  for (const row of rows) {
    const list = followUpsBySession.get(row.session_id) ?? [];
    list.push({
      id: row.id,
      sessionId: row.session_id,
      questionIndex: row.question_index,
      followUpQuestion: row.follow_up_question,
      answer: row.answer,
      feedback: row.feedback || undefined,
      createdAt: row.created_at,
    });
    followUpsBySession.set(row.session_id, list);
  }

  return followUpsBySession;
}

// Create a new interview session
export function createInterviewSession(
  jobId: string | null,
  questions: InterviewQuestion[],
  mode: SessionMode = "text",
  userId: string,
  category?: SessionQuestionCategory | null,
  contextPackId?: string | null,
): InterviewSession {
  ensureInterviewSessionsSchema();
  const id = generateId();
  const now = nowIso();

  const stmt = jobId
    ? db.prepare(`
        INSERT INTO interview_sessions (id, user_id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?
        WHERE EXISTS (SELECT 1 FROM jobs WHERE id = ? AND user_id = ?)
      `)
    : db.prepare(`
        INSERT INTO interview_sessions (id, user_id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'in_progress', ?)
      `);

  const result = jobId
    ? (stmt.run(
        id,
        userId,
        jobId,
        contextPackId || null,
        category || null,
        userId,
        mode,
        JSON.stringify(questions),
        now,
        jobId,
        userId,
      ) as { changes?: number } | undefined)
    : (stmt.run(
        id,
        userId,
        contextPackId || null,
        category || null,
        userId,
        mode,
        JSON.stringify(questions),
        now,
      ) as { changes?: number } | undefined);

  if (result?.changes === 0) {
    throw new Error("Job not found");
  }

  return {
    id,
    jobId,
    contextPackId: contextPackId || null,
    profileId: userId,
    mode,
    category: category || null,
    questions,
    status: "in_progress",
    startedAt: now,
  };
}

// Get interview session by ID
export function getInterviewSession(
  id: string,
  userId: string,
): InterviewSessionWithAnswers | null {
  ensureInterviewSessionsSchema();
  const sessionStmt = db.prepare(`
    SELECT id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
    WHERE id = ? AND user_id = ?
  `);

  const row = sessionStmt.get(id, userId) as
    | {
        id: string;
        job_id: string | null;
        context_pack_id: string | null;
        category: SessionQuestionCategory | null;
        profile_id: string;
        mode: string;
        questions_json: string;
        status: string;
        started_at: string;
        completed_at: string | null;
      }
    | undefined;

  if (!row) return null;

  const answers = getInterviewAnswersForSessions([id], userId).get(id) ?? [];
  const followUps =
    getInterviewFollowUpsForSessions([id], userId).get(id) ?? [];
  const contextPack = row.context_pack_id
    ? getInterviewContextPack(row.context_pack_id, userId)
    : null;

  return {
    id: row.id,
    jobId: rowJobId(row.job_id),
    contextPackId: row.context_pack_id || null,
    contextPackTitle: contextPack?.title || null,
    contextPackMode: contextPack?.mode || null,
    contextPackPromotable:
      contextPack?.promotionState !== "saved_to_bank" &&
      hasCustomSource(contextPack || undefined),
    profileId: row.profile_id,
    mode: row.mode as SessionMode,
    category: row.category || null,
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    answers,
    followUps,
  };
}

// Get all interview sessions (optionally filter by job)
export function getInterviewSessions(
  jobId: string | undefined,
  userId: string,
): InterviewSessionWithAnswers[] {
  ensureInterviewSessionsSchema();
  let query = `
    SELECT id, job_id, context_pack_id, category, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
  `;
  const params: string[] = [userId];

  query += " WHERE user_id = ?";

  if (jobId) {
    query += " AND job_id = ?";
    params.push(jobId);
  }

  query += " ORDER BY started_at DESC";

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Array<{
    id: string;
    job_id: string | null;
    context_pack_id: string | null;
    category: SessionQuestionCategory | null;
    profile_id: string;
    mode: string;
    questions_json: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  }>;

  const sessionIds = rows.map((row) => row.id);
  const answersBySession = getInterviewAnswersForSessions(sessionIds, userId);
  const followUpsBySession = getInterviewFollowUpsForSessions(
    sessionIds,
    userId,
  );
  const contextPacksById = getContextPacksForSessions(
    Array.from(
      new Set(
        rows
          .map((row) => row.context_pack_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ),
    userId,
  );

  return rows.map((row) => ({
    id: row.id,
    jobId: rowJobId(row.job_id),
    contextPackId: row.context_pack_id || null,
    contextPackTitle: row.context_pack_id
      ? contextPacksById.get(row.context_pack_id)?.title || null
      : null,
    contextPackMode: row.context_pack_id
      ? contextPacksById.get(row.context_pack_id)?.mode || null
      : null,
    contextPackPromotable: row.context_pack_id
      ? contextPacksById.get(row.context_pack_id)?.promotionState !==
          "saved_to_bank" &&
        hasCustomSource(contextPacksById.get(row.context_pack_id))
      : false,
    profileId: row.profile_id,
    mode: row.mode as SessionMode,
    category: row.category || null,
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    answers: answersBySession.get(row.id) ?? [],
    followUps: followUpsBySession.get(row.id) ?? [],
  }));
}

export function createInterviewContextPack(
  record: CreateInterviewContextPackRecord,
  userId: string,
): InterviewContextPack {
  ensureInterviewSessionsSchema();
  const id = generateId();
  const now = nowIso();

  db.prepare(
    `
    INSERT INTO interview_context_packs (
      id, user_id, title, mode, status, sources_json, normalized_context_json,
      raw_context_excerpt, deep_dive_enabled, promotion_state, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    userId,
    record.title,
    record.mode,
    record.status,
    JSON.stringify(record.sources),
    JSON.stringify(record.summary),
    record.rawContextExcerpt ?? null,
    record.deepDiveEnabled ? 1 : 0,
    record.promotionState ?? "none",
    now,
    now,
  );

  return {
    id,
    userId,
    title: record.title,
    mode: record.mode,
    status: record.status,
    sources: record.sources,
    summary: record.summary,
    rawContextExcerpt: record.rawContextExcerpt,
    deepDiveEnabled: record.deepDiveEnabled,
    promotionState: record.promotionState ?? "none",
    createdAt: now,
    updatedAt: now,
  };
}

export function getInterviewContextPack(
  id: string,
  userId: string,
): InterviewContextPack | null {
  ensureInterviewSessionsSchema();
  const row = db
    .prepare(
      "SELECT * FROM interview_context_packs WHERE id = ? AND user_id = ?",
    )
    .get(id, userId) as Parameters<typeof rowToContextPack>[0] | undefined;
  return row ? rowToContextPack(row) : null;
}

export function listInterviewContextPacks(
  userId: string,
  limit = 20,
): InterviewContextPack[] {
  ensureInterviewSessionsSchema();
  const rows = db
    .prepare(
      `SELECT * FROM interview_context_packs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(userId, limit) as Array<Parameters<typeof rowToContextPack>[0]>;
  return rows.map(rowToContextPack);
}

export function markInterviewContextPackSavedToBank(
  id: string,
  userId: string,
): void {
  ensureInterviewSessionsSchema();
  db.prepare(
    `UPDATE interview_context_packs
     SET promotion_state = 'saved_to_bank', updated_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(nowIso(), id, userId);
}

// Add an answer to an interview session
export function addInterviewAnswer(
  sessionId: string,
  questionIndex: number,
  answer: string,
  feedback: string | undefined,
  userId: string,
): InterviewAnswer {
  ensureInterviewSessionsSchema();
  const id = generateId();
  const now = nowIso();

  const stmt = db.prepare(`
    INSERT INTO interview_answers (id, user_id, session_id, question_index, answer, feedback, created_at)
    SELECT ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM interview_sessions
      WHERE id = ? AND user_id = ?
    )
  `);

  const result = stmt.run(
    id,
    userId,
    sessionId,
    questionIndex,
    answer,
    feedback || null,
    now,
    sessionId,
    userId,
  ) as { changes?: number } | undefined;

  if (result?.changes === 0) {
    throw new Error("Session not found");
  }

  return {
    id,
    sessionId,
    questionIndex,
    answer,
    feedback,
    createdAt: now,
  };
}

export function addInterviewFollowUp(
  sessionId: string,
  questionIndex: number,
  followUpQuestion: string,
  answer: string,
  feedback: string | undefined,
  userId: string,
): InterviewFollowUp {
  ensureInterviewSessionsSchema();
  const id = generateId();
  const now = nowIso();

  const stmt = db.prepare(`
    INSERT INTO interview_follow_ups (
      id, user_id, session_id, question_index, follow_up_question, answer, feedback, created_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM interview_sessions
      WHERE id = ? AND user_id = ?
    )
  `);

  const result = stmt.run(
    id,
    userId,
    sessionId,
    questionIndex,
    followUpQuestion,
    answer,
    feedback || null,
    now,
    sessionId,
    userId,
  ) as { changes?: number } | undefined;

  if (result?.changes === 0) {
    throw new Error("Session not found");
  }

  return {
    id,
    sessionId,
    questionIndex,
    followUpQuestion,
    answer,
    feedback,
    createdAt: now,
  };
}

// Complete an interview session
export function completeInterviewSession(
  sessionId: string,
  userId: string,
): void {
  ensureInterviewSessionsSchema();
  const now = nowIso();

  const stmt = db.prepare(`
    UPDATE interview_sessions
    SET status = 'completed', completed_at = ?
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(now, sessionId, userId);
}

// Delete an interview session (cascades to answers)
export function deleteInterviewSession(id: string, userId: string): void {
  ensureInterviewSessionsSchema();
  const session = db
    .prepare("SELECT id FROM interview_sessions WHERE id = ? AND user_id = ?")
    .get(id, userId) as { id: string } | undefined;

  if (!session) {
    return;
  }

  const deleteAnswers = db.prepare(
    "DELETE FROM interview_answers WHERE session_id = ? AND user_id = ?",
  );
  deleteAnswers.run(id, userId);

  const deleteFollowUps = db.prepare(
    "DELETE FROM interview_follow_ups WHERE session_id = ? AND user_id = ?",
  );
  deleteFollowUps.run(id, userId);

  const deleteSession = db.prepare(
    "DELETE FROM interview_sessions WHERE id = ? AND user_id = ?",
  );
  deleteSession.run(id, userId);
}

// Get recent interview sessions for dashboard
export function getRecentInterviewSessions(
  limit: number = 5,
  userId: string,
): InterviewSession[] {
  ensureInterviewSessionsSchema();
  const stmt = db.prepare(`
    SELECT id, job_id, category, profile_id, mode, questions_json, status, started_at, completed_at
    FROM interview_sessions
    WHERE user_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(userId, limit) as Array<{
    id: string;
    job_id: string | null;
    category: SessionQuestionCategory | null;
    profile_id: string;
    mode: string;
    questions_json: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    jobId: rowJobId(row.job_id),
    profileId: row.profile_id,
    mode: row.mode as SessionMode,
    category: row.category || null,
    questions: JSON.parse(row.questions_json),
    status: row.status as "in_progress" | "completed",
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
  }));
}
