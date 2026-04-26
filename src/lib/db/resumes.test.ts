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
  generateId: () => "test-resume-id",
}));

import db from "./schema";
import {
  saveGeneratedResume,
  getGeneratedResumes,
  getGeneratedResume,
  deleteGeneratedResume,
  getAllGeneratedResumes,
  getGeneratedResumeCount,
} from "./resumes";

describe("Resume Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveGeneratedResume", () => {
    it("should save a new generated resume", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const content = { name: "John Doe", skills: ["JavaScript"] };
      const result = saveGeneratedResume(
        "job-123",
        "professional",
        content,
        "/path/to/resume.html",
        85
      );

      expect(mockRun).toHaveBeenCalled();
      expect(result).toEqual({
        id: "test-resume-id",
        jobId: "job-123",
        profileId: "default",
        templateId: "professional",
        contentJson: JSON.stringify(content),
        htmlPath: "/path/to/resume.html",
        matchScore: 85,
        createdAt: expect.any(String),
      });
    });

    it("should handle missing matchScore", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      const result = saveGeneratedResume(
        "job-123",
        "modern",
        {},
        "/path/to/resume.html"
      );

      expect(result.matchScore).toBeUndefined();
      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[1]).toBe("default");
      expect(runArgs[2]).toBe("job-123");
      expect(runArgs[4]).toBe(JSON.stringify({}));
      expect(runArgs[5]).toBe("/path/to/resume.html");
      expect(runArgs[6]).toBeNull();
      expect(runArgs[7]).toEqual(expect.any(String));
      expect(runArgs[8]).toBe("job-123");
      expect(runArgs[9]).toBe("default");
    });

    it("should reject resumes for jobs outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(() =>
        saveGeneratedResume("job-123", "modern", {}, "/path/to/resume.html", undefined, "user-123")
      ).toThrow("Job not found");
    });
  });

  describe("getGeneratedResumes", () => {
    it("should return all resumes for a job", () => {
      const mockRows = [
        {
          id: "resume-1",
          job_id: "job-123",
          profile_id: "default",
          content_json: '{"name": "John"}',
          pdf_path: "/path/resume1.html",
          match_score: 90,
          created_at: "2024-01-15T10:00:00.000Z",
        },
        {
          id: "resume-2",
          job_id: "job-123",
          profile_id: "default",
          content_json: '{"name": "John v2"}',
          pdf_path: "/path/resume2.html",
          match_score: 95,
          created_at: "2024-01-16T10:00:00.000Z",
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getGeneratedResumes("job-123");

      expect(mockAll).toHaveBeenCalledWith("job-123", "default");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "resume-1",
        jobId: "job-123",
        profileId: "default",
        templateId: "",
        contentJson: '{"name": "John"}',
        htmlPath: "/path/resume1.html",
        matchScore: 90,
        createdAt: "2024-01-15T10:00:00.000Z",
      });
    });

    it("should return empty array when no resumes exist", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getGeneratedResumes("job-123");

      expect(result).toEqual([]);
    });

    it("should handle null matchScore", () => {
      const mockRows = [
        {
          id: "resume-1",
          job_id: "job-123",
          profile_id: "default",
          content_json: "{}",
          pdf_path: "/path/resume.html",
          match_score: null,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];

      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getGeneratedResumes("job-123");

      expect(result[0].matchScore).toBeUndefined();
    });
  });

  describe("getGeneratedResume", () => {
    it("should return resume by id", () => {
      const mockRow = {
        id: "resume-1",
        job_id: "job-123",
        profile_id: "default",
        content_json: '{"skills": ["React"]}',
        pdf_path: "/path/resume.html",
        match_score: 88,
        created_at: "2024-01-15T10:00:00.000Z",
      };

      (db.prepare as Mock).mockReturnValue({ get: vi.fn().mockReturnValue(mockRow) });

      const result = getGeneratedResume("resume-1");

      expect((db.prepare as Mock)).toHaveBeenCalledWith(expect.stringContaining("WHERE id = ? AND user_id = ?"));
      expect(result).toEqual({
        id: "resume-1",
        jobId: "job-123",
        profileId: "default",
        templateId: "",
        contentJson: '{"skills": ["React"]}',
        htmlPath: "/path/resume.html",
        matchScore: 88,
        createdAt: "2024-01-15T10:00:00.000Z",
      });
    });

    it("should return null for non-existent resume", () => {
      (db.prepare as Mock).mockReturnValue({ get: vi.fn().mockReturnValue(undefined) });

      const result = getGeneratedResume("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("deleteGeneratedResume", () => {
    it("should delete resume by id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      deleteGeneratedResume("resume-1");

      expect(db.prepare).toHaveBeenCalledWith(
        "DELETE FROM generated_resumes WHERE id = ? AND user_id = ?"
      );
      expect(mockRun).toHaveBeenCalledWith("resume-1", "default");
    });
  });

  describe("getAllGeneratedResumes", () => {
    it("should return all resumes across all jobs", () => {
      const mockRows = [
        {
          id: "resume-1",
          job_id: "job-123",
          profile_id: "default",
          content_json: "{}",
          pdf_path: "/path/r1.html",
          match_score: 90,
          created_at: "2024-01-16T10:00:00.000Z",
        },
        {
          id: "resume-2",
          job_id: "job-456",
          profile_id: "default",
          content_json: "{}",
          pdf_path: "/path/r2.html",
          match_score: 85,
          created_at: "2024-01-15T10:00:00.000Z",
        },
      ];

      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue(mockRows) });

      const result = getAllGeneratedResumes();

      expect(result).toHaveLength(2);
      expect(result[0].jobId).toBe("job-123");
      expect(result[1].jobId).toBe("job-456");
    });

    it("should return empty array when no resumes exist", () => {
      (db.prepare as Mock).mockReturnValue({ all: vi.fn().mockReturnValue([]) });

      const result = getAllGeneratedResumes();

      expect(result).toEqual([]);
    });
  });

  describe("getGeneratedResumeCount", () => {
    it("should return count of all generated resumes", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue({ count: 42 }),
      });

      const result = getGeneratedResumeCount();

      expect((db.prepare as Mock)).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM generated_resumes WHERE user_id = ?"
      );
      expect(result).toBe(42);
    });

    it("should return 0 when no resumes exist", () => {
      (db.prepare as Mock).mockReturnValue({
        get: vi.fn().mockReturnValue({ count: 0 }),
      });

      const result = getGeneratedResumeCount();

      expect((db.prepare as Mock)).toHaveBeenCalledWith(
        "SELECT COUNT(*) as count FROM generated_resumes WHERE user_id = ?"
      );
      expect(result).toBe(0);
    });
  });
});
