import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Mock the database module
vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

// Mock utils to control ID generation
vi.mock("@/lib/utils", () => ({
  generateId: () => "test-session-id",
}));

import db from "./schema";
import {
  createInterviewSession,
  getInterviewSession,
  getInterviewSessions,
  addInterviewAnswer,
  completeInterviewSession,
  deleteInterviewSession,
  getRecentInterviewSessions,
} from "./interviews";

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

      const result = createInterviewSession("job-123", questions, "text");

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE EXISTS"));
      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "default",
        "job-123",
        "default",
        "text",
        JSON.stringify(questions),
        expect.any(String),
        "job-123",
        "default"
      );
      expect(result).toEqual({
        id: "test-session-id",
        jobId: "job-123",
        profileId: "default",
        mode: "text",
        questions,
        status: "in_progress",
        startedAt: expect.any(String),
      });
    });

    it("should reject sessions for jobs outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() => createInterviewSession("job-123", [], "text", "user-123")).toThrow(
        "Job not found"
      );
      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "user-123",
        "job-123",
        "user-123",
        "text",
        JSON.stringify([]),
        expect.any(String),
        "job-123",
        "user-123"
      );
    });

    it("should default to text mode", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createInterviewSession("job-123", []);

      expect(result.mode).toBe("text");
    });

    it("should support voice mode", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = createInterviewSession("job-123", [], "voice");

      expect(result.mode).toBe("voice");
    });
  });

  describe("getInterviewSession", () => {
    it("should return session with answers", () => {
      const mockSessionRow = {
        id: "session-1",
        job_id: "job-123",
        profile_id: "default",
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
        return { get: vi.fn(), all: vi.fn() };
      });

      const result = getInterviewSession("session-1");

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE id = ? AND user_id = ?"));
      expect(result).toEqual({
        id: "session-1",
        jobId: "job-123",
        profileId: "default",
        mode: "text",
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
      });
    });

    it("should return null for non-existent session", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
        all: vi.fn().mockReturnValue([]),
      });

      const result = getInterviewSession("non-existent");

      expect(result).toBeNull();
    });

    it("should handle completed sessions", () => {
      const mockSessionRow = {
        id: "session-1",
        job_id: "job-123",
        profile_id: "default",
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
        return { all: vi.fn().mockReturnValue([]) };
      });

      const result = getInterviewSession("session-1");

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
          profile_id: "default",
          mode: "text",
          questions_json: "[]",
          status: "in_progress",
          started_at: "2024-01-16T10:00:00.000Z",
          completed_at: null,
        },
        {
          id: "session-1",
          job_id: "job-123",
          profile_id: "default",
          mode: "voice",
          questions_json: "[]",
          status: "completed",
          started_at: "2024-01-15T10:00:00.000Z",
          completed_at: "2024-01-15T11:00:00.000Z",
        },
      ];

      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getInterviewSessions();

      expect((db.prepare as Mock)).toHaveBeenCalledWith(expect.stringContaining("AND user_id = ?"));
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("session-2");
      expect(result[1].id).toBe("session-1");
    });

    it("should filter by jobId when provided", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getInterviewSessions("job-123");

      expect(mockAll).toHaveBeenCalledWith("default", "default", "job-123");
    });

    it("should return empty array when no sessions exist", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getInterviewSessions();

      expect((db.prepare as Mock)).toHaveBeenCalledWith(expect.stringContaining("AND user_id = ?"));
      expect(result).toEqual([]);
    });
  });

  describe("addInterviewAnswer", () => {
    it("should add an answer to a session", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = addInterviewAnswer("session-1", 0, "My answer", "Good!");

      expect(mockRun).toHaveBeenCalledWith(
        "test-session-id",
        "default",
        "session-1",
        0,
        "My answer",
        "Good!",
        expect.any(String),
        "session-1",
        "default"
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
        addInterviewAnswer("session-1", 0, "My answer", undefined, "user-123")
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
        "user-123"
      );
    });

    it("should handle answers without feedback", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = addInterviewAnswer("session-1", 0, "My answer");

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

  describe("completeInterviewSession", () => {
    it("should mark session as completed", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      completeInterviewSession("session-1");

      expect(mockRun).toHaveBeenCalled();
      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[0]).toBeTruthy(); // timestamp
      expect(runArgs[1]).toBe("session-1");
      expect(runArgs[2]).toBe("default");
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

      deleteInterviewSession("session-1");

      expect(mockGet).toHaveBeenCalledWith("session-1", "default");
      expect(mockRun).toHaveBeenCalledTimes(2);
      expect(mockRun).toHaveBeenCalledWith("session-1", "default");
      expect(mockRun).toHaveBeenCalledWith("session-1", "default");
    });
  });

  describe("getRecentInterviewSessions", () => {
    it("should return limited number of sessions", () => {
      const mockRows = [
        {
          id: "session-1",
          job_id: "job-123",
          profile_id: "default",
          mode: "text",
          questions_json: "[]",
          status: "in_progress",
          started_at: "2024-01-15T10:00:00.000Z",
          completed_at: null,
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getRecentInterviewSessions(5);

      expect(mockAll).toHaveBeenCalledWith("default", 5);
      expect(result).toHaveLength(1);
    });

    it("should default to 5 sessions", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      getRecentInterviewSessions();

      expect(mockAll).toHaveBeenCalledWith("default", 5);
    });
  });
});
