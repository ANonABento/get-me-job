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
  generateId: () => "test-id-123",
}));

import db from "./schema";
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} from "./jobs";

describe("Job Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getJobs", () => {
    it("should return all jobs ordered by created_at DESC", () => {
      const mockRows = [
        {
          id: "job-1",
          title: "Software Engineer",
          company: "Tech Corp",
          location: "NYC",
          type: "full-time",
          remote: 1,
          salary: "$100k",
          description: "Great job",
          requirements_json: '["JavaScript", "React"]',
          responsibilities_json: '["Build features"]',
          keywords_json: '["frontend"]',
          url: "https://example.com/job",
          status: "saved",
          applied_at: null,
          deadline: null,
          notes: null,
          created_at: "2024-01-15T00:00:00.000Z",
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getJobs();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC"
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "job-1",
        title: "Software Engineer",
        company: "Tech Corp",
        location: "NYC",
        type: "full-time",
        remote: true,
        salary: "$100k",
        description: "Great job",
        requirements: ["JavaScript", "React"],
        responsibilities: ["Build features"],
        keywords: ["frontend"],
        url: "https://example.com/job",
        status: "saved",
        appliedAt: null,
        deadline: null,
        notes: null,
        createdAt: "2024-01-15T00:00:00.000Z",
      });
    });

    it("should return empty array when no jobs exist", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getJobs();

      expect(result).toEqual([]);
    });

    it("should handle null JSON fields", () => {
      const mockRows = [
        {
          id: "job-1",
          title: "Job",
          company: "Company",
          description: "Desc",
          requirements_json: null,
          responsibilities_json: null,
          keywords_json: null,
          remote: 0,
        },
      ];

      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getJobs();

      expect(result[0].requirements).toEqual([]);
      expect(result[0].responsibilities).toEqual([]);
      expect(result[0].keywords).toEqual([]);
      expect(result[0].remote).toBe(false);
    });
  });

  describe("getJob", () => {
    it("should return job by id", () => {
      const mockRow = {
        id: "job-1",
        title: "Software Engineer",
        company: "Tech Corp",
        description: "Great job",
        requirements_json: '["JavaScript"]',
        responsibilities_json: '[]',
        keywords_json: '[]',
        remote: 0,
        status: "applied",
      };

      const mockGet = vi.fn().mockReturnValue(mockRow);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getJob("job-1");

      expect(db.prepare).toHaveBeenCalledWith("SELECT * FROM jobs WHERE id = ?");
      expect(mockGet).toHaveBeenCalledWith("job-1");
      expect(result?.id).toBe("job-1");
      expect(result?.title).toBe("Software Engineer");
    });

    it("should return null for non-existent job", () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getJob("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createJob", () => {
    it("should create a new job and return it", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({
        id: "test-id-123",
        title: "New Job",
        company: "New Company",
        description: "Description",
        requirements_json: "[]",
        responsibilities_json: "[]",
        keywords_json: "[]",
        remote: 0,
        status: "saved",
      });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("INSERT")) {
          return { run: mockRun };
        }
        return { get: mockGet };
      });

      const result = createJob({
        title: "New Job",
        company: "New Company",
        description: "Description",
        requirements: [],
        responsibilities: [],
        keywords: [],
      });

      expect(mockRun).toHaveBeenCalledWith(
        "test-id-123",
        "New Job",
        "New Company",
        null,
        null,
        0,
        null,
        "Description",
        "[]",
        "[]",
        "[]",
        null,
        "default"
      );
      expect(result.id).toBe("test-id-123");
    });

    it("should handle optional fields", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({
        id: "test-id-123",
        title: "Job",
        company: "Company",
        location: "Remote",
        type: "contract",
        remote: 1,
        salary: "$50/hr",
        description: "Desc",
        requirements_json: '["Skill"]',
        responsibilities_json: '["Task"]',
        keywords_json: '["key"]',
        url: "https://job.com",
        status: "saved",
      });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("INSERT")) {
          return { run: mockRun };
        }
        return { get: mockGet };
      });

      const result = createJob({
        title: "Job",
        company: "Company",
        location: "Remote",
        type: "contract",
        remote: true,
        salary: "$50/hr",
        description: "Desc",
        requirements: ["Skill"],
        responsibilities: ["Task"],
        keywords: ["key"],
        url: "https://job.com",
      });

      expect(mockRun).toHaveBeenCalledWith(
        "test-id-123",
        "Job",
        "Company",
        "Remote",
        "contract",
        1,
        "$50/hr",
        "Desc",
        '["Skill"]',
        '["Task"]',
        '["key"]',
        "https://job.com",
        "default"
      );
      expect(result.remote).toBe(true);
    });
  });

  describe("updateJob", () => {
    it("should update existing job", () => {
      const mockGet = vi.fn().mockReturnValue({
        id: "job-1",
        title: "Old Title",
        company: "Company",
        description: "Desc",
        requirements_json: "[]",
        responsibilities_json: "[]",
        keywords_json: "[]",
        remote: 0,
        status: "saved",
      });
      const mockRun = vi.fn();

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("SELECT")) {
          return { get: mockGet };
        }
        return { run: mockRun };
      });

      updateJob("job-1", { title: "New Title" });

      expect(mockRun).toHaveBeenCalled();
      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[0]).toBe("New Title"); // First arg is title
    });

    it("should do nothing for non-existent job", () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      const mockRun = vi.fn();

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("SELECT")) {
          return { get: mockGet };
        }
        return { run: mockRun };
      });

      updateJob("non-existent", { title: "New Title" });

      expect(mockRun).not.toHaveBeenCalled();
    });
  });

  describe("updateJobStatus", () => {
    it("should update job status", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({
        id: "job-1",
        title: "Job",
        company: "Company",
        description: "Desc",
        requirements_json: "[]",
        responsibilities_json: "[]",
        keywords_json: "[]",
        remote: 0,
        status: "applied",
      });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("UPDATE")) {
          return { run: mockRun };
        }
        return { get: mockGet };
      });

      const result = updateJobStatus("job-1", "applied");

      expect(mockRun).toHaveBeenCalled();
      expect(result?.status).toBe("applied");
    });

    it("should auto-set appliedAt when status is 'applied'", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({
        id: "job-1",
        title: "Job",
        company: "Company",
        description: "Desc",
        requirements_json: "[]",
        responsibilities_json: "[]",
        keywords_json: "[]",
        remote: 0,
        status: "applied",
        applied_at: "2024-01-15T00:00:00.000Z",
      });

      (db.prepare as Mock).mockImplementation((sql: string) => {
        if (sql.includes("UPDATE")) {
          return { run: mockRun };
        }
        return { get: mockGet };
      });

      updateJobStatus("job-1", "applied");

      const runArgs = mockRun.mock.calls[0];
      expect(runArgs[0]).toBe("applied");
      // Second arg should be set (the auto-generated timestamp)
      expect(runArgs[1]).toBeTruthy();
    });
  });

  describe("deleteJob", () => {
    it("should delete job by id", () => {
      const mockRun = vi.fn();
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      deleteJob("job-1");

      expect(db.prepare).toHaveBeenCalledWith(
        "DELETE FROM jobs WHERE id = ?"
      );
      expect(mockRun).toHaveBeenCalledWith("job-1");
    });
  });
});
