import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock the database module
vi.mock("./legacy", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

// Mock utils to control ID generation
vi.mock("@/lib/utils", () => ({
  generateId: () => "test-session-id",
}));

import db from "./legacy";
import {
  createInterviewSession,
  getInterviewSession,
  getInterviewSessions,
  addInterviewAnswer,
  addInterviewFollowUp,
  completeInterviewSession,
  deleteInterviewSession,
  getRecentInterviewSessions,
} from "./interviews";

const TEST_USER_ID = "test-user";

describe("Interview Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInterviewSession", () => {
    it("should create a new interview session", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const questions = [
        { question: "Tell me about yourself", category: "behavioral" as const },
        { question: "What is React?", category: "technical" as const },
      ];

      const result = createInterviewSession(
        "job-123",
        questions,
        "text",
        TEST_USER_ID,
      );

      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("WHERE EXISTS"),
      );
      expect(mockRun).toHaveBeenLastCalledWith(
        "test-session-id",
        TEST_USER_ID,
        "job-123",
        null,
        TEST_USER_ID,
        "text",
        JSON.stringify(questions),
        expect.any(String),
        "job-123",
        TEST_USER_ID,
      );
      expect(result).toEqual({
        id: "test-session-id",
        jobId: "job-123",
        profileId: TEST_USER_ID,
        mode: "text",
        category: null,
        questions,
        status: "in_progress",
        startedAt: expect.any(String),
      });
    });

    it("should create a generic interview session without a job", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const questions = [
        {
          question: "Tell me about a challenge",
          category: "behavioral" as const,
        },
      ];

      const result = createInterviewSession(
        null,
        questions,
        "generic-text",
        TEST_USER_ID,
        "behavioral",
      );

      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("VALUES"),
      );
      expect(mockRun).toHaveBeenLastCalledWith(
        "test-session-id",
        TEST_USER_ID,
        "behavioral",
        TEST_USER_ID,
        "generic-text",
        JSON.stringify(questions),
        expect.any(String),
      );
      expect(result).toMatchObject({
        id: "test-session-id",
        jobId: null,
        category: "behavioral",
        mode: "generic-text",
      });
    });

    it("should reject sessions for jobs outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() =>
        createInterviewSession("job-123", [], "text", "user-123"),
      ).toThrow("Job not found");
      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "user-123",
        "job-123",
        null,
        "user-123",
        "text",
        JSON.stringify([]),
        expect.any(String),
        "job-123",
        "user-123",
      );
    });

    it("should default to text mode", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createInterviewSession(
        "job-123",
        [],
        undefined,
        TEST_USER_ID,
      );

      expect(result.mode).toBe("text");
    });

    it("should support voice mode", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createInterviewSession(
        "job-123",
        [],
        "voice",
        TEST_USER_ID,
      );

      expect(result.mode).toBe("voice");
    });
  });

  describe("getInterviewSession", () => {
    it("should return session with answers", () => {
      const mockSessionRow = {
        id: "session-1",
        job_id: "job-123",
        profile_id: TEST_USER_ID,
        mode: "text",
        questions_json: '[{"question": "Q1", "category": "behavioral"}]',
        status: "in_progress",
        started_at: "2024-01-15T10:00:00.000Z",
        completed_at: null,
      };

      const mockAnswerRows = [
        {
          id: "answer-1",
          session_id: "session-1",
          question_index: 0,
          answer: "My answer",
          feedback: "Good answer",
          created_at: "2024-01-15T10:05:00.000Z",
        },
      ];

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("interview_sessions")) {
          return { get: vi.fn().mockReturnValue(mockSessionRow) };
        }
        if (sql.includes("interview_answers")) {
          return { all: vi.fn().mockReturnValue(mockAnswerRows) };
        }
        if (sql.includes("interview_follow_ups")) {
          return { all: vi.fn().mockReturnValue([]) };
        }
        return { get: vi.fn(), all: vi.fn() };
      });

      const result = getInterviewSession("session-1", TEST_USER_ID);

      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ? AND user_id = ?"),
      );
      expect(result).toEqual({
        id: "session-1",
        jobId: "job-123",
        profileId: TEST_USER_ID,
        mode: "text",
        category: null,
        questions: [{ question: "Q1", category: "behavioral" }],
        status: "in_progress",
        startedAt: "2024-01-15T10:00:00.000Z",
        completedAt: undefined,
        answers: [
          {
            id: "answer-1",
            sessionId: "session-1",
            questionIndex: 0,
            answer: "My answer",
            feedback: "Good answer",
            createdAt: "2024-01-15T10:05:00.000Z",
          },
        ],
        followUps: [],
      });
    });

    it("should return null for non-existent session", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
        all: vi.fn().mockReturnValue([]),
      });

      const result = getInterviewSession("non-existent", TEST_USER_ID);

      expect(result).toBeNull();
    });

    it("should handle completed sessions", () => {
      const mockSessionRow = {
        id: "session-1",
        job_id: "job-123",
        profile_id: TEST_USER_ID,
        mode: "voice",
        questions_json: "[]",
        status: "completed",
        started_at: "2024-01-15T10:00:00.000Z",
        completed_at: "2024-01-15T11:00:00.000Z",
      };

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("interview_sessions")) {
          return { get: vi.fn().mockReturnValue(mockSessionRow) };
        }
        if (sql.includes("interview_answers")) {
          return { all: vi.fn().mockReturnValue([]) };
        }
        if (sql.includes("interview_follow_ups")) {
          return { all: vi.fn().mockReturnValue([]) };
        }
        return { all: vi.fn().mockReturnValue([]) };
      });

      const result = getInterviewSession("session-1", TEST_USER_ID);

      expect(result?.status).toBe("completed");
      expect(result?.completedAt).toBe("2024-01-15T11:00:00.000Z");
    });
  });

  describe("getInterviewSessions", () => {
    it("should return all sessions ordered by started_at DESC", () => {
      const mockRows = [
        {
          id: "session-2",
          job_id: "job-456",
          profile_id: TEST_USER_ID,
          mode: "text",
          questions_json: "[]",
          status: "in_progress",
          started_at: "2024-01-16T10:00:00.000Z",
          completed_at: null,
        },
        {
          id: "session-1",
          job_id: "job-123",
          profile_id: TEST_USER_ID,
          mode: "voice",
          questions_json: "[]",
          status: "completed",
          started_at: "2024-01-15T10:00:00.000Z",
          completed_at: "2024-01-15T11:00:00.000Z",
        },
      ];

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("FROM interview_answers")) {
          return { all: vi.fn().mockReturnValue([]) };
        }
        if (sql.includes("FROM interview_follow_ups")) {
          return { all: vi.fn().mockReturnValue([]) };
        }
        return { all: vi.fn().mockReturnValue(mockRows) };
      });

      const result = getInterviewSessions(undefined, TEST_USER_ID);

      expect(db.prepare as Mock).toHaveBeenCalledWith(
        expect.stringContaining("WHERE user_id = ?"),
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("session-2");
      expect(result[1].id).toBe("session-1");
    });

    it("should filter by jobId when provided", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getInterviewSessions("job-123", TEST_USER_ID);

      expect(mockAll).toHaveBeenCalledWith(TEST_USER_ID, "job-123");
    });

    it("should return empty array when no sessions exist", () => {
      (db.prepare as Mock).mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      });

      const result = getInterviewSessions(undefined, TEST_USER_ID);

      expect(db.prepare as Mock).toHaveBeenCalledWith(
        expect.stringContaining("WHERE user_id = ?"),
      );
      expect(result).toEqual([]);
    });
  });

  describe("addInterviewAnswer", () => {
    it("should add an answer to a session", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = addInterviewAnswer(
        "session-1",
        0,
        "My answer",
        "Good!",
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        TEST_USER_ID,
        "session-1",
        0,
        "My answer",
        "Good!",
        expect.any(String),
        "session-1",
        TEST_USER_ID,
      );
      expect(result).toEqual({
        id: "test-session-id",
        sessionId: "session-1",
        questionIndex: 0,
        answer: "My answer",
        feedback: "Good!",
        createdAt: expect.any(String),
      });
    });

    it("should reject answers for sessions outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() =>
        addInterviewAnswer("session-1", 0, "My answer", undefined, "user-123"),
      ).toThrow("Session not found");
      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "user-123",
        "session-1",
        0,
        "My answer",
        null,
        expect.any(String),
        "session-1",
        "user-123",
      );
    });

    it("should handle answers without feedback", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = addInterviewAnswer(
        "session-1",
        0,
        "My answer",
        undefined,
        TEST_USER_ID,
      );

      expect(result.feedback).toBeUndefined();
      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[5]).toBeNull(); // feedback arg should be null
    });

    it("should save answers for the provided user", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      addInterviewAnswer("session-1", 0, "My answer", undefined, "user-123");

      expect(mockRun.mock.calls[0][1]).toBe("user-123");
    });
  });

  describe("addInterviewFollowUp", () => {
    it("should add a follow-up answer to a session", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = addInterviewFollowUp(
        "session-1",
        0,
        "What was the result?",
        "We reduced review time by 20%.",
        "Strong measurable result.",
        TEST_USER_ID,
      );

      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        TEST_USER_ID,
        "session-1",
        0,
        "What was the result?",
        "We reduced review time by 20%.",
        "Strong measurable result.",
        expect.any(String),
        "session-1",
        TEST_USER_ID,
      );
      expect(result).toEqual({
        id: "test-session-id",
        sessionId: "session-1",
        questionIndex: 0,
        followUpQuestion: "What was the result?",
        answer: "We reduced review time by 20%.",
        feedback: "Strong measurable result.",
        createdAt: expect.any(String),
      });
    });

    it("should reject follow-ups for sessions outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() =>
        addInterviewFollowUp(
          "session-1",
          0,
          "What changed?",
          "The team shipped faster.",
          undefined,
          "user-123",
        ),
      ).toThrow("Session not found");
      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "user-123",
        "session-1",
        0,
        "What changed?",
        "The team shipped faster.",
        null,
        expect.any(String),
        "session-1",
        "user-123",
      );
    });
  });

  describe("completeInterviewSession", () => {
    it("should mark session as completed", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      completeInterviewSession("session-1", TEST_USER_ID);

      expect(mockRun).toHaveBeenCalled();
      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[0]).toBeTruthy(); // timestamp
      expect(runArgs[1]).toBe("session-1");
      expect(runArgs[2]).toBe(TEST_USER_ID);
    });
  });

  describe("deleteInterviewSession", () => {
    it("should delete session and its answers", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({ id: "session-1" });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("SELECT id FROM interview_sessions")) {
          return { get: mockGet };
        }
        return { run: mockRun };
      });

      deleteInterviewSession("session-1", TEST_USER_ID);

      expect(mockGet).toHaveBeenCalledWith("session-1", TEST_USER_ID);
      expect(mockRun).toHaveBeenCalledTimes(3);
      expect(mockRun).toHaveBeenCalledWith("session-1", TEST_USER_ID);
      expect(mockRun).toHaveBeenCalledWith("session-1", TEST_USER_ID);
    });
  });

  describe("getRecentInterviewSessions", () => {
    it("should return limited number of sessions", () => {
      const mockRows = [
        {
          id: "session-1",
          job_id: "job-123",
          profile_id: TEST_USER_ID,
          mode: "text",
          questions_json: "[]",
          status: "in_progress",
          started_at: "2024-01-15T10:00:00.000Z",
          completed_at: null,
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getRecentInterviewSessions(5, TEST_USER_ID);

      expect(mockAll).toHaveBeenCalledWith(TEST_USER_ID, 5);
      expect(result).toHaveLength(1);
    });

    it("should default to 5 sessions", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getRecentInterviewSessions(undefined, TEST_USER_ID);

      expect(mockAll).toHaveBeenCalledWith(TEST_USER_ID, 5);
    });
  });
});
