import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("./schema", () => {
  const mockDb = {
    prepare: vi.fn(),
  };
  return { default: mockDb };
});

vi.mock("nanoid", () => ({
  nanoid: () => "test-cover-letter-id",
}));

import db from "./schema";
import {
  saveCoverLetter,
  getCoverLettersByJob,
  getLatestCoverLetter,
  getCoverLetter,
  deleteCoverLetter,
  getCoverLetterCount,
  getAllCoverLetters,
} from "./cover-letters";

describe("Cover Letter Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveCoverLetter", () => {
    it("should save a cover letter with correct version", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({ max_version: 2 });
      (db.prepare as Mock)
        .mockReturnValueOnce({ get: mockGet })
        .mockReturnValueOnce({ run: mockRun });

      const result = saveCoverLetter("job-1", "Dear hiring manager...", ["skill1"], "user-1");

      expect(result).toEqual({
        id: "test-cover-letter-id",
        jobId: "job-1",
        profileId: "user-1",
        content: "Dear hiring manager...",
        highlights: ["skill1"],
        version: 3,
        createdAt: expect.any(String),
      });
      expect(mockRun).toHaveBeenCalledWith(
        "test-cover-letter-id",
        "user-1",
        "job-1",
        "user-1",
        "Dear hiring manager...",
        JSON.stringify(["skill1"]),
        3,
        "job-1",
        "user-1"
      );
    });

    it("should start at version 1 when no existing letters", () => {
      const mockRun = vi.fn();
      const mockGet = vi.fn().mockReturnValue({ max_version: null });
      (db.prepare as Mock)
        .mockReturnValueOnce({ get: mockGet })
        .mockReturnValueOnce({ run: mockRun });

      const result = saveCoverLetter("job-1", "Content");

      expect(result.version).toBe(1);
    });

    it("should reject cover letters for jobs outside the provided user", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      const mockGet = vi.fn().mockReturnValue({ max_version: null });
      (db.prepare as Mock)
        .mockReturnValueOnce({ get: mockGet })
        .mockReturnValueOnce({ run: mockRun });

      expect(() => saveCoverLetter("job-1", "Content", [], "user-1")).toThrow("Job not found");
    });
  });

  describe("getCoverLettersByJob", () => {
    it("should return all cover letters for a job", () => {
      const mockRows = [
        {
          id: "cl-1",
          job_id: "job-1",
          profile_id: "default",
          content: "Letter content",
          highlights_json: JSON.stringify(["highlight1"]),
          version: 1,
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ];
      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getCoverLettersByJob("job-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "cl-1",
        jobId: "job-1",
        profileId: "default",
        content: "Letter content",
        highlights: ["highlight1"],
        version: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      expect(mockAll).toHaveBeenCalledWith("job-1", "default");
    });
  });

  describe("getLatestCoverLetter", () => {
    it("should return the latest cover letter for a job", () => {
      const mockRow = {
        id: "cl-2",
        job_id: "job-1",
        profile_id: "default",
        content: "Latest",
        highlights_json: null,
        version: 2,
        created_at: "2024-01-02T00:00:00.000Z",
      };
      const mockGet = vi.fn().mockReturnValue(mockRow);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getLatestCoverLetter("job-1");

      expect(result).not.toBeNull();
      expect(result!.highlights).toEqual([]);
      expect(result!.version).toBe(2);
    });

    it("should return null when no cover letter exists", () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getLatestCoverLetter("job-1");
      expect(result).toBeNull();
    });
  });

  describe("getCoverLetter", () => {
    it("should return a specific cover letter by id", () => {
      const mockRow = {
        id: "cl-1",
        job_id: "job-1",
        profile_id: "default",
        content: "Content",
        highlights_json: JSON.stringify(["a"]),
        version: 1,
        created_at: "2024-01-01T00:00:00.000Z",
      };
      const mockGet = vi.fn().mockReturnValue(mockRow);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getCoverLetter("cl-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("cl-1");
    });

    it("should return null when not found", () => {
      const mockGet = vi.fn().mockReturnValue(undefined);
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      const result = getCoverLetter("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("deleteCoverLetter", () => {
    it("should return true when deleted", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 1 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(deleteCoverLetter("cl-1")).toBe(true);
    });

    it("should return false when not found", () => {
      const mockRun = vi.fn().mockReturnValue({ changes: 0 });
      (db.prepare as Mock).mockReturnValue({ run: mockRun });

      expect(deleteCoverLetter("nonexistent")).toBe(false);
    });
  });

  describe("getCoverLetterCount", () => {
    it("should return the count", () => {
      const mockGet = vi.fn().mockReturnValue({ count: 5 });
      (db.prepare as Mock).mockReturnValue({ get: mockGet });

      expect(getCoverLetterCount("job-1")).toBe(5);
    });
  });

  describe("getAllCoverLetters", () => {
    it("should return all cover letters for a user", () => {
      const mockRows = [
        {
          id: "cl-1",
          job_id: "job-1",
          profile_id: "default",
          content: "First letter",
          highlights_json: JSON.stringify(["h1"]),
          version: 1,
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "cl-2",
          job_id: "job-2",
          profile_id: "default",
          content: "Second letter",
          highlights_json: null,
          version: 1,
          created_at: "2024-01-02T00:00:00.000Z",
        },
      ];
      const mockAll = vi.fn().mockReturnValue(mockRows);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getAllCoverLetters();

      expect(db.prepare).toHaveBeenCalledWith(
        "SELECT * FROM cover_letters WHERE user_id = ? ORDER BY created_at DESC"
      );
      expect(mockAll).toHaveBeenCalledWith("default");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "cl-1",
        jobId: "job-1",
        profileId: "default",
        content: "First letter",
        highlights: ["h1"],
        version: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      expect(result[1].highlights).toEqual([]);
    });

    it("should return empty array when no cover letters exist", () => {
      const mockAll = vi.fn().mockReturnValue([]);
      (db.prepare as Mock).mockReturnValue({ all: mockAll });

      const result = getAllCoverLetters("user-1");

      expect(mockAll).toHaveBeenCalledWith("user-1");
      expect(result).toEqual([]);
    });
  });
});
